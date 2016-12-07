var ChartCard = (function(card){
    var $card = $(card);

    function getDateOption() {
        var $input = $(".date-range-group .active input", $card);
        return $input.val();
    }

    function getDateRange() {
        var option = getDateOption();
        var start_date;
        var end_date = moment.tz("UTC");
        if (option == "weekly") {
            start_date = moment.tz("UTC").subtract(8, "days")
        } else if (option == "monthly") {
            start_date = moment.tz("UTC").subtract(32, "days")
        } else if (option == "yearly") {
            start_date = moment.tz("UTC").subtract(12, "months")
        }
        return {
            "start_date": start_date,
            "end_date": end_date
        }
    }


    function setContent(content) {
        $card.find(".card-body").html(content)
    }

    function init() {
        $(".date-range-group .btn", $card).click(function(e){
            if (API.onDateRangeChange)
                setTimeout(API.onDateRangeChange, 200) // waits for btn to be .active

        })
        $card.find(".btn-refresh").click(function(e){
            if (API.onRefresh)
                API.onRefresh(e)
        })
    }

    var API = {
        "onRefresh": null,
        "onDateRangeChange": null,
        "getDateRange": getDateRange,
        "getDateOption": getDateOption,
        "setContent": setContent,
    };

    init();

    return API;
});

var EnergyReports = (function(card){
    var container_id = "calorie-chart"
    var $container = $("#calorie-chart");
    var chart;

    var start_date;
    var end_date;

    function fetch_energy_report(category, start_date, end_date, onSuccess) {
        $.ajax({
            url: "/api/reports/energy/",
            method: "GET",
            data: {
                "start_date": start_date,
                "end_date": end_date,
                "category": category
            }
        }).success(onSuccess);
    }

    function add_timeseries(data, series_index) {
        $.map(data, function(i){
            chart.series[series_index].addPoint(
                [moment.tz(i[0], "UTC").valueOf() , i[1]], false, false)
        })
        chart.redraw()
    }

    function draw() {
        var category = "i";
        var format = "YYYY-MM-DD HH:mm:ss"
        start_date = card.getDateRange().start_date.format(format);
        end_date = card.getDateRange().end_date.format(format);

        fetch_energy_report(category, start_date, end_date, function(res){
            add_timeseries(res.data, 0)
        });

        category = "o";
        fetch_energy_report(category, start_date, end_date, function(res){
            add_timeseries(res.data, 1)
        });
    }

    function refresh() {
        $container.html("")
        chart = Highcharts.chart(container_id, {
            chart: {
                type: 'line'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
            },
            yAxis: {
                title: {
                    text: 'Calorie (Kcal)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: true
                }
            },
            series: [{
                name: 'consumed',
                color: "#ea825f",
                data: []
                // data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
            },{
                name: 'burnt',
                color: "#2a82ff",
                data: []
                // data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
            }]
        });

        chart.series[0].data = [];
        chart.series[1].data = [];

        draw();
    }

    function init() {
        card.onDateRangeChange = refresh
        card.onRefresh = refresh
        refresh()
    }

    init();
});

$(document).ready(function(){
    aa =ChartCard($("#calorie-card"));
    t = EnergyReports(ChartCard($("#calorie-card")));
    $('[data-toggle="tooltip"]').tooltip({container: 'body'});
});





// function show_energy_bar(delayed) {

//     fetch_energy_report({"onSuccess": function(report) {
//         var totalEnergy = report.energy.outtake + report.energy.intake
//         var data = {
//             "outtake": {
//                 "quantity": report.energy.outtake,
//                 "percentage": Math.round(report.energy.outtake / totalEnergy * 1000) / 10,
//             },
//             "intake": {
//                 "quantity": report.energy.intake,
//                 "percentage": Math.round(report.energy.intake / totalEnergy * 1000) / 10,
//             }
//         };

//         var template = $("#template_energy_bar").html();
//         Mustache.parse(template);
//         var $rendered = $(Mustache.render(template, data));
//         setTimeout(function() {
//             $("#energy_bar").html($rendered);
//         }, delayed ? 1000 : 0);

//     }})



// }


// function fetch_energy_report(callback) {
//     $.ajax({
//         url: '/api/reports/',
//         type: 'GET',
//         success: callback.onSuccess
//     });
// }

