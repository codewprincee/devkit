'use client';

import { useState, useCallback } from 'react';
import type { EnvFile } from '@/types/envguard';
import { encryptContent, decryptContent } from '@/lib/envguard/crypto';

interface EncryptorProps {
  files: EnvFile[];
  selectedFile: string | null;
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export function Encryptor({ files, selectedFile, onToast }: EncryptorProps) {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [sourcePath, setSourcePath] = useState<string>(selectedFile ?? files[0]?.path ?? '');
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [decryptInput, setDecryptInput] = useState('');
  const [output, setOutput] = useState('');
  const [processing, setProcessing] = useState(false);

  const sourceFile = files.find((f) => f.path === sourcePath);

  const handleEncrypt = useCallback(async () => {
    if (!sourceFile) return;
    if (!passphrase) {
      onToast('Enter a passphrase', 'error');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      onToast('Passphrases do not match', 'error');
      return;
    }

    setProcessing(true);
    try {
      const { encrypted } = await encryptContent(sourceFile.raw, passphrase);
      setOutput(encrypted);
      onToast('Encrypted successfully', 'success');
    } catch {
      onToast('Encryption failed', 'error');
    } finally {
      setProcessing(false);
    }
  }, [sourceFile, passphrase, confirmPassphrase, onToast]);

  const handleDecrypt = useCallback(async () => {
    if (!decryptInput.trim()) {
      onToast('Paste encrypted content', 'error');
      return;
    }
    if (!passphrase) {
      onToast('Enter the passphrase', 'error');
      return;
    }

    setProcessing(true);
    try {
      const plaintext = await decryptContent(decryptInput.trim(), passphrase);
      setOutput(plaintext);
      onToast('Decrypted successfully', 'success');
    } catch {
      onToast('Decryption failed — wrong passphrase or corrupted data', 'error');
    } finally {
      setProcessing(false);
    }
  }, [decryptInput, passphrase, onToast]);

  const downloadOutput = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encrypt' ? '.env.encrypted' : '.env.decrypted';
    a.click();
    URL.revokeObjectURL(url);
    onToast(`Downloaded ${mode === 'encrypt' ? '.env.encrypted' : '.env.decrypted'}`, 'success');
  }, [output, mode, onToast]);

  const copyOutput = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      onToast('Copied to clipboard', 'success');
    } catch {
      onToast('Failed to copy', 'error');
    }
  }, [output, onToast]);

  if (files.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">
            Open a project to encrypt .env files
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mode toggle + options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white p-0.5">
          <button
            onClick={() => { setMode('encrypt'); setOutput(''); }}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              mode === 'encrypt'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Encrypt
          </button>
          <button
            onClick={() => { setMode('decrypt'); setOutput(''); }}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              mode === 'decrypt'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Decrypt
          </button>
        </div>

        {mode === 'encrypt' && (
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Source</label>
            <select
              value={sourcePath}
              onChange={(e) => setSourcePath(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-mono text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-label="Source file"
            >
              {files.map((f) => (
                <option key={f.path} value={f.path}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={downloadOutput}
            disabled={!output}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </button>
          <button
            onClick={copyOutput}
            disabled={!output}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copy
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-2 h-full">
          {/* Input side */}
          <div className="flex flex-col gap-3">
            {mode === 'decrypt' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Encrypted content</label>
                <textarea
                  value={decryptInput}
                  onChange={(e) => setDecryptInput(e.target.value)}
                  placeholder="Paste base64 encrypted content here..."
                  className="w-full h-32 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Passphrase</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter passphrase..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {mode === 'encrypt' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Confirm passphrase</label>
                <input
                  type="password"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Confirm passphrase..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            <button
              onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
              disabled={processing}
              className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-50"
            >
              {processing
                ? (mode === 'encrypt' ? 'Encrypting...' : 'Decrypting...')
                : (mode === 'encrypt' ? 'Encrypt File' : 'Decrypt Content')
              }
            </button>

            {mode === 'encrypt' && sourceFile && (
              <div className="text-xs text-gray-500">
                Encrypting <span className="font-mono font-medium">{sourceFile.name}</span>
                {' '}&middot;{' '}
                {sourceFile.variables.length} variable{sourceFile.variables.length !== 1 ? 's' : ''}
                {' '}&middot;{' '}
                AES-256-GCM + PBKDF2
              </div>
            )}
          </div>

          {/* Output side */}
          <div className="rounded-lg border border-gray-200 bg-gray-900 overflow-hidden flex flex-col min-h-[200px]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <span className="text-xs font-mono text-gray-400">
                {mode === 'encrypt' ? 'encrypted output' : 'decrypted output'}
              </span>
              <span className="text-[10px] text-gray-500">
                {output ? `${output.length} chars` : 'preview'}
              </span>
            </div>
            <pre className="flex-1 p-4 overflow-auto text-sm font-mono leading-relaxed text-gray-300 whitespace-pre-wrap">
              {output || (mode === 'encrypt' ? 'Encrypted content will appear here' : 'Decrypted content will appear here')}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
