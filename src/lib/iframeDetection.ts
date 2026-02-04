/**
 * Iframe Detection and OAuth Utilities
 * Production-ready utilities for handling OAuth in embedded environments
 */

/**
 * Detects if the current window is running inside an iframe
 */
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin restrictions,
    // we're definitely in an iframe
    return true;
  }
};

/**
 * Attempts to break out of an iframe by redirecting the top window
 * @param targetUrl - The URL to navigate to (defaults to current URL)
 */
export const breakOutOfIframe = (targetUrl?: string): void => {
  const url = targetUrl || window.location.href;
  
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = url;
    }
  } catch (e) {
    // Cross-origin iframe - can't redirect parent, open in new tab instead
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Opens the login page in a new popup window for OAuth
 * @param loginUrl - The login page URL
 * @param width - Popup width (default: 500)
 * @param height - Popup height (default: 600)
 */
export const openLoginPopup = (
  loginUrl: string,
  width: number = 500,
  height: number = 600
): Window | null => {
  const left = Math.max(0, (window.screen.width - width) / 2);
  const top = Math.max(0, (window.screen.height - height) / 2);
  
  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'status=yes',
    'toolbar=no',
    'menubar=no',
    'location=yes',
  ].join(',');

  return window.open(loginUrl, 'oauth_popup', features);
};

/**
 * Opens the current page in a new tab (for iframe escape)
 */
export const openInNewTab = (url?: string): void => {
  window.open(url || window.location.href, '_blank', 'noopener,noreferrer');
};

/**
 * Listens for OAuth callback messages from popup windows
 * @param callback - Function to call when OAuth completes
 * @returns Cleanup function to remove the listener
 */
export const listenForOAuthCallback = (
  callback: (success: boolean, error?: string) => void
): (() => void) => {
  const handleMessage = (event: MessageEvent) => {
    // Validate origin for security
    if (event.origin !== window.location.origin) return;
    
    if (event.data?.type === 'oauth_callback') {
      callback(event.data.success, event.data.error);
    }
  };

  window.addEventListener('message', handleMessage);
  
  return () => window.removeEventListener('message', handleMessage);
};

/**
 * Sends OAuth result back to parent/opener window
 * @param success - Whether OAuth was successful
 * @param error - Error message if failed
 */
export const notifyOAuthComplete = (success: boolean, error?: string): void => {
  const message = { type: 'oauth_callback', success, error };
  
  // Try to send to opener (popup mode)
  if (window.opener) {
    window.opener.postMessage(message, window.location.origin);
    window.close();
    return;
  }
  
  // Try to send to parent (iframe mode - shouldn't happen but fallback)
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, window.location.origin);
  }
};
