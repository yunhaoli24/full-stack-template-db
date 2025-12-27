import type { ColumnDef } from "@tanstack/vue-table";

import { h } from "vue";

import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import type { DataScopeDetail } from "@/services/api/data-scopes.api";

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

export function createColumns({
  onEdit,
  onDelete,
  onConfigureRules,
}: {
  onEdit: (scope: DataScopeDetail) => void;
  onDelete: (scope: DataScopeDetail) => void;
  onConfigureRules: (scope: DataScopeDetail) => void;
}): ColumnDef<DataScopeDetail>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => h(DataTableColumnHeader<DataScopeDetail>, { column, title: "Name" }),
      cell: ({ row }) => h("div", { class: "font-medium" }, row.getValue("name")),
    },
    {
      accessorKey: "status",
      header: ({ column }) =>
        h(DataTableColumnHeader<DataScopeDetail>, { column, title: "Status" }),
      cell: ({ row }) => {
        const status = row.original.status;
        return h(Badge, { variant: status === 1 ? "default" : "secondary" }, () =>
          status === 1 ? "Active" : "Disabled",
        );
      },
    },
    {
      accessorKey: "created_time",
      header: ({ column }) =>
        h(DataTableColumnHeader<DataScopeDetail>, { column, title: "Created Time" }),
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
          scope: row.original,
          onEdit,
          onDelete,
          onConfigureRules,
        }),
    },
  ];
}
