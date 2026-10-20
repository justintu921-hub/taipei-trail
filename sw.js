// 離線快取：網站本身和圖片存在手機，山上沒訊號也打得開
const CACHE = 'tgt-3327be17d3';
const FILES = ["./", "index.html", "manifest.webmanifest", "img/bike.webp", "img/bird_b.webp", "img/bird_b2.webp", "img/bird_y.webp", "img/bird_y2.webp", "img/buffalo.webp", "img/cloud_a.webp", "img/cloud_b.webp", "img/egret.webp", "img/footer.jpg", "img/gondola.webp", "img/hiker_back.webp", "img/hiker_point.webp", "img/hiker_sit.webp", "img/hiker_wave.webp", "img/hikers.webp", "img/icon-180.png", "img/icon-192.png", "img/icon-512.png", "img/lm_101.webp", "img/lm_hotel.webp", "img/lm_temple.webp", "img/magpie_fly.webp", "img/magpie_perch.webp", "img/map.jpg", "img/mtn_l.webp", "img/mtn_r.webp", "img/s1.jpg", "img/s2.jpg", "img/s3.jpg", "img/s4.jpg", "img/s5.jpg", "img/s6.jpg", "img/s7.jpg", "img/s8.jpg", "img/slide1.jpg", "img/slide2.jpg", "img/slide3.jpg", "img/slide4.jpg", "img/steam_a.webp", "img/steam_b.webp", "img/steam_c.webp", "img/tea.webp"];
const RUNTIME = 'tgt-runtime';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 資料（Apps Script）一律走網路，離線時由網頁自己處理
  if (/script\.google(usercontent)?\.com$/.test(url.hostname)) return;

  // 網頁本體：有網路拿最新的，沒網路用快取
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('index.html', copy)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }

  // 圖片、字型、照片：先用快取，背景更新
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$|lh3\.googleusercontent\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(url.origin === location.origin ? CACHE : RUNTIME).then((c) => c.put(req, copy)); } return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
