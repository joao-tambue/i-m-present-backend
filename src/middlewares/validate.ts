import { NextFunction, Request, Response } from 'express';
import { z, ZodSchema } from 'zod';
import { Area } from '../modules/auth/auth.model';
import { ApiResponse } from '../shared/utils/ApiResponse';

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter pelo menos 8 caracteres')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número');

const phoneSchema = z
  .string()
  .min(9, 'Número inválido')
  .max(15, 'Número inválido')
  .regex(/^\+?[\d\s\-()]+$/, 'Número de telefone inválido');

export const registerCoordinatorSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').trim(),
  email: z.string().email('Email inválido').toLowerCase(),
  phone: phoneSchema,
  password: passwordSchema,
});

export const registerEmployeeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').trim(),
  email: z.string().email('Email inválido').toLowerCase(),
  phone: phoneSchema,
  area: z.enum(Object.values(Area) as [Area, ...Area[]], {
    error: `Área inválida. Valores aceites: ${Object.values(Area).join(', ')}`,
  }),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'Senha obrigatória'),
});

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return res.status(422).json(
        ApiResponse.fail('Dados inválidos', JSON.stringify(errors)),
      );
    }

    // Substituir req.body pelos dados validados e sanitizados (ex: email em lowercase)
    req.body = result.data;
    next();
  };
}
