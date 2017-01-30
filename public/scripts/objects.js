$(document).ready(function() {
    var lastCheckedObjects = $("td[data-property='lastChecked']");
    lastCheckedObjects.each(function(index) {
        var dataValue = $(this).attr("data-value");
        var formattedDataValue = formatDate(new Date(dataValue));
        $(this).text(formattedDataValue);
    }, this);


    var productRows = $(".productRow");
    productRows.each(function(index, productRow) {
        refreshProductPrice(productRow);
    });
})

function refreshProductPrice(productRow) {
    var oldPriceColumn = $(productRow).find("td[data-property='oldPrice']");
    var newPriceColumn = $(productRow).find("td[data-property='newPrice']");
    var priceColumn = $(productRow).find("td[data-property='price']");
    var priceDifferenceColumn = $(productRow).find("td[data-property='priceDifference']");

    if (oldPriceColumn.text() != newPriceColumn.text()) {
        priceColumn.hide();
        oldPriceColumn.show();
        newPriceColumn.show();
        priceDifferenceColumn.show();

        var oldPrice = parseFloat(oldPriceColumn.text());
        var newPrice = parseFloat(newPriceColumn.text());
        if (newPrice > oldPrice) {
            priceDifferenceColumn.find("i.price-up").show();
            priceDifferenceColumn.find("i.price-down").hide();
        } else {
            priceDifferenceColumn.find("i.price-up").hide();
            priceDifferenceColumn.find("i.price-down").show();
        }

        priceDifferenceColumn.find("span.price-difference-span").text(newPrice - oldPrice);
    } else {
        priceColumn.show();
        oldPriceColumn.hide();
        newPriceColumn.hide();
        priceDifferenceColumn.hide();
    }
}

function getObjectPrice(id) {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/getObjectPrice',
        data: {
            id: '123' //id
        },
        success: function(price) {
            console.log('price returned: ', price);
            var objectRow = $("tr[object-id='" + id + "']");
            if (objectRow) {
                console.log('object row found');
            }
        }
    });
}

function analyzeObject() {
    var url = $("#objectUrl").val();
    $("#loading-div").removeClass('invisible');

    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/analyzeObject',
        data: {
            url: url
        },
        success: function(result) {
            var price = result.price;
            $("#objectPrice").val(price);

            var objectCurrency = result.currency;
            $("#objectCurrency").val(objectCurrency);

            var objectCurrencySymbol = result.currencySymbol;
            $("#objectCurrencySymbol").val(objectCurrencySymbol);

            var name = result.name;
            $("#objectName").val(name);

            var imageUrl = result.imageUrl;
            $("#objectImage").attr('src', imageUrl);
            $("#imageUrl").val(imageUrl);

            $("#objectImage").removeClass("invisible");
            $("#additionalFields").removeClass('invisible');
            $("#loading-div").addClass('invisible');
        }
    });
}

function pageSizeChanged(object) {
    var size = parseInt(object.value);
    var currentUrl = window.location.href;
    var newUrl = updateQueryStringParameter(currentUrl, "take", size);
    newUrl = updateQueryStringParameter(newUrl, "skip", 0);
    window.location.href = newUrl;
}

function updateQueryStringParameter(uri, key, value) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
        return uri + separator + key + "=" + value;
    }
}

function changeSelection(value) {
    $("#pagingSizeSelect").val(value);
}

function changeSearchText(value) {
    if (value && value != "undefined") {
        $("#search-input").val(value);
    }
}

function changePage(size, pageRequested) {
    var skip = (pageRequested - 1) * size;
    var currentUrl = window.location.href;
    var newUrl = updateQueryStringParameter(currentUrl, "skip", skip);
    newUrl = updateQueryStringParameter(newUrl, "take", size);
    window.location.href = newUrl;
}

function search(currentSearchText) {
    var searchText = $("#search-input").val();
    if (searchText == currentSearchText) {
        return;
    }
    var currentUrl = window.location.href;
    var newUrl = updateQueryStringParameter(currentUrl, "search", searchText);
    newUrl = updateQueryStringParameter(newUrl, "skip", 0);
    window.location.href = newUrl;
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product')) {
        window.location.href = window.location.href + "/delete/" + productId
    }
}

function formatDate(date) {
    return ("0" + date.getDate()).slice(-2) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
        date.getFullYear() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2);
}

function refreshProduct(button, productId) {
    $.ajax({
        url: "/refreshProduct",
        data: {
            productId: productId
        },
        type: "GET",
        success: function(updatedProduct) {
            debugger;
            if (!updatedProduct) {
                return;
            }
            var productRow = $(button).closest("tr.productRow");
            productRow.find("td[data-property='name']").text(updatedProduct.name);
            productRow.find("td[data-property='lastChecked']").text(formatDate(new Date(updatedProduct.lastChecked)));
            productRow.find("td[data-property='newPrice']").text(updatedProduct.newPrice);

            refreshProductPrice(productRow);
        }
    });
}