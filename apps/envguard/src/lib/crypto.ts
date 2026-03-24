const FORMAT_VERSION = 'aes-256-gcm-v1';
const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const NONCE_LENGTH = 12;

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function encryptContent(
  plaintext: string,
  passphrase: string
): Promise<{ encrypted: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_LENGTH));
  const key = await deriveKey(passphrase, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    data
  );

  // Format: base64( salt(16) || nonce(12) || ciphertext+authTag )
  const combined = new Uint8Array(SALT_LENGTH + NONCE_LENGTH + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(nonce, SALT_LENGTH);
  combined.set(new Uint8Array(ciphertext), SALT_LENGTH + NONCE_LENGTH);

  const encrypted = `${FORMAT_VERSION}:${toBase64(combined.buffer)}`;
  return { encrypted };
}

export async function decryptContent(
  encryptedStr: string,
  passphrase: string
): Promise<string> {
  let base64Data: string;

  if (encryptedStr.startsWith(`${FORMAT_VERSION}:`)) {
    base64Data = encryptedStr.slice(FORMAT_VERSION.length + 1);
  } else {
    base64Data = encryptedStr;
  }

  const combined = fromBase64(base64Data.trim());

  if (combined.length < SALT_LENGTH + NONCE_LENGTH + 1) {
    throw new Error('Encrypted data is too short');
  }

  const salt = combined.slice(0, SALT_LENGTH);
  const nonce = combined.slice(SALT_LENGTH, SALT_LENGTH + NONCE_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + NONCE_LENGTH);

  const key = await deriveKey(passphrase, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: nonce },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
