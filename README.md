# pq‑address‑ts

A TypeScript library for encoding and decoding post‑quantum public keys into human‑friendly Bech32m addresses.

## Motivation

Sharing a post‑quantum public key needs:

1. A **hash** of the public key for privacy and fixed length.
2. A strong **checksum** to catch typos and errors.
3. A readable, typo‑resistant **encoding**.
4. A clear **network flag** (production vs development).

`pq‑address‑ts` provides all four. It lets you generate and parse addresses for any public‑key type (ML‑DSA, SLH‑DSA, etc.), while guaranteeing future‑proof safety.

## Design & Justification

- **Bech32m** (BIP‑350)

  - Case insensitive
  - Friendly character set
  - Strong error detection
  - Improved checksum over Bech32
  - Efficient encoding & decoding
  - Smaller QR codes due to use of alphanumeric mode

- **Disjoint byte ranges**

  - Version codes in `0x00–0x3F` (up to 64 versions).
  - PubKeyType codes in `0x40–0xFF` (up to 192 public key types).
  - Any byte‑swap or mis‑read triggers a clear “unknown code” error.

- **HRP flag**

  - `"yp"` for production/mainnet, `"rh"` for development/testnet.

- **Extendable**

  - Add new `PubKeyType` variants without breaking old addresses.

## Anatomy of a PQ address

Address example: `yp1qpqzqagfuk76p3mz62av07gdwk94kgnrlgque0z592678hck80sgum9fdgfqma`

1. **HRP** (`yp` / `rh`)

   - `yp` = Mainnet
   - `rh` = Testnet

2. **Separator**

   - Always the character `1`.

3. **Data**

   - The payload bytes:
     1. Version
     2. PubKeyType
     3. Raw pubkey hash digest
   - Converted into 5-bit words and then into Bech32 characters.

4. **Checksum**
   - 6 Bech32 characters (BIP-350)
   - Catches typos and bit-errors.

Note: A Bech32 string is at most 90 characters long [BIP-173]

## A Note on Hash Algorithms

The default hash function for `pq-address-ts` is SHA-256.
256 bit hash functions are currently considered secure against Grover's attack.
Even if the preimage is recovered, it only reveals a PQ secure public key and thus Shor's is not applicable.

## Quickstart

Add to your `package.json`:

```bash
npm install pq-address-ts
```

Import `pq_address_ts`

```js
import {
  encodeAddress,
  decodeAddress,
  Network,
  Version
  PubKeyType,
} from 'pq-address-ts';
```

Encoding

```js
const params = {
  network: Network.MAINNET,
  version: Version.V1,
  pubkeyType: PubKeyType.MLDSA65,
  pubkeyBytes: textEncoder.encode('hello')
};

const pq_addr = encodeAddress(params);
console.log(pq_addr);
```

Decoding

```js
const decoded = decodeAddress(pq_addr);
console.log(pq_addr);
```

## Errors

```js
import {
  Bech32EncodeFailure,
  InvalidLengthError,
  InvalidHashLengthError,
  UnknownHrpError,
  UnknownPubKeyTypeError,
  UnknownVersionError,
  PayloadTooShortError,
  Bech32DecodeFailure
} from 'pq-address-ts';

// Example params...
const params = {
  network: Network.MAINNET,
  version: Version.V1,
  pubkeyType: PubKeyType.MLDSA65,
  pubkeyBytes: new TextEncoder().encode('hello')
};

try {
  // ENCODE
  const addr = encodeAddress(params);
  console.log('Address:', addr);

  // DECODE
  const decoded = decodeAddress(addr);
  console.log('Decoded:', decoded);
} catch (e: unknown) {
  // Handle encode errors
  if (e instanceof Bech32EncodeFailure) {
    console.error('Bech32 encode failed:', e.original.message);
  } else if (e instanceof InvalidLengthError) {
    console.error(`Bech32m address exceeds safe length: got ${e.got}, max ${e.max}`);
  }
  // Handle decode errors
  else if (e instanceof Bech32DecodeFailure) {
    console.error('Bad address format or checksum:', e.error.message);
  } else if (e instanceof UnknownHrpError) {
    console.error('Unknown network prefix (HRP):', e.hrp);
  } else if (e instanceof PayloadTooShortError) {
    console.error(`Payload too short: got ${e.got}, need ≥ ${e.need}`);
  } else if (e instanceof UnknownVersionError) {
    console.error('Unknown version byte:', e.code);
  } else if (e instanceof UnknownPubKeyTypeError) {
    console.error('Unknown pubkey type byte:', e.code);
  } else if (e instanceof InvalidHashLengthError) {
    console.error(`Hash length mismatch: got ${e.got}, expected ${e.expected}`);
  } else {
    // Fallback for any unexpected error
    console.error('Unexpected error:', e);
  }
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
