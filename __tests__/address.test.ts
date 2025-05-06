import { TextEncoder } from 'util';

import {
  encodeAddress,
  decodeAddress,
  Version,
  Network,
  PubKeyType,
  hasher
} from '../src/index';

describe('PQ Address roundtrip', () => {
  // Now you can use this TextEncoder
  const textEncoder = new TextEncoder();

  it('mainnet SHA256 MLDSA44', () => {
    const params = {
      network: Network.MAINNET,
      version: Version.V1,
      pubkeyType: PubKeyType.MLDSA44,
      pubkeyBytes: textEncoder.encode('hello world!')
    };

    const addr = encodeAddress(params);
    expect(addr.startsWith('yp1')).toBe(true);

    const decoded = decodeAddress(addr);
    expect(decoded.network).toBe('mainnet');
    expect(decoded.version).toBe('V1');
    expect(decoded.pubkeyType).toBe('MLDSA44');

    expect(decoded.pubkeyHash).toEqual(hasher.digest(params.pubkeyBytes));
  });

  it('testnet SHA256 ML-DSA 44', () => {
    const params = {
      network: Network.TESTNET,
      version: Version.V1,
      pubkeyType: PubKeyType.MLDSA44,
      pubkeyBytes: textEncoder.encode('world')
    };

    const addr = encodeAddress(params);
    expect(addr.startsWith('rh1')).toBe(true);

    const decoded = decodeAddress(addr);
    expect(decoded.network).toBe('testnet');
    expect(decoded.version).toBe('V1');
    expect(decoded.pubkeyType).toBe('MLDSA44');

    expect(decoded.pubkeyHash).toEqual(hasher.digest(params.pubkeyBytes));
  });
});
