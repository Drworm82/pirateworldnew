import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pirateworld.app",
  appName: "PirateWorld",
  webDir: "dist",
  bundledWebRuntime: false,
  server: { androidScheme: "https" }
};

export default config;
