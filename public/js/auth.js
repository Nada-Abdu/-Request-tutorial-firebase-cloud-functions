const authSwitchLinks = document.querySelectorAll(".switch");
const authModals = document.querySelectorAll(".auth .modal");
const authWrapper = document.querySelector(".auth");
const registerForm = document.querySelector(".register");
const loginForm = document.querySelector(".login");
const signOut = document.querySelector(".sign-out");

// toggle auth modals
authSwitchLinks.forEach((link) => {
  link.addEventListener("click", () => {
    authModals.forEach((modal) => modal.classList.toggle("active"));
  });
});

// register in firebase
registerForm.addEventListener("submit", (event) => {
  // to prevent default behavior of form submission (refresh page)
  event.preventDefault();
  //email and password is name of the input
  const email = registerForm.email.value;
  const password = registerForm.password.value;

  console.log(email, password);

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      console.log("registered", user);
      //   to reset form to orignal state
      registerForm.reset();
    })
    .catch((error) => {
      registerForm.querySelector(".error").textContent = error.message;
    });
});

// login using firebase
loginForm.addEventListener("submit", (event) => {
  // to prevent default behavior of form submission (refresh page)
  event.preventDefault();
  //email and password is name of the input
  const email = loginForm.email.value;
  const password = loginForm.password.value;

  console.log(email, password);

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((user) => {
      console.log("logged in ", user);
      //   to reset form to orignal state
      loginForm.reset();
    })
    .catch((error) => {
      loginForm.querySelector(".error").textContent = error.message;
    });
});

// auth listener : if user loging , register or logout this function will run/fire
firebase.auth().onAuthStateChanged((user) => {
  // if user logged in or register then user become (not null ==  true) . else null
  if (user) {
    authWrapper.classList.remove("open");
    authModals.forEach((modal) => {
      modal.classList.remove("active");
    });
  } else {
    authWrapper.classList.add("open");
    // just show login form
    authModals[0].classList.add("active");
  }
});

// sign out
signOut.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("signed out !!");
    });
});
