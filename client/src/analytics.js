import { v4 as uuidv4 } from 'uuid';

async function main(){
  const ga_id = await (await fetch("/ga_id")).text();

  if(ga_id.length !== 0){
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    let userId = localStorage.getItem("uuid");
    if(userId === null){
      userId = uuidv4();
      localStorage.setItem("uuid", userId);
    }
    gtag('js', new Date());
    gtag('config', ga_id, {
      client_storage: 'none',
      client_id: userId,
    });
    gtag('event', 'page_view', {
      page_title: 'home',
      page_location: '/',
      page_path: '/',
    })
  }
}


export default main;