import type { ColumnDef } from "@tanstack/vue-table";

import { h } from "vue";

import { Checkbox } from "@/components/ui/checkbox";
import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import type { LoginLog } from "@/services/api/login-logs.api";

function getStatusVariant(status: number) {
  return status === 1 ? "default" : "destructive";
}

function getStatusText(status: number) {
  return status === 1 ? "Success" : "Failed";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

function getLocation(log: LoginLog) {
  const parts = [log.country, log.region, log.city].filter(Boolean);
  return parts.length > 0 ? parts.join(" - ") : "-";
}

export function createColumns({
  selectedIds,
  onSelect,
  onSelectAll,
}: {
  selectedIds: Set<number>;
  onSelect: (id: number) => void;
  onSelectAll: () => void;
}): ColumnDef<LoginLog>[] {
  return [
    {
      id: "select",
      header: ({ table }) =>
        h(Checkbox, {
          checked:
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate"),
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
      header: ({ column }) => h(DataTableColumnHeader<LoginLog>, { column, title: "Username" }),
      cell: ({ row }) => h("div", { class: "font-medium" }, row.getValue("username")),
    },
    {
      accessorKey: "status",
      header: ({ column }) => h(DataTableColumnHeader<LoginLog>, { column, title: "Status" }),
      cell: ({ row }) => {
        const status = row.original.status;
        return h(Badge, { variant: getStatusVariant(status) }, () => getStatusText(status));
      },
    },
    {
      accessorKey: "ip",
      header: ({ column }) => h(DataTableColumnHeader<LoginLog>, { column, title: "IP" }),
      cell: ({ row }) => h("div", { class: "font-mono text-xs" }, row.original.ip || "-"),
    },
    {
      accessorKey: "location",
      header: ({ column }) => h(DataTableColumnHeader<LoginLog>, { column, title: "Location" }),
      cell: ({ row }) => h("div", { class: "text-muted-foreground" }, getLocation(row.original)),
    },
    {
      accessorKey: "user_agent",
      header: ({ column }) => h(DataTableColumnHeader<LoginLog>, { column, title: "User Agent" }),
      cell: ({ row }) => {
        const ua = row.original.user_agent;
        return h("div", { class: "max-w-[300px] truncate text-muted-foreground" }, ua || "-");
      },
    },
    {
      accessorKey: "login_time",
      header: ({ column }) => h(DataTableColumnHeader<LoginLog>, { column, title: "Login Time" }),
      cell: ({ row }) =>
        h(
          "div",
          { class: "whitespace-nowrap text-sm text-muted-foreground" },
          formatDate(row.original.login_time),
        ),
    },
  ];
}
