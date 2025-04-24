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

  it('mainnet SHA256 MLDSA65', () => {
    const params = {
      network: Network.MAINNET,
      version: Version.V1,
      pubkeyType: PubKeyType.MLDSA65,
      pubkeyBytes: textEncoder.encode('hello')
    };

    const addr = encodeAddress(params);
    expect(addr.startsWith('yp1')).toBe(true);

    const decoded = decodeAddress(addr);
    expect(decoded.network).toBe('mainnet');
    expect(decoded.version).toBe('V1');
    expect(decoded.pubkeyType).toBe('MLDSA65');

    expect(decoded.pubkeyHash).toEqual(hasher.digest(params.pubkeyBytes));
  });

  it('testnet SHA256 SLH_DSA_SHA2_256S', () => {
    const params = {
      network: Network.TESTNET,
      version: Version.V1,
      pubkeyType: PubKeyType.SLH_DSA_SHA2_256S,
      pubkeyBytes: textEncoder.encode('world')
    };

    const addr = encodeAddress(params);
    expect(addr.startsWith('rh1')).toBe(true);

    const decoded = decodeAddress(addr);
    expect(decoded.network).toBe('testnet');
    expect(decoded.version).toBe('V1');
    expect(decoded.pubkeyType).toBe('SLH_DSA_SHA2_256S');

    expect(decoded.pubkeyHash).toEqual(hasher.digest(params.pubkeyBytes));
  });
});
