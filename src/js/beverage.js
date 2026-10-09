import Service from './service';
import { changeQueueDomElements } from './nodeOperations';
import { gridView } from './gridView';
import {addOrderIntoQueue, updateQueue} from './firebaseDb'

const service = Service;

class Beverage{

    constructor(){
        this.customerName = '';
        this.phoneNumber = '';
        this.address = '';
        this.OrderCreatedTimeStamp= Date.now();
        this.BeverageBarOrderId = Math.random();
        this.OrderedBeverage = {
            BeverageId: "",
            Name: ""
        };
        this.IsBeingMixed =  false;
        this.IsReadyToCollect = false;
        this.IsCollected = false;
        this.OrderDeliveredTimeStamp = Date.now();
    }


    //funciton for take ordering beverage and post it into the server
    orderBeverage(event) {
        event.preventDefault();
        const url = "/BeveragesQueue";
        let formdata = new FormData(formele);
        let selector = document.getElementById('menuDropdown');
        this.OrderedBeverage.BeverageId = selector[selector.selectedIndex].id;
        this.OrderedBeverage.Name = formdata.get('beverage')
        this.customerName = formdata.get('customerName')
        this.phoneNumber = formdata.get('phoneNumber')
        this.address = formdata.get('address')
        addOrderIntoQueue(this)
    }

    //changeing queue elements when click event is happen
    changeQueue(event) {

        event.preventDefault();
        const clickId = event.path[2].id;
        const itemId = event.target.id;
        const url = `/BeveragesQueue/${itemId}`;
        let clickLiele = document.getElementById(itemId).parentElement;
        let changeObj ={}
        if (clickId == "inQueue") {
            changeObj.IsBeingMixed = true; //set isBeingMixed flag to true
            changeQueueDomElements(clickLiele,clickId,'isBeingMixed')
        } else if (clickId == "isBeingMixed") {
            changeObj.IsReadyToCollect = true; //set isreadytocollect flag to true
            changeQueueDomElements(clickLiele,clickId,'isReadyToCollect')
        } else if (clickId == "isReadyToCollect") {
            changeObj.IsCollected = true; //set iscollected flag to true
            //show hidden data in collected elements
            document.getElementById(itemId).firstChild.lastElementChild.hidden = false; 
            document.getElementById(itemId).lastElementChild.lastElementChild.hidden = false;
            changeObj.OrderDeliveredTimeStamp = Date.now(); // set completed date to when it is completed
            changeQueueDomElements(clickLiele,clickId,'isCollected')
        }

        //send changed data to server 
        updateQueue(changeObj,itemId)
        //manipulate grid elements when the status of beverae changed
        
        gridView()
    }
}

export default new Beverage