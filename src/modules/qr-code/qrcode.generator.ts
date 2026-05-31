import QRCode from 'qrcode';
import { qrCodeRenderOptions } from '../../config/qrcode';

export async function generateQRCodeAssets(token: string) {
  const [imageDataUrl, svg] = await Promise.all([
    QRCode.toDataURL(token, qrCodeRenderOptions),
    QRCode.toString(token, {
      ...qrCodeRenderOptions,
      type: 'svg',
    }),
  ]);

  return {
    imageDataUrl,
    svg,
  };
}
