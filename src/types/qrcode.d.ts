declare module 'qrcode' {
  export interface QRCodeRenderersOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    type?: 'svg' | 'terminal' | 'utf8';
  }

  export function toDataURL(
    text: string,
    options?: QRCodeRenderersOptions,
  ): Promise<string>;

  export function toString(
    text: string,
    options?: QRCodeRenderersOptions,
  ): Promise<string>;
}
