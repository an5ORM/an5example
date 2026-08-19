
import { An5ClientKnownRequestError as An5KnownError } from "@an5/orm";

export namespace An5 {
  export const An5ClientKnownRequestError: typeof An5KnownError = An5KnownError;
  export type An5ClientKnownRequestError = An5KnownError;
  export type SortOrder = 'asc' | 'desc';
  export type StringFilter = { equals?: string; in?: string[]; notIn?: string[]; lt?: string; lte?: string; gt?: string; gte?: string; contains?: string; startsWith?: string; endsWith?: string; not?: string | StringFilter; };
  export type StringNullableFilter = { equals?: string | null; in?: (string | null)[]; notIn?: (string | null)[]; lt?: string; lte?: string; gt?: string; gte?: string; contains?: string; startsWith?: string; endsWith?: string; not?: string | StringNullableFilter | null; };
  export type NumberFilter = { equals?: number; in?: number[]; notIn?: number[]; lt?: number; lte?: number; gt?: number; gte?: number; not?: number | NumberFilter; };
  export type IntFieldUpdateOperationsInput = { set?: number; increment?: number; decrement?: number; multiply?: number; divide?: number; };
  export type FloatFieldUpdateOperationsInput = { set?: number; increment?: number; decrement?: number; multiply?: number; divide?: number; };
  export type NumberNullableFilter = { equals?: number | null; in?: (number | null)[]; notIn?: (number | null)[]; lt?: number; lte?: number; gt?: number; gte?: number; not?: number | NumberNullableFilter | null; };
  export type BooleanFilter = { equals?: boolean; not?: boolean | BooleanFilter; };
  export type BooleanNullableFilter = { equals?: boolean | null; not?: boolean | BooleanNullableFilter | null; };
  export type DateTimeFilter = { equals?: Date; in?: Date[]; notIn?: Date[]; lt?: Date; lte?: Date; gt?: Date; gte?: Date; not?: Date | DateTimeFilter; };
  export type DateTimeNullableFilter = { equals?: Date | null; in?: (Date | null)[]; notIn?: (Date | null)[]; lt?: Date; lte?: Date; gt?: Date; gte?: Date; not?: Date | DateTimeNullableFilter | null; };
}

export interface TableClient<T, WhereInput = any, Select = any, Include = any, CreateInput = any, UpdateInput = any, FindManyArgs = any, FindFirstArgs = any, FindUniqueArgs = any, CreateArgs = any, UpdateArgs = any, UpsertArgs = any, DeleteArgs = any, AggregateArgs = any, GroupByArgs = any> {
  findMany(args?: FindManyArgs): Promise<T[]>;
  vectorSearch(args: { vector: number[]; take?: number; where?: WhereInput; include?: Include; vectorField?: string; distanceMetric?: 'cosine' | 'euclidean' | 'dot'; }): Promise<(T & { distance: number })[]>;
  findFirst(args?: FindFirstArgs): Promise<T | null>;
  findUnique(args?: FindUniqueArgs): Promise<T | null>;
  count(args?: { where?: WhereInput; }): Promise<number>;
  create(args: CreateArgs): Promise<T>;
  createMany(args: { data: CreateInput[]; skipDuplicates?: boolean; }): Promise<{ count: number }>;
  update(args: UpdateArgs): Promise<T>;
  updateMany(args: { where?: WhereInput; data: UpdateInput; }): Promise<{ count: number }>;
  delete(args: DeleteArgs): Promise<T>;
  deleteMany(args?: { where?: WhereInput; }): Promise<{ count: number }>;
  aggregate(args: AggregateArgs): Promise<any>;
  groupBy(args: GroupByArgs): Promise<any[]>;
  upsert(args: UpsertArgs): Promise<T>;
}
