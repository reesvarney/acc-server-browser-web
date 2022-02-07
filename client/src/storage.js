function getFavourites(){
  let favourites = localStorage.getItem('favourites');
  if(typeof favourites == "string" && favourites != "" && Array.isArray(JSON.parse(favourites))){
    favourites = JSON.parse(favourites)
  } else {
    favourites = [];
  }
  return favourites
}

function setFavourites(favourites){
  localStorage.setItem("favourites", JSON.stringify(favourites));
  document.getElementById("filter_favourites").value = favourites.join(",");
}

export {getFavourites, setFavourites}