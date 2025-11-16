// Type declarations for msgpack-lite
declare module 'msgpack-lite' {
  export function encode(data: any): Buffer;
  export function decode(buffer: Buffer): any;
  export function createCodec(options?: any): any;

  export const codec: any;
}
