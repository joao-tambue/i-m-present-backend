import { QRCodeRenderersOptions } from 'qrcode';

export const qrCodeRenderOptions: QRCodeRenderersOptions = {
  errorCorrectionLevel: 'H',
  margin: 2,
  width: 320,
  color: {
    dark: '#111827',
    light: '#FFFFFFFF',
  },
};
