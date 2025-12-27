export interface TaskScheduler {
  id: number;
  name: string;
  task: string;
  args: unknown;
  kwargs: unknown;
  queue: string | null;
  exchange: string | null;
  routing_key: string | null;
  start_time: string | null;
  expire_time: string | null;
  expire_seconds: number | null;
  type: number;
  interval_every: number | null;
  interval_period: string | null;
  crontab: string;
  one_off: boolean;
  enabled: boolean;
  total_run_count: number;
  last_run_time: string | null;
  remark: string | null;
  created_time: string;
  updated_time: string | null;
}

export interface TaskSchedulerParams {
  name?: string;
  type?: number;
}

export interface TaskSchedulerPayload {
  name: string;
  task: string;
  args?: unknown;
  kwargs?: unknown;
  queue?: string | null;
  exchange?: string | null;
  routing_key?: string | null;
  start_time?: string | null;
  expire_time?: string | null;
  expire_seconds?: number | null;
  type: number;
  interval_every?: number | null;
  interval_period?: string | null;
  crontab: string;
  one_off?: boolean;
  remark?: string | null;
}
