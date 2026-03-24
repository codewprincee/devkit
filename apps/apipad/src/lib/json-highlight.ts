interface Token {
  type: 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation';
  value: string;
}

function tokenize(json: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < json.length) {
    const ch = json[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === '"') {
      let str = '"';
      i++;
      while (i < json.length && json[i] !== '"') {
        if (json[i] === '\\') {
          str += json[i] + json[i + 1];
          i += 2;
        } else {
          str += json[i];
          i++;
        }
      }
      str += '"';
      i++;

      // Check if this is a key (next non-whitespace is ':')
      let j = i;
      while (j < json.length && /\s/.test(json[j])) j++;
      if (json[j] === ':') {
        tokens.push({ type: 'key', value: str });
      } else {
        tokens.push({ type: 'string', value: str });
      }
      continue;
    }

    if (ch === '-' || /\d/.test(ch)) {
      let num = '';
      while (i < json.length && /[\d.eE\-+]/.test(json[i])) {
        num += json[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }

    if (json.startsWith('true', i)) {
      tokens.push({ type: 'boolean', value: 'true' });
      i += 4;
      continue;
    }

    if (json.startsWith('false', i)) {
      tokens.push({ type: 'boolean', value: 'false' });
      i += 5;
      continue;
    }

    if (json.startsWith('null', i)) {
      tokens.push({ type: 'null', value: 'null' });
      i += 4;
      continue;
    }

    if ('{}[],:'.includes(ch)) {
      tokens.push({ type: 'punctuation', value: ch });
      i++;
      continue;
    }

    i++;
  }

  return tokens;
}

const colorMap: Record<Token['type'], string> = {
  key: 'text-blue-400',
  string: 'text-emerald-400',
  number: 'text-amber-400',
  boolean: 'text-violet-400',
  null: 'text-gray-500',
  punctuation: 'text-gray-500',
};

export function highlightJson(json: string): string {
  try {
    const formatted = JSON.stringify(JSON.parse(json), null, 2);
    const tokens = tokenize(formatted);

    return tokens
      .map((t) => {
        const escaped = t.value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<span class="${colorMap[t.type]}">${escaped}</span>`;
      })
      .join('');
  } catch {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
