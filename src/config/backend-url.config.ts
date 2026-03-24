/**
 * Backend URL Configuration
 * Toggle between local and deployed backend
 * 
 * INSTRUCTIONS:
 * 1. For LOCAL backend: Set USE_LOCAL_BACKEND = true
 * 2. For DEPLOYED backend: Set USE_LOCAL_BACKEND = false
 * 
 * When you change this, restart your dev server (npm run dev)
 */

// ==========================================
// TOGGLE THIS VALUE TO SWITCH BACKENDS
// ==========================================
export const USE_LOCAL_BACKEND = true; // Change to true for local, false for deployed

// Backend URLs
const LOCAL_BACKEND_URL = 'http://localhost:5000';
const DEPLOYED_BACKEND_URL = 'https://ebookbackend.vercel.app';

// Export the active backend URL
export const BACKEND_URL = USE_LOCAL_BACKEND ? LOCAL_BACKEND_URL : DEPLOYED_BACKEND_URL;

// For debugging - logs which backend is being used
console.log(`[Backend Config] Using ${USE_LOCAL_BACKEND ? 'LOCAL' : 'DEPLOYED'} backend: ${BACKEND_URL}`);
