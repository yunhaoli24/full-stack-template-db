import type { ColumnDef } from "@tanstack/vue-table";

import { h } from "vue";

import { Checkbox } from "@/components/ui/checkbox";
import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import type { TaskResult } from "@/services/api/task-results.api";

import RowActions from "./row-actions.vue";

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'success':
      return 'default'
    case 'failure':
    case 'error':
      return 'destructive'
    case 'pending':
      return 'secondary'
    default:
      return 'outline'
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr)
    return '-'
  return new Date(dateStr).toLocaleString()
}

export function createColumns({
  selectedIds,
  onSelect,
  onSelectAll,
  onViewDetail,
  onDelete,
}: {
  selectedIds: Set<number>
  onSelect: (id: number) => void
  onSelectAll: () => void
  onViewDetail: (result: TaskResult) => void
  onDelete: (ids: number[]) => void
}): ColumnDef<TaskResult>[] {
  return [
    {
      id: "select",
      header: ({ table }) =>
        h(Checkbox, {
          checked: table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
          onCheckedChange: (value) => {
            onSelectAll()
          },
          ariaLabel: "Select all",
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          checked: selectedIds.has(row.original.id),
          onCheckedChange: (value) => {
            onSelect(row.original.id)
          },
          ariaLabel: "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "task_id",
      header: ({ column }) => h(DataTableColumnHeader<TaskResult>, { column, title: "Task ID" }),
      cell: ({ row }) => h("div", { class: "font-mono text-xs" }, row.getValue("task_id")),
    },
    {
      accessorKey: "name",
      header: ({ column }) => h(DataTableColumnHeader<TaskResult>, { column, title: "Name" }),
      cell: ({ row }) => {
        const name = row.original.name
        return h("div", {}, name || "-")
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => h(DataTableColumnHeader<TaskResult>, { column, title: "Status" }),
      cell: ({ row }) => {
        const status = row.original.status
        return h(Badge, { variant: getStatusVariant(status) }, () => status)
      },
    },
    {
      accessorKey: "worker",
      header: ({ column }) => h(DataTableColumnHeader<TaskResult>, { column, title: "Worker" }),
      cell: ({ row }) => {
        const worker = row.original.worker
        return h("div", {}, worker || "-")
      },
    },
    {
      accessorKey: "queue",
      header: ({ column }) => h(DataTableColumnHeader<TaskResult>, { column, title: "Queue" }),
      cell: ({ row }) => {
        const queue = row.original.queue
        return h("div", {}, queue || "-")
      },
    },
    {
      accessorKey: "retries",
      header: ({ column }) => h(DataTableColumnHeader<TaskResult>, { column, title: "Retries" }),
      cell: ({ row }) => h("div", {}, row.original.retries ?? 0),
    },
    {
      accessorKey: "date_done",
      header: ({ column }) => h(DataTableColumnHeader<TaskResult>, { column, title: "Completed Time" }),
      cell: ({ row }) =>
        h(
          "div",
          { class: "whitespace-nowrap text-sm text-muted-foreground" },
          formatDate(row.original.date_done),
        ),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        h(RowActions, {
          result: row.original,
          onViewDetail,
          onDelete,
        }),
    },
  ];
}
