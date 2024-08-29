<template>
  <div class="hea">
    <div class="hea-left">
      <el-button type="danger" size="large" round>小红书</el-button>
    </div>
    <div class="hea-center">
      <el-select
        v-model="value"
        placeholder="登录搜索更多内容"
        filterable
        :remote-method="remoteMethod"
        reserve-keyword
        remote
        :loading="loading"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
     
    </div>
    <div class="hea-right">
        <div>创作中心</div>
        <div>业务合作</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { log } from 'console'
import { onMounted, ref } from 'vue'

interface ListItem {
  value: string
  label: string
}

const list = ref<ListItem[]>([])
const options = ref<ListItem[]>([])
const value = ref<string[]>([])
const loading = ref(false)

onMounted(() => {
    list.value = states.map(item => {
        return {value:item,label:item}
    })
})

const remoteMethod = (query: string) => {
  if (query) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      options.value = list.value.filter((item) => {
        return item.label.toLowerCase().includes(query.toLowerCase())
      })
    }, 200)
  } else {
    options.value = []
  }
}

const states = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming'
]
</script>
<style lang="scss" scoped>
.hea {
  display: flex;
  .hea-center {
    width: 30%;
    margin: 0 auto;
  }
  .hea-right{
    display: flex;
    width: 15%;
    justify-content: space-around;
  }
}
</style>
