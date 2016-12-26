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