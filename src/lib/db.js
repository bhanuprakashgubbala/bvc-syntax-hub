import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

    // Multiple possible source paths in serverless bundles
    const candidatePaths = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.join('/var/task', 'prisma', 'dev.db'),
      path.join('/var/task', 'dev.db'),
      path.resolve(__dirname, '..', '..', 'prisma', 'dev.db'),
      path.resolve(__dirname, '..', 'prisma', 'dev.db')
    ];

    let sourceDb = null;
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p) && fs.statSync(p).size > 0) {
          sourceDb = p;
          break;
        }
      } catch {
        // ignore check errors in read-only directories
      }
    }

    if (sourceDb) {
      try {
        const needsCopy = !fs.existsSync(tmpDbPath) || fs.statSync(tmpDbPath).size === 0;
        if (needsCopy) {
          fs.copyFileSync(sourceDb, tmpDbPath);
          console.log(`[DB] Copied SQLite database to writable path: ${tmpDbPath} (from ${sourceDb})`);
        }
        return `file:${tmpDbPath}`;
      } catch (err) {
        console.warn(`[DB] Error copying SQLite db to /tmp:`, err);
        return `file:${sourceDb}`;
      }
    } else {
      console.warn(`[DB] No source dev.db found. Target: ${tmpDbPath}`);
      return `file:${tmpDbPath}`;
    }
  }

  // Local development / dedicated server
  const localDb = path.resolve(process.cwd(), 'prisma', 'dev.db');
  return `file:${localDb}`;
}

const globalForPrisma = global;

function createPrismaClient() {
  const dbUrl = resolveDatabaseUrl();
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    }
  });
}

export const db = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
