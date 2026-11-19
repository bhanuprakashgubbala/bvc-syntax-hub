import { NextResponse } from 'next/server';
import { 
  getCodeSpaceConfig, 
  saveCodeSpaceConfig, 
  INITIAL_SERVERS, 
  INITIAL_LANGUAGES, 
  INITIAL_SETTINGS 
} from '@/lib/compiler/codespaceConfig';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getCodeSpaceConfig();

    // Generate quick lookup dictionaries for convenience
    const defaultCode = {};
    const languageVersions = {};
    const languageDisplayNames = {};
    const languageColors = {};

    config.languages.forEach(l => {
      defaultCode[l.id] = l.defaultCode || '';
      languageVersions[l.id] = l.version || 'Latest';
      languageDisplayNames[l.id] = l.name || l.id;
      languageColors[l.id] = {
        text: l.colorText || 'text-zinc-200',
        bg: l.colorBg || 'bg-zinc-800',
        border: l.colorBorder || 'border-zinc-700',
        dot: l.colorDot || 'bg-emerald-400'
      };
    });

    return NextResponse.json({
      success: true,
      servers: config.servers,
      languages: config.languages,
      settings: config.settings,
      defaultCode,
      languageVersions,
      languageDisplayNames,
      languageColors,
      updatedAt: config.updatedAt
    });
  } catch (error) {
    console.error('Error fetching codespace config:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, payload, requesterRole = 'HOD' } = body;

    let config = getCodeSpaceConfig();

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action parameter is required.' },
        { status: 400 }
      );
    }

    let message = 'Code Space updated successfully.';

    switch (action) {
      case 'ADD_SERVER': {
        const { id, name, badge, desc, ping, protocol = 'judge0', isDefault = false } = payload || {};
        if (!id || !name) {
          return NextResponse.json({ success: false, error: 'Server ID and Name are required.' }, { status: 400 });
        }
        const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (config.servers.some(s => s.id === cleanId)) {
          return NextResponse.json({ success: false, error: `A server with ID '${cleanId}' already exists.` }, { status: 409 });
        }

        const newServer = {
          id: cleanId,
          name: name.trim(),
          badge: badge?.trim() || 'Custom Cloud',
          desc: desc?.trim() || 'Custom Compiler Cluster',
          ping: ping?.trim() || '35ms',
          iconColor: payload.iconColor || 'text-cyan-400',
          isDefault: Boolean(isDefault),
          status: 'online',
          protocol
        };

        if (newServer.isDefault) {
          config.servers.forEach(s => s.isDefault = false);
        }

        config.servers.push(newServer);
        message = `Server '${newServer.name}' added successfully.`;
        break;
      }

      case 'EDIT_SERVER': {
        const { id, name, badge, desc, ping, protocol, isDefault, status, iconColor } = payload || {};
        const index = config.servers.findIndex(s => s.id === id);
        if (index === -1) {
          return NextResponse.json({ success: false, error: `Server with ID '${id}' not found.` }, { status: 404 });
        }

        if (isDefault) {
          config.servers.forEach(s => s.isDefault = false);
        }

        config.servers[index] = {
          ...config.servers[index],
          name: name ? name.trim() : config.servers[index].name,
          badge: badge ? badge.trim() : config.servers[index].badge,
          desc: desc ? desc.trim() : config.servers[index].desc,
          ping: ping ? ping.trim() : config.servers[index].ping,
          protocol: protocol || config.servers[index].protocol,
          status: status || config.servers[index].status,
          iconColor: iconColor || config.servers[index].iconColor,
          isDefault: isDefault !== undefined ? Boolean(isDefault) : config.servers[index].isDefault
        };

        message = `Server '${config.servers[index].name}' updated successfully.`;
        break;
      }

      case 'DELETE_SERVER': {
        const { id } = payload || {};
        if (config.servers.length <= 1) {
          return NextResponse.json({ success: false, error: 'Cannot delete the only available compiler server.' }, { status: 400 });
        }
        const filtered = config.servers.filter(s => s.id !== id);
        if (filtered.length === config.servers.length) {
          return NextResponse.json({ success: false, error: `Server with ID '${id}' not found.` }, { status: 404 });
        }
        if (!filtered.some(s => s.isDefault)) {
          filtered[0].isDefault = true;
        }
        config.servers = filtered;
        message = `Server '${id}' removed from Code Space.`;
        break;
      }

      case 'ADD_LANGUAGE': {
        const { id, name, version, extension, defaultCode } = payload || {};
        if (!id || !name) {
          return NextResponse.json({ success: false, error: 'Language ID and Display Name are required.' }, { status: 400 });
        }
        const cleanId = id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (config.languages.some(l => l.id === cleanId)) {
          return NextResponse.json({ success: false, error: `Language '${cleanId}' already exists.` }, { status: 409 });
        }

        const newLang = {
          id: cleanId,
          name: name.trim(),
          version: version?.trim() || 'Latest',
          extension: extension?.startsWith('.') ? extension.trim() : `.${extension?.trim() || cleanId}`,
          defaultCode: defaultCode || '',
          colorText: payload.colorText || 'text-violet-400',
          colorBg: payload.colorBg || 'bg-violet-500/10',
          colorBorder: payload.colorBorder || 'border-violet-500/30',
          colorDot: payload.colorDot || 'bg-violet-400',
          status: 'active'
        };

        config.languages.push(newLang);
        message = `Language '${newLang.name}' added to Code Space.`;
        break;
      }

      case 'EDIT_LANGUAGE': {
        const { id, name, version, extension, defaultCode, status } = payload || {};
        const index = config.languages.findIndex(l => l.id === id);
        if (index === -1) {
          return NextResponse.json({ success: false, error: `Language '${id}' not found.` }, { status: 404 });
        }

        config.languages[index] = {
          ...config.languages[index],
          name: name ? name.trim() : config.languages[index].name,
          version: version ? version.trim() : config.languages[index].version,
          extension: extension ? (extension.startsWith('.') ? extension : `.${extension}`) : config.languages[index].extension,
          defaultCode: defaultCode !== undefined ? defaultCode : config.languages[index].defaultCode,
          status: status || config.languages[index].status
        };

        message = `Language '${config.languages[index].name}' updated.`;
        break;
      }

      case 'DELETE_LANGUAGE': {
        const { id } = payload || {};
        if (config.languages.length <= 1) {
          return NextResponse.json({ success: false, error: 'Cannot remove the last programming language.' }, { status: 400 });
        }
        const filtered = config.languages.filter(l => l.id !== id);
        if (filtered.length === config.languages.length) {
          return NextResponse.json({ success: false, error: `Language '${id}' not found.` }, { status: 404 });
        }
        config.languages = filtered;
        message = `Language '${id}' removed from Code Space.`;
        break;
      }

      case 'UPDATE_SETTINGS': {
        config.settings = {
          ...config.settings,
          ...payload
        };
        message = 'Code Space global settings updated.';
        break;
      }

      case 'RESET_DEFAULTS': {
        config = {
          servers: INITIAL_SERVERS,
          languages: INITIAL_LANGUAGES,
          settings: INITIAL_SETTINGS,
          updatedAt: new Date().toISOString()
        };
        message = 'Code Space restored to default institutional configurations.';
        break;
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }

    saveCodeSpaceConfig(config);

    // Audit log
    try {
      await db.auditLog.create({
        data: {
          role: requesterRole,
          action: 'CODESPACE_CONFIG_UPDATE',
          details: `HOD updated Code Space configuration: ${action} - ${message}`
        }
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message,
      servers: config.servers,
      languages: config.languages,
      settings: config.settings,
      updatedAt: config.updatedAt
    });

  } catch (error) {
    console.error('Error updating codespace config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update Code Space configuration: ' + error.message },
      { status: 500 }
    );
  }
}
