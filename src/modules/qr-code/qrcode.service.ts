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
  async list(page: number = 1, limit: number = 20, search?: string) {
    const result = await repo.listAll(page, limit, search);

    const qrCodesWithDetails = result.qrCodes.map((qrCode) => ({
      id: qrCode.id,
      code: qrCode.code,
      status: qrCode.status,
      issuedAt: qrCode.issuedAt,
      revokedAt: qrCode.revokedAt,
      employeeId: qrCode.employee.id,
      employeeName: qrCode.employee.name,
      employeeEmail: qrCode.employee.email,
    }));

    return {
      data: qrCodesWithDetails,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async getByEmployeeId(employeeId: string) {
    await this.ensureEmployeeExists(employeeId);
    const qrCode = await repo.findByEmployeeId(employeeId);
    if (!qrCode) {
      return await mapQRCode(await repo.ensureActiveForEmployee(employeeId));
    }

    return await mapQRCode(qrCode);
  }

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
