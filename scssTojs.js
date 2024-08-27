import { readFileSync, writeFileSync } from 'fs'
const path = './src/css/color.js'
const code = 'utf-8'
const content = readFileSync(path, code)
console.log('content', content)

// writeFileSync(path, newContent, code, (err) => {
//   if (err) {
//     console.log('更新版本号失败', err)
//   } else {
//     console.log('更新版本号成功')
//   }
// })
