import type { DataRuleSimpleDetail } from "./data-rule";

export interface DataScopeDetail {
  id: number;
  name: string;
  status: number;
  created_time: string;
  updated_time: string | null;
}

export interface DataScopeWithRelationDetail extends DataScopeDetail {
  rules: DataRuleSimpleDetail[];
}

export interface DataRuleSimpleDetail {
  id: number;
  name: string;
}

export interface DataScopeParams {
  name?: string;
  status?: number;
}

export interface DataScopePayload {
  name: string;
  status: number;
}
