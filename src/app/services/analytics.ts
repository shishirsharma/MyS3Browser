/**
 * Google Analytics service for Chrome extension (Measurement Protocol)
 * This service handles event tracking via the background service worker
 * Privacy-friendly: no remote scripts loaded, only API calls
 */

// Generate or retrieve a session ID for this extension session
function getSessionId() {
  let sessionId = sessionStorage.getItem('ga_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('ga_session_id', sessionId);
  }
  return sessionId;
}

// Send event to Google Analytics via background service worker
function sendToGA(eventName: string, eventParams: Record<string, any> = {}) {
  chrome.runtime.sendMessage({
    type: 'ANALYTICS_EVENT',
    eventName: eventName,
    eventParams: {
      session_id: getSessionId(),
      engagement_time_msec: '100',
      ...eventParams
    }
  }).catch(error => {
    // Silently fail - don't disrupt the app if analytics fails
    console.debug('[Analytics] Failed to send message to background:', error);
  });
}

/**
 * Initialize Google Analytics
 * No-op now, kept for compatibility
 */
export function initializeAnalytics() {
  console.debug('[Analytics] Initialized with Measurement Protocol');
}

/**
 * Track a page view
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  sendToGA('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, eventData?: Record<string, any>) {
  sendToGA(eventName, eventData || {});
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
