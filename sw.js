/* ============================================================
   向阳社 · 天气指数保险设计平台 · Service Worker
   ------------------------------------------------------------
   策略（保守优先，宁可慢一点也不能出旧页面）：
     · HTML  → network-first：永远先取最新，断网才回退缓存
     · 静态资源 → stale-while-revalidate：先用缓存秒开，后台静默更新
     · 第三方（气象 API）→ 完全不拦截，避免缓存住实时数据

   版本约定：改动任何被缓存的资源后，必须把 CACHE 版本号 +1，
   否则用户会继续用旧缓存。sync-site.sh 会在发布时提醒。
   ============================================================ */
var CACHE = 'wii-v2';

// 预缓存：只放首屏必需的，geo 地图数据按需缓存（共 4.5MB，不适合预载）
var PRECACHE = [
  './',
  './index.html',
  './assets/css/app.css',
  './assets/js/gate.js',
  './assets/js/app.bundle.js',
  './assets/img/sunflower-logo.webp'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // 单个失败不阻塞整体安装（避免一个 404 让 SW 装不上）
      return Promise.all(PRECACHE.map(function (u) {
        return c.add(u).catch(function () { });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  // 跨域（气象 API、CDN）不拦截：避免把实时数据缓存成旧值
  if (url.origin !== self.location.origin) return;

  var isHTML = req.mode === 'navigate' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('.html');

  if (isHTML) {
    // network-first：保证用户永远看到最新页面
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) {
          return r || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // 静态资源：缓存优先 + 后台更新
  e.respondWith(
    caches.match(req).then(function (cached) {
      var fetching = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || fetching;
    })
  );
});
