import axios from 'axios'
export default class RegistrationFormValidation {

    constructor() {
        // this.username = document.querySelector()
        this.form = document.querySelector("#registration-form")
        this.allFields = document.querySelectorAll("#registration-form .form-control")
        this.username = document.querySelector("#username-register")
        this.userEmail = document.querySelector("#email-register")
        this.userPassword = document.querySelector("#password-register")
        this.username.previousValue = ""
        this.userEmail.previousValue = ""
        this.userPassword.previousValue = ""
        this.username.isUnique  = false
        this.userEmail.isUnique = false
        this.insertValidationElement()
        this.events()
    }


    //Events
    events() {

        this.form.addEventListener("submit",e=>{
           e.preventDefault()
           this.formHandler()
        })

        this.username.addEventListener("keyup", () => {
            this.isDifferent(this.username, this.usernameHandler)

        })
        this.userEmail.addEventListener("keyup", () => {
            this.isDifferent(this.userEmail, this.userEmailHandler)

        })

        this.userPassword.addEventListener("keyup", () => {
            this.isDifferent(this.userPassword, this.userPasswordHandler)

        })

        this.username.addEventListener("blur", () => {
            this.isDifferent(this.username, this.usernameHandler)

        })
        this.userEmail.addEventListener("blur", () => {
            this.isDifferent(this.userEmail, this.userEmailHandler)

        })

        this.userPassword.addEventListener("blur", () => {
            this.isDifferent(this.userPassword, this.userPasswordHandler)

        })

    }


    //Methods
    isDifferent(el, handler) {
        if (el.previousValue != el.value) {
            handler.call(this)
        }
        el.previousValue = el.value
    }

    formHandler(){
        console.log("reg ekhane 222")
        this.usernameImmediatly()
        this.usernameRunDelay()
        this.userEmailRunDelay()
        this.userPasswordImmediatly()
        this.userPasswordRunDelay()
        console.log("reg ekhane 1")

        
        if(
            
            this.username.isUnique && 
            !this.username.errors && 
            this.userEmail.isUnique && 
            !this.userEmail.errors &&
            !this.userPassword.errors ){
            console.log("reg ekhane 2")
            this.form.submit()
        }else{
            console.log("eikhane error")
            console.log(this.username.isUnique)
            console.log(this.username.errors)
            console.log(this.userEmail.isUnique)
            console.log(this.userEmail.errors)
            console.log(this.userPassword.errors)
        }
    }
    usernameHandler() {
        this.username.errors = false
        this.usernameImmediatly()
        clearTimeout(this.username.timer)
        this.username.timer = setTimeout(() => this.usernameRunDelay(), 800)

    }

    userEmailHandler() {
        this.userEmail.errors = false
        clearTimeout(this.userEmail.timer)
        this.userEmail.timer = setTimeout(() => this.userEmailRunDelay(), 1000)

    }

    userPasswordHandler() {
        this.userPassword.errors = false
        this.userPasswordImmediatly()
        clearTimeout(this.userPassword.timer)
        this.userPassword.timer = setTimeout(() => this.userPasswordRunDelay(), 800)

    }

    userPasswordImmediatly() {

        if (this.userPassword.value.length > 50) {
            //alert("username can contains only characters")
            this.showValidationErrors(this.userPassword, "Password can not exceded 50 characters")
        }
        if (!this.userPassword.errors) {
            this.hideValidationErrors(this.userPassword)
        }

    }

    userPasswordRunDelay(){

        if(this.userPassword.value.length < 6){
            this.showValidationErrors(this.userPassword,"Password must have to 6 characters")
            
        }
    }

    usernameImmediatly() {

        if (this.username.value != "" && !/^([a-zA-Z0-9]+)$/.test(this.username.value)) {
            //alert("username can contains only characters")
            this.showValidationErrors(this.username, "username can contains only characters")
        }
        if (this.username.value.length > 30) {
            this.showValidationErrors(this.username, "username cant be more than 30 characters")
        }

        if (!this.username.errors) {
            this.hideValidationErrors(this.username)
        }

    }
    usernameRunDelay() {
        //alert("finally im ran")
        if (this.username.value.length < 3) {
            this.showValidationErrors(this.username, "user name must be at least four characters")
        }
        if (!this.username.errors) {
            axios.post("/checkUsernameExists", { username: this.username.value }).then((response) => {
                console.log("response is : " + response.data)
                if (response.data) {
                    console.log("response is again : " + response.data)
                    this.showValidationErrors(this.username, "username already taken")
                    this.username.isUnique = false
                } else {
                    this.username.isUnique = true
                }
            }).catch(() => {
                console.log("something happen wrong")
            })
        }

    }
    userEmailRunDelay() {
        if (!/^\S+@\S+$/.test(this.userEmail.value)) {
            this.showValidationErrors(this.userEmail, "please enter valid email address")
        } else {
            this.hideValidationErrors(this.userEmail)
        }
        if (!this.userEmail.errors) {
            console.log(this.userEmail.value)
            axios.post("/checkUserEmailExists", { email: this.userEmail.value }).then((response) => {
                console.log("response is : " + response.data)
                if (response.data) {
                    console.log("response is again : " + response.data)
                    this.showValidationErrors(this.userEmail, "email already taken")
                    this.userEmail.isUnique = false
                } else {
                    this.userEmail.isUnique = true
                    this.hideValidationErrors(this.userEmail)
                }
            }).catch(() => {
                console.log("something happen wrong email")
            })
        }
    }
    showValidationErrors(el, message) {
        // console.log("validation error")
        el.nextElementSibling.innerHTML = message
        el.nextElementSibling.classList.add("liveValidateMessage--visible")
        el.errors = true
    }

    hideValidationErrors(el) {
        el.nextElementSibling.classList.remove("liveValidateMessage--visible")
    }
    insertValidationElement() {

        this.allFields.forEach(function (el) {

            el.insertAdjacentHTML('afterend', '<div class="alert alert-danger small liveValidateMessage "></div>')
        })
    }
}