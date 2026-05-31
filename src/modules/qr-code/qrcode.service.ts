import { AppError } from '../../shared/utils/AppError';
import { QRCodeRepository } from './qrcode.repository';

const repo = new QRCodeRepository();

function mapQRCode(qrCode: Awaited<ReturnType<QRCodeRepository['ensureActiveForEmployee']>>) {
  return {
    id: qrCode.id,
    token: qrCode.code,
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
      return mapQRCode(await repo.ensureActiveForEmployee(employeeId));
    }

    return mapQRCode(qrCode);
  }

  async regenerate(employeeId: string) {
    await this.ensureEmployeeExists(employeeId);
    return mapQRCode(await repo.ensureActiveForEmployee(employeeId));
  }

  async revoke(employeeId: string) {
    await this.ensureEmployeeExists(employeeId);
    const existing = await repo.findByEmployeeId(employeeId);
    if (!existing) {
      throw new AppError('QR Code do funcionário não encontrado', 404);
    }

    return mapQRCode(await repo.revokeByEmployeeId(employeeId));
  }

  private async ensureEmployeeExists(employeeId: string) {
    const exists = await repo.employeeExists(employeeId);
    if (!exists) {
      throw new AppError('Funcionário não encontrado', 404);
    }
  }
}
