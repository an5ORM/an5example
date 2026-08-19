import { An5, TableClient } from './base';
import { Order, OrderWhereInput, OrderFindManyArgs, OrderCreateInput, OrderUpdateInput } from './Order';

export interface User {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  score: number;
  createdAt: Date;
  orders?: Order[];
  _count?: { orders: number };
}

export type UserWhereInput = {
  AND?: UserWhereInput | UserWhereInput[];
  OR?: UserWhereInput[];
  NOT?: UserWhereInput | UserWhereInput[];
  id?: string | An5.StringFilter;
  email?: string | An5.StringFilter;
  name?: string | An5.StringNullableFilter | null;
  isActive?: boolean | An5.BooleanFilter;
  score?: number | An5.NumberFilter;
  createdAt?: Date | An5.DateTimeFilter;
  orders?: { some?: OrderWhereInput; none?: OrderWhereInput; every?: OrderWhereInput; };
};

export type UserSelect = { id?: boolean; email?: boolean; name?: boolean; isActive?: boolean; score?: boolean; createdAt?: boolean; orders?: boolean | OrderFindManyArgs; _count?: boolean | { select?: { orders?: boolean } }; };
export type UserInclude = { orders?: boolean | OrderFindManyArgs; _count?: boolean | { select?: { orders?: boolean } }; };
export type UserCreateInput = { id?: string; email: string; name?: string | null; isActive?: boolean; score?: number; createdAt?: Date; orders?: { create?: OrderCreateInput | OrderCreateInput[]; connect?: OrderWhereInput | OrderWhereInput[]; } };
export type UserUpdateInput = { email?: string; name?: string | null; isActive?: boolean; score?: number | An5.IntFieldUpdateOperationsInput; createdAt?: Date; orders?: { create?: OrderCreateInput | OrderCreateInput[]; connect?: OrderWhereInput | OrderWhereInput[]; set?: OrderWhereInput | OrderWhereInput[]; disconnect?: OrderWhereInput | OrderWhereInput[]; delete?: OrderWhereInput | OrderWhereInput[]; update?: { where: OrderWhereInput; data: OrderUpdateInput; } | { where: OrderWhereInput; data: OrderUpdateInput; }[]; upsert?: { where: OrderWhereInput; create: OrderCreateInput; update: OrderUpdateInput; } | { where: OrderWhereInput; create: OrderCreateInput; update: OrderUpdateInput; }[]; } };
export type UserFindManyArgs = { where?: UserWhereInput; orderBy?: any; take?: number; skip?: number; include?: UserInclude; select?: UserSelect; };
export type UserFindFirstArgs = { where?: UserWhereInput; orderBy?: any; include?: UserInclude; select?: UserSelect; };
export type UserFindUniqueArgs = { where?: UserWhereInput; include?: UserInclude; select?: UserSelect; };
export type UserCreateArgs = { data: UserCreateInput; include?: UserInclude; select?: UserSelect; };
export type UserUpdateArgs = { where: UserWhereInput; data: UserUpdateInput; include?: UserInclude; select?: UserSelect; };
export type UserUpsertArgs = { where: UserWhereInput; create: UserCreateInput; update: UserUpdateInput; include?: UserInclude; select?: UserSelect; };
export type UserDeleteArgs = { where: UserWhereInput; include?: UserInclude; select?: UserSelect; };
export type UserScalarFieldEnum = 'id' | 'email' | 'name' | 'isActive' | 'score' | 'createdAt';
export type UserAggregateArgs = { where?: UserWhereInput; _count?: true | { _all?: true; id?: true; email?: true; name?: true; isActive?: true; score?: true; createdAt?: true }; _sum?: { score?: true }; _avg?: { score?: true }; _min?: { id?: true; email?: true; name?: true; isActive?: true; score?: true; createdAt?: true }; _max?: { id?: true; email?: true; name?: true; isActive?: true; score?: true; createdAt?: true }; };
export type UserAggregateHavingInput = { _count?: { _all?: An5.NumberFilter | number; id?: An5.NumberFilter | number; email?: An5.NumberFilter | number; name?: An5.NumberFilter | number; isActive?: An5.NumberFilter | number; score?: An5.NumberFilter | number; createdAt?: An5.NumberFilter | number }; _sum?: { score?: An5.NumberFilter | number }; _avg?: { score?: An5.NumberFilter | number }; _min?: { id?: any; email?: any; name?: any; isActive?: any; score?: any; createdAt?: any }; _max?: { id?: any; email?: any; name?: any; isActive?: any; score?: any; createdAt?: any }; };
export type UserGroupByArgs = { by: UserScalarFieldEnum | UserScalarFieldEnum[]; where?: UserWhereInput; having?: UserAggregateHavingInput; orderBy?: any; skip?: number; take?: number; _count?: true | { _all?: true; id?: true; email?: true; name?: true; isActive?: true; score?: true; createdAt?: true }; _sum?: { score?: true }; _avg?: { score?: true }; _min?: { id?: true; email?: true; name?: true; isActive?: true; score?: true; createdAt?: true }; _max?: { id?: true; email?: true; name?: true; isActive?: true; score?: true; createdAt?: true }; };
export type UserTableClient = TableClient<
  User,
  UserWhereInput,
  UserSelect,
  UserInclude,
  UserCreateInput,
  UserUpdateInput,
  UserFindManyArgs,
  UserFindFirstArgs,
  UserFindUniqueArgs,
  UserCreateArgs,
  UserUpdateArgs,
  UserUpsertArgs,
  UserDeleteArgs,
  UserAggregateArgs,
  UserGroupByArgs
>;
