import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigins=new Set(['https://verticalhorizons.ch','https://www.verticalhorizons.ch','http://localhost:8000','http://127.0.0.1:8000']);
const headers=(origin:string)=>({'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS',Vary:'Origin'});
Deno.serve(async request=>{
  const origin=request.headers.get('origin')||'';if(!allowedOrigins.has(origin))return new Response('Origin not allowed',{status:403});const cors=headers(origin);
  if(request.method==='OPTIONS')return new Response('ok',{headers:cors});if(request.method!=='POST')return new Response('Method not allowed',{status:405,headers:cors});
  const authorization=request.headers.get('authorization')||'';if(!/^Bearer\s+\S+$/i.test(authorization))return new Response('Unauthorized',{status:401,headers:cors});
  let objectPath='';try{objectPath=(await request.json()).object_path;}catch{return new Response('Invalid request',{status:400,headers:cors});}
  if(typeof objectPath!=='string'||!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/i.test(objectPath))return new Response('Invalid request',{status:400,headers:cors});
  const url=Deno.env.get('SUPABASE_URL'),anon=Deno.env.get('SUPABASE_ANON_KEY'),service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!anon||!service)return new Response('Cleanup is not configured',{status:503,headers:cors});
  const token=authorization.replace(/^Bearer\s+/i,'');const verifier=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false}});const {data:{user},error}=await verifier.auth.getUser(token);if(error||!user)return new Response('Unauthorized',{status:401,headers:cors});
  if(objectPath.split('/')[0]!==user.id)return new Response('Not found',{status:404,headers:cors});
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});const {error:removeError}=await admin.storage.from('progress-photos').remove([objectPath]);if(removeError)return new Response('Photo cleanup could not be completed. Retry.',{status:500,headers:cors});
  return new Response(JSON.stringify({deleted:true}),{status:200,headers:{...cors,'Content-Type':'application/json'}});
});
