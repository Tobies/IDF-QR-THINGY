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
        if (csv[i][0].includes(SerialID)) {
            return {ID:csv[i][0], Name:csv[i][1], Units:csv[i][2], Shelf:csv[i][3], Area:csv[i][4]}
        }
    }
    return {ID:SerialID, Shelf:"•", Name:"פריט לא ידוע", Units:"יח", Area:12}
}

function compareProducts(a, b) {

    aValue = rateProduct(a)
    bValue = rateProduct(b)

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

function rateProduct(a) {
    try {
        aShelf = parseInt(a.Shelf)
    } catch {
        aShelf = 0
    }
    if (isNaN(aShelf)) {
        aShelf = 0
    }

    try {
        aArea = parseInt(a.Area)
    } catch {
        aArea = 12
    }
    if (isNaN(aArea)) {
        aArea = 12
    }
    console.log(aShelf, aArea)
    return aShelf + (aArea * 1000)
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

function createCookie() {
	var cookie = "data=";
	for (var i = 0; i < items.length;i++) {
		cookie += Number(items[i].TrueQuantity) + "$" + items[i].ID + "&";
	}
	cookie = cookie.slice(0, -1);
	var d = new Date();
	d.setTime(d.getTime() + 1 * 24 * 60 * 60 * 1000);
	cookie += ";secure;expires=" + d.toUTCString();
	document.cookie = cookie;
}

function deleteCookie() {
	var d = new Date();
	d.setTime(d.getTime() - 1 * 24 * 60 * 60 * 1000);
	var cookie = "data=0;secure;expires=" + d.toUTCString();
	document.cookie = cookie;
}

function validateCookie() {
	var cookie = document.cookie;
	if (cookie.length > 0) {
		cookie = cookie.slice(6, cookie.length);
		var tempItems = cookie.split("&");
		var newItems = [];
		var flag = true;
		if (tempItems.length == items.length) {
			for (var i = 0; i < tempItems.length; i++) {
				var tempItem = tempItems[i].split("$");
				if (Number(tempItem[1]) == Number(items[i].ID)) {
					newItems.push({ID:Number(tempItem[1].ID), TrueQuantity:Number(tempItem[0])});
				} else {
					flag = false;
					break;
				}
			}
			if (flag) {
				for (var i = 0; i < items.length; i++) {
					items[i].TrueQuantity = newItems[i].TrueQuantity;
				}
			} else {
				deleteCookie();
			}
		}
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
            items.push({ID:productData.ID, WantedQuantity:info[0], TrueQuantity:0, Shelf:productData.Shelf, Name:productData.Name, Units:productData.Units, Area:productData.Area});
        }
	    
	//validateCookie();

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
        //window.location.replace("https://tobies.github.io/IDF-QR-THINGY/404");
    }
}

function areaName(area) {
    switch (area) {
        case "1":
            return "מדף "
        case "2":
            return "מחסן שוטף "
        case "3":
            return "מסדרון "
        case "4":
            return "מחסן רעלים "
        case "5":
            return "משטח "
        case "6":
            return "מחסן אחד "
        case "7":
            return "חדר ניפוק "
        case "8":
            return "מחסן מכשירים "
        case "9":
            return "מקרר "
        case "10":
            return "סככת חמצן "
        case "11":
            return "כספת סמים "
        default:
            return "איזור לא ידוע "
    }
}

function updateUI(index) {
    if (index >= 0 && index < sortedItems.length) {
        document.getElementById("LBL-SerialID").innerText = sortedItems[index].ID;
        document.getElementById("LBL-ProductName").innerText = sortedItems[index].Name;
        document.getElementById("LBL-ShelfNum").innerText = areaName(sortedItems[index].Area) + sortedItems[index].Shelf;
        document.getElementById("LBL-NeededQuantity").innerText = "/ " + sortedItems[index].Units + " " + sortedItems[index].WantedQuantity;
        document.getElementById("INPUT-Quantity").value = sortedItems[index].TrueQuantity;
        document.getElementById("INPUT-Calc-4").value = sortedItems[index].WantedQuantity;
        try {
            if (parseInt(sortedItems[index].Area) >= 7 || sortedItems[index].ID.includes("960100352") || sortedItems[index].ID.includes("960100050")) {
                document.getElementById("INPUT-Quantity").style.color = "#FF2222"
            } else {
                document.getElementById("INPUT-Quantity").style.color = "#33e1ec"
            }
        } catch {
            document.getElementById("INPUT-Quantity").style.color = "#33e1ec"
        }
        calcChanged();
	createCookie();
    }
}
setup();
