<template>
  <div :class="{ 'active': (isActive) }">
  {{isActive}}
    <span>
      {{session.type}}
    </span>
  </div>
</template>
<script>
export default {
  props: {
    session: Object
  }
}
</script>
<style scoped>
  .active {
    background-color: white;
    color: black;
  }
</style>