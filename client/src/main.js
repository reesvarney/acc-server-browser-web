import smartLoad from "./smartLoad.js";
const data = await fetch("/servers");
const jsonData = await data.json();
let serverList = null;

async function main(){
  serverList = new smartLoad("#servers", "#server-template", jsonData);

  document.getElementById("filters").addEventListener("submit", function(e){
    e.preventDefault()
    update();
  })

  document.getElementById("refresh_button").addEventListener("click", function(){
    update();
  })

  async function update(){
    const data = new FormData(document.getElementById("filters"));
    const res = await fetch(`/servers?${new URLSearchParams(data).toString()}`);
    const resJSON = await res.json();
    serverList.replaceData(resJSON)
  }
}

if (document.readyState !== "loading") {
  main();
} else {
  document.addEventListener("load", main, false)
}