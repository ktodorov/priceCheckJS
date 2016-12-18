function analyzePrice() {
    var website = $("#website").val();
    var url = $("#objectUrl").val();

    if (!website || !url) {
        return;
    }

    var analyzer = null;

    $("#loading-div").removeClass('invisible');


    if (website == "emag") {
        analyzer = new EmagAnalyzer(url);
        // analyzer.getPrice().then(function(price) {
        //     $("#objectPrice").val(price);

        //     analyzer.getName().then(function(name) {
        //         $("#objectName").val(name);

        //         analyzer.getImageUrl().then(function(imageUrl) {
        //             $("#objectImage").attr('src', imageUrl);
        //             $("#objectImage").removeClass("invisible");
        //             $("#imageUrl").val(imageUrl);
        //         });
        //     });
        // });


        // emagAnalyzer.getPrice().then(function(price) {
        //     $("#objectPrice").val(price);
        // });
        // emagAnalyzer.getName().then(function(name) {
        //     $("#objectName").val(name);
        // });
        // emagAnalyzer.getImageUrl().then(function(imageUrl) {
        //     $("#objectImage").attr('src', imageUrl);
        //     $("#objectImage").removeClass("invisible");
        //     $("#imageUrl").val(imageUrl);
        // });
    }

    analyzer.getHtmlFromUrl().then(function(html) {
        analyzer.htmlFromUrl = html;
        analyzer.getPrice().then(function(price) {
            $("#objectPrice").val(price);

            analyzer.getName().then(function(name) {
                $("#objectName").val(name);

                analyzer.getImageUrl().then(function(imageUrl) {
                    $("#objectImage").attr('src', imageUrl);
                    $("#objectImage").removeClass("invisible");
                    $("#imageUrl").val(imageUrl);

                    $("#additionalFields").removeClass('invisible');
                    $("#loading-div").addClass('invisible');
                });
            });
        });
    })

}