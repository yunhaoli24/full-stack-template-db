import type { ColumnDef } from "@tanstack/vue-table";

import { h } from "vue";

import { LogOut } from "lucide-vue-next";

import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OnlineUserDetail } from "@/services/api/online-users.api";

function formatDevice(user: OnlineUserDetail) {
  const parts = [user.os, user.browser, user.device].filter(Boolean)
  return parts.join(' / ') || 'Unknown'
}

function formatTime(time: string) {
  if (time === '未知' || !time) {
    return '-'
  }
  try {
    return new Date(time).toLocaleString()
  }
  catch {
    return time
  }
}

function getExpireTime(expireTime: string) {
  try {
    const date = new Date(expireTime)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    if (diff <= 0) {
      return 'Expired'
    }
    const minutes = Math.floor(diff / 60000)
    return `${minutes}min`
  }
  catch {
    return '-'
  }
}

export function createColumns(onKick: (user: OnlineUserDetail) => void): ColumnDef<OnlineUserDetail>[] {
  return [
    {
      accessorKey: "username",
      header: ({ column }) => h(DataTableColumnHeader<OnlineUserDetail>, { column, title: "User" }),
      cell: ({ row }) => {
        const user = row.original
        return h("div", {}, [
          h("div", { class: "font-medium" }, user.nickname || user.username),
          h("div", { class: "text-sm text-muted-foreground" }, `@${user.username}`),
        ])
      },
    },
    {
      accessorKey: "ip",
      header: ({ column }) => h(DataTableColumnHeader<OnlineUserDetail>, { column, title: "IP Address" }),
      cell: ({ row }) => h("code", { class: "rounded bg-muted px-2 py-1 text-sm font-mono text-xs" }, row.original.ip || '-'),
    },
    {
      accessorKey: "location",
      header: ({ column }) => h(DataTableColumnHeader<OnlineUserDetail>, { column, title: "Location" }),
      cell: ({ row }) => {
        const parts = [row.original.country, row.original.region, row.original.city].filter(Boolean)
        return h("div", { class: "text-muted-foreground" }, parts.length > 0 ? parts.join(' - ') : '-')
      },
    },
    {
      accessorKey: "device",
      header: ({ column }) => h(DataTableColumnHeader<OnlineUserDetail>, { column, title: "Device" }),
      cell: ({ row }) => h("div", { class: "text-muted-foreground text-sm" }, formatDevice(row.original)),
    },
    {
      accessorKey: "status",
      header: ({ column }) => h(DataTableColumnHeader<OnlineUserDetail>, { column, title: "Status" }),
      cell: ({ row }) => {
        const status = row.original.status
        return h(Badge, { variant: status === 1 ? "default" : "secondary" }, () => status === 1 ? "Online" : "Offline")
      },
    },
    {
      accessorKey: "last_login_time",
      header: ({ column }) => h(DataTableColumnHeader<OnlineUserDetail>, { column, title: "Last Login" }),
      cell: ({ row }) => h("div", { class: "text-sm text-muted-foreground" }, formatTime(row.original.last_login_time)),
    },
    {
      accessorKey: "expire_time",
      header: ({ column }) => h(DataTableColumnHeader<OnlineUserDetail>, { column, title: "Expires In" }),
      cell: ({ row }) => h("div", { class: "text-sm text-muted-foreground" }, getExpireTime(row.original.expire_time)),
    },
    {
      id: "actions",
      header: ({ column }) => h(DataTableColumnHeader<OnlineUserDetail>, { column, title: "Actions" }),
      cell: ({ row }) => {
        const user = row.original
        return h("div", { class: "flex justify-end" }, [
          h(Button, {
            size: "sm",
            variant: "ghost",
            disabled: user.status !== 1,
            onClick: () => onKick(user)
          }, () => [
            h(LogOut, { class: "mr-1 size-4" }),
            "Kick"
          ])
        ])
      },
    },
  ];
}
