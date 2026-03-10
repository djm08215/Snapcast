declare module "*.ttf" {
  const src: string;
  export default src;
}

declare module "fontkit" {
  function create(buffer: Buffer | Uint8Array, postscriptName?: string): unknown;
  function registerFormat(format: unknown): void;
  export { create, registerFormat };
}
