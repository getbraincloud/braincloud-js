// Type declarations for the brainCloud JavaScript client (@braincloud/client).
//
// The SDK itself is a large, hand-maintained concatenation of plain-JS service
// files with no per-method typings, so these declarations describe only the
// module SHAPE — the exported classes and their well-known members — and fall
// back to `any` for the service methods via an index signature. That clears the
// TS7016 error ("Could not find a declaration file for module …") for
// TypeScript consumers without pretending to type the entire (and frequently
// changing) API surface.
//
// This file is part of the published package (see package.json "types" + the
// "files" whitelist), so every consumer that installs the SDK — including
// `node bccm syncsdk <example>`, which installs this package into the example —
// picks up types automatically. No per-example ambient `declare module` shim is
// needed (and hand-maintained shims drift: the old `declare module 'braincloud'`
// went stale when the package was renamed to the scoped `@braincloud/client`).

export = braincloud;

declare namespace braincloud {
  /**
   * The low-level brainCloud client. Service accessors and their methods are
   * untyped (index signature -> any); use BrainCloudWrapper for most apps.
   */
  class BrainCloudClient {
    constructor(wrapperName?: string);
    [key: string]: any;
  }

  /**
   * Recommended entry point: wraps BrainCloudClient with authentication +
   * profile persistence. Methods beyond the well-known ones below are untyped.
   */
  class BrainCloudWrapper {
    constructor(wrapperName?: string);
    /** The underlying client instance. */
    brainCloudClient: BrainCloudClient;
    [key: string]: any;
  }

  /** Node multipart-upload shim used internally for file uploads. */
  const XMLHttpRequest4Upload: any;

  /** React-Native specific helpers (re-exported from ./react-native). */
  const BrainCloudReact: any;
}
