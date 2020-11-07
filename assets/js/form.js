// @ts-nocheck
class AuthFormHandler {
    constructor() {
        this.form = document.querySelector('form');
    }

    // Automatically bind forms on page if found
    bindForms = () => {
        // If there is a form on the page
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                // Prevent form default behaviour
                e.preventDefault();

                // Gather Form Data
                const formId = this.form.id;
                const path = this.form.action;
                const method = this.form.method.toUpperCase();

                // if form is a signup, check is password and confirm password match
                if(formId === 'signup') {
                    const passwordInput = document.querySelector("#psw").value;
                    const confirmPasswordInput = document.querySelector("#psw__confirm").value;

                    if(passwordInput !== confirmPasswordInput) {
                        this.formFailProcessor('Password confirmation does not match');
                        return;
                    }
                }

                // Turn the inputs into payload
                const payload = {};
                const formElements = this.form.elements;
                for (const el of formElements) {
                    if (el.name) {
                        payload[el.name] = el.value;
                    }
                }

                // Send form data to server
                App.request(undefined, path, method, undefined, payload, (statusCode, resPayload) => {
                    if (statusCode !== 200) {
                        // Handle server rejection
                        this.formFailProcessor(resPayload.Error);
                    } else {
                        // Send to form response processor
                        this.formSuccessProcessor(formId, payload, resPayload);
                    }
                })
            })
        }
    }

    // Show / Hide User helper when choosing a password
    passwordHelperHandler = () => {
        if(this.form.id === 'signup') {
            const passwordInput = document.querySelector("#psw");
            const confirmPasswordInput = document.querySelector("#psw__confirm");
            const letter = document.querySelector("#letter");
            const special = document.querySelector("#special");
            const number = document.querySelector("#number");
            const length = document.querySelector("#length");
            const match = document.querySelector("#match");
            const pswHelperBox = document.querySelector(".form__passwordHelper");
            const confPswHelperBox = document.querySelector(".form__confirmPasswordHelper");
    
            const showHelperBox = (el) => {
                el.style.display = "block";
                setTimeout(() => {
                    el.style.opacity = 0.97;
                }, 0);
            }
    
            const hideHelperBox = (el) => {
                el.style.opacity = 0;
                setTimeout(() => {
                    el.style.display = "none";
                }, 200);
            }
    
            // When the user clicks on the password / confirm password field, show the message box
            passwordInput.onfocus = () => showHelperBox(pswHelperBox);
            confirmPasswordInput.onfocus = () => showHelperBox(confPswHelperBox);
    
            // When the user clicks outside of the password / confirm password field, hide the message box
            passwordInput.onblur = () => hideHelperBox(pswHelperBox);
            confirmPasswordInput.onblur = () => hideHelperBox(confPswHelperBox);
    
            // When the user starts to type something inside the password field
            passwordInput.onkeyup = () => {
                // Validate lowercase letters
                const oneletter = /[a-zA-Z]/g;
    
                if(passwordInput.value.match(oneletter)) {
                    letter.classList.remove("invalid");
                    letter.classList.add("valid");
                } else {
                    letter.classList.remove("valid");
                    letter.classList.add("invalid");
                }
    
                // Validate capital letters
                const specialCharacter = /[!@#$%^&*]/g;
    
                if(passwordInput.value.match(specialCharacter)) {
                    special.classList.remove("invalid");
                    special.classList.add("valid");
                } else {
                    special.classList.remove("valid");
                    special.classList.add("invalid");
                }
    
                // Validate numbers
                const numbers = /[0-9]/g;
    
                if(passwordInput.value.match(numbers)) {
                    number.classList.remove("invalid");
                    number.classList.add("valid");
                } else {
                    number.classList.remove("valid");
                    number.classList.add("invalid");
                }
    
                // Validate length
                if(passwordInput.value.length >= 7 && passwordInput.value.length <= 15) {
                    length.classList.remove("invalid");
                    length.classList.add("valid");
                } else {
                    length.classList.remove("valid");
                    length.classList.add("invalid");
                }
            }
    
            // When the user starts to type something inside the confirm password field
            confirmPasswordInput.onkeyup = () => {
                // Validate match with password filed
                console.log(passwordInput.value,confirmPasswordInput.value);
                if(passwordInput.value === confirmPasswordInput.value) {
                    match.classList.remove("invalid");
                    match.classList.add("valid");
                } else {
                    match.classList.remove("valid");
                    match.classList.add("invalid");
                }
            }
        }
    }

    // Process the data coming back from a successful form submission
    formSuccessProcessor = (formId, reqPayload, resPayload) => {
        // Handle form submission response based on form data
        if (formId === 'signup') {
            // Take the email and the password and use it to log the user in
            const newPayload = {
                email: reqPayload.email,
                password: reqPayload.password
            }
            App.request(undefined, 'user/login', 'POST', undefined, newPayload, (statusCode, newResPayload) => {
                if (statusCode !== 200) {
                    console.log(statusCode, newResPayload.Error)
                } else {
                    // handle session data
                    Auth.setSession(newResPayload)
                    // Automatically redirect the user to it's profile page
            
                    window.location = '/my-profile';
                }
            })
        }

        if (formId === 'signin') {
            // handle session data
            Auth.setSession(resPayload)
            // Automatically redirect the user to it's profile page
            window.location = '/my-profile';
        }
    }

    // Process the an unsuccesful form submission
    formFailProcessor = (message) => {
        console.log(message);
        const errorContainer = document.createElement('p');
        errorContainer.innerText = message;
        errorContainer.classList.add = 'form__errorMessage';

        // getComputedStyle(document.querySelector('p'), ':before')
    }
}

window.addEventListener('DOMContentLoaded',()=>{
    const formController = new AuthFormHandler();

    formController.bindForms();
    formController.passwordHelperHandler();
})