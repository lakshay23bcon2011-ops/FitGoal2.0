import { Response } from 'express';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  pagination?: PaginationInfo
) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(pagination && { pagination })
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code?: string
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(code && { code })
  });
}
