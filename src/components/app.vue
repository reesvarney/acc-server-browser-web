<template>
  <div>
    <img class="background" src="/img/bg.jpg">
    <div id="filters">
      <label for="filter_sa">Safety Rating</label>
      <input type="range" id="filter_sa" name="sa" max="100" min="0">

      <label for="filter_empty">Show Empty</label>
      <input type="checkbox" id="filter_empty" name="empty">

      <label for="filter_full">Show Full</label>
      <input type="checkbox" id="filter_full" name="full">

      <label for="filter_tracks">Show Full</label>

    </div>
    <div id="server_list">
      <RecycleScroller
        class="scroller"
        :items="servers"
        :item-size="32"
        key-field="_id"
        v-slot="{ item }"
      >
        <server
        v-bind:server="item"
        v-bind:key="`${item._id}-data`"
        ></server>
      </RecycleScroller>
    </div>
  </div>
</template>

<script>
import server from "./server.vue";
export default {
  components : {
    "server": server
    },
  props: {
    servers: Array,
  },
}
</script>

<style scoped>
.background {
  min-width: 111%;
  min-height: 111%;
  object-fit: cover;
  filter: blur(5px);
  position: fixed;
  top:-5%;
  left: -5%;
  z-index: -1;
}

.scroller {
  height: 100%;
}

.user {
  height: 32%;
  padding: 0 5px;
  display: flex;
  align-items: center;
}
</style>

<style>
  :root{
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
</style>