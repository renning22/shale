<script lang="ts" setup>
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: '/css/font_3826471_y17sgb217cb.css',
    },
  ],
})
</script>

<template>
  <div class="app-footer">
    <div class="page-wrap h-100 flex-row-between-start">
      <div class="copyright flex-col-between-start">
        <div class="footer-logo">
          <img src="/img/shale-logo-white.png" alt="" />
        </div>
        <div>©2022 SHALE. All Rights Reserved</div>
      </div>
      <div class="contact">
        <div class="title">Email</div>
        <div class="contact-link flex-row-end-center">
          <span class="link-icon iconfont icon-email"></span>
          <!-- TODO Email -->
          <span class="m-l-15"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/scss/variable.scss';

.app-footer {
  width: 100%;
  height: calc(100vh * 0.22);
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  background-color: #252525;
  .copyright {
    padding-top: 46px;
    height: 55%;
    .footer-logo {
      img {
        display: inline-block;
        height: 30px;
      }
    }
  }
  .contact {
    padding-top: 46px;
    .title {
      text-align: right;
    }
    .contact-link {
      margin-top: 15px;
      .link-icon {
        margin-left: 20px;
        font-size: 18px;
      }
    }
  }
}
</style>
