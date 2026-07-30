export default defineNuxtPlugin({
  name: 'meta-pixel',
  enforce: 'pre',
  setup(nuxtApp) {
    const config = useRuntimeConfig();
    const pixelId = config.public.metaPixelId;
    if (!pixelId) return;

    const win = window as any;
    if (win.fbq) return;

    win.fbq = function () {
      win.fbq.callMethod
        ? win.fbq.callMethod.apply(win.fbq, arguments)
        : win.fbq.queue.push(arguments);
    };
    if (!win._fbq) win._fbq = win.fbq;
    win.fbq.push = win.fbq;
    win.fbq.loaded = true;
    win.fbq.version = '2.0';
    win.fbq.queue = [];

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    win.fbq('init', pixelId);

    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = 1;
    img.width = 1;
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);

    const router = useRouter();
    router.afterEach(() => {
      win.fbq('track', 'PageView');
    });

    nuxtApp.provide('fbq', win.fbq);
  },
});
