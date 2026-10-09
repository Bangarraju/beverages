import Service from './service'

const service = Service;
let beveragesMenuDb;

let openRequest = indexedDB.open("beveragesMenu", 1);


openRequest.onerror = function (event) {
    console.error("Error", openRequest.error);
};

openRequest.onsuccess = function (event) {
    console.log('db initialized')
    beveragesMenuDb = event.target.result;
};

openRequest.onupgradeneeded = function (event) {
    beveragesMenuDb = event.target.result;
    let menuStore = beveragesMenuDb.createObjectStore("menu", { keyPath: "id" });

    let menu = menuStore.getAll();

    if (menu.length) {
        console.log('menu is there already')
    } else {
        console.log('upgraded called')
    }
}

export function addMenu(beveragesMenu) {
    let transaction = beveragesMenuDb.transaction('menu', 'readwrite');
    let menuStore = transaction.objectStore('menu', { keyPath: "id" })
    beveragesMenu.map((menu) => {
        menuStore.add(menu)
    })
}

export function setMenuList(callback) {
    let transaction = beveragesMenuDb.transaction('menu');
    let menuStore = transaction.objectStore('menu')
    let menu = menuStore.getAll();
    menu.onsuccess = function (event) {
        callback(event.target.result)
    }
}