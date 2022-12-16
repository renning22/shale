<script setup lang="ts">
import { ElAvatar } from 'element-plus'
import { useWallet } from '@/composables/wallet'

const { userAccount } = useWallet()
const desensitizedAccount = computed(() => {
  if (!userAccount.value) return ''
  return userAccount.value.slice(0, 5) + '...' + userAccount.value.slice(-4)
})
</script>

<template>
  <nav class="app-header">
    <div class="page-wrap flex-row-between-center">
      <div class="nav-left flex-row-start-center">
        <NuxtLink to="/" class="logo">
          <img src="/img/shale-logo.png" alt="Logo" />
        </NuxtLink>
        <NuxtLink to="/" class="nav-link">{{ $t('Home') }}</NuxtLink>
        <NuxtLink to="/store" class="nav-link">{{ $t('Store') }}</NuxtLink>
        <NuxtLink to="/user/order" v-if="userAccount" class="nav-link">
          Order
        </NuxtLink>
        <NuxtLink to="/user/rent" v-if="userAccount" class="nav-link">
          Rent
        </NuxtLink>
      </div>
      <div class="nav-right flex-row-start-center">
        <div class="user flex-row-start-center">
          <el-avatar
            class="avatar"
            src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
          />
          <span v-if="!desensitizedAccount" class="account">Connecting...</span>
          <span v-else class="account">{{ desensitizedAccount }}</span>
        </div>
        <!-- <el-select
          v-model="$i18n.locale"
          class="lang-select"
          placeholder="Select"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select> -->
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.app-header {
  font-size: 16px;
  .page-wrap {
    height: 50px;
  }
  .logo {
    font-weight: bold;
    font-size: 23px;
    color: #333333;
    text-decoration: none;
    img {
      display: inline-block;
      height: 30px;
      vertical-align: middle;
    }
  }
  .nav-link {
    font-size: 13px;
    color: #666666;
    text-decoration: none;
    &:not(:first-child) {
      margin-left: 35px;
    }
  }
  .router-link-active {
    font-weight: bold;
    color: var(--el-color-primary);
  }
  .user {
    margin-right: 30px;
    height: 32px;
    background-color: #eeeeee;
    border-radius: 16px;
    .avatar {
      width: 32px;
      height: 32px;
    }
    .account {
      padding: 0 20px 0 15px;
      font-size: 12px;
      font-weight: 600;
      color: #000000;
    }
  }
  .lang-select {
    width: 100px;
  }
}
</style>
