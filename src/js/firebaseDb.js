
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/database";

import 'regenerator-runtime/runtime';
import Service from './service';
const service = Service

//firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDmbf0gCi-_OyP4vMxX0w80TIbyaakFe24",
    authDomain: "beverages-menu-app.firebaseapp.com",
    databaseURL: "https://beverages-menu-app.firebaseio.com",
    projectId: "beverages-menu-app",
    storageBucket: "beverages-menu-app.appspot.com",
    messagingSenderId: "727732246308",
    appId: "1:727732246308:web:15fdc8124f25109cea85b1",
    measurementId: "G-LGGN9JLHET"
  };

// Initialize Firebase
const defaultProject = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
let firestore = firebase.firestore();

firestore.enablePersistence()
    .then(function() {
        // Initialize Cloud Firestore through firebase
        firestore = firebase.firestore();
    })
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a a time.

        } else if (err.code == 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
        }
    });

//this function to get data fro firebase.database
function setMenuByDb(callback){
    let rootRef = database.ref("BeveragesMenu");
    rootRef.once("value")
    .then(function(snapshot) {
        let key = snapshot.key; //BeveragesMenu
        console.log(key)
        callback(snapshot.val())
    });
}

//this function is for get data from the firebase.firestore
export function getMenuList(callback){
    firestore.collection('BeveragesMenu').get().then((querySelector)=>{
        querySelector.forEach((menu)=>{
            callback(menu.data())
        })
    })
}

export async function getQueue(callback){
    const snapshot = await firestore.collection('BeveragesQueue').get()
    callback(snapshot.docs.map(doc => {return doc}));
}

export function addOrderIntoQueue(obj){
    firestore.collection("BeveragesQueue").add({
        customerName : obj.customerName,
        phoneNumber : obj.phoneNumber,
        address : obj.address,
        OrderCreatedTimeStamp : obj.OrderCreatedTimeStamp,
        BeverageBarOrderId : obj.BeverageBarOrderId,
        OrderedBeverage: obj.OrderedBeverage,
        IsBeingMixed: obj.IsBeingMixed,
        IsReadyToCollect: obj.IsReadyToCollect,
        IsCollected: obj.IsCollected,
        OrderDeliveredTimeStamp: obj.OrderDeliveredTimeStamp
    }).then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
        window.open('index.html', '_self')
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

export function updateQueue(obj,id){
    firestore.collection("BeveragesQueue").doc(id).update(obj)
}