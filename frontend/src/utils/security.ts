// security.ts
import { AxiosRequestConfig } from 'axios';

export const securityConfig = {
    // CSP Headers
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", process.env.REACT_APP_API_URL],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },

    // Axios Security Configuration
    axiosConfig: {
        withCredentials: true,
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
        },
    } as AxiosRequestConfig,

    // Cookie Security Settings
    cookieOptions: {
        secure: true,
        sameSite: 'strict',
        httpOnly: true,
    },

    // Authentication Settings
    auth: {
        tokenRefreshInterval: 15 * 60 * 1000, // 15 minutes
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
    },
};

// Input sanitization function
export const sanitizeInput = (input: string): string => {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// URL sanitization
export const sanitizeURL = (url: string): string => {
    try {
        const parsed = new URL(url);
        const allowedDomains = [
            window.location.hostname,
            process.env.REACT_APP_API_URL,
        ].filter(Boolean);
        
        if (allowedDomains.includes(parsed.hostname)) {
            return url;
        }
        throw new Error('Invalid domain');
    } catch {
        return '/';
    }
};

// Token validation
export const validateToken = (token: string): boolean => {
    try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        return Date.now() < exp;
    } catch {
        return false;
    }
};
