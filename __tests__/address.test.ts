import { TextEncoder } from 'util';

import {
  encodeAddress,
  decodeAddress,
  Version,
  Network,
  HashAlgorithm,
  PubKeyType,
  hashDigest
} from '../src/index';

describe('PQ Address roundtrip', () => {
  // Now you can use this TextEncoder
  const textEncoder = new TextEncoder();

  it('mainnet SHA256 MLDSA65', () => {
    const params = {
      network: Network.MAINNET,
      version: Version.V1,
      pubkeyType: PubKeyType.MLDSA65,
      hashAlg: HashAlgorithm.SHA2_256,
      pubkeyBytes: textEncoder.encode('hello')
    };

    const addr = encodeAddress(params);
    expect(addr.startsWith('yp1')).toBe(true);

    const decoded = decodeAddress(addr);
    expect(decoded.network).toBe('mainnet');
    expect(decoded.version).toBe('V1');
    expect(decoded.pubkeyType).toBe('MLDSA65');
    expect(decoded.hashAlg).toBe('SHA2_256');

    expect(decoded.pubkeyHash).toEqual(
      hashDigest(params.hashAlg, params.pubkeyBytes)
    );
  });

  it('testnet SHA256 MLDSA87', () => {
    const params = {
      network: Network.TESTNET,
      version: Version.V1,
      pubkeyType: PubKeyType.MLDSA87,
      hashAlg: HashAlgorithm.SHA2_256,
      pubkeyBytes: textEncoder.encode('world')
    };

    const addr = encodeAddress(params);
    expect(addr.startsWith('rh1')).toBe(true);

    const decoded = decodeAddress(addr);
    expect(decoded.network).toBe('testnet');
    expect(decoded.version).toBe('V1');
    expect(decoded.pubkeyType).toBe('MLDSA87');
    expect(decoded.hashAlg).toBe('SHA2_256');

    expect(decoded.pubkeyHash).toEqual(
      hashDigest(params.hashAlg, params.pubkeyBytes)
    );
  });
});
