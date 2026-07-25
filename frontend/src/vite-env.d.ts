/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_CURRENCY: string;
  readonly VITE_BASE_FEE_IN_CENTS: string;
  readonly VITE_DELIVERY_FEE_IN_CENTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
