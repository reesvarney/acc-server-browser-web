import Handlebars from "handlebars/dist/handlebars.js";
export default class{
  constructor(elSelector, templateSelector, data){
    this.data = data;
    this.template = Handlebars.compile(
      document.querySelector(templateSelector).innerHTML
    );
    this.container = document.querySelector(elSelector);
    this.container.addEventListener("scroll", ()=>{
      this.checkScroll()
    });
    this.init();
  }

  init(){
    this.container.innerHTML = "";
    this.paddingElement = document.createElement("div");
    this.childEl = this.container.appendChild(document.createElement("tbody"))
    this.scrollTimeout = null;
    this.fastScrollTimeout = null;
    this.bufferDistance = 1000;
    this.needNewContent();
  }

  checkScroll(){
    if(this.data.length > 0  && this.scrollTimeout == null){
      if((this.container.scrollHeight - this.paddingElement.clientHeight) - this.container.scrollTop <500){
        if(this.fastScrollTimeout != null){
          window.clearTimeout(this.fastScrollTimeout);
        }
        let lastPos = (this.container.scrollHeight - this.paddingElement.clientHeight) - this.container.scrollTop;

        this.fastScrollTimeout = window.setTimeout(()=>{
          let newPos =  (this.container.scrollHeight - this.paddingElement.clientHeight) - this.container.scrollTop;
          if(lastPos - newPos < 500 && lastPos - newPos > -500){
            this.needNewContent();
          }
          this.fastScrollTimeout = null;
        }, 500);
      } else {
        this.scrollTimeout = window.setTimeout(()=>{
          this.needNewContent();
          this.scrollTimeout = null;
        }, 200);
      }
    }
  }

  replaceData(data){
    this.data = data;
    this.init();
  }

  addChild(){
    if(this.data.length > 0){
      const server = this.data.splice(0, 1)[0];
      const div =  document.createElement("template");
      div.innerHTML =  this.template(server);
      this.childEl.appendChild(div.content.firstElementChild);
      this.paddingElement.style.height = (this.childEl.lastChild.clientHeight * this.data.length) - this.bufferDistance;
      this.childEl.appendChild(this.paddingElement);
    }
  }

  needNewContent(){
    if(this.data.length > 0){
      while(this.data.length > 0 && (this.container.scrollHeight - this.paddingElement.clientHeight) - this.container.scrollTop < this.container.clientHeight + this.bufferDistance){
        this.addChild();
      }
    }
  };
}