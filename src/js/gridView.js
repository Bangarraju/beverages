//importing ag-grid modules
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  ModuleRegistry,
  PaginationModule,
  RowSelectionModule,
  SelectEditorModule,
  TextEditorModule,
  TextFilterModule,
  createGrid
} from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
  CellSelectionModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ColumnApiModule,
  PaginationModule,
  RowSelectionModule,
  SelectEditorModule,
  TextEditorModule,
  TextFilterModule
]);

//importing user define modules
import { getQueue, updateQueue } from './firebaseDb'
import { createNode, changeQueueDomElements } from './nodeOperations';

//defining headers of the table or Grid
const queue = ['In queue', 'Being mixed', 'Ready to collect', 'Collected']
let columnDefs = [
  {
    headerName: "Name",
    field: "customerName",
  },
  { headerName: "Phone number", field: "phoneNumber", editable: true },
  { headerName: "Order name", field: "OrderedBeverage.Name" },
  {
    headerName: "Order status",
    field: "status",
    editable: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: function (params) {
      let status = params.data.status
      if (status == 'In queue') {
        return {
          values: ['In queue', 'Being mixed', 'Ready to collect', 'Collected']
        }
      } else if (status == 'Being mixed') {
        return {
          values: ['Being mixed', 'Ready to collect', 'Collected']
        };
      } else if (status == 'Ready to collect') {
        return {
          values: ['Ready to collect', 'Collected']
        };
      } else if (status == 'Collected') {
        return {
          values: ['Collected']
        };
      }
    }
  },
  { headerName: "Order collected date", field: "OrderDeliveredTime" },
  { headerName: "Address", field: "address" },
];

//options to resize and filtering for data and for assign columndefs to table
let gridOptions = {
  defaultColDef: {
    sortable: true,
    resizable: true,
    filter: true,
    flex: 1,
    minWidth: 150,
    headerCheckboxSelection: isFirstColumn,
    headerCheckboxSelectionFilteredOnly: isFirstColumn,
    checkboxSelection: isFirstColumn,
  },
  suppressRowClickSelection: true,
  groupSelectsChildren: true,
  enableRangeSelection: true,
  stopEditingWhenGridLosesFocus: true, //stop editing when grid loses focus
  columnDefs: columnDefs, //for adding headers to the table
  pagination: true,
  paginationPageSize: 3, //by default pagination page size
  paginationPageSizeSelector: false,
  rowSelection: "multiple",
  theme: 'legacy',
  paginationNumberFormatter(params) {
    return '[' + params.value.toLocaleString() + ']';
  },
  onCellValueChanged: onCellValueChanged,
  onSelectionChanged: onSelectionChanged,
};

function isFirstColumn(params) {
  var displayedColumns = params.api.getAllDisplayedColumns();
  var thisIsFirstColumn = displayedColumns[0] === params.column;
  return thisIsFirstColumn;
}

function onSelectionChanged(params) {
  let selectedRows = params.api.getSelectedRows();
  let updateStatus = document.getElementById('updateStatus')
  let select = document.getElementById('statusDropdown')
  if (selectedRows.length > 0) {
    updateStatus.hidden = false;
    select.length = 1;
    let selectedRowsStatus = selectedRows.map((row) => { return row.status });
    selectedRowsStatus = selectedRowsStatus.filter(onlyUnique);
    let updatedQueue = queue;
    let indexes = selectedRowsStatus.map((selectedRowStatus)=>{return queue.indexOf(selectedRowStatus)})
    let min_index = Math.min.apply(null,indexes)
    updatedQueue = queue.slice(min_index + 1)
    updatedQueue.map((stat) => {
      let option = createNode('option')
      option.text = `${stat}`
      select.add(option)
    })
  } else {
    updateStatus.hidden = true;
    document.getElementById('update').hidden = true
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
}

let gridApi;

export function onStatusUpdate() {
  let newstatusElement = document.getElementById('statusDropdown')
  if (newstatusElement.selectedIndex < 1) return;
  let selectedRows = gridApi.getSelectedRows();
  selectedRows.map((selectedRow) => {
    let oldStatus = selectedRow.status;
    if (selectedRow.status == newstatusElement.value) { return };
    if (queue.indexOf(selectedRow.status) + 1 <= queue.indexOf(newstatusElement.value)) {
      selectedRow.status = newstatusElement.value;
      pushDataToServer('status', selectedRow, oldStatus)
    } else {
      return
    }

    gridApi.applyTransactionAsync({ update: [selectedRow] });
  })
}

export function moveToNextState() {
  let selectedRows = gridApi.getSelectedRows();
  selectedRows.map((selectedRow) => {
    let oldStatus = selectedRow.status
    switch (oldStatus) {
      case 'In queue':
        selectedRow.status = 'Being mixed';
        break;
      case 'Being mixed':
        selectedRow.status = 'Ready to collect';
        break;
      case 'Ready to collect':
        selectedRow.status = 'Collected';
        break;
      case 'Collected':
        break;
    }
    pushDataToServer('status', selectedRow, oldStatus)
    gridApi.applyTransactionAsync({ update: [selectedRow] });
  })
}

function onCellValueChanged(params) {
  let colId = params.column.getId();
  pushDataToServer(colId, params.data, params.oldValue)
}

function pushDataToServer(colId, data, oldStatus) {
  let beverage = {}
  let beverageId = data.id;
  const url = `/BeveragesQueue/${beverageId}`;
  //changed in status 
  if (colId === 'status') {
    let beverageStatus = data.status
    let clickLiele = document.getElementById(data.docRefId).parentElement;
    if (beverageStatus == 'Being mixed') {
      beverage.IsBeingMixed = true;
    }
    if (beverageStatus == 'Ready to collect') {
      beverage.IsReadyToCollect = true;
    }
    if (beverageStatus == 'Collected') {
      beverage.IsCollected = true;
      //dom element changes
      document.getElementById(data.docRefId).firstChild.lastElementChild.hidden = false;
      document.getElementById(data.docRefId).lastElementChild.lastElementChild.hidden = false;
    }
    //dom element changes
    changeQueueDomElements(clickLiele, getId(oldStatus), getId(beverageStatus))
  }
  if (colId === 'phoneNumber') {
    beverage.phoneNumber = data.phoneNumber;
  }

  updateQueue(beverage,data.docRefId)

  function getId(state) {
    switch (state) {
      case 'In queue':
        return 'inQueue'
      case 'Being mixed':
        return 'isBeingMixed'
      case 'Ready to collect':
        return 'isReadyToCollect'
      case 'Collected':
        return 'isCollected'
      default:
        return
    }
  }
}

//if page size changes, it sets pagination size
export function onPageSizeChanged(newPageSize) {
  let value = document.getElementById('page-size').value;
  gridApi.setGridOption('paginationPageSize', Number(value));
}

//show data in Grid i.e., in table 
export function gridView() {
  // Create the grid once; later refreshes update its rows without discarding selection or controls.
  if (!gridApi) {
    let eGridDiv = document.querySelector('#grid');
    gridApi = createGrid(eGridDiv, gridOptions);

    //setting user defined pagination in the paging div
    let pagingDiv = createNode('div')
    pagingDiv.classList.add('example-wrapper')
    pagingDiv.innerHTML = `<div class="example-header">
                          Page size:
                          <select id="page-size">
                            <option value="3" selected>3</option>
                            <option value="6">6</option>
                            <option value="9">9</option>
                          </select>
                        </div>`
    document.getElementsByClassName('ag-paging-panel')[0].append(pagingDiv)
  }

  //get orders from Firestore and set them in the Grid
  getQueue(setRowData)
  //callback function to set data in Grid
  function setRowData(dataRefs) {
    if (dataRefs.length) {
      let rowdata = []
      dataRefs.map((dataRef) => {
        let row = dataRef.data();
        let date = new Date(row.OrderDeliveredTimeStamp);
        row.docRefId = dataRef.id //document Ref Id for find the document in Firestore
        row.status = row.IsCollected ? 'Collected' : (row.IsReadyToCollect ? 'Ready to collect' : (row.IsBeingMixed ? 'Being mixed' : 'In queue'));
        row.OrderDeliveredTime = row.IsCollected ? date.toDateString() : '';
        rowdata.push(row)
      })
      gridApi.setGridOption('rowData', rowdata);
    }
  }
}