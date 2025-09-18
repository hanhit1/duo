import { FilterQuery } from 'mongoose';
import { AppError, FilterItem, Operator, Pagination, SortReq } from './types';

export const toApiOkResp = (
  data: Record<string, any>,
  pagination?: Pagination,
): Record<string, any> => {
  return { pagination, data };
};

export const toApiErrorResp = (error: AppError, statusCode?: number) => {
  console.error('API Error:', error);
  return {
    ...error,
    statusCode: statusCode ? statusCode : error.statusCode,
  };
};

export const toNotFoundResp = (context: Record<string, any>) => {
  return {
    message: 'Not found',
    context: context,
  };
};

export const toFilterReq = (rawString: string) => {
  const parsedFilters = JSON.parse(rawString) as string[];

  const res: FilterItem[] = parsedFilters.map((i: string) => {
    const [field, operator, ...rest] = i.split(':');
    return { field, operator, value: rest?.join(':') };
  });
  return res;
};

export const toQueryCondition = <T>(filters: FilterItem[]): FilterQuery<T> => {
  const query: Record<string, any> = {};

  filters?.forEach((i: FilterItem) => {
    switch (i.operator) {
      case Operator.CN.valueOf():
        if (i.value === 'null' || !i.value) break;
        if (query[i.field]) {
          query[i.field].$regex = new RegExp(i.value, 'i');
        } else query[i.field] = { $regex: new RegExp(i.value, 'i') };
        break;
      case Operator.SW.valueOf():
        if (i.value === 'null' || !i.value) break;
        if (query[i.field]) {
          query[i.field].$regex = new RegExp(`^${i.value}`, 'i');
        } else query[i.field] = { $regex: new RegExp(`^${i.value}`, 'i') };
        break;
      case Operator.IN.valueOf():
        if (i.value === 'null' || !i.value) break;
        if (query[i.field]) {
          query[i.field][`$${i.operator}`] = i.value.split(',');
        } else query[i.field] = { [`$${i.operator}`]: i.value.split(',') };
        break;
      default:
        if (i.value === 'null' || !i.value) break;
        if (query[i.field]) {
          query[i.field][`$${i.operator}`] = i.value;
        } else query[i.field] = { [`$${i.operator}`]: i.value };
        break;
    }
  });

  return query;
};

export const toSortReq = (rawSort: string): SortReq => {
  const [field, ...rest] = rawSort.split(':');

  return { field, value: rest?.join(':') };
};
