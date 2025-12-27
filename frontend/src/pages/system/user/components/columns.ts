import type { ColumnDef } from "@tanstack/vue-table";

import { h } from "vue";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import type { UserDetail } from "@/services/api/user.api";

import RowActions from "./row-actions.vue";

function getStatusLabel(status: number) {
  return status === 1 ? "Active" : "Disabled";
}

export function createColumns({
  onEdit,
  onDelete,
  onResetPassword,
}: {
  onEdit: (user: UserDetail) => void;
  onDelete: (user: UserDetail) => void;
  onResetPassword: (user: UserDetail) => void;
}): ColumnDef<UserDetail>[] {
  return [
    {
      accessorKey: "username",
      header: ({ column }) => h(DataTableColumnHeader<UserDetail>, { column, title: "Username" }),
      cell: ({ row }) => {
        const user = row.original;
        return h("div", { class: "flex items-center gap-2" }, [
          user.avatar
            ? h(Avatar, { class: "size-8" }, () => [
                h(AvatarImage, { src: user.avatar }),
                h(AvatarFallback, {}, () => user.username.charAt(0).toUpperCase()),
              ])
            : null,
          h("span", {}, user.username),
          user.is_superuser
            ? h(Badge, { variant: "default", class: "ml-1" }, () => "Admin")
            : null,
        ]);
      },
    },
    {
      accessorKey: "nickname",
      header: ({ column }) => h(DataTableColumnHeader<UserDetail>, { column, title: "Nickname" }),
      cell: ({ row }) => h("div", {}, row.getValue("nickname")),
    },
    {
      accessorKey: "dept",
      header: ({ column }) => h(DataTableColumnHeader<UserDetail>, { column, title: "Department" }),
      cell: ({ row }) => {
        const dept = row.original.dept;
        return h("div", {}, dept?.name || "-");
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => h(DataTableColumnHeader<UserDetail>, { column, title: "Email" }),
      cell: ({ row }) => {
        const email = row.original.email;
        return h("div", {}, email || "-");
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => h(DataTableColumnHeader<UserDetail>, { column, title: "Phone" }),
      cell: ({ row }) => {
        const phone = row.original.phone;
        return h("div", {}, phone || "-");
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => h(DataTableColumnHeader<UserDetail>, { column, title: "Status" }),
      cell: ({ row }) => {
        const status = row.original.status;
        return h(Badge, { variant: status === 1 ? "default" : "secondary" }, () =>
          getStatusLabel(status),
        );
      },
    },
    {
      accessorKey: "roles",
      header: ({ column }) => h(DataTableColumnHeader<UserDetail>, { column, title: "Roles" }),
      cell: ({ row }) => {
        const roles = row.original.roles || [];
        return h(
          "div",
          { class: "flex flex-wrap gap-1" },
          roles.map((role) =>
            h(Badge, { key: role.id, variant: "outline", class: "text-xs" }, () => role.name),
          ),
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) =>
        h(RowActions, {
          user: row.original,
          onEdit,
          onDelete,
          onResetPassword,
        }),
    },
  ];
}
