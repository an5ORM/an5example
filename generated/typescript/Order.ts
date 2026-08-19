import { An5, TableClient } from './base';
import { User, UserWhereInput, UserFindManyArgs, UserCreateInput, UserUpdateInput } from './User';

export interface Order {
  id: string;
  userId: string;
  total: number;
  status: string | null;
  createdAt: Date;
  user?: User;
  _count?: { user: number };
}

export type OrderWhereInput = {
  AND?: OrderWhereInput | OrderWhereInput[];
  OR?: OrderWhereInput[];
  NOT?: OrderWhereInput | OrderWhereInput[];
  id?: string | An5.StringFilter;
  userId?: string | An5.StringFilter;
  total?: number | An5.NumberFilter;
  status?: string | An5.StringNullableFilter | null;
  createdAt?: Date | An5.DateTimeFilter;
  user?: UserWhereInput;
};

export type OrderSelect = { id?: boolean; userId?: boolean; total?: boolean; status?: boolean; createdAt?: boolean; user?: boolean | UserFindManyArgs; _count?: boolean | { select?: { user?: boolean } }; };
export type OrderInclude = { user?: boolean | UserFindManyArgs; _count?: boolean | { select?: { user?: boolean } }; };
export type OrderCreateInput = { id?: string; userId: string; total?: number; status?: string | null; createdAt?: Date; user?: { create?: UserCreateInput | UserCreateInput[]; connect?: UserWhereInput | UserWhereInput[]; } };
export type OrderUpdateInput = { userId?: string; total?: number | An5.IntFieldUpdateOperationsInput; status?: string | null; createdAt?: Date; user?: { create?: UserCreateInput | UserCreateInput[]; connect?: UserWhereInput | UserWhereInput[]; set?: UserWhereInput | UserWhereInput[]; disconnect?: UserWhereInput | UserWhereInput[]; delete?: UserWhereInput | UserWhereInput[]; update?: { where: UserWhereInput; data: UserUpdateInput; } | { where: UserWhereInput; data: UserUpdateInput; }[]; upsert?: { where: UserWhereInput; create: UserCreateInput; update: UserUpdateInput; } | { where: UserWhereInput; create: UserCreateInput; update: UserUpdateInput; }[]; } };
export type OrderFindManyArgs = { where?: OrderWhereInput; orderBy?: any; take?: number; skip?: number; include?: OrderInclude; select?: OrderSelect; };
export type OrderFindFirstArgs = { where?: OrderWhereInput; orderBy?: any; include?: OrderInclude; select?: OrderSelect; };
export type OrderFindUniqueArgs = { where?: OrderWhereInput; include?: OrderInclude; select?: OrderSelect; };
export type OrderCreateArgs = { data: OrderCreateInput; include?: OrderInclude; select?: OrderSelect; };
export type OrderUpdateArgs = { where: OrderWhereInput; data: OrderUpdateInput; include?: OrderInclude; select?: OrderSelect; };
export type OrderUpsertArgs = { where: OrderWhereInput; create: OrderCreateInput; update: OrderUpdateInput; include?: OrderInclude; select?: OrderSelect; };
export type OrderDeleteArgs = { where: OrderWhereInput; include?: OrderInclude; select?: OrderSelect; };
export type OrderScalarFieldEnum = 'id' | 'userId' | 'total' | 'status' | 'createdAt';
export type OrderAggregateArgs = { where?: OrderWhereInput; _count?: true | { _all?: true; id?: true; userId?: true; total?: true; status?: true; createdAt?: true }; _sum?: { total?: true }; _avg?: { total?: true }; _min?: { id?: true; userId?: true; total?: true; status?: true; createdAt?: true }; _max?: { id?: true; userId?: true; total?: true; status?: true; createdAt?: true }; };
export type OrderAggregateHavingInput = { _count?: { _all?: An5.NumberFilter | number; id?: An5.NumberFilter | number; userId?: An5.NumberFilter | number; total?: An5.NumberFilter | number; status?: An5.NumberFilter | number; createdAt?: An5.NumberFilter | number }; _sum?: { total?: An5.NumberFilter | number }; _avg?: { total?: An5.NumberFilter | number }; _min?: { id?: any; userId?: any; total?: any; status?: any; createdAt?: any }; _max?: { id?: any; userId?: any; total?: any; status?: any; createdAt?: any }; };
export type OrderGroupByArgs = { by: OrderScalarFieldEnum | OrderScalarFieldEnum[]; where?: OrderWhereInput; having?: OrderAggregateHavingInput; orderBy?: any; skip?: number; take?: number; _count?: true | { _all?: true; id?: true; userId?: true; total?: true; status?: true; createdAt?: true }; _sum?: { total?: true }; _avg?: { total?: true }; _min?: { id?: true; userId?: true; total?: true; status?: true; createdAt?: true }; _max?: { id?: true; userId?: true; total?: true; status?: true; createdAt?: true }; };
export type OrderTableClient = TableClient<
  Order,
  OrderWhereInput,
  OrderSelect,
  OrderInclude,
  OrderCreateInput,
  OrderUpdateInput,
  OrderFindManyArgs,
  OrderFindFirstArgs,
  OrderFindUniqueArgs,
  OrderCreateArgs,
  OrderUpdateArgs,
  OrderUpsertArgs,
  OrderDeleteArgs,
  OrderAggregateArgs,
  OrderGroupByArgs
>;
