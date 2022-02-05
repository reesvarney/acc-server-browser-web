<template>
  <li class="server">
    <div class="flex-col">
      <div class="flex-row">
        <span class="server-ip">
          {{server.ip}}
        </span>
  
        <span class="server-name">
          {{server.name}}
        </span>
      </div>

      <div class="flex-row">
        {{server.track}}
      </div>
      
      <div class="flex-row">
        <session
          v-for="(session, index) in server.sessions"
          v-bind:session="session"
          v-bind:isActive="index == server.currentSession"
          v-bind:key="`${server.__id}-session-${index}`"
        ></session>
      </div>
    </div>
  </li>
</template>

<script>
import session from "./session.vue";
export default {
  components : {
    "session": session
    },
  props: {
    server: Object,
  },
}
</script>


<style scoped>
.server{
  background-color: rgba(0,0,0,0.8);
  color: white;
  padding: 10px;
}
</style>