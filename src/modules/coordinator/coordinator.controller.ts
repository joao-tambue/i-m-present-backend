import { NextFunction, Response } from 'express';
import { CoordinatorService } from './coordinator.service';
import { ApiResponse } from '../../shared/utils/ApiResponse';
import { AuthenticatedRequest } from '../../middlewares/authenticate';

const service = new CoordinatorService();

export class CoordinatorController {
  // GET /coordinator/employees
  async listEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { area, isActive, search, page, limit } = req.query as Record<string, string>;
      const result = await service.listEmployees({
        area: area as import('../auth/auth.model').Area | undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        search,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json(ApiResponse.ok('Funcionários obtidos', result));
    } catch (err) {
      next(err);
    }
  }

  // GET /coordinator/employees/:id
  async getEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employee = await service.getEmployee(req.params['id'] as string);
      res.json(ApiResponse.ok('Funcionário obtido', employee));
    } catch (err) {
      next(err);
    }
  }

  // PATCH /coordinator/employees/:id
  async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await service.updateEmployee(req.params['id'] as string, req.body);
      res.json(ApiResponse.ok('Funcionário actualizado', updated));
    } catch (err) {
      next(err);
    }
  }

  // PATCH /coordinator/employees/:id/activate
  async activateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await service.toggleEmployeeActive(req.params['id'] as string, true);
      res.json(ApiResponse.ok('Funcionário activado'));
    } catch (err) {
      next(err);
    }
  }

  // PATCH /coordinator/employees/:id/deactivate
  async deactivateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await service.toggleEmployeeActive(req.params['id'] as string, false);
      res.json(ApiResponse.ok('Funcionário desactivado'));
    } catch (err) {
      next(err);
    }
  }

  // GET /coordinator/stats
  async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await service.getStats();
      res.json(ApiResponse.ok('Estatísticas obtidas', stats));
    } catch (err) {
      next(err);
    }
  }

  // PUT /coordinator/employees/:id/schedule
  async upsertSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await service.upsertSchedule(req.params['id'] as string, req.body);
      res.json(ApiResponse.ok('Horário guardado', schedule));
    } catch (err) {
      next(err);
    }
  }

  // DELETE /coordinator/employees/:id/schedule
  async deleteSchedule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await service.deleteSchedule(req.params['id'] as string);
      res.json(ApiResponse.ok('Horário removido'));
    } catch (err) {
      next(err);
    }
  }

  // GET /coordinator/attendance/today
  async getTodayAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const records = await service.getTodayAttendance();
      res.json(ApiResponse.ok('Presenças do dia obtidas', records));
    } catch (err) {
      next(err);
    }
  }

  // GET /coordinator/attendance/summary
  async getDailySummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { date } = req.query as { date?: string };
      const summary = await service.getDailySummary(date);
      res.json(ApiResponse.ok('Resumo do dia obtido', summary));
    } catch (err) {
      next(err);
    }
  }

  // GET /coordinator/employees/:id/attendance
  async getEmployeeHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query as { from: string; to: string };
      const history = await service.getEmployeeHistory(req.params['id'] as string, from, to);
      res.json(ApiResponse.ok('Histórico obtido', history));
    } catch (err) {
      next(err);
    }
  }

  // POST /coordinator/attendance/manual
  async manualAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await service.manualAttendance(req.body);
      res.json(ApiResponse.ok('Presença registada manualmente', record));
    } catch (err) {
      next(err);
    }
  }

  // PATCH /coordinator/attendance/:recordId/note
  async addNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { notes } = req.body as { notes: string };
      const record = await service.addNote(req.params['recordId'] as string, notes);
      res.json(ApiResponse.ok('Nota adicionada', record));
    } catch (err) {
      next(err);
    }
  }
}
