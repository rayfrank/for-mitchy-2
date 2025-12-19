import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  return {
    // Dev (localhost) uses "/" so photos load
    // Build (GitHub Pages) uses "/for-mitchy-2/"
    base: command === "build" ? "/for-mitchy-2/" : "/",
  };
});
