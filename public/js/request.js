const ref = firebase
  .firestore()
  .collection("requests")
  .orderBy("upvotes", "desc");

const notification = document.querySelector(".notification");

// onSnapshot function : callback function every time a change in this collection (requests)
// snapshot : represent current state data and correct of all data at time that this function fires
ref.onSnapshot((snapshot) => {
  let requests = [];
  snapshot.forEach((doc) => {
    requests.push({ ...doc.data(), id: doc.id });
  });
  let html = "";
  requests.forEach((request) => {
    html += `<li>
    <span class="text">${request.text}</span>
    <div>
      <span class="votes">${request.upvotes}</span>
      <button class="material-icons upvote " onClick="upvote('${request.id}')" > arrow_upward</button>
    </div>
    </li>`;
  });

  document.querySelector("ul").innerHTML = html;
});

// to handel upvote and send id to callback cloude function
function upvote(id) {
  //   content.querySelector(".error").textContent = "";
  const upvote = firebase.functions().httpsCallable("upvote");
  upvote({ id: id }).catch((error) => {
    showNotification(error.message);
    // content.querySelector(".error").textContent = error.message;
  });
}

const showNotification = (message) => {
  notification.textContent = message;
  notification.classList.add("active");
  setTimeout(() => {
    notification.classList.remove("active");
    notification.textContent = "";
  }, 4000);
};
