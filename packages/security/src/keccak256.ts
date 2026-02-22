import { createHash } from 'node:crypto';

/**
 * Computes the SHA3-256 hash of the given data.
 * 
 * NOTE: Node.js supports SHA3-256 (FIPS-202). This is slightly different 
 * from the original Keccak-256 algorithm used in some contexts (like Ethereum).
 * 
 * @param data The data to hash (string, Buffer, or Uint8Array)
 * @returns The hexadecimal representation of the hash
 */
export function keccak256(data: string | Buffer | Uint8Array): string {
    return createHash('sha3-256').update(data).digest('hex');
}