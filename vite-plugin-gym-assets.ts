import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

function resolveGymPublicDir(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'src/modules/gym/fitai/public'),
    path.resolve(__dirname, 'src/modules/gym/fitai/public'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Hace accesibles los assets de `public/` del submódulo FitAi
 * (src/modules/gym/fitai/public) sin copiarlos al repositorio:
 * - dev: middleware que los sirve desde el disco en su ruta raíz
 *   (p. ej. `/exercisesDatabase.json`).
 * - build: los emite a `dist/` para que funcionen en producción.
 */
export function gymPublicAssets(): Plugin {
  const gymPublicDir = resolveGymPublicDir();
  return {
    name: 'gym-public-assets',
    configureServer(server) {
      if (!gymPublicDir) return;
      server.middlewares.use(
        (req: { url?: string | undefined }, res: any, next: (err?: unknown) => void) => {
          const url = (req.url ?? '').split('?')[0];
          const isSafe = url.startsWith('/') && !url.split('/').includes('..');
          if (!isSafe) return next();
          const filePath = path.join(gymPublicDir, url);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', url.endsWith('.json') ? 'application/json' : 'application/octet-stream');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
          next();
        }
      );
    },
    generateBundle() {
      if (!gymPublicDir) return;
      for (const name of fs.readdirSync(gymPublicDir)) {
        const filePath = path.join(gymPublicDir, name);
        if (!fs.statSync(filePath).isFile()) continue;
        this.emitFile({ type: 'asset', fileName: name, source: fs.readFileSync(filePath) });
      }
    },
  };
}