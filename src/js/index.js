import Service from './service';
import { createNode, append } from './nodeOperations';
import Beverage from './beverage';
import { gridView, onPageSizeChanged,onStatusUpdate,moveToNextState } from './gridView';
import '../styles/main.scss';
import {getMenuList, getQueue} from './firebaseDb';


const service = Service; //axios service object
const beverage = Beverage; // beverage object to order and changing queue


/* get menu from server and set it into the local storage*/
// service.get("/BeveragesMenu", handleRequest)

// function handleRequest(status, data) {
//     if (status === 200) {
//         if (data.length) {
//             addMenu(data)
//         } else {
//             console.log('Not get any data from server')
//         }
//     }
// }


//append each order into the Beverage Queue and other list too
function appendItemsintoList(item, ul) {
    let li = createNode('li');
    let beverageDiv = createNode('div');
    let customerDiv = createNode('div');
    let maindiv = createNode('div');
    let date = new Date(item.OrderDeliveredTimeStamp);
    maindiv.id = `${item.id}`;
    item = item.data()
    if (ul !== document.getElementById('isCollected')) {
        //this logic is for in queue elements to hide remaining data
        beverageDiv.innerHTML = `<b>${item.OrderedBeverage.Name}</b><br/><span hidden>${date? date.toDateString() :''}</span>`;
        customerDiv.innerHTML = `<b>${item.customerName}</b><br/><span hidden> ${item.phoneNumber?item.phoneNumber:''}<br/> ${item.address? item.address : ''}</span>`;
        maindiv.addEventListener('click', beverage.changeQueue);
    }else{
        //this logic is for show remaining data of user and order
        beverageDiv.innerHTML = `<b>${item.OrderedBeverage.Name}</b><br/><span>${date? date.toDateString() :''}</span>`;
        customerDiv.innerHTML = `<b>${item.customerName}</b><br/><span> ${item.phoneNumber?item.phoneNumber:''}<br/> ${item.address? item.address : ''}</span>`;
    }
    beverageDiv.classList.add('beverage');
    customerDiv.classList.add('customer');
    maindiv.classList.add('order');
    maindiv.append(beverageDiv, customerDiv);
    append(li, maindiv);
    append(ul, li);
}


//setting menu into list and append into dom elements
function beveragesMenu() {
    const ul = document.getElementById('beverageMenu');
    getMenuList(appendListTopage)

    function appendListTopage(menu){
        let item = menu
        let li = createNode('li');
        let div = createNode('div');
        div.innerText = `${item.Name}`;
        div.classList.add('menuItem');
        append(li, div);
        append(ul, li);
    }
}

//fetching orders and set into list and append those to dom elements
function beveragesQueue() {
    let queueElement = document.getElementById('inQueue');
    let mixedElement = document.getElementById('isBeingMixed');
    let readyToCollectelement = document.getElementById('isReadyToCollect');
    let collectedElement = document.getElementById('isCollected');

    // service.get("/BeveragesQueue", orderList) //
    getQueue(orderList)

    function orderList(data) {
        if (data.length) {
            //filtering corresponding elements in for queue, mixing, ready to collect and collected items
            let beingMixedItems = data.filter(item => item.data().IsBeingMixed && !item.data().IsReadyToCollect && !item.data().IsCollected);
            let readyToCollectItems = data.filter(item => item.data().IsReadyToCollect && !item.data().IsCollected);
            let inQueueItems = data.filter(item => !item.data().IsCollected && !item.data().IsReadyToCollect && !item.data().IsBeingMixed);
            let collectedItems = data.filter(item => item.data().IsCollected);
            //appending items into the corresponding div elements 
            inQueueItems.map(
                (item) => appendItemsintoList(item, queueElement)
            );
            beingMixedItems.map(
                (item) => appendItemsintoList(item, mixedElement)
            );
            readyToCollectItems.map(
                (item) => appendItemsintoList(item, readyToCollectelement)
            );
            collectedItems.map(
                (item) => appendItemsintoList(item, collectedElement)
            )
        }
    }
}


window.onload = function () {
    beveragesMenu(); //set menu into list in ui
    beveragesQueue(); //set queue of orders in corresponding list

    //toggle view of queue to completed queue while click switch view button
    document.getElementById('switchView').onclick = () => {
        if(document.getElementById('completedOrdersContainer').hidden){
            document.getElementById('completedOrdersContainer').hidden = false;
            document.getElementById('queueContainer').hidden= true;
            document.getElementById('gridViewContainer').hidden = true;
        }else{
            document.getElementById('completedOrdersContainer').hidden = true;
            document.getElementById('queueContainer').hidden= false;
            document.getElementById('gridViewContainer').hidden = true;
        }
    }

    //toggle Grid view while click on the Grid View button
    document.getElementById('gridView').onclick = () => {
        if( document.getElementById('gridViewContainer').hidden){
            document.getElementById('gridViewContainer').hidden = false;
            document.getElementById('completedOrdersContainer').hidden = true;
            document.getElementById('queueContainer').hidden= true;
        }else{
            document.getElementById('gridViewContainer').hidden = true;
            document.getElementById('completedOrdersContainer').hidden = true;
            document.getElementById('queueContainer').hidden= false;
        }
    }
    
    gridView(); //function call to Grid view

    //onchage of page size of grid
    document.getElementById('page-size').onchange = ()=>{
        console.log('page number changed')
       onPageSizeChanged(); 
    }

    let updateElement = document.getElementById('update')
    updateElement.onclick = ()=>{
        onStatusUpdate()
    }

    document.getElementById('moveToNextState').onclick = () => {
        moveToNextState();
    }

    document.getElementById('statusDropdown').onchange = (event)=>{
        if(event.target.value){
            updateElement.hidden = false
        }else{
            updateElement.hidden = true
        }
    }
}

