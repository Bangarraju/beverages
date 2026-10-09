
import { initializeApp } from 'firebase/app';
import {
    addDoc,
    collection,
    doc,
    enableIndexedDbPersistence,
    getDocs,
    getFirestore,
    updateDoc
} from 'firebase/firestore';

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

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

enableIndexedDbPersistence(firestore).catch((error) => {
    if (error.code === 'failed-precondition') {
        console.warn('Firestore offline persistence is unavailable because multiple tabs are open.', error);
    } else if (error.code === 'unimplemented') {
        console.warn('Firestore offline persistence is not supported by this browser.', error);
    } else {
        console.error('Unable to enable Firestore offline persistence.', error);
    }
});

export function getMenuList(callback) {
    return getDocs(collection(firestore, 'BeveragesMenu')).then((snapshot) => {
        snapshot.forEach((menu) => {
            callback(menu.data());
        });
    })
}

export async function getQueue(callback) {
    const snapshot = await getDocs(collection(firestore, 'BeveragesQueue'));
    callback(snapshot.docs);
}

export function addOrderIntoQueue(obj) {
    return addDoc(collection(firestore, 'BeveragesQueue'), {
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
    }).then((documentRef) => {
        console.log('Document written with ID: ', documentRef.id);
        window.open('index.html', '_self')
    })
    .catch((error) => {
        console.error('Error adding document: ', error);
    });
}

export function updateQueue(obj, id) {
    return updateDoc(doc(firestore, 'BeveragesQueue', id), obj);
}