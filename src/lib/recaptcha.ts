/**
 * Google reCAPTCHA v3 Utility
 * Handles loading and executing reCAPTCHA v3
 */

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

if (!RECAPTCHA_SITE_KEY) {
  console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set');
}

/**
 * Loads the reCAPTCHA script dynamically
 */
export function loadRecaptchaScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.grecaptcha && window.grecaptcha.ready) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existingScript) {
      // Wait for grecaptcha to be available
      const checkInterval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.grecaptcha) {
          reject(new Error('reCAPTCHA script failed to load'));
        }
      }, 5000);
      return;
    }

    // Create and append script tag
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        resolve();
      } else {
        reject(new Error('reCAPTCHA script loaded but grecaptcha is not available'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Executes reCAPTCHA v3 and returns a token
 * @param action - The action name (e.g., 'submit', 'contact_form')
 * @returns Promise that resolves to the reCAPTCHA token
 */
export async function executeRecaptcha(action: string = 'submit'): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) {
    throw new Error('reCAPTCHA site key is not configured');
  }

  // Ensure script is loaded
  await loadRecaptchaScript();

  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then((token: string) => {
          resolve(token);
        })
        .catch((error: Error) => {
          reject(new Error(`reCAPTCHA execution failed: ${error.message}`));
        });
    });
  });
}

