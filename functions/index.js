const functions = require("firebase-functions");

// to user firestore must call admin SDK and the initialize the app
const admin = require("firebase-admin");
admin.initializeApp();

// *****************************************************http request

// request function thats create URL or end point ,
// create function that generate random number .
// req: request we made and res: response from request
exports.randomNumber = functions.https.onRequest(async (req, res) => {
  const number = Math.round(Math.random() * 100);
  // send response to user/browser
  res.send(number.toString());
});

// redirect to anothe page
exports.toZonizer = functions.https.onRequest(async (req, res) => {
  res.redirect("https://zonizer.com");
});

// *****************************************************http callable function

// take two args : 1- data: data send to function when call from our code . 2- context: additional info available to us like authentication
exports.sayHello = functions.https.onCall(async (data, context) => {
  const name = data.name;
  return `hello, ${name}`;
});

// adding Request a Tutorial
// 1- check user auth 2- adding request
// context: contains auth info
exports.addRequest = functions.https.onCall(async (data, context) => {
  // check if  user not logged in
  if (!context.auth) {
    // HttpsError prams: 1- error code 2- message can access from frontend
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can request"
    );
  }

  // check if length of character > 30
  // can access to sended text form fronted >> called text in frontend
  if (data.text.length > 30) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "request must be not more than 30 characters long"
    );
  }

  return admin.firestore().collection("requests").add({
    text: data.text,
    userId: context.auth.uid,
    upvotes: 0,
  });
});

// *****************************************************Background triggers (auth)

// auth trigger (new user signup will run this function)
exports.newUserSignup = functions.auth.user().onCreate(async (user) => {
  // the user when registered in auth in firebase, the auth is automatically generate uid
  // create new user in users collection because the auth in firebase just register email and pass and uid
  //doc: search for uid in uers doc if not exeist then create it
  // set:set values for use in users doc
  // return promise but can't put promise hear so we can wite return
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
    upvotedOn: [],
  });
});

// auth trigger (delete user  will run this function)
exports.userDeleted = functions.auth.user().onDelete(async (user) => {
  // the user is registered in auth if firebase and automaticlly generate uid
  // console.log("user deleted ", user.email, user.uid);
  const doc = admin.firestore().collection("users").doc(user.uid);
  return doc.delete();
});

// upvote callback function
exports.upvote = functions.https.onCall(async (data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can request"
    );
  }

  // get refs users and requests document
  const user = admin.firestore().collection("users").doc(context.auth.uid);
  const request = admin.firestore().collection("requests").doc(data.id);

  //  check if user was upvote before for same tutorial
  //XXXX return user.get().then((doc) => {
  const doc = await user.get();
  // check if user hasn't already upvoted the request
  if (doc.data().upvotedOn.includes(data.id)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "You can only upvote somthing once"
    );
  }

  // update user array
  // XXXXX return user
  await user.update({
    upvotedOn: [...doc.data().upvotedOn, data.id],
  });
  // .then(() => {
  // update votes on the request to increase one
  return request.update({
    upvotes: admin.firestore.FieldValue.increment(1),
  });
});
// xxxxx });
// XXXXXX });

// furestore trigger to traking activity

// id: like path to any document in requests collection
// document("/{collection}/{id}") : means taraking any document created(onCraete) in ayn collection
// document("/{requests}/{id}") : means taraking any document created(onCraete) in requests collection
// snap: snapshot of document that created
// context :contains info for the path of document
exports.logActivities = functions.firestore
  .document("/{collection}/{id}")
  .onCreate((snap, context) => {
    // context.params.collection : .collection same name of {collection}
    //context.params.abc : .collection name must {abc}
    const collection = context.params.collection;
    const id = context.params.id;

    //store all user activity in activities collection
    const activities = admin.firestore().collection("activities");

    // find type activity
    if (collection === "requests")
      return activities.add({ text: "a new tutorial request was added" });

    if (collection === "users")
      return activities.add({ text: "a new use signed up" });

    // if no one of users and requests collection will return null
    return null;
  });
