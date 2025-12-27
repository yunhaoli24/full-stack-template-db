export interface ITask {
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
}
