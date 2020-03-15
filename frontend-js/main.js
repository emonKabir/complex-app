import Search from './modules/search'
import Chat from './modules/chat'
import RegistrationFormValidation from './modules/registrationFormValidation'

if(document.querySelector("#registration-form")){new RegistrationFormValidation()}
if(document.querySelector("#chat-wrapper")){
    new Chat()
}
if(document.querySelector(".header-search-icon")){new Search()}
