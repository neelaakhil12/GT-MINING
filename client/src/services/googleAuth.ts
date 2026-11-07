export const GOOGLE_CLIENT_ID = '793304113901-ea3rlvn5lkvkedpdm5in2pcnafg8vb70.apps.googleusercontent.com';

export interface GoogleUserProfile {
  email: string;
  name: string;
  sub: string;
  picture?: string;
}

/**
 * Initiates the Google OAuth 2.0 Sign In flow.
 * - Always forces Google to show the account selection screen (`select_account`).
 * - Resolves with the user's verified Google profile (email, name, sub).
 */
export async function triggerGoogleSignIn(isSignup: boolean = false): Promise<GoogleUserProfile> {
  return new Promise((resolve, reject) => {
    const google = typeof window !== 'undefined' ? (window as any).google : null;

    // Method 1: Try Google Identity Services (GSI) Token Client popup
    if (google?.accounts?.oauth2) {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (resp: any) => {
            if (resp.error) {
              return reject(new Error(resp.error_description || resp.error || 'Google sign-in was canceled'));
            }
            if (!resp.access_token) {
              return reject(new Error('No access token received from Google'));
            }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${resp.access_token}` },
              });
              if (!res.ok) {
                throw new Error('Failed to retrieve profile from Google');
              }
              const profile: GoogleUserProfile = await res.json();
              resolve(profile);
            } catch (err: any) {
              reject(err);
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('GSI Token client error, falling back to direct OAuth redirect:', err);
      }
    }

    // Method 2: Standard Google OAuth 2.0 redirect flow (100% reliable fallback)
    try {
      sessionStorage.setItem('gt_google_auth_mode', isSignup ? 'signup' : 'login');
      const redirectUri = window.location.origin + window.location.pathname;
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        GOOGLE_CLIENT_ID
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=email%20profile%20openid&prompt=select_account`;
      window.location.href = authUrl;
    } catch (redirectErr: any) {
      reject(redirectErr);
    }
  });
}

/**
 * Checks if the user was just redirected back from Google OAuth with an access token in the hash.
 * If so, fetches their Google profile and cleans the URL.
 */
export async function checkGoogleRedirectResponse(): Promise<{ profile: GoogleUserProfile; isSignup: boolean } | null> {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;

  try {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    if (!accessToken) return null;

    // Clean hash from browser address bar immediately so refreshing won't re-trigger
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    const isSignup = sessionStorage.getItem('gt_google_auth_mode') === 'signup';
    sessionStorage.removeItem('gt_google_auth_mode');

    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error('Failed to retrieve profile from Google access token');
    }

    const profile: GoogleUserProfile = await res.json();
    return { profile, isSignup };
  } catch (err) {
    console.error('Error handling Google redirect callback:', err);
    return null;
  }
}
