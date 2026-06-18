/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_BACKEND_URL: string;
  // add more env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
