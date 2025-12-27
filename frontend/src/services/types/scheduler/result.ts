export interface TaskResult {
  id: number;
  task_id: string;
  status: string;
  result: unknown;
  date_done: string | null;
  traceback: string | null;
  name: string | null;
  args: unknown;
  kwargs: unknown;
  worker: string | null;
  retries: number | null;
  queue: string | null;
}

export interface TaskResultParams {
  name?: string;
  task_id?: string;
}
