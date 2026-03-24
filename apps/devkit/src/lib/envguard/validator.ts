import type { EnvVariable, ValidationIssue, ValidationReport } from '@/types/envguard';

export function validateVariables(
  variables: EnvVariable[],
  exampleVariables?: EnvVariable[]
): ValidationReport {
  const issues: ValidationIssue[] = [];

  // Check for duplicate keys
  const seen = new Map<string, number>();
  for (const v of variables) {
    const prev = seen.get(v.key);
    if (prev !== undefined) {
      issues.push({
        key: v.key,
        value: v.value,
        message: `Duplicate key (also defined on line ${prev})`,
        severity: 'error',
        line: v.line,
      });
    }
    seen.set(v.key, v.line);
  }

  for (const v of variables) {
    // Empty value
    if (v.value === '') {
      issues.push({
        key: v.key,
        value: v.value,
        message: 'Empty value',
        severity: 'warning',
        line: v.line,
      });
    }

    // Leading/trailing whitespace
    if (v.value !== v.value.trim() && v.value !== '') {
      issues.push({
        key: v.key,
        value: v.value,
        message: 'Value has leading or trailing whitespace',
        severity: 'warning',
        line: v.line,
      });
    }

    // URL validation
    const keyLower = v.key.toLowerCase();
    if (
      (keyLower.includes('url') || keyLower.includes('uri') || keyLower.includes('endpoint')) &&
      v.value !== ''
    ) {
      if (
        !v.value.startsWith('http://') &&
        !v.value.startsWith('https://') &&
        !v.value.startsWith('${') // allow variable interpolation
      ) {
        issues.push({
          key: v.key,
          value: v.value,
          message: 'URL should start with http:// or https://',
          severity: 'error',
          line: v.line,
        });
      }
    }

    // Port validation
    if (keyLower.includes('port') && v.value !== '') {
      const port = parseInt(v.value, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        issues.push({
          key: v.key,
          value: v.value,
          message: 'Port must be a number between 1 and 65535',
          severity: 'error',
          line: v.line,
        });
      }
    }

    // Email validation
    if (
      (keyLower.includes('email') || keyLower.includes('mail')) &&
      !keyLower.includes('mailgun') &&
      !keyLower.includes('mailchimp') &&
      !keyLower.includes('smtp') &&
      v.value !== ''
    ) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(v.value) && !v.value.startsWith('${')) {
        issues.push({
          key: v.key,
          value: v.value,
          message: 'Value does not appear to be a valid email address',
          severity: 'warning',
          line: v.line,
        });
      }
    }
  }

  // Missing keys compared to .env.example
  if (exampleVariables && exampleVariables.length > 0) {
    const currentKeys = new Set(variables.map((v) => v.key));
    for (const ev of exampleVariables) {
      if (!currentKeys.has(ev.key)) {
        issues.push({
          key: ev.key,
          value: '',
          message: 'Missing key defined in .env.example',
          severity: 'error',
          line: 0,
        });
      }
    }
  }

  // Sort by severity (errors first) then line number
  issues.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === 'error' ? -1 : 1;
    }
    return a.line - b.line;
  });

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;

  return {
    issues,
    errors,
    warnings,
    passed: errors === 0,
  };
}
