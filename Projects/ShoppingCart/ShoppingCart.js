// Specs:

// Take the start code for the Shopping Cart Project

// Then complete the shopping cart by adding REMOVE buttons that performs the opposite to the Add Button

// Please remember if you remove - to prevent from going into negative quantities

// Also add a Checkout Button that calculates the total price of items in the Shopping cart and places the total on the page (make a new function for this ).

var items = ["Coke", "Kit Kat", "Bar One", "Fanta"];
var prices = [7.5, 9.5, 8.5, 7.5];
var quantities = [0, 0, 0, 0];
var totals = [0.0, 0.0, 0.0, 0.0];
var totalOrderAmt = 0;

document.getElementById("checkout").addEventListener("click", checkout);
document.getElementById("newCart").addEventListener("click", newCart);

function add_selection(x) {
    console.log(x);
    quantities[x] = quantities[x] + 1;
    totals[x] = prices[x] * quantities[x];
    totalOrderAmt += prices[x];
    display_all();
}

function remove_selection(x) {
    console.log(x);
    if (quantities[x] > 0) {
        quantities[x] = quantities[x] - 1;
        totals[x] = prices[x] * quantities[x];
        totalOrderAmt -= prices[x];
    }
    display_all();
}

function display_all() {
    var myTable = "<table><th style='width: 100px; color: red; text-align: right;'>Num</th>";
    myTable += "<th style='width: 100px; color: red; text-align: right;'>Item</th>";
    myTable += "<th style='width: 100px; color: red; text-align: right;'>Price</th>";
    myTable += "<th style='width: 100px; color: red; text-align: right;'>Quantity</th>";
    myTable += "<th style='width: 100px; color: red; text-align: right;'>Total</th>";
    myTable += "<th style='width: 100px; color: red; text-align: right;'>Add</th>";
    myTable += "<th style='width: 100px; color: red; text-align: right;'>Remove</th>";

    for (i = 0; i < items.length; i++) {
        myTable += "<tr><td style='width: 100px; text-align: right;'>" + (i + 1) + "</td>";
        myTable += "<td style='width: 100px; text-align: right;'>" + items[i] + "</td>";
        myTable += "<td style='width: 100px; text-align: right;'>" + prices[i] + "</td>";
        myTable += "<td style='width: 100px; text-align: right;'>" + quantities[i] + "</td>";
        myTable += "<td style='width: 100px; text-align: right;'>" + totals[i] + "</td>";
        myTable += "<td><button onclick='add_selection(" + i + ")'>Add</button></td>";
        myTable += "<td><button onclick='remove_selection(" + i + ")'>Remove</button></td>";
    }

    myTable += "</table>";
    document.getElementById("demo").innerHTML = myTable;
}

function checkout() {
    if (totalOrderAmt == 0) {
        document.getElementById("total").innerHTML = "Your cart is empty. Please add items to your cart before checking out.";
    } else {
        document.getElementById("total").innerHTML = "Total Amount: R" + totalOrderAmt +
            "<br/><br/>Thank you for shopping with us!";
    }
}

function newCart() {
    quantities = [0, 0, 0, 0];
    totals = [0.0, 0.0, 0.0, 0.0];
    totalOrderAmt = 0;
    document.getElementById("total").innerHTML = "";
    display_all();
}
display_all();