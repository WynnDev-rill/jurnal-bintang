import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wynn.jurnalbintang",
  appName: "Jurnal Bintang",
  webDir: "dist",
  server: {
    url: "https://jurnal-bintang.vercel.app",
    cleartext: false,
    allowNavigation: ["jurnal-bintang.vercel.app"],
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
