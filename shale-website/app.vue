<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import { useI18n } from 'vue-i18n'
// @ts-ignore
import en from 'element-plus/dist/locale/en.mjs'
// @ts-ignore
import zh from 'element-plus/dist/locale/zh-cn.mjs'

const i18n = useI18n()
const locale = ref(en)
const localeCookie = useCookie('locale')

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Shale` : 'Shale'
  },
})

watchEffect(() => {
  localeCookie.value = i18n.locale.value
  switch (i18n.locale.value) {
    case 'en':
      locale.value = en
      break
    case 'zh':
      locale.value = zh
      break
    default:
      locale.value = en
      break
  }
})
</script>

<template>
  <div>
    <NuxtLayout>
      <el-config-provider :locale="locale">
        <NuxtPage />
      </el-config-provider>
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
// ...
</style>
