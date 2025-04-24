import { bech32m } from 'bech32';
import { sha256 } from 'js-sha256';

export const MAX_ADDRESS_LENGTH = 90;

//——— Enums and Ranges

/** Versioning */
/** 0x00..=0x1F (32 slots) */
export enum Version {
  // eslint-disable-next-line no-unused-vars
  V1 = 0x00
}
export function versionFromCode(code: number): Version {
  if (code === Version.V1) return Version.V1;
  throw new Error(`Unknown version code: 0x${code.toString(16)}`);
}

/** Hash Algorithms */
/** 0x20..=0x3F (32 slots) */
export enum HashAlgorithm {
  // eslint-disable-next-line no-unused-vars
  SHA2_256 = 0x20
}
export function hashAlgFromCode(code: number): HashAlgorithm {
  if (code === HashAlgorithm.SHA2_256) return HashAlgorithm.SHA2_256;
  throw new Error(`Unknown hash algorithm code: 0x${code.toString(16)}`);
}
export function digestLength(alg: HashAlgorithm): number {
  switch (alg) {
    case HashAlgorithm.SHA2_256:
      return 32;
  }
}
export function hashDigest(alg: HashAlgorithm, data: Uint8Array): Uint8Array {
  switch (alg) {
    case HashAlgorithm.SHA2_256:
      return Uint8Array.from(Buffer.from(sha256.arrayBuffer(data)));
  }
}

/** Public Key Algorithms */
/** 0x40..=0xFF (192 slots) */
export enum PubKeyType {
  // eslint-disable-next-line no-unused-vars
  MLDSA65 = 0x40,
  // eslint-disable-next-line no-unused-vars
  MLDSA87 = 0x41
}
export function pubKeyTypeFromCode(code: number): PubKeyType {
  switch (code) {
    case PubKeyType.MLDSA65:
      return PubKeyType.MLDSA65;
    case PubKeyType.MLDSA87:
      return PubKeyType.MLDSA87;
    default:
      throw new Error(`Unknown public key type code: 0x${code.toString(16)}`);
  }
}

/** Network & HRP mapping */
export enum Network {
  // eslint-disable-next-line no-unused-vars
  MAINNET = 'mainnet',
  // eslint-disable-next-line no-unused-vars
  TESTNET = 'testnet'
}
export function hrpOf(net: Network): string {
  return net === 'mainnet' ? 'yp' : 'rh';
}
export function networkFromHrp(hrp: string): Network {
  if (hrp === 'yp') return Network.MAINNET;
  if (hrp === 'rh') return Network.TESTNET;
  throw new Error(`Unknown HRP: ${hrp}`);
}

//——— Error Types

export class EncodeError extends Error {}
export class DecodeError extends Error {}

export class InvalidLengthError extends EncodeError {
  constructor(public got: number) {
    super(
      `A Bech32 string is at most ${MAX_ADDRESS_LENGTH} characters long: got ${got}`
    );
  }
}

//——— Payload interface

export interface AddressParams {
  network: Network;
  version: Version;
  pubkeyType: PubKeyType;
  hashAlg: HashAlgorithm;
  pubkeyBytes: Uint8Array;
}

export interface DecodedAddress {
  network: Network;
  version: string;
  pubkeyType: string;
  hashAlg: string;
  pubkeyHash: Uint8Array;
}

//——— Encode / Decode

export function encodeAddress(params: AddressParams): string {
  const digest = hashDigest(params.hashAlg, params.pubkeyBytes);

  const payload = new Uint8Array(3 + digest.length);
  payload[0] = params.version;
  payload[1] = params.pubkeyType;
  payload[2] = params.hashAlg;
  payload.set(digest, 3);

  const words = bech32m.toWords(payload);
  const hrp = hrpOf(params.network);
  const encoded = bech32m.encode(hrp, words);

  if (encoded.length > MAX_ADDRESS_LENGTH) {
    throw new InvalidLengthError(encoded.length);
  }
  return encoded;
}

export function decodeAddress(addr: string): DecodedAddress {
  const { prefix: hrp, words } = bech32m.decode(addr);
  const network = networkFromHrp(hrp);
  const data = bech32m.fromWords(words);

  if (data.length < 3) throw new DecodeError('Payload too short');

  const version = versionFromCode(data[0]);
  const pubkeyType = pubKeyTypeFromCode(data[1]);
  const hashAlg = hashAlgFromCode(data[2]);
  const hash = data.slice(3);

  const expected = digestLength(hashAlg);
  if (hash.length !== expected) {
    throw new DecodeError(
      `Invalid hash length: got ${hash.length}, expected ${expected}`
    );
  }

  return {
    network,
    version: Version[version],
    pubkeyType: PubKeyType[pubkeyType],
    hashAlg: HashAlgorithm[hashAlg],
    pubkeyHash: Uint8Array.from(hash)
  };
}

// TODO: REMOVE TEMP!
const params = {
  network: Network.MAINNET,
  version: Version.V1,
  pubkeyType: PubKeyType.MLDSA65,
  hashAlg: HashAlgorithm.SHA2_256,
  pubkeyBytes: new TextEncoder().encode('hello world!')
};

const addr = encodeAddress(params);
console.log('Encoded:', addr);

try {
  const decoded = decodeAddress(addr);
  console.log('Decoded:', decoded);
} catch (err) {
  console.error('Error decoding:', err);
}
