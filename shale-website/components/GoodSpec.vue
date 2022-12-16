<script lang="ts" setup>
import {
  ElImage,
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
} from 'element-plus'
import { EGoodStatus, ShaleItem } from '@/assets/js/Shale'
import { ethers } from 'ethers'
import { cidFilter } from '@/utils/shale'
import { getMinerBrowserUrl } from '@/assets/js/constant'

interface IProps {
  data: ShaleItem
}

const props = defineProps<IProps>()

const datasetsCids = computed<string[]>(() => {
  return props.data.MinerInfo?.datasets.map((item) => item.cid) || []
})
const imagesCids = computed<string[]>(() => {
  return props.data.MinerInfo?.images.map((item) => item.cid) || []
})
</script>

<template>
  <div
    class="good-spec flex-row-between-center position-relative"
    :class="{
      'order-card': data.Type == 'Order',
      'product-card': data.Type == 'Product',
    }"
  >
    <div class="flex-row-start-start flex-flex1">
      <el-image
        class="item-img"
        :src="
          data.Type == 'Order'
            ? 'https://goblin-assets3.oss-cn-shanghai.aliyuncs.com/download/order.png'
            : 'https://goblin-assets3.oss-cn-shanghai.aliyuncs.com/download/ubuntu.png'
        "
        fit="contain"
      />
      <div class="spec">
        <el-descriptions title="" :column="3">
          <!-- OrderId -->
          <template v-if="data.Type == 'Order'">
            <el-descriptions-item
              label="Order ID"
              label-class-name="spec-title"
              :span="3"
            >
              {{ data.OrderId }}
            </el-descriptions-item>
          </template>
          <!-- ProductId -->
          <template v-else>
            <el-descriptions-item
              label="Machine ID"
              label-class-name="spec-title"
              :span="3"
            >
              {{ data.ProductId }}
            </el-descriptions-item>
          </template>
          <el-descriptions-item
            label="Machine Details"
            label-class-name="spec-title"
            :span="3"
          ></el-descriptions-item>
          <!-- CPU -->
          <el-descriptions-item
            label="CPU"
            label-class-name="spec-sub-title"
          ></el-descriptions-item>
          <el-descriptions-item label="Frequency">
            {{ data.Specs.cpu.frequency }}
          </el-descriptions-item>
          <el-descriptions-item label="Core">
            {{ data.Specs.cpu.cores }}
          </el-descriptions-item>
          <!-- \CPU -->
          <!-- GPU -->
          <el-descriptions-item label="GPU" label-class-name="spec-sub-title">
          </el-descriptions-item>
          <el-descriptions-item label="Processor">
            {{ data.Specs.gpu.process }}
          </el-descriptions-item>
          <el-descriptions-item label="Graphics Memory">
            {{ data.Specs.gpu.vram }}
          </el-descriptions-item>
          <!-- \GPU -->
          <!-- RAM -->
          <el-descriptions-item
            label="Memory"
            label-class-name="spec-sub-title"
          >
          </el-descriptions-item>
          <el-descriptions-item label="" :span="2">
            {{ data.Specs.ram.total }}
          </el-descriptions-item>
          <!-- \RAM -->
          <!-- Disk -->
          <el-descriptions-item
            label="Hard Drive"
            label-class-name="spec-sub-title"
          >
          </el-descriptions-item>
          <el-descriptions-item label="" :span="2">
            {{ data.Specs.disk.total }}
          </el-descriptions-item>
          <!-- \Disk -->
          <!-- Miner Info -->
          <el-descriptions-item
            label="Miner Info&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⭐⭐⭐⭐⭐&nbsp;&nbsp;5.0"
            label-class-name="spec-title"
            :span="3"
          ></el-descriptions-item>
          <el-descriptions-item label-class-name="spec-sub-title" :span="3">
            <template #label>
              <a
                v-if="getMinerBrowserUrl(data.MinerInfo?.miner)"
                :href="getMinerBrowserUrl(data.MinerInfo?.miner)"
                target="_blank"
              >
                {{ data.MinerInfo?.miner }}
              </a>
              <span v-else>--</span>
            </template>
            <div class="image-tag-box m-t-5">
              <el-tag
                v-if="data.MinerInfo"
                v-for="m in [
                  ...data.MinerInfo.datasets,
                  ...data.MinerInfo.images,
                ]"
                :key="m.cid"
                class="image-tag word-wrap"
                type="info"
                size="large"
              >
                {{ m.filename }} ({{ cidFilter(m.cid) }})
              </el-tag>
            </div>
          </el-descriptions-item>

          <!-- \Miner Info -->
          <!-- Price -->
          <el-descriptions-item
            label="Price:"
            label-class-name="spec-title"
            :span="3"
          >
            {{ ethers.utils.formatEther(data.FixedPrice) + ' FIL/H' }}
          </el-descriptions-item>
          <!-- \Price -->
        </el-descriptions>
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
    <div class="operate">
      <slot name="operate"></slot>
    </div>
    <div class="order-status">
      <el-tag
        v-if="data.Status == EGoodStatus.ToBeInitialize"
        class="status-tag-pending"
        size="small"
        type="danger"
        effect="dark"
      >
        Pending
      </el-tag>
      <el-tag
        v-else-if="data.Status == EGoodStatus.InUse"
        class="status-tag-active"
        size="small"
        type="success"
        effect="dark"
      >
        Active
      </el-tag>
      <el-tag
        v-else-if="data.Status == EGoodStatus.End"
        class="status-tag-terminated"
        size="small"
        type="info"
        effect="dark"
      >
        Terminated
      </el-tag>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.good-spec {
  margin: 16px 0px;
  padding: 35px 40px;
  font-size: 13px;
  color: #333;
  // background-color: white;
  border-radius: 12px;

  .item-img {
    width: 134px;
    height: 134px;
    border-radius: 12px;
  }

  .spec {
    flex: 1;
    margin: 0 38px;

    // header
    :deep(.el-descriptions__header) {
      margin-bottom: 8px;
    }

    // span
    :deep(
        .el-descriptions__body
          .el-descriptions__table:not(.is-bordered)
          .el-descriptions__cell
      ) {
      padding-bottom: 3px;
    }

    // label
    :deep(.el-descriptions__label:not(.is-bordered-label)) {
      font-size: 14px;
      color: #9e9e9e;
    }

    // value and cpu
    :deep(.el-descriptions__content:not(.is-bordered-label)),
    :deep(.spec-sub-title:not(.is-bordered-label)) {
      font-size: 14px;
      color: #333;
    }

    // title
    :deep(.spec-title:not(.is-bordered-label)) {
      font-size: 15px;
      font-weight: bold;
      color: #333;
    }

    // [ Product | Order ] ID
    :deep(.spec-id:not(.is-bordered-label)) {
      font-size: 15px;
      font-weight: bold;
      color: #586edc;
    }
  }

  .image-tag-box {
    border-radius: 4px;

    .image-tag {
      margin: 5px;
      border-radius: 16px;
    }
  }
  .order-status {
    position: absolute;
    top: 35px;
    right: 40px;
    // .status-tag-pending {
    //   // border-radius: 18%;
    //   // background-color: #f56c6c;
    // }
    // .status-tag-active {
    //   // border-radius: 18%;
    //   // background-color: green;
    // }
    // .status-tag-terminated {
    //   // border-radius: 18%;
    //   // background-color: darkgray;
    // }
  }
}

.product-card,
.order-card {
  $cardColor: #fff;
  background-color: $cardColor;

  :deep(.el-descriptions__body) {
    background-color: $cardColor;
  }
}
</style>
