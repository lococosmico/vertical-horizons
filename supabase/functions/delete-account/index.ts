import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigins = new Set(['https://verticalhorizons.ch','https://www.verticalhorizons.ch','http://localhost:8000','http://127.0.0.1:8000']);
const headersFor = (origin: string) => ({'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'});
const json = (body: unknown, status: number, headers: Record<string,string>) => new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json'}});
const sha256 = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(v=>v.toString(16).padStart(2,'0')).join('');

Deno.serve(async request => {
  const origin=request.headers.get('origin')||'';
  if(!allowedOrigins.has(origin))return new Response('Origin not allowed',{status:403});
  const cors=headersFor(origin);
  if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:cors});
  let body: {confirmation?:unknown;recovery_token?:unknown};
  try{body=await request.json();}catch{return json({error:'Invalid request'},400,cors);}

  const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!anon||!service)return json({error:'Deletion is not configured'},503,cors);
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  let jobId:string,userId:string,authDeleted:boolean,completedAt:string|null,recoveryHash:string;

  if(typeof body.recovery_token==='string'&&/^[0-9a-f]{64}$/i.test(body.recovery_token)){
    recoveryHash=await sha256(body.recovery_token);
    const {data:job,error}=await admin.from('account_deletion_jobs').select('id,user_id,auth_deleted,completed_at').eq('recovery_token_hash',recoveryHash).maybeSingle();
    if(error||!job)return json({error:'Invalid recovery token'},401,cors);
    ({id:jobId,user_id:userId,auth_deleted:authDeleted,completed_at:completedAt}=job);
    if(completedAt)return json({deleted:true},200,cors);
  }else{
    if(body.confirmation!=='SUPPRIMER MON COMPTE')return json({error:'Confirmation required'},400,cors);
    const authorization=request.headers.get('authorization')||'';
    if(!/^Bearer\s+\S+$/i.test(authorization))return json({error:'Unauthorized'},401,cors);
    const token=authorization.replace(/^Bearer\s+/i,'');
    const verifier=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:{user},error:authError}=await verifier.auth.getUser(token);
    if(authError||!user)return json({error:'Unauthorized'},401,cors);
    let authTime=0;
    try{const payload=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');authTime=Number(JSON.parse(atob(payload.padEnd(Math.ceil(payload.length/4)*4,'='))).auth_time||0);}catch{return json({error:'Recent sign-in required'},401,cors);}
    const age=Math.floor(Date.now()/1000)-authTime;
    if(!authTime||age<0||age>600)return json({error:'Recent sign-in required'},401,cors);
    if(typeof body.recovery_token!=='string'||!/^[0-9a-f]{64}$/i.test(body.recovery_token))return json({error:'Invalid recovery token'},400,cors);
    userId=user.id;recoveryHash=await sha256(body.recovery_token);
    const {data:job,error}=await admin.from('account_deletion_jobs').insert({user_id:userId,recovery_token_hash:recoveryHash}).select('id,auth_deleted,completed_at').single();
    if(error||!job)return json({error:'Deletion could not be prepared'},500,cors);
    jobId=job.id;authDeleted=job.auth_deleted;completedAt=job.completed_at;
  }

  try{
    if(!authDeleted){
      const {error:deleteError}=await admin.auth.admin.deleteUser(userId);
      if(deleteError){const {data,error:lookupError}=await admin.auth.admin.getUserById(userId);if(lookupError||data.user)throw deleteError;}
      const {error:updateError}=await admin.from('account_deletion_jobs').update({auth_deleted:true}).eq('id',jobId);
      if(updateError)throw updateError;
    }

    const bucket='progress-photos';
    const walk=async(prefix:string):Promise<string[]>=>{
      const paths:string[]=[];
      for(let offset=0;;offset+=100){
        const {data,error}=await admin.storage.from(bucket).list(prefix,{limit:100,offset,sortBy:{column:'name',order:'asc'}});
        if(error)throw error;
        for(const entry of data||[]){const path=`${prefix}/${entry.name}`;if(entry.id===null)paths.push(...await walk(path));else paths.push(path);}
        if(!data||data.length<100)break;
      }
      return paths;
    };
    const objects=await walk(userId);
    for(let i=0;i<objects.length;i+=100){const {error}=await admin.storage.from(bucket).remove(objects.slice(i,i+100));if(error)throw error;}
    const {error:completeError}=await admin.from('account_deletion_jobs').update({completed_at:new Date().toISOString()}).eq('id',jobId);
    if(completeError)throw completeError;
    return json({deleted:true},200,cors);
  }catch{
    return json({error:'Account deletion is pending. Retry using the recovery token saved in this browser.'},500,cors);
  }
});
