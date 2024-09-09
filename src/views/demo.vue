<template>
    <div class="demo1">
        <div>{{ isIntersect }}</div>
        <div ref="box1" class="box1" draggable="true" :style="{
            top: position1.top + 'px',
            left: position1.left + 'px',
        }" @dragend="dragend1" @dragstart="dragstart1"></div>
        <div ref="box2" class="box2" draggable="true" :style="{
            top: position2.top + 'px',
            left: position2.left + 'px',
        }" @dragend="dragend2" @dragstart="dragstart2"></div>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const position1 = ref({ top: 0, left: 0 })
const position2 = ref({ top: 0, left: 0 })
const position = ref({ top: 0, left: 0 })
const box1 = ref()
const box2 = ref()
const isIntersect = computed(() => {
    const height1 = box1.value?.offsetHeight
    const height2 = box2.value?.offsetHeight
    const width1 = box1.value?.offsetWidth
    const width2 = box2.value?.offsetWidth
    if (((position2.value.left > position1.value.left && position2.value.left < position1.value.left + width1) || (position2.value.left + width2 > position1.value.left && position2.value.left + width2 < position1.value.left + width1))
        && ((position2.value.top > position1.value.top && position2.value.top < position1.value.top + height1) || (position2.value.top + height2 > position1.value.top && position2.value.top + height2 < position1.value.top + width1))
    ) {
        return true
    }
    return false
})
const dragstart1 = (event: DragEvent) => {
    position.value.top = event.offsetY
    position.value.left = event.offsetX
}
const dragend1 = (event: DragEvent) => {
    position1.value.top = event.clientY - position.value.top
    position1.value.left = event.clientX - position.value.left
}
const dragstart2 = (event: DragEvent) => {
    position.value.top = event.offsetY
    position.value.left = event.offsetX
}
const dragend2 = (event: DragEvent) => {
    position2.value.top = event.clientY - position.value.top
    position2.value.left = event.clientX - position.value.left
}
</script>
<style lang="scss">
.demo1 {
    height: 100vh;
    width: 100vw;
    position: relative;

    .box1 {
        position: absolute;
        height: 200px;
        width: 200px;
        background-color: yellow;
    }

    .box2 {
        position: absolute;
        height: 200px;
        width: 300px;
        background-color: green;
    }

}
</style>