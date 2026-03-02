<script setup lang="ts">
import { Pencil, Settings, Trash2 } from "lucide-vue-next";

import { Button } from "@/components/ui/button";
import type { DataScopeDetail } from "@/services/api/system/data-scope/data-scopes.api";

defineProps<{
  scope: DataScopeDetail;
  onEdit: (scope: DataScopeDetail) => void;
  onDelete: (scope: DataScopeDetail) => void;
  onConfigureRules: (scope: DataScopeDetail) => void;
}>();
</script>

<template>
  <div class="flex justify-end gap-2">
    <Button size="sm" variant="ghost" @click="onConfigureRules(scope)">
      <Settings class="mr-1 size-4" />
      Rules
    </Button>
    <Button size="sm" variant="ghost" @click="onEdit(scope)">
      <Pencil class="mr-1 size-4" />
      Edit
    </Button>
    <Button size="sm" variant="ghost" class="text-destructive" @click="onDelete(scope)">
      <Trash2 class="mr-1 size-4" />
      Delete
    </Button>
  </div>
</template>
