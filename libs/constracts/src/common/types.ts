import { FastifyRequest } from 'fastify';

export type AppError = {
  message: string;
  statusCode?: number;
  error?: string;
  context?: Record<string, any>;
  cause?: any;
};

export type PaginationReq = {
  page: number;
  pageSize: number;
};

export type SortReq = {
  field: string;
  value: string;
};

export type Pagination = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
};

export type JwtPayload = {
  userId: string;
  role: AccountRole;
};

export enum Operator {
  EQ = 'eq', //Equal to
  NE = 'ne', //Not equal to
  LT = 'lt', //Less than
  GT = 'gt', //Greater than
  LE = 'le', //Less than or equal
  GE = 'ge', //Greater than or equal
  IN = 'in', //In
  NI = 'ni', //	Not in
  SW = 'sw', //Starts with
  CN = 'cn', //	Contains
}

export type FilterItem = {
  field: string;
  operator: string;
  value: string;
};

export interface CustomRequest extends FastifyRequest {
  user: JwtPayload;
}

export type GeneratedToken = {
  access_token: string;
  refresh_token: string;
};

export enum AccountRole {
  User = 'user',
  Admin = 'admin',
}
