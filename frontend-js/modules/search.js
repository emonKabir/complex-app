import axios from 'axios'
import domPurify from 'dompurify'
export default class Search {
    constructor(){
        this.injectHtml()
        this.headerSearchIcon = document.querySelector(".header-search-icon")
        this.crossBtn = document.querySelector(".close-live-search")
        this.overlay = document.querySelector(".search-overlay")
        this.inputField = document.querySelector("#live-search-field")
        this.resultArea = document.querySelector(".live-search-results")
        this.loaderIcon = document.querySelector(".circle-loader")
        this.waitforInput
        this.previousvalue = ""
        this.event()
    }

    event(){

        this.inputField.addEventListener("keyup",()=> this.keyPressHolder())
        this.headerSearchIcon.addEventListener("click",(e)=>{
            e.preventDefault()
            this.openOverlay()
            //this.injectHtml()
        })

        this.crossBtn.addEventListener("click",(e)=>{
           // e.preventDefault()
            this.closeOverlay()
        })
    }

    keyPressHolder(){
        let value = this.inputField.value
        if(value == ""){
            clearTimeout(this.waitforInput)
            this.hideLoader()
            this.hideSearchResult()
        }
        if(value != "" && value != this.previousvalue){
            clearTimeout(this.waitforInput)
            this.showLoader()
            this.hideSearchResult()
            this.waitforInput = setTimeout(()=> this.sendRequest(),750)
        }
        
        this.previousvalue = value
    }

    sendRequest(){
        axios.post("/search",{searchTerm:this.inputField.value}).then((response)=>{

           // console.log(response.data)
            this.renderHtml(response.data)
           
        }).catch(()=>{
            alert("The request has been faild yeah!!!")
        })
    }

    renderHtml(posts){
        if(posts.length){

            this.resultArea.innerHTML = domPurify.sanitize(`<div class="list-group shadow-sm">
            <div class="list-group-item active"><strong>Search Results</strong> (${posts.length > 1 ? `${posts.length} items found`:'1 item found'}) </div>

            ${posts.map((post)=>{
                let postDate = new Date(post.currentDate)
                return `<a href="/post/${post._id}" class="list-group-item list-group-item-action">
                <img class="avatar-tiny" src="${post.author.avatar}"> <strong>${post.title}</strong>
                <span class="text-muted small">by ${post.author.username} on ${postDate.getMonth()}/${postDate.getDate()}/${postDate.getFullYear()}</span>
              </a>`
            }).join('')}

          </div>`)

        }else{

            this.resultArea.innerHTML =  `<p class="alert alert-danger shadow-sm">Sorry we coudnt find anything from your search</p>`
        }
        this.hideLoader()
        this.showSearchResult()
        //this.resultArea.
    }

    showSearchResult(){
        this.resultArea.classList.add("live-search-results--visible")
    }

    hideSearchResult(){
        this.resultArea.classList.remove("live-search-results--visible")
    }

    showLoader(){

        this.loaderIcon.classList.add("circle-loader--visible")
    }

    hideLoader(){

        this.loaderIcon.classList.remove("circle-loader--visible")
    }
    openOverlay(){
        this.overlay.classList.add("search-overlay--visible")
        setTimeout(()=> this.inputField.focus(),50)
    }
    closeOverlay(){
        this.overlay.classList.remove("search-overlay--visible")
    }
    injectHtml(){
        document.body.insertAdjacentHTML("beforeend",`<div class="search-overlay ">
        <div class="search-overlay-top shadow-sm">
          <div class="container container--narrow">
            <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
            <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
            <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
          </div>
        </div>
    
        <div class="search-overlay-bottom">
          <div class="container container--narrow py-3">
            <div class="circle-loader"></div>
            <div class="live-search-results">
              
            </div>
          </div>
        </div>
      </div>`)

    }
}