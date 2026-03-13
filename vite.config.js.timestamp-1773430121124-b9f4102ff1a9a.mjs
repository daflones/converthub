// vite.config.js
import { defineConfig } from "file:///C:/Users/dudud/OneDrive/%C3%81rea%20de%20Trabalho/Nova%20pasta/CascadeProjects/windsurf-project/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/dudud/OneDrive/%C3%81rea%20de%20Trabalho/Nova%20pasta/CascadeProjects/windsurf-project/node_modules/@vitejs/plugin-react/dist/index.js";
import Sitemap from "file:///C:/Users/dudud/OneDrive/%C3%81rea%20de%20Trabalho/Nova%20pasta/CascadeProjects/windsurf-project/node_modules/vite-plugin-sitemap/dist/index.js";
import { viteObfuscateFile } from "file:///C:/Users/dudud/OneDrive/%C3%81rea%20de%20Trabalho/Nova%20pasta/CascadeProjects/windsurf-project/node_modules/vite-plugin-obfuscator/index.js";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    react(),
    Sitemap({
      hostname: "https://converthub.nanosync.com.br",
      dynamicRoutes: [
        "/",
        "/baixar-video-youtube",
        "/baixar-video-instagram",
        "/baixar-video-tiktok",
        "/conversor-de-video",
        "/conversor-de-audio",
        "/conversor-de-imagem",
        "/conversor-de-documentos",
        "/conversor-base64",
        "/conversor-de-caracteres"
      ],
      changefreq: "weekly",
      priority: 0.8
    }),
    mode === "production" && viteObfuscateFile({
      options: {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: "hexadecimal",
        rotateStringArray: true,
        selfDefending: false,
        stringArray: true,
        stringArrayEncoding: ["base64"],
        stringArrayThreshold: 0.75
      }
    })
  ].filter(Boolean),
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxkdWR1ZFxcXFxPbmVEcml2ZVxcXFxcdTAwQzFyZWEgZGUgVHJhYmFsaG9cXFxcTm92YSBwYXN0YVxcXFxDYXNjYWRlUHJvamVjdHNcXFxcd2luZHN1cmYtcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZHVkdWRcXFxcT25lRHJpdmVcXFxcXHUwMEMxcmVhIGRlIFRyYWJhbGhvXFxcXE5vdmEgcGFzdGFcXFxcQ2FzY2FkZVByb2plY3RzXFxcXHdpbmRzdXJmLXByb2plY3RcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2R1ZHVkL09uZURyaXZlLyVDMyU4MXJlYSUyMGRlJTIwVHJhYmFsaG8vTm92YSUyMHBhc3RhL0Nhc2NhZGVQcm9qZWN0cy93aW5kc3VyZi1wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCBTaXRlbWFwIGZyb20gJ3ZpdGUtcGx1Z2luLXNpdGVtYXAnXG5pbXBvcnQgeyB2aXRlT2JmdXNjYXRlRmlsZSB9IGZyb20gJ3ZpdGUtcGx1Z2luLW9iZnVzY2F0b3InXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFNpdGVtYXAoe1xuICAgICAgaG9zdG5hbWU6ICdodHRwczovL2NvbnZlcnRodWIubmFub3N5bmMuY29tLmJyJyxcbiAgICAgIGR5bmFtaWNSb3V0ZXM6IFtcbiAgICAgICAgJy8nLFxuICAgICAgICAnL2JhaXhhci12aWRlby15b3V0dWJlJyxcbiAgICAgICAgJy9iYWl4YXItdmlkZW8taW5zdGFncmFtJyxcbiAgICAgICAgJy9iYWl4YXItdmlkZW8tdGlrdG9rJyxcbiAgICAgICAgJy9jb252ZXJzb3ItZGUtdmlkZW8nLFxuICAgICAgICAnL2NvbnZlcnNvci1kZS1hdWRpbycsXG4gICAgICAgICcvY29udmVyc29yLWRlLWltYWdlbScsXG4gICAgICAgICcvY29udmVyc29yLWRlLWRvY3VtZW50b3MnLFxuICAgICAgICAnL2NvbnZlcnNvci1iYXNlNjQnLFxuICAgICAgICAnL2NvbnZlcnNvci1kZS1jYXJhY3RlcmVzJyxcbiAgICAgIF0sXG4gICAgICBjaGFuZ2VmcmVxOiAnd2Vla2x5JyxcbiAgICAgIHByaW9yaXR5OiAwLjgsXG4gICAgfSksXG4gICAgbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nICYmIHZpdGVPYmZ1c2NhdGVGaWxlKHtcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgY29tcGFjdDogdHJ1ZSxcbiAgICAgICAgY29udHJvbEZsb3dGbGF0dGVuaW5nOiBmYWxzZSxcbiAgICAgICAgZGVhZENvZGVJbmplY3Rpb246IGZhbHNlLFxuICAgICAgICBkZWJ1Z1Byb3RlY3Rpb246IGZhbHNlLFxuICAgICAgICBkaXNhYmxlQ29uc29sZU91dHB1dDogdHJ1ZSxcbiAgICAgICAgaWRlbnRpZmllck5hbWVzR2VuZXJhdG9yOiAnaGV4YWRlY2ltYWwnLFxuICAgICAgICByb3RhdGVTdHJpbmdBcnJheTogdHJ1ZSxcbiAgICAgICAgc2VsZkRlZmVuZGluZzogZmFsc2UsXG4gICAgICAgIHN0cmluZ0FycmF5OiB0cnVlLFxuICAgICAgICBzdHJpbmdBcnJheUVuY29kaW5nOiBbJ2Jhc2U2NCddLFxuICAgICAgICBzdHJpbmdBcnJheVRocmVzaG9sZDogMC43NSxcbiAgICAgIH1cbiAgICB9KSxcbiAgXS5maWx0ZXIoQm9vbGVhbiksXG4gIHNlcnZlcjoge1xuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6ICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXG4gICAgfVxuICB9XG59KSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeWMsU0FBUyxvQkFBb0I7QUFDdGUsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sYUFBYTtBQUNwQixTQUFTLHlCQUF5QjtBQUVsQyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLGVBQWU7QUFBQSxRQUNiO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLE1BQ1osVUFBVTtBQUFBLElBQ1osQ0FBQztBQUFBLElBQ0QsU0FBUyxnQkFBZ0Isa0JBQWtCO0FBQUEsTUFDekMsU0FBUztBQUFBLFFBQ1AsU0FBUztBQUFBLFFBQ1QsdUJBQXVCO0FBQUEsUUFDdkIsbUJBQW1CO0FBQUEsUUFDbkIsaUJBQWlCO0FBQUEsUUFDakIsc0JBQXNCO0FBQUEsUUFDdEIsMEJBQTBCO0FBQUEsUUFDMUIsbUJBQW1CO0FBQUEsUUFDbkIsZUFBZTtBQUFBLFFBQ2YsYUFBYTtBQUFBLFFBQ2IscUJBQXFCLENBQUMsUUFBUTtBQUFBLFFBQzlCLHNCQUFzQjtBQUFBLE1BQ3hCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
