import {
  encodeAddress,
  decodeAddress,
  Version,
  Network,
  PubKeyType,
  hasher
} from '../src/index';

// Helper function to convert base64 to bytes
const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

describe('PQ Address roundtrip', () => {
  const MlDsaPublicKey =
    'e+ffcul9XkuQCkiCEYX2ES6KMGJ9c7+Z0PFfhnJRckbaHzh4EH9hcEkUoFZ4gK2ta6/xPzgxB1yTT92wPZw8SmrK3DeLMz9mkst0IWkSzJ/TPPHRcSYJekO+CLV8k7uXsGSSoK4fbLqkX8leQFMCzjzRYg06zb3SD7iQwK3O8dP2WWLa9PkBMl1LECCBtTHrxoqyYtKopNbn3wICOOxI1jjTTL46AZnE6Vw2vQdLB/Qg59Pq6su8P3zEqBbsVPwPpT9ZbBNCHE+puWjdYnOfttj6DZ748CRHibQ9WTkH+VpxssIxU62nsYes/fV85nDozwddZggZoLfRsmSlG1Yz6h4m5hMMu9Nku9myTTw4UCiGSxZmad+yIjl7hh6J3wDaLMDA6SXajLSXTk2RwmnsEUlYs+uXS6Wj5wzg+bLQDQVMkU+doOf4vPTArf4uwzJdZ9Ghp8vjHd+rQgKjuo+Hy+HWz4JgvaQXlln+3yF0eY4/v01Bhe8BwVCbFZX8ts2Ay53gJmZEtsnXw3d5xedAMO9LJt4UqwovnmWCuApzAG9jyvG3Wxxe572E725S4vLtgnESzfrsD3wWo/A0oP+wk4oOFjhRDdVwHzwBDiHPhl43b/lt6omQuxK+xF0BJ77X/VhAoCx5zwIQ1GnmtXmP5xqx8f+e9ceFWNSxBPVKakKx/BveCxF1uOLc7DZUFLDVxRBURiF4BQX/670+FaYF2BWS3XtxfCqxaCz3F177qUev3pYuwpvSIj6WNSmU8uyxvibSzvYtA50gQtznTfteWja14B8AB+rgagz5nEzRzO7u1+QmxbdvEyBKvmWzNtnvsNqee4LhU9sl6rPdyUScmDrCPVLiPhrqY/sBVfxzX6z40suflYFPYU+fE6lApXnpyDB8he25DmnmPYTEsCq9d2uYaYTSBAgeir0qi9Jnjj/mcJ/3sNwwTlh7Tp6ahJlqWEUJ4myGxcHEesgWAeIrqJ6bhHTxP1n+do4ffry4CMcAjoAPAwYY0JUTYANy722LbOgiN+z5KUryC/MYjw/azOHFcpYjsGR60fARG03yVBgNBuD5okkmxtrAGdS4w85UDMAa/dwobUI5bdigFHP0Av6hHQ5uxeaxt1gAO53veGmA8aIOidhtZyHhlv+ANl9VYyZMOdPP1DjBTd8AQTIGR2JglmGzE8/00Ndx736MNdVzxNG0iKOvLlgl3cd1cEjW6hfC47juSDCgZTs9oPeo2mr1qvtak7zVd/yByjP9KHh0mjCi3cZDButaTe/oic4bdf24xQDtahSEJpAf49i9gzIpqxG92pyM7HRaVSvScFmCNnNKLJSDCeYw4+zlU+jawGKPjX6ebFDGFV1gNiPvkZdYd/5UXFwpHt5saj/Lgfoe/BtJWUx53TNkYlTNytflgV/ssFo8k9aYlIq2SDDKeZdlZexeNJOvhr8yntOQzLK6WWVONUgilTFNKX3+NQTmMR1LhA7VSP17+/3NjM0wEaz/JpKRoqMMvrgzl2A/6s019UMoT81hGXNtk9Ed8vxtdeNi1BC+SHWWyazundxXMQ4/gD7PnJXQJduz0QZ8quxRQZZTn+u+t1hKyMQikRKqephJaIQv9NLnKffPncEii9ukfRuLLCy7hPFuAho1Bfgi6rJMN0AxlX9URe6LB6vjLMNdTvWVqCHtBvay4scJg58my00razBF8BhQe7db+UJiv5JwADSJ2fwO/oooReksH3Sv1U4UOx5Y7kK8bbChFg==';

  it('mainnet MLDSA44', () => {
    const params = {
      network: Network.Mainnet,
      version: Version.V1,
      pubkeyType: PubKeyType.MlDsa44,
      pubkeyBytes: base64ToBytes(MlDsaPublicKey)
    };

    const addr = encodeAddress(params);
    expect(addr).toEqual(
      'yp1qpqg39uw700gcctpahe650p9zlzpnjt60cpz09m4kx7ncz8922635hs5cdx7q'
    );
    expect(addr.startsWith('yp1')).toBe(true);

    const decoded = decodeAddress(addr);
    expect(decoded.network).toBe('mainnet');
    expect(decoded.version).toBe('V1');
    expect(decoded.pubkeyType).toBe('MlDsa44');

    expect(decoded.pubkeyHash).toEqual(hasher.digest(params.pubkeyBytes));
  });

  it('testnet MLDSA44', () => {
    const params = {
      network: Network.Testnet,
      version: Version.V1,
      pubkeyType: PubKeyType.MlDsa44,
      pubkeyBytes: base64ToBytes(MlDsaPublicKey)
    };

    const addr = encodeAddress(params);
    expect(addr).toEqual(
      'rh1qpqg39uw700gcctpahe650p9zlzpnjt60cpz09m4kx7ncz8922635hsmmfzpd'
    );
    expect(addr.startsWith('rh1')).toBe(true);

    const decoded = decodeAddress(addr);
    expect(decoded.network).toBe('testnet');
    expect(decoded.version).toBe('V1');
    expect(decoded.pubkeyType).toBe('MlDsa44');

    expect(decoded.pubkeyHash).toEqual(hasher.digest(params.pubkeyBytes));
  });
});
