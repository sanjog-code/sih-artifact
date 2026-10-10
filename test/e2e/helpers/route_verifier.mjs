import fs from 'node:fs';
import path from 'node:path';
import { ROUTES, WEB_SRC } from './env.mjs';

export function getRouteInventory() {
  const portalRoutes = [
    { path: '/', file: ROUTES.landing, name: 'Marketplace & Advisory' },
    { path: '/about', file: ROUTES.about, name: 'Institutional Trust & Cause' },
    { path: '/farmer', file: ROUTES.farmer, name: 'Farmer Command Center' },
    { path: '/buyer', file: ROUTES.buyer, name: 'Bulk Buyer & Vendor Hub' },
    { path: '/logistics', file: ROUTES.logistics, name: 'Logistics Command & VRP' },
    { path: '/consumer', file: ROUTES.consumer, name: 'Consumer Marketplace' },
  ];

  const results = portalRoutes.map((r) => ({
    ...r,
    exists: fs.existsSync(r.file),
    content: fs.existsSync(r.file) ? fs.readFileSync(r.file, 'utf8') : '',
  }));

  return results;
}

export function auditNavbarLinks() {
  if (!fs.existsSync(ROUTES.navbar)) {
    return { exists: false, links: [], missing: ['Navbar component file missing'] };
  }

  const content = fs.readFileSync(ROUTES.navbar, 'utf8');

  const requiredDestinations = [
    { target: '/farmer', label: 'Farmer Portal' },
    { target: '/buyer', label: 'Buyer Hub' },
    { target: '/logistics', label: 'Logistics' },
    { target: '/consumer', label: 'Consumer Portal' },
    { target: '/about', label: 'About Us' },
    { target: 'marketplace', label: 'Marketplace' },
    { target: 'advisory', label: 'Advisory' },
  ];

  const detected = [];
  const missing = [];

  for (const req of requiredDestinations) {
    const hasTarget = content.includes(req.target);
    if (hasTarget) {
      detected.push(req);
    } else {
      missing.push(req);
    }
  }

  return {
    exists: true,
    hasDirectLinks: detected.length >= 5,
    detected,
    missing,
    hasLanguageSelector: content.includes('Language') || content.includes('भाषा') || content.includes('useLanguage'),
    hasMobileDrawer: content.includes('isOpen') || content.includes('Menu') || content.includes('X'),
  };
}

export function auditLayoutHygiene() {
  const layoutPath = path.join(WEB_SRC, 'app/layout.tsx');
  if (!fs.existsSync(layoutPath)) return { exists: false };

  const content = fs.readFileSync(layoutPath, 'utf8');
  return {
    exists: true,
    wrapsLanguageProvider: content.includes('LanguageProvider'),
    hasGeistFonts: content.includes('Geist'),
    hasMetadata: content.includes('metadata'),
  };
}
