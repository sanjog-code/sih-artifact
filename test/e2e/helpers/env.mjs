import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, '../../..');
export const APPS_DIR = path.join(PROJECT_ROOT, 'apps');
export const WEB_DIR = path.join(APPS_DIR, 'web');
export const WEB_SRC = path.join(WEB_DIR, 'src');
export const PACKAGES_DIR = path.join(PROJECT_ROOT, 'packages');
export const SHARED_DIR = path.join(PACKAGES_DIR, 'shared');
export const SHARED_SRC = path.join(SHARED_DIR, 'src');

export const ROUTES = {
  landing: path.join(WEB_SRC, 'app/page.tsx'),
  about: path.join(WEB_SRC, 'app/about/page.tsx'),
  farmer: path.join(WEB_SRC, 'app/farmer/page.tsx'),
  buyer: path.join(WEB_SRC, 'app/buyer/page.tsx'),
  logistics: path.join(WEB_SRC, 'app/logistics/page.tsx'),
  consumer: path.join(WEB_SRC, 'app/consumer/page.tsx'),
  navbar: path.join(WEB_SRC, 'components/Navbar.tsx'),
  footer: path.join(WEB_SRC, 'components/Footer.tsx'),
  languageContext: path.join(WEB_SRC, 'context/LanguageContext.tsx'),
  storeIndex: path.join(WEB_SRC, 'lib/store/index.ts'),
  forecastRoute: path.join(WEB_SRC, 'app/api/ai/forecast/route.ts'),
  routeOptimizeRoute: path.join(WEB_SRC, 'app/api/ai/route-optimize/route.ts'),
  gradingRoute: path.join(WEB_SRC, 'app/api/ai/grading/route.ts'),
  shelfLifeRoute: path.join(WEB_SRC, 'app/api/ai/shelf-life/route.ts'),
  aiSchemas: path.join(SHARED_SRC, 'schemas/ai.ts'),
};
