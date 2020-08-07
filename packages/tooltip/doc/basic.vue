<template>
  <el-tooltip
    content="click to close tooltip function"
    placement="bottom"
    effect="light"
  >
    <el-button
      @click="disabled = !disabled"
    >
      click to {{ disabled ? 'active' : 'close' }} tooltip function
    </el-button>
  </el-tooltip>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    return {
      disabled: ref(false),
    }
  },
}
</script>
