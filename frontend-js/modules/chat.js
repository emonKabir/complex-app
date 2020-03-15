export default class Chat {

    constructor() {
        this.openedYet = false
        this.chatWrapper = document.querySelector("#chat-wrapper")
        this.chatIcon = document.querySelector(".header-chat-icon")
        this.injectHmtl()
        this.chatLog = document.querySelector("#chat")
        this.chatField = document.querySelector("#chatField")
        this.chatForm = document.querySelector("#chatForm")
        this.chatClose = document.querySelector(".chat-title-bar-close")
        this.events()
    }

    //Events
    events() {
        this.chatForm.addEventListener("submit",(e)=>{
            e.preventDefault()
            this.sendMesseageToServer()
        })
        this.chatIcon.addEventListener("click", () => this.showChatBox())
        this.chatClose.addEventListener("click", () => this.hideChatBox())
    }
    //methods
    sendMesseageToServer(){

        //sending message from browser to server
        this.socket.emit("chatMessageFromBrowser",{message:this.chatField.value})
        //displaying own message to chat box.
        this.chatLog.insertAdjacentHTML("beforeend",`
        <div class="chat-self">
    <div class="chat-message">
      <div class="chat-message-inner">
        ${this.chatField.value}
      </div>
    </div>
    <img class="chat-avatar avatar-tiny" src="${this.avatar}">
  </div>
        `)
        this.chatLog.scrollTop = this.chatLog.scrollHeight
        this.chatField.value = ""
        this.chatField.focus()
    
    }

    showChatBox() {
        if(!this.openedYet){
            this.openConnection()
        }
        this.openedYet = true
        this.chatWrapper.classList.add("chat--visible")
        this.chatField.focus()
    }
    hideChatBox() {
        this.chatWrapper.classList.remove("chat--visible")
    }
    injectHmtl() {

        this.chatWrapper.innerHTML = `
        <div class="chat-title-bar">Chat <span class="chat-title-bar-close"><i class="fas fa-times-circle"></i></span></div>
        <div id="chat" class= "chat-log"></div>
        <form id="chatForm" class="chat-form border-top">
      <input type="text" class="chat-field" id="chatField" placeholder="Type a message…" autocomplete="off">
    </form>
        `
    }

    openConnection(){

        this.socket = io()
        //Receiving user information from server and saving it to local variable.
        this.socket.on("welcome",data =>{
           this.username = data.username
           this.avatar = data.avatar
        })

        //Receiving message from the server and displaying it to chat box.
        this.socket.on("chatMessageFromServer",(data)=>{
          this.displayMessageFromTheServer(data)
           
        })
    }

    displayMessageFromTheServer(data){

        this.chatLog.insertAdjacentHTML("beforeend",` <div class="chat-other">
           <a href="#"><img class="avatar-tiny" src="${data.avatar}"></a>
           <div class="chat-message"><div class="chat-message-inner">
             <a href="#"><strong>${data.username}:</strong></a>
             ${data.message}
           </div></div>
         </div>`)
         this.chatLog.scrollTop = this.chatLog.scrollHeight
    }
}