/**
 * Google Analytics service for Chrome extension
 * This service handles event tracking for the My S3 Browser extension
 */

const GA_MEASUREMENT_ID = 'G-Z67KC80X9V';

/**
 * Initialize Google Analytics
 */
export function initializeAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-YOUR_MEASUREMENT_ID') {
    console.warn('Google Analytics not configured. Please set GA_MEASUREMENT_ID');
    return;
  }

  // Load the Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    'send_page_view': false, // We'll manually send page views
    'allow_google_signals': false,
    'allow_ad_personalization_signals': false
  });

  (window as any).gtag = gtag;
}

/**
 * Track a page view
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (!(window as any).gtag) {
    console.warn('Google Analytics not initialized');
    return;
  }

  (window as any).gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  if (!(window as any).gtag) {
    console.warn('Google Analytics not initialized');
    return;
  }

  (window as any).gtag('event', eventName, eventData || {});
}

/**
 * Track errors
 */
export function trackError(errorMessage: string, errorStack?: string) {
  trackEvent('exception', {
    description: errorMessage,
    fatal: false,
    ...(errorStack && { error_stack: errorStack })
  });
}
