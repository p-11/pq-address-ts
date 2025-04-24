import { bech32m } from 'bech32';
import { sha256 } from 'js-sha256';
import {
  InvalidLengthError,
  Bech32EncodeFailure,
  InvalidHashLengthError,
  UnknownHrpError,
  UnknownPubKeyTypeError,
  UnknownVersionError,
  UnknownHashAlgError,
  PayloadTooShortError,
  Bech32DecodeFailure
} from './error';

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
  throw new UnknownVersionError(code);
}

/** Hash Algorithms */
/** 0x20..=0x3F (32 slots) */
export enum HashAlgorithm {
  // eslint-disable-next-line no-unused-vars
  SHA2_256 = 0x20
}
export function hashAlgFromCode(code: number): HashAlgorithm {
  if (code === HashAlgorithm.SHA2_256) return HashAlgorithm.SHA2_256;
  throw new UnknownHashAlgError(code);
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
      throw new UnknownPubKeyTypeError(code);
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

  let encoded: string;
  try {
    encoded = bech32m.encode(hrp, words);
  } catch (err) {
    throw new Bech32EncodeFailure(err as Error);
  }

  if (encoded.length > MAX_ADDRESS_LENGTH) {
    throw new InvalidLengthError(encoded.length, MAX_ADDRESS_LENGTH);
  }
  return encoded;
}

export function decodeAddress(addr: string): DecodedAddress {
  let decoded: { prefix: string; words: number[] };
  try {
    decoded = bech32m.decode(addr);
  } catch (err) {
    throw new Bech32DecodeFailure(err as Error);
  }

  const { prefix: hrp, words } = decoded;

  const network = (() => {
    try {
      return networkFromHrp(hrp);
    } catch {
      throw new UnknownHrpError(hrp);
    }
  })();

  const data = bech32m.fromWords(words);
  if (data.length < 3) {
    throw new PayloadTooShortError(data.length, 3);
  }

  const version = versionFromCode(data[0]);
  const pubkeyType = pubKeyTypeFromCode(data[1]);
  const hashAlg = hashAlgFromCode(data[2]);

  const hash = data.slice(3);
  const expected = digestLength(hashAlg);
  if (hash.length !== expected) {
    throw new InvalidHashLengthError(hash.length, expected);
  }

  return {
    network,
    version: Version[version],
    pubkeyType: PubKeyType[pubkeyType],
    hashAlg: HashAlgorithm[hashAlg],
    pubkeyHash: Uint8Array.from(hash)
  };
}

// export errors
export {
  InvalidLengthError,
  Bech32EncodeFailure,
  InvalidHashLengthError,
  UnknownHrpError,
  UnknownPubKeyTypeError,
  UnknownVersionError,
  UnknownHashAlgError,
  PayloadTooShortError,
  Bech32DecodeFailure
};
