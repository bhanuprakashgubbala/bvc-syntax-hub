import { NextResponse } from 'next/server';
import { executeCode, getServersStatus } from '@/lib/compiler/serverManager';
import { SERVERS } from '@/lib/compiler/constants';

/**
 * GET /api/compile
 * Returns the real-time status, health, and configuration state of all 5 execution servers.
 */
export async function GET() {
  try {
    const servers = getServersStatus();
    return NextResponse.json({
      success: true,
      servers,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compile
 * Executes code using the selected compiler server with automatic backup support.
 */
export async function POST(req) {
  const startTime = performance.now();
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      language, 
      code, 
      stdin, 
      server, 
      serverId, 
      engine, 
      autoFallback = false 
    } = body;

    if (!language || !code) {
      return NextResponse.json(
        { success: false, error: "Language and code are required." },
        { status: 400 }
      );
    }

    // Map backwards-compatible engine/server param to standardized server ID
    let requestedServer = server || serverId || engine || SERVERS.DEFAULT;
    if (requestedServer === 'judge0') requestedServer = SERVERS.CE_JUDGE;
    if (requestedServer === 'wandbox' || requestedServer === 'auto') requestedServer = SERVERS.DEFAULT;

    // Execute via centralized Server Manager
    const result = await executeCode({
      serverId: requestedServer,
      language,
      code,
      stdin,
      autoFallback: Boolean(autoFallback)
    });

    const executionTimeMs = Math.round(performance.now() - startTime);
    const executionTimeSec = result.time || (executionTimeMs / 1000).toFixed(2) + "s";

    return NextResponse.json({
      success: result.success,
      server: result.usedServer,
      serverName: result.usedServerName,
      requestedServer: result.requestedServer,
      usedServer: result.usedServer,
      usedServerName: result.usedServerName,
      fallbackOccurred: result.fallbackOccurred,
      fallbackReason: result.fallbackReason || undefined,
      availableFallbackServers: result.availableFallbackServers || undefined,
      warning: result.warning || undefined,
      executionTime: executionTimeSec,
      executionTimeMs,
      exitCode: result.exitCode,
      status: result.status,
      run: {
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        output: result.output || "",
        code: result.exitCode
      },
      compile: {
        stdout: "",
        stderr: result.compileError || "",
        output: result.compileError || "",
        code: result.compileError ? 1 : 0
      },
      output: result.output,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      compileError: result.compileError || undefined,
      error: result.error || undefined,
      memory: result.memory || undefined,
      engine: result.usedServerName,
      engineDetail: result.engineDetail
    });
  } catch (error) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    console.error("Multi-Server Compilation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Compilation failed: " + error.message,
        output: `❌ System Error: ${error.message}`,
        executionTime: (executionTimeMs / 1000).toFixed(2) + "s",
        executionTimeMs
      },
      { status: 500 }
    );
  }
}
