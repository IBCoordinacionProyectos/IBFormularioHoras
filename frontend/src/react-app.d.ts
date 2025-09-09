/// <reference types="vite/client" />

// This file is used to declare modules that don't have their own type declarations.
declare module 'react/jsx-runtime';

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SKIP_LOGIN: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
