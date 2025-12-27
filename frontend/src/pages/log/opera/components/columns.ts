import type { ColumnDef } from "@tanstack/vue-table";

import { h } from "vue";

import { Checkbox } from "@/components/ui/checkbox";
import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import type { OperaLog } from "@/services/api/opera-logs.api";

function getStatusVariant(status: number) {
  return status === 1 ? 'default' : 'destructive'
}

function getStatusText(status: number) {
  return status === 1 ? 'Success' : 'Failed'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString()
}

function getLocation(log: OperaLog) {
  const parts = [log.country, log.region, log.city].filter(Boolean)
  return parts.length > 0 ? parts.join(' - ') : '-'
}

function formatCostTime(time: number) {
  return `${time.toFixed(2)}ms`
}

export function createColumns({
  selectedIds,
  onSelect,
  onSelectAll,
}: {
  selectedIds: Set<number>
  onSelect: (id: number) => void
  onSelectAll: () => void
}): ColumnDef<OperaLog>[] {
  return [
    {
      id: "select",
      header: ({ table }) =>
        h(Checkbox, {
          checked: table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
          onCheckedChange: () => onSelectAll(),
          ariaLabel: "Select all",
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          checked: selectedIds.has(row.original.id),
          onCheckedChange: () => onSelect(row.original.id),
          ariaLabel: "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "username",
      header: ({ column }) => h(DataTableColumnHeader<OperaLog>, { column, title: "Username" }),
      cell: ({ row }) => h("div", { class: "font-medium" }, row.getValue("username")),
    },
    {
      accessorKey: "module",
      header: ({ column }) => h(DataTableColumnHeader<OperaLog>, { column, title: "Module" }),
      cell: ({ row }) => h("div", {}, row.getValue("module")),
    },
    {
      accessorKey: "operation",
      header: ({ column }) => h(DataTableColumnHeader<OperaLog>, { column, title: "Operation" }),
      cell: ({ row }) => h("div", {}, row.getValue("operation")),
    },
    {
      accessorKey: "method",
      header: ({ column }) => h(DataTableColumnHeader<OperaLog>, { column, title: "Method" }),
      cell: ({ row }) => {
        const method = row.original.method
        return h("div", { class: "font-mono text-xs" }, method || '-')
      },
    },
    {
      accessorKey: "url",
      header: ({ column }) => h(DataTableColumnHeader<OperaLog>, { column, title: "URL" }),
      cell: ({ row }) => {
        const url = row.original.url
        return h("div", { class: "max-w-[300px] truncate font-mono text-xs" }, url || '-')
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => h(DataTableColumnHeader<OperaLog>, { column, title: "Status" }),
      cell: ({ row }) => {
        const status = row.original.status
        return h(Badge, { variant: getStatusVariant(status) }, () => getStatusText(status))
      },
    },
    {
      accessorKey: "cost_time",
      header: ({ column }) => h(DataTableColumnHeader<OperaLog>, { column, title: "Cost Time" }),
      cell: ({ row }) => h("div", { class: "text-muted-foreground" }, formatCostTime(row.original.cost_time)),
    },
    {
      accessorKey: "opera_time",
      header: ({ column }) => h(DataTableColumnHeader<OperaLog>, { column, title: "Time" }),
      cell: ({ row }) =>
        h(
          "div",
          { class: "whitespace-nowrap text-sm text-muted-foreground" },
          formatDate(row.original.opera_time),
        ),
    },
  ];
}
