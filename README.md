# PQ Address TS

A TypeScript library for encoding and decoding post‑quantum public keys into human‑friendly Bech32m addresses.

## Motivation

Sharing a post‑quantum public key needs:

1. A **hash** of the public key for privacy and fixed length.
2. A strong **checksum** to catch typos and errors.
3. A readable, typo‑resistant **encoding**.
4. A clear **network flag** (production vs development).

`pq‑address` provides all four. It lets you generate and parse addresses for any public‑key type (ML‑DSA, SLH‑DSA, etc.), while guaranteeing future‑proof safety.

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

  By carving out non-overlapping slots for versions (0x00–0x3F) and public key types (0x40–0xFF), parsing becomes trivial—and any stray or swapped byte instantly flags itself as an “unknown code,” preventing silent failures.

- **HRP flag**

  - `"yp"` for production/mainnet, `"rh"` for development/testnet.

- **Extendable**

  - Add new `PubKeyType` variants without breaking old addresses.

## Anatomy of a PQ address

Address example: `yp1qpqg39uw700gcctpahe650p9zlzpnjt60cpz09m4kx7ncz8922635hs5cdx7q`

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

PQ address length is 64 characters.

Note: A Bech32 string is at most 90 characters long [BIP-173]

## A Note on Hash Algorithms

The default hash function for `@project-eleven/pq-address` is SHA-256.
256 bit hash functions are currently considered secure against Grover's attack.
Even if the preimage is recovered, it only reveals a PQ secure public key and thus Shor's is not applicable.

## Quickstart

Add to your `package.json`:

```bash
npm install @project-eleven/pq-address
```

Import `@project-eleven/pq-address`

```js
import {
  encodeAddress,
  decodeAddress,
  Network,
  Version
  PubKeyType,
} from '@project-eleven/pq-address';
```

Encoding

```js
const params = {
  network: Network.MAINNET,
  version: Version.V1,
  pubkeyType: PubKeyType.MlDsa44,
  pubkeyBytes: <PUB_KEY_BYTES>,
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
  InvalidPubkeyLengthError,
  UnknownHrpError,
  UnknownPubKeyTypeError,
  UnknownVersionError,
  PayloadTooShortError,
  Bech32DecodeFailure
} from '@project-eleven/pq-address';

// Example params...
const params = {
  network: Network.MAINNET,
  version: Version.V1,
  pubkeyType: PubKeyType.MlDsa44,
  pubkeyBytes: <PUB_KEY_BYTES>,
};

try {
  // ENCODE
  const addr = encodeAddress(params);
  console.log('Address:', addr);

  // DECODE
  const decoded = decodeAddress(addr);
  console.log('Decoded:', decoded);
  console.log('Re-encoded string:', decoded.toString());
} catch (e: unknown) {
  // Handle encode errors
  if (e instanceof Bech32EncodeFailure) {
    console.error('Bech32 encode failed:', e.original.message);
  } else if (e instanceof InvalidLengthError) {
    console.error(`Bech32m address exceeds safe length: got ${e.got}, max ${e.max}`);
  } else if (e instanceof InvalidPubKeyLengthError) {
    console.error(`Pubkey length mismatch: got ${e.got}, expected ${e.expected}`);
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
