import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigins=new Set(['https://verticalhorizons.ch','https://www.verticalhorizons.ch','http://localhost:8000','http://127.0.0.1:8000']);
const cors=(origin:string)=>({'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS',Vary:'Origin'});

Deno.serve(async request=>{
  const origin=request.headers.get('origin')||'';if(!allowedOrigins.has(origin))return new Response('Origin not allowed',{status:403});const headers=cors(origin);
  if(request.method==='OPTIONS')return new Response('ok',{headers});if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers});
  const authorization=request.headers.get('authorization')||'';if(!/^Bearer\s+\S+$/i.test(authorization))return new Response('Unauthorized',{status:401,headers});
  let activityId='';try{activityId=(await request.json()).activity_id;}catch{return new Response('Invalid request',{status:400,headers});}
  if(typeof activityId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(activityId))return new Response('Invalid request',{status:400,headers});
  const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!anon||!service)return new Response('Deletion is not configured',{status:503,headers});
  const token=authorization.replace(/^Bearer\s+/i,'');const verifier=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});const {data:{user},error:authError}=await verifier.auth.getUser(token);if(authError||!user)return new Response('Unauthorized',{status:401,headers});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});const prefix=`${user.id}/${activityId}`;
  try{
    const {data:activity,error:lookupError}=await admin.from('activities').select('id,user_id').eq('id',activityId).maybeSingle();if(lookupError)throw lookupError;
    if(activity&&activity.user_id!==user.id)return new Response('Activity not found',{status:404,headers});
    const walk=async(path:string):Promise<string[]>=>{const found:string[]=[];for(let offset=0;;offset+=100){const {data,error}=await admin.storage.from('progress-photos').list(path,{limit:100,offset,sortBy:{column:'name',order:'asc'}});if(error)throw error;for(const entry of data||[]){const child=`${path}/${entry.name}`;if(entry.id===null)found.push(...await walk(child));else found.push(child);}if(!data||data.length<100)break;}return found;};
    // Walk the user's activity folder as well as its metadata, so a prior
    // failed cleanup or an orphaned object can be safely retried.
    const paths=await walk(prefix);
    for(let i=0;i<paths.length;i+=100){const {error}=await admin.storage.from('progress-photos').remove(paths.slice(i,i+100));if(error)throw error;}
    if(activity){const {error:deleteError}=await admin.from('activities').delete().eq('id',activityId).eq('user_id',user.id);if(deleteError)throw deleteError;}
    // A missing row is treated as success only after cleaning the authenticated
    // user's own prefix. A foreign activity was rejected above.
    return new Response(JSON.stringify({deleted:true}),{status:200,headers:{...headers,'Content-Type':'application/json'}});
  }catch{return new Response('Activity deletion could not be completed. Retry the same request.',{status:500,headers});}
});
