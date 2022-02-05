import Vue from "vue";
import VueVirtualScroller from 'vue-virtual-scroller';
import App from './components/App.vue';

Vue.use(VueVirtualScroller);

const data = await fetch("/servers");
const jsonData = await data.json();
console.log(jsonData)
new Vue({
  el: "#app",
  render: h => h(App, {
    props: {
      'servers': jsonData
    }
  })
});

// Vue.component('server', {
//   props: ['server'],
//   template: "#server-template"
// })

// Vue.component('session', {
//   props: ['session'],
//   template: "#session-template"
// })

// const serverList = new Vue({
//   el: '#server_list',
//   props: {servers: json},
//   data: {servers: json}
// })