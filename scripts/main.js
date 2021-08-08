var items = []
var sortedItems = []
var currentItem = 0;

var rawCSV = d3.select("#csvdata").text();;
var csv = d3.csv.parseRows(rawCSV);

function getProductData(SerialID) {
    try {
        if (SerialID.includes("\"")) {
            SerialID.replace("\"", "");
        }
    } catch {

    }
    SerialID = "" + SerialID;
    for (var i = 0; i < csv.length-1; i++) {
        if (csv[i][2].includes(SerialID)) {
            return {ID:csv[i][2], Shelf:csv[i][1], Name:csv[i][0]}
        }
    }
    return {ID:SerialID, Shelf:"•", Name:"פריט לא ידוע"}
}

function compareProducts(a, b) {

    var bValue =-999;

    try {
        aValue = parseInt(a.Shelf);
    } catch {
        aValue =999;
    }

    try {
        bValue = parseInt(b.Shelf);
    } catch {
        bValue =999;
    }

    if (a == null) {
        return -1;
    }
    if (aValue > bValue) {
        return 1;
    } else if (aValue < bValue) {
        return -1;
    } else {
        return 0;
    }
}
function NeededQuantityClick() {
    document.getElementById("INPUT-Quantity").value = sortedItems[currentItem].WantedQuantity;
    sortedItems[currentItem].TrueQuantity = sortedItems[currentItem].WantedQuantity;
}
function nextButtonClick() {
    if (currentItem + 1 < sortedItems.length) {
        currentItem += 1;
        updateUI(currentItem);
    } else {
        summaryClick()
    }
}

function backButtonClick() {
    if (currentItem - 1 >= 0) {
        currentItem -= 1;
        updateUI(currentItem);
    }
}

function quantityChanged() {
    var value = document.getElementById("INPUT-Quantity").value;
    try {
        var amount = parseInt(value);
        sortedItems[currentItem].TrueQuantity = amount;
    } catch {
        sortedItems[currentItem].TrueQuantity = 0;
    }
}

function calcChanged() {
    var num1 = document.getElementById("INPUT-Calc-4").value
    var num2 = document.getElementById("INPUT-Calc-3").value
    try {
        document.getElementById("Result").placeholder = num1/num2;
    } catch {

    }
}

function exitSummaryClick() {
    document.getElementById("summary-screen").style.display = "none";
}

function summaryClick() {
    document.getElementById("summary-screen").style.display = "block";
	while (table.rows.length > 1) {
        table.deleteRow(1)
    }

    for (var i = 0; i < items.length; i++) {
        var tr = document.createElement('TR');

        var td = document.createElement('TD');
        td.innerHTML = items[i].TrueQuantity;
        tr.appendChild(td);

        var td2 = document.createElement('TD');
        td2.innerHTML = items[i].WantedQuantity;
        tr.appendChild(td2);

        var td3 = document.createElement('TD');
        td3.innerHTML = items[i].Name;
        tr.appendChild(td3);

        var td4 = document.createElement('TD');
        td4.innerHTML = items[i].ID;
        tr.appendChild(td4);

        document.getElementById("table").appendChild(tr);    
    }
}

function setup() {
    var url = window.location.href;
    var startingPoint = url.indexOf("data=") +5;
    if (startingPoint > 5) {
        var data = "";
        for (var i = startingPoint; i < url.length; i++) {
            data += url[i];
        }
        
        parsedData = data.split("&");
        for (var i = 0; i < parsedData.length; i++) {
            var info = parsedData[i].split("$");
            var productData = getProductData(info[1]);
            items.push({ID:productData.ID, WantedQuantity:info[0], TrueQuantity:0, Shelf:productData.Shelf, Name:productData.Name});
        }

        sortedItems = Array.from(items);
        sortedItems = sortedItems.sort(compareProducts);
    }

    if (sortedItems.length > 0) {
        updateUI(currentItem);
        document.getElementById("BTN-Next").onclick = nextButtonClick;
        document.getElementById("BTN-Back").onclick = backButtonClick;
        document.getElementById("BTN-Summrize").onclick = summaryClick;
        document.getElementById("INPUT-Quantity").onchange = quantityChanged;
        document.getElementById("INPUT-Calc-4").onchange = calcChanged;
        document.getElementById("INPUT-Calc-3").onchange = calcChanged;
        document.getElementById("BTN-ExitSummary").onclick = exitSummaryClick;
        document.getElementById("LBL-NeededQuantity").onclick = NeededQuantityClick;
    } else {
        window.location.replace("https://tobies.github.io/IDF-QR-THINGY/404");
    }
}

function updateUI(index) {
    if (index >= 0 && index < sortedItems.length) {
        document.getElementById("LBL-SerialID").innerText = sortedItems[index].ID;
        document.getElementById("LBL-ProductName").innerText = sortedItems[index].Name;
        document.getElementById("LBL-ShelfNum").innerText = "מדף " + sortedItems[index].Shelf;
        document.getElementById("LBL-NeededQuantity").innerText = "/ " + sortedItems[index].WantedQuantity;
        document.getElementById("INPUT-Quantity").value = sortedItems[index].TrueQuantity;
        document.getElementById("INPUT-Calc-4").value = sortedItems[index].WantedQuantity;
        calcChanged();

    }
}
setup();
