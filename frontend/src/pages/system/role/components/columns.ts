import type { ColumnDef } from "@tanstack/vue-table";

import { h } from "vue";

import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import type { RoleDetail } from "@/services/api/roles.api";

import RowActions from "./row-actions.vue";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function getStatusLabel(status: number) {
  return status === 1 ? "Active" : "Disabled";
}

export function createColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (role: RoleDetail) => void;
  onDelete: (role: RoleDetail) => void;
}): ColumnDef<RoleDetail>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => h(DataTableColumnHeader<RoleDetail>, { column, title: "Role Name" }),
      cell: ({ row }) => h("div", { class: "font-medium" }, row.getValue("name")),
    },
    {
      accessorKey: "status",
      header: ({ column }) => h(DataTableColumnHeader<RoleDetail>, { column, title: "Status" }),
      cell: ({ row }) => {
        const status = row.original.status;
        return h(Badge, { variant: status === 1 ? "default" : "secondary" }, () =>
          getStatusLabel(status),
        );
      },
    },
    {
      accessorKey: "is_filter_scopes",
      header: ({ column }) => h(DataTableColumnHeader<RoleDetail>, { column, title: "Filter Data Scopes" }),
      cell: ({ row }) => {
        const isFilter = row.original.is_filter_scopes;
        return h(Badge, { variant: isFilter ? "default" : "outline" }, () =>
          isFilter ? "Yes" : "No",
        );
      },
    },
    {
      accessorKey: "remark",
      header: ({ column }) => h(DataTableColumnHeader<RoleDetail>, { column, title: "Remark" }),
      cell: ({ row }) => {
        const remark = row.original.remark;
        return h("div", { class: "text-muted-foreground" }, remark || "-");
      },
    },
    {
      accessorKey: "created_time",
      header: ({ column }) => h(DataTableColumnHeader<RoleDetail>, { column, title: "Created Time" }),
      cell: ({ row }) =>
        h(
          "div",
          { class: "whitespace-nowrap text-sm text-muted-foreground" },
          formatDate(row.original.created_time),
        ),
    },
    {
      id: "actions",
      cell: ({ row }) =>
        h(RowActions, {
          role: row.original,
          onEdit,
          onDelete,
        }),
    },
  ];
}
