<template>
  <div class="container">
    <div class="top">
      <el-tooltip placement="top-start" content="Top start text">
        <el-button>Top start</el-button>
      </el-tooltip>
      <el-tooltip placement="top" content="Top middle text">
        <el-button>Top middle</el-button>
      </el-tooltip>
      <el-tooltip placement="top-end" content="Top end text">
        <el-button>Top end</el-button>
      </el-tooltip>
    </div>
    <div class="left">
      <el-tooltip placement="left-start" content="Left start text">
        <el-button>Left start</el-button>
      </el-tooltip>
      <el-tooltip placement="left" content="Left middle text">
        <el-button>Left middle</el-button>
      </el-tooltip>
      <el-tooltip placement="left-end" content="Left end text">
        <el-button>Left end</el-button>
      </el-tooltip>
    </div>
    <div class="right">
      <el-tooltip placement="right-start" content="Right start text">
        <el-button>Right start</el-button>
      </el-tooltip>
      <el-tooltip placement="right" content="Right middle text">
        <el-button>Right middle</el-button>
      </el-tooltip>
      <el-tooltip placement="right-end" content="Right end text">
        <el-button>Right end</el-button>
      </el-tooltip>
    </div>
    <div class="bottom">
      <el-tooltip placement="bottom-start" content="Bottom start text">
        <el-button>Bottom start</el-button>
      </el-tooltip>
      <el-tooltip placement="bottom" content="Bottom middle text">
        <el-button>Bottom middle</el-button>
      </el-tooltip>
      <el-tooltip placement="bottom-end" content="Bottom end text">
        <el-button>Bottom end</el-button>
      </el-tooltip>
    </div>
  </div>
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

<style>
.container {
  height: 100vh;
  width: 500px;
  padding-left: 120px;
  padding-top: 100px;
}

.preview-popper-class {
  max-width: 50px;
}

.left {
  float: left;
  width: 60px;
}

.right {
  float: right;
  width: 60px;
}

.top {
  text-align: center;
}

.bottom {
  clear: both;
  text-align: center;
}
</style>
