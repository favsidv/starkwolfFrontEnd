/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PLAYER0_ADDRESS: string;
  readonly PLAYER0_PRIVATE_KEY: string;
  readonly PLAYER1_ADDRESS: string;
  readonly PLAYER1_PRIVATE_KEY: string;
  readonly PLAYER2_ADDRESS: string;
  readonly PLAYER2_PRIVATE_KEY: string;
  readonly PLAYER3_ADDRESS: string;
  readonly PLAYER3_PRIVATE_KEY: string;
  readonly PLAYER4_ADDRESS: string;
  readonly PLAYER4_PRIVATE_KEY: string;
  readonly PLAYER5_ADDRESS: string;
  readonly PLAYER5_PRIVATE_KEY: string;
  readonly PLAYER6_ADDRESS: string;
  readonly PLAYER6_PRIVATE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 