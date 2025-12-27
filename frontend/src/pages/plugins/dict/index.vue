<template>
  <div class="page-container">
    <h1>字典管理</h1>
    <div class="todo-notice">
      <p>🚧 此页面正在开发中</p>
      <p>页面路径：{{ route.path }}</p>
      <p>功能：系统字典类型和数据管理</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.todo-notice {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  color: #6c757d;
}
</style>
