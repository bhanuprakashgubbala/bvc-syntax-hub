import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Resolves the appropriate database URL depending on runtime environment:
 * 1. External Cloud Database (Supabase, Neon, PostgreSQL) if DATABASE_URL is set.
 * 2. Serverless Runtime (Netlify, AWS Lambda, Vercel): copies bundled dev.db to writable /tmp/dev.db.
 * 3. Local Development: connects directly to ./prisma/dev.db.
 */
function resolveDatabaseUrl() {
  // If an external cloud database URL is configured in environment
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:')) {
    return process.env.DATABASE_URL;
  }

  // Detect serverless environment (Netlify, AWS Lambda, Vercel)
  const isServerless = Boolean(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.VERCEL
  );

  if (isServerless) {
    const tmpDbPath = path.join(os.tmpdir(), 'dev.db');

    // Possible bundled source paths in serverless distributions
    const p1 = path.join(process.cwd(), 'prisma', 'dev.db');
    const p2 = path.join('/var/task', 'prisma', 'dev.db');
    const p3 = path.join(process.cwd(), 'dev.db');
    const p4 = path.join('/var/task', 'dev.db');

    let sourceDb = null;
    if (fs.existsSync(/*turbopackIgnore: true*/ p1)) {
      sourceDb = p1;
    } else if (fs.existsSync(/*turbopackIgnore: true*/ p2)) {
      sourceDb = p2;
    } else if (fs.existsSync(/*turbopackIgnore: true*/ p3)) {
      sourceDb = p3;
    } else if (fs.existsSync(/*turbopackIgnore: true*/ p4)) {
      sourceDb = p4;
    }

    if (sourceDb) {
      try {
        const needsCopy = !fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath) || fs.statSync(/*turbopackIgnore: true*/ tmpDbPath).size === 0;
        if (needsCopy) {
          fs.copyFileSync(sourceDb, tmpDbPath);
          console.log(`[DB] Successfully mounted SQLite database at writable path: ${tmpDbPath} (from ${sourceDb})`);
        }
        return `file:${tmpDbPath}`;
      } catch (err) {
        console.warn(`[DB] Error mounting SQLite db in /tmp:`, err);
        return `file:${sourceDb}`;
      }
    } else {
      console.warn(`[DB] Bundled dev.db not located. Falling back to target: ${tmpDbPath}`);
      return `file:${tmpDbPath}`;
    }
  }

  // Local development / dedicated server
  const localDb = path.resolve(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDb}`;
}

const globalForPrisma = globalThis;

function createPrismaClient() {
  const dbUrl = resolveDatabaseUrl();
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
}

// Single correct Prisma client initialization
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

export default db;
