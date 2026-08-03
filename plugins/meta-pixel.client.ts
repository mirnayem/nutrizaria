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

    const router = useRouter();

    const loadScript = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
      win.fbq('init', pixelId);

      router.afterEach(() => {
        win.fbq('track', 'PageView');
      });

      nuxtApp.provide('fbq', win.fbq);
    };

    const loadWhenIdle = () => {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(loadScript, { timeout: 4000 });
      } else {
        window.setTimeout(loadScript, 4000);
      }
    };

    const consent = getStoredConsent();
    if (consent === 'accepted') {
      if (document.readyState === 'complete') {
        loadWhenIdle();
      } else {
        window.addEventListener('load', loadWhenIdle, { once: true });
      }
    } else if (consent === null) {
      window.addEventListener(
        'nutrizaria:consent',
        (event: Event) => {
          const detail = (event as CustomEvent<string>).detail;
          if (detail === 'accepted') loadWhenIdle();
        },
        { once: true },
      );
    }
  },
});
