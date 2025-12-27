import type { ColumnDef } from "@tanstack/vue-table";
import { h } from "vue";
import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import type { TaskScheduler } from "@/services/api/schedulers.api";
import RowActions from "./row-actions.vue";
function formatDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}
function getTypeLabel(type: number) {
  return type === 1 ? "Crontab" : "Interval";
}
function getTypeVariant(type: number) {
  return type === 1 ? "default" : "secondary";
}
export function createColumns({
  onEdit,
  onDelete,
  onToggleStatus,
  onExecute,
}: {
  onEdit: (scheduler: TaskScheduler) => void;
  onDelete: (scheduler: TaskScheduler) => void;
  onToggleStatus: (scheduler: TaskScheduler) => void;
  onExecute: (scheduler: TaskScheduler) => void;
}): ColumnDef<TaskScheduler>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => h(DataTableColumnHeader<TaskScheduler>, { column, title: "Name" }),
      cell: ({ row }) => h("div", { class: "font-medium" }, row.getValue("name")),
    },
    {
      accessorKey: "task",
      header: ({ column }) => h(DataTableColumnHeader<TaskScheduler>, { column, title: "Task" }),
      cell: ({ row }) => h("div", { class: "font-mono text-xs" }, row.getValue("task")),
    },
    {
      accessorKey: "type",
      header: ({ column }) => h(DataTableColumnHeader<TaskScheduler>, { column, title: "Type" }),
      cell: ({ row }) => {
        const type = row.original.type;
        return h(Badge, { variant: getTypeVariant(type) }, () => getTypeLabel(type));
      },
    },
    {
      accessorKey: "crontab",
      header: ({ column }) =>
        h(DataTableColumnHeader<TaskScheduler>, { column, title: "Crontab/Interval" }),
      cell: ({ row }) => {
        const scheduler = row.original;
        const value = scheduler.type === 1 ? scheduler.crontab : scheduler.interval_seconds;
        return h("div", { class: "font-mono text-xs text-muted-foreground" }, value || "-");
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => h(DataTableColumnHeader<TaskScheduler>, { column, title: "Status" }),
      cell: ({ row }) => {
        const status = row.original.status;
        return h(Badge, { variant: status === 1 ? "default" : "secondary" }, () =>
          status === 1 ? "Enabled" : "Disabled",
        );
      },
    },
    {
      accessorKey: "run_count",
      header: ({ column }) =>
        h(DataTableColumnHeader<TaskScheduler>, { column, title: "Run Count" }),
      cell: ({ row }) => h("div", {}, row.original.run_count ?? 0),
    },
    {
      accessorKey: "last_run_time",
      header: ({ column }) =>
        h(DataTableColumnHeader<TaskScheduler>, { column, title: "Last Run" }),
      cell: ({ row }) =>
        h(
          "div",
          { class: "whitespace-nowrap text-sm text-muted-foreground" },
          formatDate(row.original.last_run_time),
        ),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        h(RowActions, {
          scheduler: row.original,
          onEdit,
          onDelete,
          onToggleStatus,
          onExecute,
        }),
    },
  ];
}
