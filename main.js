


$(function () {
    //when document ready ask for API information and do coinsListArray func
    $(document).ready(async function showCoins() {
        const coinsList = "https://api.coingecko.com/api/v3/coins/list";
        $("#coins").html(`<br><div class="progress">
            <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">Loading...</div>
          </div><br> `)
        try {
            const api = await getAPIAsync(coinsList);
            coinsListArray(api)
        }
        catch (err) {
            console.log("Error: " + err.status);
        }
    });

    function getAPIAsync(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                success: data => resolve(data),
                error: err => reject(err),
            })
        });
    }
    //this is coinsListArray func: append information 
    function coinsListArray(coinsList) {
        $("#coins").html("")
        for (const coin of coinsList) {
            const symbol = (coin.symbol).toUpperCase()
            $("#coins").append(
                ` <div class="card coinArea">
                         <div class="card-body">
                             <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input tglBtn " id="${coin.symbol}" >
                                <label class="custom-control-label  " for="${coin.symbol}"></label>
                                <span>${symbol} </span>
                             </div>
                             <h1>${coin.id}</h1>
                             <p>
                              <button class="btn border-primary moreInfoBtn" id="${coin.id}" data-toggle="collapse" href="#collapse${coin.id}" role="button"
                                aria-expanded="false" aria-controls="collapseExample">
                                More Info
                              </button>
                             </p>
                             <div class="collapse " id="collapse${coin.id}">
                              <div class="card card-body moreInfo" id="${coin.id}">
                               <div id="progressBar${coin.id}"></div>
                                <div class="info" id="img${coin.id}"></div>
                                 <div class="infoc ">
                                    <div id="usd${coin.id}"></div>
                                    <div id="eur${coin.id}"></div>
                                    <div id="ils${coin.id}"></div>
                                 </div>
                               </div>
                              </div>
                             </div>
                         </div>
                     </div>`
            ) //end of append

            // checked if this coin saved on localStorage show as `checked`
            const savedCoinsArray = localStorage.getItem("coin")
            let coinsAraay = savedCoinsArray === null ? [] : JSON.parse(savedCoinsArray)
            for (let i = 0; i < coinsAraay.length; i++) {
                if (coinsAraay[i].coin === `${coin.symbol}`)
                    $(`#${coin.symbol}`).attr('checked', 'checked')
            }

        } //end of the main for-loop

    } //end of coinListArray function



    //toggle btn - using localStorage saving for user next time open this web 
    $(document).on("click", ".tglBtn", function () {
        const tglId = $(this).attr("id")

        //if user click for `unchecked` remove it from saved coins list:
        if (this.checked != true) {
            const savedCoinsArray = localStorage.getItem("coin")
            const coinsAraay = JSON.parse(savedCoinsArray)
            for (let i = 0; i < coinsAraay.length; i++) {
                if (coinsAraay[i].coin === tglId)
                    coinsAraay.splice(i, 1)
            }
            // Save coins list array without the removed coin to localStorage:
            const savedCoinsArrayJson = JSON.stringify(coinsAraay)
            localStorage.setItem("coin", savedCoinsArrayJson)
        }
        //if when click the coin become checked 
        else {
            const coinId = tglId
            const savedCoins = {
                coin: coinId
            }
            //get saved coins from local storage and push the new coin to the array:
            const savedCoinJson = localStorage.getItem("coin")
            const savedCoinsArray = savedCoinJson === null ? [] : JSON.parse(savedCoinJson)

            // if user choose more then 5 coins
            if (savedCoinsArray.length >= 5) {

                $("#mdalContent").empty()
                //  for-loop add the content to the modal:
                for (let i = 0; i < savedCoinsArray.length; i++) {
                    $("#mdalContent").append(
                        `<div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input tglBtn " checked="checked" id="tgl${savedCoinsArray[i].coin}" >
                        <label class="custom-control-label  " for="tgl${savedCoinsArray[i].coin}"></label>
                        <span>${savedCoinsArray[i].coin} </span>
                             </div>`)

                    $(`#tgl${savedCoinsArray[i].coin}`).on("change", () => {
                        $(`#${savedCoinsArray[i].coin}`).prop('checked', false)
                        //remove the coin ans add the choosen coin
                        savedCoinsArray.splice(i, 1)
                        savedCoinsArray.push(savedCoins)
                        const savedCoinsArrayJson = JSON.stringify(savedCoinsArray)
                        localStorage.setItem("coin", savedCoinsArrayJson)
                        //close the modal after user choose coin to remove
                        $('#myModal').modal('hide')
                    })
                }
                //show Modal:
                $('#myModal').modal()


                //  on click modal "close" btn using .off() to avoid duplicate event calling:
                $(".closeBtn").off().on("click", function () {
                    $(`#${tglId}`).prop('checked', false)
                })

            }
            else { savedCoinsArray.push(savedCoins) }
            // Save coin list array to localStorage
            const savedCoinsArrayJson = JSON.stringify(savedCoinsArray)
            localStorage.setItem("coin", savedCoinsArrayJson)
        }
    });


    //on click more info btn :
    $(document).on("click", ".moreInfoBtn", function (event) {
        let coinId = $(this).attr("id")
        $(`#img${coinId}`).html("")
        $(`#usd${coinId}`).html("")
        $(`#eur${coinId}`).html("")
        $(`#ils${coinId}`).html("")

        //if user clicked on this btn for close -dont ask for API again:
        if ($(`#collapse${coinId}`).hasClass("collapse show") === true) {
            console.log("open")
            event.preventDefault()
        }
        else {
            $(`#progressBar${coinId}`).append(`<br><div class="progress">
               <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">Loading...</div>
               </div><br></br>`)
            sessionStorage.getItem(`${coinId}`)
            const savedTime = sessionStorage.getItem(`time${coinId}`)
            const currentTime = new Date().getTime() / 1000

            let backUpCoin = JSON.parse(sessionStorage.getItem(coinId));
            if (sessionStorage.getItem(coinId) !== null && (currentTime - savedTime) < 120) {
                console.log("from local");

                $(`#progressBar${coinId}`).html("")
                $(`#img${coinId}`).append(`<img src="${backUpCoin.image.thumb}" alt="">`)
                const usd = backUpCoin.market_data.current_price.usd
                $(`#usd${coinId}`).append(`${usd.toFixed(3)} $`)
                const eur = backUpCoin.market_data.current_price.eur
                $(`#eur${coinId}`).append(`${eur.toFixed(3)} €`)
                const ils = backUpCoin.market_data.current_price.ils
                $(`#ils${coinId}`).append(`${ils.toFixed(3)} ₪`)
            }
            else {
                console.log("from Ajax");

                let coinAPI = `https://api.coingecko.com/api/v3/coins/${coinId}`;

                $(async function getCoinInfo() {

                    $(`#progressBar${coinId}`).append(`<br><div class="progress">
                           <div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">Loading...</div>
                           </div><br></br>`)

                    try {
                        const coinapis = await getAPIAsync(coinAPI);
                        sessionStorage.setItem(`${coinId}`, JSON.stringify(coinapis));
                        sessionStorage.setItem(`time${coinId}`, (new Date().getTime()) / 1000);

                        $(`#progressBar${coinId}`).html("")
                        $(`#img${coinId}`).append(`<img src="${coinapis.image.thumb}" alt="">`)
                        const usd = coinapis.market_data.current_price.usd
                        $(`#usd${coinId}`).append(`${usd.toFixed(3)} $`)
                        const eur = coinapis.market_data.current_price.eur
                        $(`#eur${coinId}`).append(`${eur.toFixed(3)} €`)
                        const ils = coinapis.market_data.current_price.ils
                        $(`#ils${coinId}`).append(`${ils.toFixed(3)} ₪`)

                    }
                    catch (err) {
                        console.log("Error: " + err.status);
                    }
                })
            }
        }

    });


    //search button
    $(document).on("click", "#searchBtn", async function () {
        try {
            let coinName = $("#myInput").val();
            $("#myInput").val("");

            if (coinName === "" || !isNaN(coinName)) {
                alert("please insert coin name");
                return;
            }

            let coinD = await getCoin(coinName.toLowerCase());
            console.log(coinName)
            let arr = [coinD];
            coinsListArray(arr);
            $("#showAllCoins").css("display", "inline")

        } catch (err) {
            alert("please insert valid coin name");
            console.log(err);
        }
    });

    function getCoin(coin) {
        return new Promise((resolve, reject) => {
            $.ajax({

                url: `https://api.coingecko.com/api/v3/coins/${coin}`,
                success: data => resolve(data),
                error: err => reject(err),
            });
        })
    }
})



$("#showAllCoins").on("click", function () {
    showCoins()
})

//navigation 
$("#menu > a").on("click", function (event) {
    event.preventDefault();
    const fileName = $(this).attr("href");
    if (fileName !== "#") {
        $.ajax({
            url: fileName,
            success: function (response) {
                if (fileName === "LiveReports.html") {


                    fillContentHtml(response)
                    liveReport()
                    $(".form-inline").hide()
                }

                if (fileName === "about.html") {
                    fillContentHtml(response)
                    $(".form-inline").hide()
                }

                else {
                    fillContentHtml(response)
                }
            },

            error: (err) => console.error(err),
        });
    }
    else {
        location.reload()
    }


    function fillContentHtml(htmlContent) {
        $("section").html(htmlContent);
    }

});


function liveReport() {
    let IntervalId;
    //get user coins list from localStorage 
    const savedCoinJson = localStorage.getItem("coin")
    let savedCoinsArray = savedCoinJson === null ? [] : JSON.parse(savedCoinJson)

    if (savedCoinsArray.length === 0) {
        alert("Please select up to 5 coins to display on the graph")
        location.reload()
    }

    else {
        let arrCoinRealTime1 = [];
        let arrCoinRealTime2 = [];
        let arrCoinRealTime3 = [];
        let arrCoinRealTime4 = [];
        let arrCoinRealTime5 = [];
        let arrCoinRealTimeName = [];
        let coinsList = ""

        for (let i = 0; i < savedCoinsArray.length; i++) {
            if (i != savedCoinsArray.length - 1) {
                coinsList += `${savedCoinsArray[i].coin},`
            }
            else {
                coinsList += `${savedCoinsArray[i].coin}`
            }
        }

        function getData() {
            $.ajax({
                type: "GET",
                url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinsList}&tsyms=USD`,
                success: function (result) {
                    if (result.Response == "Error") {
                        clearInterval(IntervalId);
                        $("#LRprogressBar").hide();
                        $('#LiveReportContainer').html(`<div class="liveReportPageMSG"> <h2>No data on selected currencies - please try other coins!</h2> </div>`);
                    }
                    else {
                        $('#LiveReportContainer').html(` <div id="chartContainer" ></div>`);
                        let dateNow = new Date();
                        let counter = 1;
                        arrCoinRealTimeName = [];
                        for (let key in result) {
                            if (counter == 1) {
                                arrCoinRealTime1.push({ x: dateNow, y: result[key].USD });
                                arrCoinRealTimeName.push(key);
                            }

                            if (counter == 2) {
                                arrCoinRealTime2.push({ x: dateNow, y: result[key].USD });
                                arrCoinRealTimeName.push(key);
                            }

                            if (counter == 3) {
                                arrCoinRealTime3.push({ x: dateNow, y: result[key].USD });
                                arrCoinRealTimeName.push(key);
                            }

                            if (counter == 4) {
                                arrCoinRealTime4.push({ x: dateNow, y: result[key].USD });
                                arrCoinRealTimeName.push(key);
                            }

                            if (counter == 5) {
                                arrCoinRealTime5.push({ x: dateNow, y: result[key].USD });
                                arrCoinRealTimeName.push(key);
                            }

                            counter++;
                        }

                        createGraph();

                        $("#LRprogressBar").hide()

                    }

                }

            })

        }

        IntervalId = setInterval(() => {
            getData();
        }, 2000);

        function createGraph() {

            var chart = new CanvasJS.Chart("chartContainer", {
                exportEnabled: true,
                animationEnabled: false,

                title: {
                    text: `Price of: ${coinsList} in USD`
                },
                axisX: {
                    valueFormatString: "HH:mm:ss",
                },
                axisY: {
                    title: "Coin Value",
                    suffix: "$",
                    titleFontColor: "#4F81BC",
                    lineColor: "#4F81BC",
                    labelFontColor: "#4F81BC",
                    tickColor: "#4F81BC",
                    includeZero: true,
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    itemclick: toggleDataSeries,
                },
                data: [{
                    type: "spline",
                    name: arrCoinRealTimeName[0],
                    showInLegend: true,
                    xValueFormatString: "HH:mm:ss",
                    dataPoints: arrCoinRealTime1

                },
                {
                    type: "spline",
                    name: arrCoinRealTimeName[1],
                    showInLegend: true,
                    xValueFormatString: "HH:mm:ss",
                    dataPoints: arrCoinRealTime2

                },
                {
                    type: "spline",
                    name: arrCoinRealTimeName[2],
                    showInLegend: true,
                    xValueFormatString: "HH:mm:ss",
                    dataPoints: arrCoinRealTime3

                },
                {
                    type: "spline",
                    name: arrCoinRealTimeName[3],
                    showInLegend: true,
                    xValueFormatString: "HH:mm:ss",
                    dataPoints: arrCoinRealTime4

                },
                {
                    type: "spline",
                    name: arrCoinRealTimeName[4],
                    showInLegend: true,
                    xValueFormatString: "HH:mm:ss",
                    dataPoints: arrCoinRealTime5

                }]

            });

            chart.render();

            function toggleDataSeries(e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                }
                else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            }
        }
    }
}

