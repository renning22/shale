<script setup>
import { ElButton } from 'element-plus'

useHead({
  title: 'Home',
})

const router = useRouter()
const toStore = () => {
  router.push('/store')
}
</script>

<template>
  <div class="home-page">
    <div class="text-area flex-col-center-center">
      <div class="title">Decentralized Compute</div>
      <div class="desc">Native computing against data on Filecoin</div>
      <div class="to-select">
        <el-button class="select-btn" color="#586EDC" dark @click="toStore">
          Enter
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.home-page {
  min-height: $mainHeightWithFooter;
  font-size: 16px;
  background: #fff url('/img/home.png') no-repeat;
  background-position: center;
  background-size: cover;

  .text-area {
    padding-top: 20vh;
    padding-left: 20vw;
    width: 520px;
    .title {
      font-size: 36px;
      font-weight: bold;
      color: #586edc;
    }
    .desc {
      margin-top: 25px;
      font-size: 18px;
      color: #666666;
      text-align: center;
      line-height: 28px;
    }
    .to-select {
      margin-top: 35px;
      .select-btn {
        width: 150px;
        height: 40px;
        font-size: 18px;
      }
    }
  }
}
</style>
