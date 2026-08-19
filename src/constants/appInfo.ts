import packageJson from "@/package.json";

/**
 * Versão única do aplicativo.
 * Obtida diretamente do package.json (fonte única da verdade).
 */
export const APP_VERSION: string = packageJson.version;
export const APP_NAME: string = packageJson.name;
