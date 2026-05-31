import { AppError } from '../../shared/utils/AppError';
import { generateQRCodeAssets } from './qrcode.generator';
import { QRCodeRepository } from './qrcode.repository';

const repo = new QRCodeRepository();

type QRCodeEntity = Awaited<ReturnType<QRCodeRepository['ensureActiveForEmployee']>>;

async function mapQRCode(qrCode: QRCodeEntity) {
  const assets = await generateQRCodeAssets(qrCode.code);

  return {
    id: qrCode.id,
    token: qrCode.code,
    imageDataUrl: assets.imageDataUrl,
    svg: assets.svg,
    status: qrCode.status,
    issuedAt: qrCode.issuedAt,
    revokedAt: qrCode.revokedAt,
    employee: qrCode.employee,
  };
}

export class QRCodeService {
  async getMyQRCode(employeeId: string) {
    const qrCode = await repo.findByEmployeeId(employeeId);
    if (!qrCode) {
      return await mapQRCode(await repo.ensureActiveForEmployee(employeeId));
    }

    return await mapQRCode(qrCode);
  }

  async regenerate(employeeId: string) {
    await this.ensureEmployeeExists(employeeId);
    return await mapQRCode(await repo.ensureActiveForEmployee(employeeId));
  }

  async revoke(employeeId: string) {
    await this.ensureEmployeeExists(employeeId);
    const existing = await repo.findByEmployeeId(employeeId);
    if (!existing) {
      throw new AppError('QR Code do funcionário não encontrado', 404);
    }

    return await mapQRCode(await repo.revokeByEmployeeId(employeeId));
  }

  private async ensureEmployeeExists(employeeId: string) {
    const exists = await repo.employeeExists(employeeId);
    if (!exists) {
      throw new AppError('Funcionário não encontrado', 404);
    }
  }
}
