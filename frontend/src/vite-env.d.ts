/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SKIP_LOGIN: string;
  readonly VITE_BACKEND_URL: string;
  // más variables de entorno...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
