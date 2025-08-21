/**
 * Validates if a URL is safe to navigate to
 * @param url URL to validate
 * @returns boolean indicating if URL is safe
 */
export const isSafeUrl = (url: string): boolean => {
  try {
    // Check if it's a relative URL
    if (url.startsWith('/') && !url.startsWith('//')) {
      return true;
    }

    // For absolute URLs, validate against allowed domains
    const allowedDomains = [
      window.location.hostname,
      process.env.VITE_API_URL ? new URL(process.env.VITE_API_URL).hostname : '',
      process.env.VITE_SUPABASE_URL ? new URL(process.env.VITE_SUPABASE_URL).hostname : ''
    ].filter(Boolean);

    const urlObject = new URL(url);
    return allowedDomains.includes(urlObject.hostname);
  } catch {
    return false;
  }
};

/**
 * Sanitizes and validates navigation target
 * @param to Navigation target
 * @returns Safe navigation target or '/'
 */
export const getSafeNavigationTarget = (to: string): string => {
  // If it's a relative path starting with /, it's safe
  if (to.startsWith('/') && !to.startsWith('//')) {
    return to;
  }

  // For other URLs, validate them
  return isSafeUrl(to) ? to : '/';
};
