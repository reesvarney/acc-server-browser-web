import smartLoad from "./smartLoad.js";
import {getFavourites, setFavourites, getFilters, setFilter} from "./storage.js";
import addAnalytics from "./analytics.js";
addAnalytics();
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

async function populateFilters(){
  const filterValues = getFilters();
  for(const el of document.querySelectorAll('.filter input:not(#filter_favourites)')){
    if(el.name in filterValues){
      const value = filterValues[el.name];
      if(el.type === "checkbox"){
        el.checked = value;
      } else {
        el.value = value;
      }
    }
    el.addEventListener("change", ()=>{
      setFilter(el.name, (el.type === "checkbox") ? el.checked : el.value);
    });
  }
}

async function main(){
  populateFilters();
  document.getElementById("filters").addEventListener("submit", function(e){
    e.preventDefault()
    update();
  })

  document.getElementById("refresh_button").addEventListener("click", function(){
    update();
  })

  document.getElementById("hide_filters").addEventListener("click", function(){
    document.querySelector(".filters-main").style.display = "none";
    document.querySelector("#show_filters").style.display = "block";
  });

  document.getElementById("show_filters").addEventListener("click", function(){
    document.querySelector(".filters-main").style.display = "flex";
    document.querySelector("#show_filters").style.display = "none";
  });
  
  document.getElementById("filter_favourites").value = (getFavourites()).join(",");

  async function update(){
    const data = new FormData(document.getElementById("filters"));
    const res = await fetch(`/servers?${new URLSearchParams(data).toString()}`);
    const resJSON = await res.json();
    serverList.replaceData(resJSON)
  }
  serverList = await new smartLoad("#servers", "#server-template", []);
  update();
}

if (document.readyState !== "loading") {
  main();
} else {
  document.addEventListener("load", main, false)
}