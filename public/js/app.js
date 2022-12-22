// const { sayHello } = require("../../functions");

const requestModal = document.querySelector(".new-request");
const requestLink = document.querySelector(".add-request");
const requestForm = document.querySelector(".new-request form");

// open request modal
requestLink.addEventListener("click", () => {
  requestModal.classList.add("open");
});

// close request modal
requestModal.addEventListener("click", (e) => {
  if (e.target.classList.contains("new-request")) {
    requestModal.classList.remove("open");
  }
});

// // say hello function call
// const button = document.querySelector(".call");
// button.addEventListener("click", () => {
//   // get function reference from firebase script in index.js body
//   const sayHello = firebase.functions().httpsCallable("sayHello");
//   // call the function and pass data
//   sayHello({ name: "nada abdu" }).then((result) => {
//     console.log(result.data);
//   });
// });

// adding Request a Tutorial fpr call addRequest cloude function
requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const addRequest = firebase.functions().httpsCallable("addRequest");
  addRequest({ text: requestForm.request.value })
    .then(() => {
      requestForm.reset();
      // disappear requestModal from screen
      requestModal.classList.remove("open");
      requestForm.querySelector(".error").textContent = "";
    })
    // to display error that sended from firebase
    .catch((error) => {
      requestForm.querySelector(".error").textContent = error.message;
    });
});
