import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors';

// Central error handler — maps known error types to appropriate HTTP
// statuses. Anything unexpected falls through to a 500.
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map(i => ({ field: i.path.join('.'), message: i.message }))
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {})
    });
  }

  // Prisma unique constraint (e.g. duplicate email / employeeId)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field';
    return res.status(409).json({ error: `A record with this ${target} already exists` });
  }

  console.error(err.stack);
  return res.status(500).json({ error: err.message || 'Internal server error' });
};
