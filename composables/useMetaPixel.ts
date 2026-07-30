const win = typeof window !== 'undefined' ? (window as any) : null;

type PixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact';

type PixelParams = Record<string, string | number | boolean | undefined>;

export function useMetaPixel() {
  const track = (event: PixelEvent, params?: PixelParams) => {
    if (win?.fbq) {
      win.fbq('track', event, params);
    }
  };

  const trackSingle = (pixelId: string, event: PixelEvent, params?: PixelParams) => {
    if (win?.fbq) {
      win.fbq('trackSingle', pixelId, event, params);
    }
  };

  return { track, trackSingle };
}
