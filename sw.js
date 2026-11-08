/* SocialBase Web Push - manter na raiz do dominio */
self.addEventListener('push',event=>{
 let data={};try{data=event.data?.json()||{}}catch(_){data={}}
 const sender=String(data.sender_name||'Alguém').slice(0,80);
 const chat=typeof data.sender_id==='string'&&/^[0-9a-f-]{36}$/i.test(data.sender_id)?data.sender_id:'';
 const url=new URL('/',self.location.origin);if(chat)url.searchParams.set('chat',chat);
 event.waitUntil(self.registration.showNotification('SocialBase',{
  body:sender+' enviou uma mensagem',tag:'socialbase-'+String(data.message_id||Date.now()),
  icon:'/icon.svg',badge:'/icon.svg',data:{url:url.href,sender_id:chat}
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=event.notification.data?.url||self.location.origin+'/';
 const sender=event.notification.data?.sender_id||'';
 event.waitUntil((async()=>{
  const windows=await clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of windows){
   if(new URL(client.url).origin!==self.location.origin)continue;
   const focused=await client.focus();
   // Avisar a aba existente sem depender de recarregar o aplicativo.
   focused.postMessage({type:'SOCIALBASE_OPEN_CHAT',sender_id:sender});
   return;
  }
  return clients.openWindow(target);
 })());
});
