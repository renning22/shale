<script lang="ts" setup>
import { dappCtx } from '@/assets/js/contract'
import {
  IDatasetOrImage,
  instanceOfShaleSpec,
  ShaleSpec,
  ViewMinerInfo,
} from '@/assets/js/Shale'
import { MINERS, DATASETS, IMAGES, cidFilter } from '@/utils/shale'
import {
  ElMessage,
  ElImage,
  ElCheckboxGroup,
  ElCheckbox,
  ElButton,
  ElInput,
  ElRadioGroup,
  ElRadio,
  ElScrollbar,
  vLoading,
} from 'element-plus'

const machineDesc = ref(
  'cpu.cores=\ncpu.frequency=\ngpu.process=\ngpu.vram=\nram.total=\ndisk.total=\ndisk.free='
)
const price = ref('')
const minerOptionLoading = ref(false)
const minerOpts = ref<string[]>([])
const datasetOpts = ref<IDatasetOrImage[]>([])
const imageOpts = ref<IDatasetOrImage[]>([])
const checkedMiner = ref('')
const datasetCheckList = ref<string[]>([])
const imageCheckList = ref<string[]>([])

useHead({
  title: 'Add Machine',
})

onMounted(() => {
  loadMinerOptions()
})

watch(checkedMiner, async () => {
  await onMinerChange()
  datasetCheckList.value = datasetOpts.value.map((item) => item.cid)
  imageCheckList.value = imageOpts.value.map((item) => item.cid)
})

const minerChanging = ref(false)
const onMinerChange = async () => {
  try {
    minerChanging.value = true
    await sleepSomeTime()
    if (checkedMiner.value == minerOpts.value[0]) {
      datasetOpts.value = DATASETS
      imageOpts.value = IMAGES
    } else if (checkedMiner.value == minerOpts.value[1]) {
      const omitIdxs: { [idx: number]: boolean } = {
        1: true,
        3: true,
      }
      datasetOpts.value = DATASETS.filter((_, idx: number) => !omitIdxs[idx])
      imageOpts.value = IMAGES.filter((_, idx: number) => !omitIdxs[idx])
    } else if (checkedMiner.value == minerOpts.value[2]) {
      const omitIdxs: { [idx: number]: boolean } = {
        2: true,
        4: true,
      }
      datasetOpts.value = DATASETS.filter((_, idx: number) => !omitIdxs[idx])
      imageOpts.value = IMAGES.filter((_, idx: number) => !omitIdxs[idx])
    }
  } catch (err) {
    console.error('[loadMinerOptions err]', err)
  } finally {
    minerChanging.value = false
  }
}

const loadMinerOptions = async () => {
  try {
    minerOptionLoading.value = true
    await sleepSomeTime(800)
    minerOpts.value = MINERS
    datasetOpts.value = DATASETS
    imageOpts.value = IMAGES
  } catch (err) {
    console.error('[loadMinerOptions err]', err)
  } finally {
    minerOptionLoading.value = false
  }
}

const emit = defineEmits<{
  (e: 'added'): void
}>()

const confirmAdd = async () => {
  if (!machineDesc.value) {
    ElMessage({
      message: 'Please enter the machine details',
      type: 'warning',
    })
    return
  }
  if (!checkedMiner.value) {
    ElMessage({
      message: 'Please choose the miner info',
      type: 'warning',
    })
    return
  }
  if (!datasetCheckList.value.length) {
    ElMessage({
      message: 'Please choose the data set',
      type: 'warning',
    })
    return
  }
  if (!imageCheckList.value.length) {
    ElMessage({
      message: 'Please choose the image',
      type: 'warning',
    })
    return
  }
  if (!price.value) {
    ElMessage({
      message: 'Please set the price',
      type: 'warning',
    })
    return
  }
  let specs: ShaleSpec | null = null
  try {
    const arr = machineDesc.value.split('\n')
    specs = {
      data: '',
      cpu: {
        cores: arr[0].split('=')[1],
        frequency: arr[1].split('=')[1],
      },
      gpu: {
        process: arr[2].split('=')[1],
        vram: arr[3].split('=')[1],
      },
      ram: {
        total: arr[4].split('=')[1],
      },
      disk: {
        total: arr[5].split('=')[1],
        free: arr[6].split('=')[1],
      },
    }
  } catch (err) {}
  if (!specs || !instanceOfShaleSpec(specs)) {
    ElMessage({
      message: 'The json format of the machine details is invalid',
      type: 'warning',
    })
    return
  }
  // console.log('specs:', specs)

  try {
    // miner info json
    const datasets: IDatasetOrImage[] = getDatasetsOrImages(
      datasetCheckList.value
    )
    const images: IDatasetOrImage[] = getDatasetsOrImages(imageCheckList.value)
    specs.data = JSON.stringify({
      miner: checkedMiner.value,
      datasets,
      images,
    } as ViewMinerInfo)
    const res = await dappCtx.Shale?.putProduct(price.value, specs)
    // console.log('put product res：', res)
    ElMessage({
      message:
        'The transaction is submitted successfully, please go to the browser to check.',
      type: 'success',
    })
    emit('added')
  } catch (err) {
    console.error('[confirmAdd err]', err)
  }
}
</script>

<template>
  <div class="good-spec">
    <div class="flex-row-start-start">
      <el-image
        class="item-img"
        src="https://goblin-assets3.oss-cn-shanghai.aliyuncs.com/download/ubuntu.png"
        fit="contain"
      />
      <div class="spec">
        <!-- Machine Details -->
        <div class="group-name">Machine Details</div>
        <el-input
          v-model="machineDesc"
          class="spec-text"
          :rows="7"
          type="textarea"
          spellcheck="false"
          placeholder="Please enter the machine details"
        />
        <!-- Set Price -->
        <div class="group-name m-t-10">Set Price</div>
        <el-input
          v-model="price"
          class="spec-input"
          placeholder="Please set the price"
        >
          <template #suffix>FIL/H/Instance</template>
        </el-input>
        <div
          v-if="minerOptionLoading"
          style="height: 40px"
          class="m-t-20 flex-row-center-center"
          v-loading="minerOptionLoading"
        ></div>
        <template v-else>
          <div class="group-name m-t-10">Miner Info</div>
          <!-- miners -->
          <el-radio-group v-model="checkedMiner">
            <el-radio
              v-for="miner in minerOpts"
              :label="miner"
              size="large"
              border
            >
              {{ miner }}
            </el-radio>
          </el-radio-group>
          <div v-if="checkedMiner" v-loading="minerChanging">
            <!-- datasets -->
            <div class="group-name m-t-10">Data Set</div>
            <el-checkbox-group class="miner-info" v-model="datasetCheckList">
              <el-scrollbar height="150px">
                <div v-for="op in datasetOpts" :key="op.cid">
                  <el-checkbox :label="op.cid">
                    {{ op.filename }}
                    <span style="color: #999">
                      ({{ cidFilter(op.cid, [12, 12]) }})
                    </span>
                  </el-checkbox>
                </div>
              </el-scrollbar>
            </el-checkbox-group>
            <!-- images -->
            <div class="group-name m-t-10">Image</div>
            <el-checkbox-group class="miner-info" v-model="imageCheckList">
              <el-scrollbar height="150px">
                <div v-for="op in imageOpts" :key="op.cid">
                  <el-checkbox :label="op.cid">
                    {{ op.filename }}
                    <span style="color: #999" class="text-ellipsis">
                      ({{ cidFilter(op.cid, [12, 12]) }})
                    </span>
                  </el-checkbox>
                </div>
              </el-scrollbar>
            </el-checkbox-group>
          </div>
        </template>
        <div class="flex-row-end-center m-t-40">
          <el-button class="add-btn" @click="confirmAdd"> Confirm </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.good-spec {
  padding: 35px 40px;
  font-size: 13px;
  color: #333;
  background-color: white;
  border-radius: 12px;
  .item-img {
    flex: 1;
    border-radius: 12px;
  }
  .spec {
    flex: 2;
    margin: 0 38px;
    line-height: 1.5;
    .group-name {
      margin-bottom: 6px;
      font-size: 15px;
      font-weight: bold;
      color: #333333;
    }
    .spec-text {
      width: 100%;
    }
    .add-btn {
      width: 342px;
      height: 42px;
      color: #ffffff;
      background: #586edc;
      border-radius: 12px;
    }
    .miner-btn {
      width: 342px;
      height: 42px;
    }
    .miner-info {
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
    }
  }
}
</style>
