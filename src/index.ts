import { bech32m } from 'bech32';
import { sha256 } from 'js-sha256';
import {
  InvalidLengthError,
  Bech32EncodeFailure,
  InvalidPubkeyLengthError,
  InvalidHashLengthError,
  UnknownHrpError,
  UnknownPubKeyTypeError,
  UnknownVersionError,
  PayloadTooShortError,
  Bech32DecodeFailure
} from './error';

// A Bech32 string is at most 90 characters long [BIP-173]
// PQ address length is 64 characters.
export const ADDRESS_LENGTH = 64;

//——— Enums and Ranges

/** Versioning */
/** 0x00..=0x3F (64 slots) */
export enum Version {
  // eslint-disable-next-line no-unused-vars
  V1 = 0x00
}
export function versionFromCode(code: number): Version {
  if (code === Version.V1) return Version.V1;
  throw new UnknownVersionError(code);
}

/** Public Key Algorithms */
/** 0x40..=0xFF (192 slots) */
export enum PubKeyType {
  // eslint-disable-next-line no-unused-vars
  MlDsa44 = 0x40,
  // eslint-disable-next-line no-unused-vars
  SlhDsaSha2S128 = 0x41
}
export function pubKeyTypeFromCode(code: number): PubKeyType {
  switch (code) {
    case PubKeyType.MlDsa44:
      return PubKeyType.MlDsa44;
    case PubKeyType.SlhDsaSha2S128:
      return PubKeyType.SlhDsaSha2S128;
    default:
      throw new UnknownPubKeyTypeError(code);
  }
}

function getPubkeyLength(type: PubKeyType): number {
  switch (type) {
    case PubKeyType.MlDsa44:
      return 1312;
    case PubKeyType.SlhDsaSha2S128:
      return 32;
    default:
      throw new UnknownPubKeyTypeError(type);
  }
}

/** Network & HRP mapping */
export enum Network {
  // eslint-disable-next-line no-unused-vars
  Mainnet = 'mainnet',
  // eslint-disable-next-line no-unused-vars
  Testnet = 'testnet'
}
export function hrpOf(net: Network): string {
  return net === Network.Mainnet ? 'yp' : 'rh';
}
export function networkFromHrp(hrp: string): Network {
  if (hrp === 'yp') return Network.Mainnet;
  if (hrp === 'rh') return Network.Testnet;
  throw new Error(`Unknown HRP: ${hrp}`);
}

/** Hasher */
/// The default hash function for pq-address: SHA-256.
///
/// 256 bit hash function is currently considered secure against Grover's attack.
/// Even if the preimage is recovered, it only reveals a PQ secure public key and thus Shor's is not applicable.
export const hasher = {
  DIGEST_LENGTH: 32,
  digest: (data: Uint8Array) =>
    Uint8Array.from(Buffer.from(sha256.arrayBuffer(data)))
};

//——— Payload interface

export interface AddressParams {
  network: Network;
  version: Version;
  pubkeyType: PubKeyType;
  pubkeyBytes: Uint8Array;
}

export interface DecodedAddress {
  network: Network;
  version: string;
  pubkeyType: string;
  pubkeyHash: Uint8Array;
}

//——— Encode / Decode
export function encodeAddress(params: AddressParams): string {
  const expectedPubkeyLength = getPubkeyLength(params.pubkeyType);
  if (params.pubkeyBytes.length !== expectedPubkeyLength) {
    throw new InvalidPubkeyLengthError(
      params.pubkeyBytes.length,
      expectedPubkeyLength
    );
  }
  const digest = hasher.digest(params.pubkeyBytes);
  const payload = new Uint8Array(2 + digest.length);
  payload[0] = params.version;
  payload[1] = params.pubkeyType;
  payload.set(digest, 2);

  const words = bech32m.toWords(payload);
  const hrp = hrpOf(params.network);

  let encoded: string;
  try {
    encoded = bech32m.encode(hrp, words);
  } catch (err) {
    throw new Bech32EncodeFailure(err as Error);
  }

  if (encoded.length !== ADDRESS_LENGTH) {
    throw new InvalidLengthError(encoded.length, ADDRESS_LENGTH);
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
  if (data.length < 2) {
    throw new PayloadTooShortError(data.length, 2);
  }

  const version = versionFromCode(data[0]);
  const pubkeyType = pubKeyTypeFromCode(data[1]);

  const hash = data.slice(2);
  const expected = hasher.DIGEST_LENGTH;
  if (hash.length !== expected) {
    throw new InvalidHashLengthError(hash.length, expected);
  }

  const decodedAddress = {
    network,
    version: Version[version],
    pubkeyType: PubKeyType[pubkeyType],
    pubkeyHash: Uint8Array.from(hash)
  } as DecodedAddress;

  Object.defineProperty(decodedAddress, 'toString', {
    value: () => addr,
    writable: false,
    enumerable: false
  });

  return decodedAddress;
}

// export errors
export {
  InvalidLengthError,
  Bech32EncodeFailure,
  InvalidHashLengthError,
  UnknownHrpError,
  UnknownPubKeyTypeError,
  UnknownVersionError,
  PayloadTooShortError,
  Bech32DecodeFailure
};
