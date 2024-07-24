<template>
  <div>{{ timestamp }}</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'LiveTimestamp',
  setup() {
    const timestamp = ref(new Date().toLocaleTimeString());

    const updateTimestamp = () => {
      timestamp.value = new Date().toLocaleTimeString();
    };

    onMounted(() => {
      setInterval(updateTimestamp, 1000);
    });

    return {
      timestamp,
    };
  },
});
</script>

<style scoped>
div {
  font-size: 2em;
}
</style>