import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('Global setup for coverage collection');
  // Ensure coverage directory exists
  const coverageDir = path.join(process.cwd(), '../frontend/coverage');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
}

export default globalSetup;
