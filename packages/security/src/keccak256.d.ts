/**
 * Computes the SHA3-256 hash of the given data.
 *
 * NOTE: Node.js supports SHA3-256 (FIPS-202). This is slightly different
 * from the original Keccak-256 algorithm used in some contexts (like Ethereum).
 *
 * @param data The data to hash (string, Buffer, or Uint8Array)
 * @returns The hexadecimal representation of the hash
 */
export declare function keccak256(data: string | Buffer | Uint8Array): string;
//# sourceMappingURL=keccak256.d.ts.map