import smartLoad from "./smartLoad.js";
import {getFavourites, setFavourites} from "./storage.js";
const data = await fetch("/servers");
const jsonData = await data.json();
let serverList = null;

window["toggleFavourite"] = function(el, ip){
  const favourites = getFavourites();
  if(favourites.includes(ip)){
    // remove
    const index = favourites.indexOf(ip);
    favourites.splice(index, 1);
    el.firstElementChild.firstElementChild.classList.toggle('fas', false);
    el.firstElementChild.firstElementChild.classList.toggle('far', true);
  } else {
    // add
    favourites.push(ip);
    el.firstElementChild.firstElementChild.classList.toggle('far', false);
    el.firstElementChild.firstElementChild.classList.toggle('fas', true);
  }
  setFavourites(favourites);
}

async function main(){
  serverList = new smartLoad("#servers", "#server-template", jsonData);

  document.getElementById("filters").addEventListener("submit", function(e){
    e.preventDefault()
    update();
  })

  document.getElementById("refresh_button").addEventListener("click", function(){
    update();
  })

  console.log(getFavourites())

  document.getElementById("filter_favourites").value = (getFavourites()).join(",");

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