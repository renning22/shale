<script lang="ts" setup>
import { dappCtx } from '@/assets/js/contract'
import {
  ShaleOrder,
  ShaleProduct,
  ShaleItem,
  EGoodStatus,
} from '@/assets/js/Shale'
import { ArrowRight } from '@element-plus/icons-vue'
import {
  ElMessage,
  ElMessageBox,
  ElBreadcrumb,
  ElBreadcrumbItem,
  // ElScrollbar,
  ElButton,
  ElDescriptions,
  ElDescriptionsItem,
  ElEmpty,
  ElPagination,
  ElDialog,
  ElInput,
  vLoading,
} from 'element-plus'
import { BigNumber, ethers } from 'ethers'
import { useClipboard } from '@vueuse/core'
import { useUser } from '@/composables/wallet'
import { getErrorMessage } from '@/utils/errors'
import { copyToItem, addrFilter, scrollToTop } from '@/utils/shale'
import { useTimeStr } from '@/composables/timestr'

const { tasker: timeTasker } = useTimeStr()

const route = useRoute()

definePageMeta({
  layout: 'custom',
})

useHead({
  title: route.params.type == 'order' ? 'Order' : 'Rent',
})

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

// 'Lessor' | 'Lessee'
type ISiderbarType = 'Lessor' | 'Lessee'
const sidebarActive = ref<ISiderbarType>('Lessor')
const isAddMachine = ref(false)
const allList = ref<ShaleItem[]>([])
const rentOutOrders = ref<ShaleOrder[]>([])
const currentPage = ref(1)
const pageSize = ref(2)
const { userEthAccount } = useUser()

watch(currentPage, () => {
  scrollToTop()
})

const changeSidebar = (type: ISiderbarType) => {
  if (sidebarActive.value === type) return
  sidebarActive.value = type
  currentTab.value = 1
  currentPage.value = 1
  getAllList()
}

const openAddMachine = () => {
  if (isAddMachine.value) return
  isAddMachine.value = true
}

const backToLessor = () => {
  if (!isAddMachine.value) return
  isAddMachine.value = false
  currentTab.value = 1
  currentPage.value = 1
  getAllList()
}

onMounted(() => {
  // lessor => rent
  // lessee => order
  if (route.params.type == 'order') {
    sidebarActive.value = 'Lessee'
  } else if (route.params.type == 'rent') {
    sidebarActive.value = 'Lessor'
  }
  getAllList()
})

// ==================== tab and list ====================
const currentTab = ref(1)
function changeTab(tab: number) {
  currentTab.value = tab
  currentPage.value = 1
}

const curList = computed(() => {
  let tmpList: ShaleItem[] = []
  switch (currentTab.value) {
    case 1:
      tmpList = allList.value.filter(
        (item) => item.Status != EGoodStatus.Default
      )
      break
    case 2:
      if (sidebarActive.value === 'Lessor') {
        tmpList = allList.value.filter(
          (item) => item.Status == EGoodStatus.Listed
        )
      } else {
        tmpList = allList.value.filter(
          (item) => item.Status == EGoodStatus.ToBeInitialize
        )
      }
      break
    case 3:
      if (sidebarActive.value === 'Lessor') {
        tmpList = allList.value.filter(
          (item) => item.Status == EGoodStatus.ToBeInitialize
        )
      } else {
        tmpList = allList.value.filter(
          (item) => item.Status == EGoodStatus.InUse
        )
      }
      break
    case 4:
      if (sidebarActive.value === 'Lessor') {
        tmpList = allList.value.filter(
          (item) => item.Status == EGoodStatus.InUse
        )
      } else {
        tmpList = allList.value.filter((item) => item.Status == EGoodStatus.End)
      }
      break
  }
  return tmpList
})

const pageList = computed(() => {
  const offset = (currentPage.value - 1) * pageSize.value
  return curList.value.slice(offset, offset + pageSize.value)
})

const listLoading = ref(true)
async function getAllList() {
  try {
    listLoading.value = true
    if (!dappCtx.Shale) await dappCtx.connect()
    let list: ShaleProduct[] | ShaleOrder[] = []
    if (sidebarActive.value === 'Lessor') {
      rentOutOrders.value =
        (await dappCtx.Shale?.getRentOutOrders(userEthAccount.value)) || []
      list =
        (await dappCtx.Shale?.getRentOutProduct(userEthAccount.value)) || []
      const rentOutOrderMap: { [ProductId: string]: ShaleOrder } =
        rentOutOrders.value.reduce((prev: { [key: string]: any }, cur) => {
          if (!prev[cur.ProductId] || prev[cur.CreateOn] < cur.CreateOn)
            prev[cur.ProductId] = cur
          return prev
        }, {})

      allList.value = list.map((item) => {
        if (!item.Used) return copyToItem(item, 'Product')
        return copyToItem(rentOutOrderMap[item.ProductId], 'Product')
      })
    } else if (sidebarActive.value === 'Lessee') {
      list = (await dappCtx.Shale?.getRentOrders(userEthAccount.value)) || []
      allList.value = list.map((item) => copyToItem(item, 'Order'))
    }

    // console.log('allList:', allList.value)
    currentPage.value = 1
  } catch (err) {
    ElMessage.error(getErrorMessage(err))
    console.error('err:', err)
  } finally {
    listLoading.value = false
  }
}

const lessorRemoving = ref(false)
async function lessorRemove(item: ShaleItem) {
  try {
    await ElMessageBox.confirm(
      'You will remove the machine. Continue?',
      'Warning',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    lessorRemoving.value = true
    const txHash = await dappCtx.Shale?.modifyProduct(item.ProductId, false)
    // console.log('lessorRemove txHash:', txHash)
    ElMessage({
      message:
        'The transaction is submitted successfully, please go to the browser to check.',
      type: 'success',
    })
  } catch (err: any) {
    if (err?.code != 4001 && err != 'cancel') {
      console.error('err:', err)
      ElMessage.error(err.message)
    }
  } finally {
    lessorRemoving.value = false
  }
}
const centerDialogVisible = ref(false)
const currentInitInfo = ref<ShaleItem>()
const loginInfoInput = ref('')
function openLessorInit(item: ShaleItem) {
  loginInfoInput.value = ''
  currentInitInfo.value = item
  centerDialogVisible.value = true
}
const lessorIniting = ref(false)
async function lessorInit() {
  if (!loginInfoInput.value) {
    ElMessage({
      message: 'Please enter the IP address and port number',
      type: 'warning',
    })
    return
  }
  try {
    lessorIniting.value = true
    const txHash = await dappCtx.Shale?.setupOrder(
      currentInitInfo.value?.OrderId || '',
      true,
      loginInfoInput.value
    )
    // console.log('lessorInit txHash:', txHash)
    centerDialogVisible.value = false
    ElMessage({
      message:
        'The transaction is submitted successfully, please go to the browser to check.',
      type: 'success',
    })
  } catch (err: any) {
    if (err?.code != 4001 && err != 'cancel') {
      console.error('err:', err)
      ElMessage.error(err.message)
    }
  } finally {
    lessorIniting.value = false
  }
}
const lesseeTerminating = ref(false)
async function lesseeTerminate(item: ShaleItem) {
  try {
    await ElMessageBox.confirm(
      'You will terminate the machine. Continue?',
      'Warning',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    lesseeTerminating.value = true
    const txHash = await dappCtx.Shale?.closeOrder(item.OrderId || '')
    // console.log('lesseeTerminate txHash:', txHash)
    ElMessage({
      message:
        'The transaction is submitted successfully, please go to the browser to check.',
      type: 'success',
    })
  } catch (err: any) {
    if (err?.code != 4001 && err != 'cancel') {
      console.error('err:', err)
      ElMessage.error(err.message)
    }
  } finally {
    lesseeTerminating.value = false
  }
}
const lesseeEnding = ref(false)
async function lesseeEnd(item: ShaleItem) {
  try {
    await ElMessageBox.confirm('You will end the order. Continue?', 'Warning', {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
    lesseeEnding.value = true
    const txHash = await dappCtx.Shale?.closeOrder(item.OrderId || '')
    // console.log('lesseeEnd txHash:', txHash)
    ElMessage({
      message:
        'The transaction is submitted successfully, please go to the browser to check.',
      type: 'success',
    })
  } catch (err: any) {
    if (err?.code != 4001 && err != 'cancel') {
      console.error('err:', err)
      ElMessage.error(err.message)
    }
  } finally {
    lesseeEnding.value = false
  }
}

function getSecondDuration(createOnBySecond: number): number {
  return Date.now() / 1000 - createOnBySecond
}
function getHourDuration(createOnBySecond: number): string {
  const d = Math.ceil(getSecondDuration(createOnBySecond) / 3600)
  return d + ' H'
}

function getCost(createOnBySecond: number, fixedPrice: BigNumber): string {
  const ds = getSecondDuration(createOnBySecond) / 3600
  const price = parseFloat(ethers.utils.formatEther(fixedPrice))
  return (ds * price).toFixed(2)
}
</script>

<template>
  <div class="profile-page">
    <!-- <el-container> -->
    <!-- <el-aside width="200px" class="sidebar">
        <div class="good-rent flex-col-center-center">
          <img src="/img/good-rent.png" alt="" class="rent-img" />
          <span class="rent-title">Machine Lessee</span>
        </div>
        <div class="rent-tab flex-col-center-center">
          <el-button
            class="tab-btn"
            :class="{ 'tab-btn-active': sidebarActive === 'Lessor' }"
            link
            @click="changeSidebar('Lessor')"
          >
            <img
              v-if="sidebarActive === 'Lessor'"
              class="tab-btn-icon"
              src="/img/checked-rent.png"
              alt=""
            />
            <img
              v-else
              class="tab-btn-icon"
              src="/img/unchecked-rent.png"
              alt=""
            />
            Machine Lessor
          </el-button>
          <el-button
            class="tab-btn"
            :class="{ 'tab-btn-active': sidebarActive === 'Lessee' }"
            link
            @click="changeSidebar('Lessee')"
          >
            <img
              v-if="sidebarActive === 'Lessee'"
              class="tab-btn-icon tab-btn-icon-big"
              src="/img/selected-lease.png"
              alt=""
            />
            <img
              v-else
              class="tab-btn-icon tab-btn-icon-big"
              src="/img/unchecked-lease.png"
              alt=""
            />
            Machine Lessee
          </el-button>
        </div>
      </el-aside> -->
    <!-- <el-main style="padding: 0">
        
      </el-main> -->
    <!-- </el-container> -->
    <!-- <el-scrollbar height="calc(100vh - 50px)"> -->
    <div class="page-wrap">
      <div
        v-if="sidebarActive === 'Lessor' && !isAddMachine"
        class="add-good flex-row-center-center"
        @click="openAddMachine"
      >
        <img class="add-good-img" src="/img/add-to.png" alt="" />
        <span class="add-text">Add Machine</span>
      </div>
      <div v-if="isAddMachine" class="add-breadcrumb">
        <el-breadcrumb :separator-icon="ArrowRight">
          <el-breadcrumb-item class="pointer" @click="backToLessor">
            Rent
          </el-breadcrumb-item>
          <el-breadcrumb-item>
            <strong>Add Machine</strong>
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div v-if="isAddMachine" class="add-area">
        <GoodAdd @added="backToLessor"></GoodAdd>
      </div>

      <div v-else v-loading="listLoading">
        <div class="flex-row-between-center m-t-8">
          <h2>{{ sidebarActive === 'Lessee' ? 'Order' : 'Rent' }}</h2>
          <div class="list-tabs">
            <el-button
              class="tab-btn"
              :class="{ 'tab-btn-active': currentTab === 1 }"
              link
              @click="changeTab(1)"
              >All</el-button
            >
            <el-button
              class="tab-btn"
              :class="{ 'tab-btn-active': currentTab === 2 }"
              link
              @click="changeTab(2)"
              >{{ sidebarActive == 'Lessor' ? 'Listed' : 'Pending' }}</el-button
            >
            <el-button
              class="tab-btn"
              :class="{ 'tab-btn-active': currentTab === 3 }"
              link
              @click="changeTab(3)"
              >{{ sidebarActive == 'Lessor' ? 'Pending' : 'Active' }}</el-button
            >
            <el-button
              class="tab-btn"
              :class="{ 'tab-btn-active': currentTab === 4 }"
              link
              @click="changeTab(4)"
              >{{
                sidebarActive == 'Lessor' ? 'Active' : 'Terminated'
              }}</el-button
            >
          </div>
        </div>
        <div class="list" style="overflow: auto">
          <GoodSpec v-for="item in pageList" :key="item.ProductId" :data="item">
            <template #footer v-if="sidebarActive === 'Lessor'">
              <div
                v-if="item.Status == EGoodStatus.Listed"
                class="good-spec-footer flex-row-between-center"
              >
                <div class="good-status">Listed</div>
                <el-button
                  class="operate-btn"
                  color="#586EDC"
                  dark
                  :loading="lessorRemoving"
                  @click="lessorRemove(item)"
                >
                  Remove
                </el-button>
              </div>
              <template v-else-if="item.Status == EGoodStatus.ToBeInitialize">
                <div class="good-spec-footer">
                  <el-descriptions title="" :column="1">
                    <!-- User -->
                    <el-descriptions-item label="User">
                      {{ item.User ? addrFilter(item.User) : '--' }}
                      <img
                        v-if="copied && clipboardProductId == item.ProductId"
                        class="copy-icon"
                        src="/img/success.png"
                        alt=""
                      />
                      <img
                        v-else
                        class="copy-icon"
                        src="/img/copy.png"
                        alt=""
                        @click="copyText(item.User || '', item.ProductId)"
                      />
                    </el-descriptions-item>
                    <!-- Public key -->
                    <el-descriptions-item label="Public key">
                      <el-input
                        v-if="item.UserInfo?.pubkey"
                        v-model="item.UserInfo.pubkey"
                        :rows="3"
                        type="textarea"
                        placeholder="Please input"
                        readonly
                      />
                      <span v-else>--</span>
                    </el-descriptions-item>
                    <!-- Image -->
                    <el-descriptions-item label="Image">
                      <img
                        class="img-icon"
                        src="https://goblin-assets3.oss-cn-shanghai.aliyuncs.com/download/ubuntu_logo.png"
                        alt="image"
                      />
                      {{ item.UserInfo?.image?.filename || '--' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Rental Duration">
                      {{
                        item.CreateOn ? getHourDuration(item.CreateOn) : '--'
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Staking FIL">
                      {{
                        item.OrderBalance
                          ? ethers.utils.formatEther(item.OrderBalance)
                          : '--'
                      }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
                <div class="good-spec-footer flex-row-between-center">
                  <div class="good-status">Waiting for initialization</div>
                  <el-button
                    class="operate-btn"
                    color="#586EDC"
                    dark
                    @click="openLessorInit(item)"
                  >
                    Provision
                  </el-button>
                </div>
              </template>
              <div
                v-else-if="item.Status == EGoodStatus.InUse"
                class="good-spec-footer"
              >
                <el-descriptions title="" :column="1">
                  <el-descriptions-item label="Login Information">
                    {{ item.LoginInfo || '--' }}
                    <img
                      v-if="
                        copied &&
                        clipboardProductId == item.ProductId + item.LoginInfo
                      "
                      class="copy-icon"
                      src="/img/success.png"
                      alt=""
                    />
                    <img
                      v-else-if="item.LoginInfo"
                      class="copy-icon"
                      src="/img/copy.png"
                      alt=""
                      @click="
                        copyText(
                          item.LoginInfo as string,
                          item.ProductId + item.LoginInfo
                        )
                      "
                    />
                  </el-descriptions-item>
                  <!-- Public key -->
                  <el-descriptions-item label="Public key">
                    <el-input
                      v-if="item.UserInfo?.pubkey"
                      v-model="item.UserInfo.pubkey"
                      :rows="3"
                      type="textarea"
                      placeholder="Please input"
                      readonly
                    />
                    <span v-else>--</span>
                  </el-descriptions-item>
                  <el-descriptions-item
                    label="Start Time"
                    label-class-name="spec-sub-title"
                  >
                    {{
                      item.CreateOn
                        ? $dayjs(item.CreateOn * 1000).format(
                            'YYYY-MM-DD HH:mm'
                          )
                        : ''
                    }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Time for Rental">
                    {{
                      item.CreateOn
                        ? timeTasker.add({
                            taskId: item.ProductId,
                            startTimeBySecond: item.CreateOn,
                            shouldUpdate: true,
                          }).value
                        : '--'
                    }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Staking Amount">
                    {{
                      item.OrderBalance
                        ? ethers.utils.formatEther(item.OrderBalance)
                        : '--'
                    }}
                    FIL
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
            <template #footer v-else-if="sidebarActive === 'Lessee'">
              <div class="good-spec-footer">
                <el-descriptions title="" :column="1">
                  <!-- Owner -->
                  <el-descriptions-item label="Owner" :span="1">
                    {{ item.Owner ? addrFilter(item.Owner) : '--' }}
                    <img
                      v-if="copied && clipboardProductId == item.ProductId"
                      class="copy-icon"
                      src="/img/success.png"
                      alt=""
                    />
                    <img
                      v-else
                      class="copy-icon"
                      src="/img/copy.png"
                      alt=""
                      @click="copyText(item.Owner, item.ProductId)"
                    />
                  </el-descriptions-item>
                  <!-- Public key -->
                  <el-descriptions-item label="Public key">
                    <el-input
                      v-model="item.UserInfo.pubkey"
                      :rows="3"
                      type="textarea"
                      placeholder="Please input"
                      readonly
                    />
                  </el-descriptions-item>
                  <!-- Image -->
                  <el-descriptions-item label="Image">
                    <img
                      class="img-icon"
                      src="https://goblin-assets3.oss-cn-shanghai.aliyuncs.com/download/ubuntu_logo.png"
                      alt="image"
                    />
                    {{ item.UserInfo.image?.filename || '--' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Rental Duration">
                    {{ item.CreateOn ? getHourDuration(item.CreateOn) : '--' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="Staking FIL">
                    {{
                      item.OrderBalance
                        ? ethers.utils.formatEther(item.OrderBalance)
                        : '--'
                    }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <!-- ToBeInitialize -->
              <div
                v-if="item.Status == EGoodStatus.ToBeInitialize"
                class="good-spec-footer flex-row-end-center"
              >
                <el-button
                  class="operate-btn"
                  color="#586EDC"
                  dark
                  :loading="lesseeTerminating"
                  @click="lesseeTerminate(item)"
                >
                  Terminate
                </el-button>
              </div>
              <!-- InUse -->
              <div
                v-else-if="item.Status == EGoodStatus.InUse"
                class="good-spec-footer"
              >
                <div class="flex-row-between-center">
                  <el-descriptions title="" :column="1">
                    <el-descriptions-item label="Login Information">
                      {{ item.LoginInfo || '--' }}
                      <img
                        v-if="
                          copied &&
                          clipboardProductId == item.ProductId + item.LoginInfo
                        "
                        class="copy-icon"
                        src="/img/success.png"
                        alt=""
                      />
                      <img
                        v-else-if="item.LoginInfo"
                        class="copy-icon"
                        src="/img/copy.png"
                        alt=""
                        @click="
                          copyText(
                            item.LoginInfo as string,
                            item.ProductId + item.LoginInfo
                          )
                        "
                      />
                    </el-descriptions-item>
                    <el-descriptions-item label="Start Time">
                      {{
                        item.CreateOn
                          ? $dayjs(item.CreateOn * 1000).format(
                              'YYYY-MM-DD HH:mm'
                            )
                          : ''
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Time for Rental">
                      {{
                        item.CreateOn
                          ? timeTasker.add({
                              taskId: item.ProductId,
                              startTimeBySecond: item.CreateOn,
                              shouldUpdate: true,
                            }).value
                          : '--'
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Staking Amount">
                      {{
                        item.OrderBalance
                          ? ethers.utils.formatEther(item.OrderBalance)
                          : '--'
                      }}
                      FIL
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
                <div class="good-spec-footer flex-row-end-center">
                  <el-button
                    class="operate-btn"
                    color="#586EDC"
                    dark
                    :loading="lesseeEnding"
                    @click="lesseeEnd(item)"
                  >
                    Terminate
                  </el-button>
                </div>
              </div>
              <!-- End -->
              <div
                v-else-if="item.Status == EGoodStatus.End"
                class="good-spec-footer"
              >
                <div class="flex-row-between-center">
                  <el-descriptions title="" :column="1">
                    <el-descriptions-item label="Login Information">
                      {{ item.LoginInfo || '--' }}
                      <img
                        v-if="
                          copied &&
                          clipboardProductId == item.ProductId + item.LoginInfo
                        "
                        class="copy-icon"
                        src="/img/success.png"
                        alt=""
                      />
                      <img
                        v-else-if="item.LoginInfo"
                        class="copy-icon"
                        src="/img/copy.png"
                        alt=""
                        @click="
                          copyText(
                            item.LoginInfo as string,
                            item.ProductId + item.LoginInfo
                          )
                        "
                      />
                    </el-descriptions-item>
                    <el-descriptions-item label="Start Time">
                      {{
                        item.CreateOn
                          ? $dayjs(item.CreateOn * 1000).format(
                              'YYYY-MM-DD HH:mm'
                            )
                          : ''
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item label="End Time">
                      {{
                        item.FinishOn
                          ? $dayjs(item.FinishOn * 1000).format(
                              'YYYY-MM-DD HH:mm'
                            )
                          : ''
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Time for Rental">
                      {{
                        item.CreateOn
                          ? timeTasker.add({
                              taskId: item.ProductId,
                              startTimeBySecond: item.CreateOn,
                              shouldUpdate: false,
                            }).value
                          : '--'
                      }}
                    </el-descriptions-item>
                    <el-descriptions-item label="Cost">
                      {{
                        item.CreateOn
                          ? getCost(item.CreateOn, item.FixedPrice) + ' FIL'
                          : '--'
                      }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
            </template>
          </GoodSpec>
          <el-empty v-if="pageList.length === 0" />
          <div class="flex-row-center-center p-b-20">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 40]"
              background
              layout="prev, pager, next"
              hide-on-single-page
              :total="curList.length"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- </el-scrollbar> -->
    <el-dialog
      v-model="centerDialogVisible"
      class="rent-dialog"
      title="Initialize"
      width="30%"
      align-center
      append-to-body
      center
    >
      <div class="rent-title">Login Information</div>
      <el-input
        v-model="loginInfoInput"
        class="rent-input"
        placeholder="Please enter the IP address and port number"
        clearable
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button
            class="confirm-op-btn"
            color="#586EDC"
            dark
            :loading="lessorIniting"
            @click="lessorInit"
          >
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.img-icon {
  width: 30px;
  vertical-align: middle;
  border: 1px solid var(--el-fill-color);
  border-radius: 50%;
}

.profile-page {
  min-height: $mainHeightWithoutFooter;
  font-size: 16px;
  background-color: #f9f9f9;

  .sidebar {
    height: $mainHeightWithoutFooter;
    background-color: white;

    .good-rent {
      .rent-img {
        width: 70px;
        height: 70px;
      }

      .rent-title {
        margin-top: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #9e9e9e;
      }
    }

    .rent-tab {
      margin-top: 36px;

      .tab-btn {
        margin: 0;
        width: 100%;
        height: 40px;
        border-radius: 11px;

        .tab-btn-icon {
          display: inline-block;
          margin-right: 10px;
          width: 16px;
          height: 16px;
          object-fit: contain;
        }

        .tab-btn-icon-big {
          width: 20px;
          height: 20px;
        }
      }

      .tab-btn-active {
        color: white;
        background-color: #586edc;
      }
    }
  }

  .page-wrap {
    // margin-left: 8%;
    max-width: 64vw;
    padding-top: 20px;
  }

  .add-good {
    height: 80px;
    background: transparent url('/img/add-background.png') no-repeat;
    background-position: center;
    background-size: cover;
    border-radius: 12px;

    &:active,
    &:hover {
      opacity: 0.9;
    }

    cursor: pointer;

    .add-good-img {
      margin-right: 20px;
      width: 32px;
    }

    .add-text {
      font-size: 15px;
      font-weight: 500;
      color: #ffffff;
    }
  }

  .add-breadcrumb {
    // padding-top: 16px;
    padding-bottom: 8px;
  }

  .good-spec-footer {
    margin-top: 15px;
    padding-top: 16px;
    border-top: 1px solid #ebebeb;

    .good-status {
      font-size: 14px;
      color: #9e9e9e;
    }

    // :deep(.el-descriptions__content) {
    //   display: inline-block;
    //   word-wrap: break-word;
    //   word-break: break-all;
    // }
  }

  .operate-btn {
    padding: 0 30px;
    height: 38px;
    border-radius: 19px;
  }

  .list-tabs {
    // margin: 0 auto;
    // margin-top: 16px;
    // width: 600px;
    background-color: #eeeeee;
    border-radius: 25px;
    overflow: hidden;

    .tab-btn {
      flex: 1;
      height: 44px;
      font-size: 14px;
      font-weight: 500;
      color: #666666;
      text-align: center;
      width: 3rem;
    }

    .tab-btn-active {
      color: white;
      background-color: #586edc;
      border-radius: 25px;
    }
  }
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

  .confirm-op-btn {
    padding: 0 30px;
    height: 38px;
    border-radius: 19px;
  }
}
</style>
