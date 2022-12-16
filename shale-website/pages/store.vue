<script lang="ts" setup>
import { dappCtx } from '@/assets/js/contract'
import { ShaleItem } from '@/assets/js/Shale'
import {
  ElMessage,
  ElButton,
  ElEmpty,
  ElPagination,
  ElInput,
  ElInputNumber,
  vLoading,
  ElDialog,
  ElSelect,
  ElOption,
} from 'element-plus'
import { useClipboard } from '@vueuse/core'
import { ethers } from 'ethers'
import { getErrorMessage } from '@/utils/errors'
import {
  copyToItem,
  addrFilter,
  getDatasetsOrImages,
  scrollToTop,
} from '@/utils/shale'
import { getMinerBrowserUrl } from '@/assets/js/constant'

useHead({
  title: 'Store',
})

const router = useRouter()

const clipboardSource = ref('')
const {
  text: clipboardText,
  copy: copyToClipboard,
  copied,
  isSupported,
} = useClipboard({
  source: clipboardSource,
})
const clipboardProductId = ref('')

function copyText(text: string, id: string) {
  copyToClipboard(text)
  clipboardProductId.value = id
}

onMounted(() => {
  getAllList()
})

// ==================== List & Page ====================
const allList = ref<ShaleItem[]>([])
const currentPage = ref(1)
const pageSize = ref(3)
// filtered list
const list = computed(() => {
  const offset = (currentPage.value - 1) * pageSize.value
  return allList.value.slice(offset, offset + pageSize.value)
})

watch(currentPage, () => {
  scrollToTop()
})

const listLoading = ref(true)
async function getAllList() {
  try {
    listLoading.value = true
    if (!dappCtx.Shale) await dappCtx.connect()
    const res = await dappCtx.Shale?.getMarketList()
    // console.log('res:', res)
    allList.value = (res || []).map((item) => copyToItem(item, 'Product'))
    currentPage.value = 1
    // console.log('allList:', allList.value)
  } catch (err) {
    ElMessage.error(getErrorMessage(err))
  } finally {
    listLoading.value = false
  }
}

// ==================== Rent ====================

const centerDialogVisible = ref(false)
const currentRentInfo = ref<ShaleItem>()
// user info
const publicKey = ref('')
// DataSet
const datasetCheckedKey = ref('')
// Image
const imageCheckedKey = ref('')
const rentalDuration = ref<number>(1)
const currentRentPrice = computed(() => {
  const fixedPrice: number | string = ethers.utils.formatEther(
    currentRentInfo.value?.FixedPrice || 0
  )
  return parseFloat(parseFloat(fixedPrice).toFixed(4))
})
const estimatedCost = computed(() => {
  const fixedPrice: number | string = ethers.utils.formatEther(
    currentRentInfo.value?.FixedPrice || 0
  )
  let cost = rentalDuration.value
    ? rentalDuration.value * parseFloat(fixedPrice)
    : 0
  cost = parseFloat(cost.toFixed(4))
  return cost
})
const openRent = (item: ShaleItem) => {
  // console.log('item:', item)
  publicKey.value = ''
  imageCheckedKey.value = ''
  rentalDuration.value = 1
  currentRentInfo.value = item
  centerDialogVisible.value = true
}
const confirmRent = async () => {
  if (!publicKey.value) {
    ElMessage({
      message: 'Please enter the public key',
      type: 'warning',
    })
    return
  }
  if (!rentalDuration.value) {
    ElMessage({
      message: 'Please enter the rental duration',
      type: 'warning',
    })
    return
  }
  // console.log('product:', currentRentInfo.value)
  const txHash = await dappCtx.Shale?.takeProduct(
    currentRentInfo.value?.ProductId as string,
    rentalDuration.value,
    {
      pubkey: publicKey.value,
      dataset: getDatasetsOrImages([datasetCheckedKey.value])[0],
      image: getDatasetsOrImages([imageCheckedKey.value])[0],
    }
  )
  ElMessage({
    message:
      'The transaction is submitted successfully, please go to the browser to check.',
    type: 'success',
  })
  router.push('/user/order')
}
</script>

<template>
  <div class="store-page">
    <div class="page-wrap">
      <div class="list" v-loading="listLoading" style="overflow: auto">
        <GoodSpec v-for="item in list" :key="item.ProductId" :data="item">
          <template #operate>
            <el-button
              class="operate-btn"
              color="#586EDC"
              dark
              @click="openRent(item)"
              >Request Instance</el-button
            >
          </template>
        </GoodSpec>
        <el-empty v-if="list.length === 0" />
        <div class="flex-row-center-center p-b-20">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 40]"
            background
            layout="prev, pager, next"
            hide-on-single-page
            :total="allList.length"
          />
        </div>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="centerDialogVisible"
    class="rent-dialog"
    title="Rent"
    width="30%"
    align-center
    append-to-body
    center
  >
    <!-- Machine ID -->
    <div class="rent-title">
      Machine ID:
      <span class="m-l-10 m-r-5">
        {{ currentRentInfo?.ProductId || '--' }}
      </span>
    </div>
    <!-- Owner -->
    <div class="rent-title">
      Owner:
      <span class="m-l-10 m-r-5">
        {{ currentRentInfo?.Owner ? addrFilter(currentRentInfo?.Owner) : '--' }}
      </span>
      <img
        v-if="copied && clipboardProductId == currentRentInfo?.ProductId"
        class="copy-icon"
        src="/img/success.png"
        alt=""
      />
      <img
        v-else
        class="copy-icon"
        src="/img/copy.png"
        alt=""
        @click="
          copyText(
            currentRentInfo?.Owner || '',
            currentRentInfo?.ProductId || ''
          )
        "
      />
    </div>
    <!-- Miner -->
    <div class="rent-title">
      Miner:
      <span class="m-l-10 m-r-5">
        <!-- {{ currentRentInfo?.MinerInfo?.miner || '--' }} -->
        <a
          v-if="getMinerBrowserUrl(currentRentInfo?.MinerInfo?.miner)"
          :href="getMinerBrowserUrl(currentRentInfo?.MinerInfo?.miner)"
          target="_blank"
        >
          {{ currentRentInfo?.MinerInfo?.miner }}
        </a>
        <span v-else>--</span>
      </span>
    </div>
    <!-- Data Set -->
    <!-- <div class="rent-title m-t-20">Data Set</div>
    <el-select
      v-model="datasetCheckedKey"
      class="m-2"
      placeholder="Please select the image"
      size="large"
    >
      <el-option
        v-for="op in currentRentInfo?.MinerInfo?.datasets"
        :label="op.filename"
        :value="op.cid"
      />
    </el-select> -->
    <!-- Image -->
    <div class="rent-title m-t-20">Image</div>
    <el-select
      v-model="imageCheckedKey"
      class="m-2"
      placeholder="Please select the image"
      size="large"
    >
      <el-option
        v-if="currentRentInfo?.MinerInfo"
        v-for="op in currentRentInfo?.MinerInfo?.images"
        :label="op.filename"
        :value="op.cid"
      />
    </el-select>
    <!-- Public key -->
    <div class="rent-title m-t-20">Public key</div>
    <el-input
      v-model="publicKey"
      class="rent-input"
      :rows="3"
      type="textarea"
      placeholder="Please enter the public key"
    />
    <!-- Rental duration -->
    <div class="rent-title m-t-20">Rental duration (hour)</div>
    <el-input-number v-model="rentalDuration" class="rent-number" :min="1" />
    <!-- Price -->
    <div class="rent-title m-t-20">
      Price:
      <span class="m-l-10">
        {{ currentRentPrice }}
        FIL/H
      </span>
    </div>
    <!-- <el-input
      :value="currentRentPrice"
      class="rent-input"
      placeholder=""
      readonly
      disabled
    /> -->
    <div class="rent-title m-t-20">
      Estimated cost:
      <strong class="m-l-10">
        {{ estimatedCost }}
        FIL
      </strong>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button
          class="operate-btn"
          color="#586EDC"
          dark
          @click="confirmRent"
        >
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.store-page {
  min-height: $mainHeightWithFooter;
  background-color: #f9f9f9;
  .list {
    padding: 0;
    margin: 0;
  }
}
.operate-btn {
  padding: 0 30px;
  height: 38px;
  border-radius: 19px;
}
</style>

<style lang="scss">
.rent-dialog {
  border-radius: 12px;
  .rent-title {
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #333333;
  }
  .rent-input {
    .el-input__wrapper {
      height: 44px;
      background: #eeeeee;
      border-radius: 22px;
      &.is-focus {
        box-shadow: 0 0 0 1px #586edc inset;
      }
    }
  }
  .rent-number {
    .el-input__wrapper {
      height: 44px;
      background: #eeeeee;
      &.is-focus {
        box-shadow: 0 0 0 1px #586edc inset;
      }
    }
  }
}
</style>
