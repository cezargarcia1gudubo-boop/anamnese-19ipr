const CACHE='anamnese-19ipr-v1';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // Página: tenta a rede primeiro (pega atualizações) e cai no cache sem internet
    if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put('index.html',c));return r}).catch(()=>caches.match('index.html')));return}
    e.respondWith(caches.match(req).then(r=>r||fetch(req)));return;
  }
  if(url.hostname.endsWith('fonts.googleapis.com')||url.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(req,c));return res})));
  }
});
