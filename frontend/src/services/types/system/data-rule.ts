export interface DataRuleDetail {
  id: number;
  name: string;
  model: string;
  column: string;
  operator: string;
  expression: string;
  value: string;
  created_time: string;
  updated_time: string | null;
}

export interface DataRuleColumnDetail {
  key: string;
  comment: string | null;
}

export interface DataRuleParams {
  name?: string;
}

export interface DataRulePayload {
  name: string;
  model: string;
  column: string;
  operator: string;
  expression: string;
  value: string;
}
