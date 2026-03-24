import type { EnvVariable } from '@/types/envguard';

/**
 * Parse a .env file string into an array of EnvVariable entries.
 * Handles comments, blank lines, quoted values (single, double, backtick),
 * multiline values in double quotes, and inline comments.
 */
export function parseEnvContent(content: string): EnvVariable[] {
  const variables: EnvVariable[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines and comment-only lines
    if (trimmed === '' || trimmed.startsWith('#')) {
      i++;
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      i++;
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let valuePart = trimmed.slice(eqIndex + 1);
    const lineNumber = i + 1;

    // Handle quoted values
    if (
      (valuePart.startsWith('"') && !valuePart.endsWith('"')) ||
      (valuePart.startsWith('"') && valuePart === '"')
    ) {
      // Multiline double-quoted value
      const parts = [valuePart.slice(1)];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine.includes('"')) {
          const closeIdx = nextLine.indexOf('"');
          parts.push(nextLine.slice(0, closeIdx));
          break;
        }
        parts.push(nextLine);
        i++;
      }
      const value = parts.join('\n');
      variables.push({ key, value, line: lineNumber, raw: rawLine });
      i++;
      continue;
    }

    // Single-line quoted value
    const value = unquote(valuePart);

    variables.push({ key, value, line: lineNumber, raw: rawLine });
    i++;
  }

  return variables;
}

function unquote(val: string): string {
  let v = val.trim();

  // Remove inline comments for unquoted values
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    return v.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) {
    return v.slice(1, -1);
  }
  if (v.startsWith('`') && v.endsWith('`') && v.length >= 2) {
    return v.slice(1, -1);
  }

  // Strip inline comments (but not # in the value itself for URLs etc.)
  const hashIndex = v.indexOf(' #');
  if (hashIndex !== -1) {
    v = v.slice(0, hashIndex).trim();
  }

  return v;
}

/**
 * Serialize an array of EnvVariables back into .env file content.
 */
export function serializeEnv(variables: EnvVariable[]): string {
  return variables
    .map((v) => {
      const needsQuotes =
        v.value.includes('\n') ||
        v.value.includes(' ') ||
        v.value.includes('"') ||
        v.value.includes("'") ||
        v.value.includes('#');
      if (needsQuotes) {
        const escaped = v.value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
        return `${v.key}="${escaped}"`;
      }
      return `${v.key}=${v.value}`;
    })
    .join('\n');
}

/**
 * Generate .env.example content from variables.
 * Strips values, optionally adds placeholder comments.
 */
export function generateExample(
  variables: EnvVariable[],
  withComments: boolean
): string {
  return variables
    .map((v) => {
      const comment = withComments ? `# ${describeKey(v.key)}\n` : '';
      return `${comment}${v.key}=`;
    })
    .join('\n');
}

function describeKey(key: string): string {
  const lower = key.toLowerCase();
  if (lower.includes('url')) return 'URL endpoint';
  if (lower.includes('port')) return 'Port number';
  if (lower.includes('host')) return 'Hostname';
  if (lower.includes('key') || lower.includes('secret'))
    return 'Secret key (do not commit)';
  if (lower.includes('token')) return 'Authentication token (do not commit)';
  if (lower.includes('password') || lower.includes('pass'))
    return 'Password (do not commit)';
  if (lower.includes('database') || lower.includes('db'))
    return 'Database configuration';
  if (lower.includes('api')) return 'API configuration';
  if (lower.includes('email') || lower.includes('mail'))
    return 'Email configuration';
  if (lower.includes('redis')) return 'Redis configuration';
  if (lower.includes('node_env') || lower.includes('env'))
    return 'Environment setting';
  return 'Configuration value';
}
