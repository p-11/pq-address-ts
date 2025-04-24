// —— Encode errors

/** Base for all encode‐time errors */
export class EncodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncodeError';
  }
}

/** Wrapped Bech32 encode failure */
export class Bech32EncodeFailure extends EncodeError {
  constructor(public original: Error) {
    super(`Bech32 encode failure: ${original.message}`);
    this.name = 'Bech32EncodeFailure';
  }
}

/** Address exceeded max length */
export class InvalidLengthError extends EncodeError {
  constructor(
    public got: number,
    public max: number
  ) {
    super(`Address too long: got ${got}, max ${max}`);
    this.name = 'InvalidLengthError';
  }
}

// —— Decode errors

/** Base for all decode‐time errors */
export class DecodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecodeError';
  }
}

/** Wrapped Bech32 decode failure */
export class Bech32DecodeFailure extends DecodeError {
  constructor(public error: Error) {
    super(`Bech32 decode failure: ${error.message}`);
    this.name = 'Bech32DecodeFailure';
  }
}

/** HRP prefix wasn’t recognized */
export class UnknownHrpError extends DecodeError {
  constructor(public hrp: string) {
    super(`Unknown HRP: ${hrp}`);
    this.name = 'UnknownHrpError';
  }
}

/** Data payload was too short */
export class PayloadTooShortError extends DecodeError {
  constructor(
    public got: number,
    public need: number
  ) {
    super(`Payload too short: got ${got}, need ≥ ${need}`);
    this.name = 'PayloadTooShortError';
  }
}

/** Version byte was unrecognized */
export class UnknownVersionError extends DecodeError {
  constructor(public code: number) {
    super(`Unknown version code: 0x${code.toString(16)}`);
    this.name = 'UnknownVersionError';
  }
}

/** PubKeyType byte was unrecognized */
export class UnknownPubKeyTypeError extends DecodeError {
  constructor(public code: number) {
    super(`Unknown pubkey type code: 0x${code.toString(16)}`);
    this.name = 'UnknownPubKeyTypeError';
  }
}

/** HashAlg byte was unrecognized */
export class UnknownHashAlgError extends DecodeError {
  constructor(public code: number) {
    super(`Unknown hash algorithm code: 0x${code.toString(16)}`);
    this.name = 'UnknownHashAlgError';
  }
}

/** Digest length mismatch */
export class InvalidHashLengthError extends DecodeError {
  constructor(
    public got: number,
    public expected: number
  ) {
    super(`Invalid hash length: got ${got}, expected ${expected}`);
    this.name = 'InvalidHashLengthError';
  }
}
