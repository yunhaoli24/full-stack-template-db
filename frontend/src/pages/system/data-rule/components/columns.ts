import type { ColumnDef } from "@tanstack/vue-table";

import { h } from "vue";

import DataTableColumnHeader from "@/components/data-table/column-header.vue";
import { Badge } from "@/components/ui/badge";
import type { DataRuleDetail } from "@/services/api/data-rules.api";

import RowActions from "./row-actions.vue";

const operatorOptions = [
  { label: 'AND', value: 0 },
  { label: 'OR', value: 1 },
];

const expressionOptions = [
  { label: '== (Equal)', value: 0 },
  { label: '!= (Not Equal)', value: 1 },
  { label: '> (Greater Than)', value: 2 },
  { label: '>= (Greater or Equal)', value: 3 },
  { label: '< (Less Than)', value: 4 },
  { label: '<= (Less or Equal)', value: 5 },
  { label: 'IN', value: 6 },
  { label: 'NOT IN', value: 7 },
];

function formatOperator(operator: string) {
  const num = Number.parseInt(operator);
  return operatorOptions.find((opt) => opt.value === num)?.label || operator;
}

function formatExpression(expression: string) {
  const num = Number.parseInt(expression);
  return expressionOptions.find((opt) => opt.value === num)?.label || expression;
}

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
}: {
  onEdit: (rule: DataRuleDetail) => void;
  onDelete: (rule: DataRuleDetail) => void;
}): ColumnDef<DataRuleDetail>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => h(DataTableColumnHeader<DataRuleDetail>, { column, title: "Name" }),
      cell: ({ row }) => h("div", { class: "font-medium" }, row.getValue("name")),
    },
    {
      accessorKey: "model",
      header: ({ column }) => h(DataTableColumnHeader<DataRuleDetail>, { column, title: "Model" }),
      cell: ({ row }) => {
        return h(Badge, { variant: "outline" }, () => row.getValue("model"));
      },
    },
    {
      accessorKey: "column",
      header: ({ column }) => h(DataTableColumnHeader<DataRuleDetail>, { column, title: "Column" }),
      cell: ({ row }) => h("div", {}, row.getValue("column")),
    },
    {
      accessorKey: "operator",
      header: ({ column }) => h(DataTableColumnHeader<DataRuleDetail>, { column, title: "Operator" }),
      cell: ({ row }) => {
        const operator = row.original.operator;
        const num = Number.parseInt(operator);
        return h(Badge, { variant: num === 0 ? "default" : "secondary" }, () =>
          formatOperator(operator),
        );
      },
    },
    {
      accessorKey: "expression",
      header: ({ column }) => h(DataTableColumnHeader<DataRuleDetail>, { column, title: "Expression" }),
      cell: ({ row }) => {
        return h(Badge, { variant: "outline" }, () => formatExpression(row.original.expression));
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => h(DataTableColumnHeader<DataRuleDetail>, { column, title: "Value" }),
      cell: ({ row }) => h("div", { class: "font-mono text-xs" }, row.getValue("value")),
    },
    {
      accessorKey: "created_time",
      header: ({ column }) => h(DataTableColumnHeader<DataRuleDetail>, { column, title: "Created Time" }),
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
          rule: row.original,
          onEdit,
          onDelete,
        }),
    },
  ];
}
