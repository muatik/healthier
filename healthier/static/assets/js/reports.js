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
        if (option == "today") {
            start_date = moment.tz("UTC").startOf('day')
        } else if (option == "weekly") {
            start_date = moment.tz("UTC").subtract(7, "days")
        } else if (option == "monthly") {
            start_date = moment.tz("UTC").subtract(31, "days")
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
        User.ajax({
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
            credits: {
                enabled: false
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



var WeightHistoryReports = (function(card){
    var container_id = "weight-chart"
    var $container = $("#weight-chart");
    var chart;

    // @TODO: needs to be parametric
    var height = User.userprofile.height / 100; // in meters

    var start_date;
    var end_date;

    function fetch_weight_history_report(start_date, end_date, onSuccess) {
        User.ajax({
            url: "/api/weights/",
            method: "GET",
            data: {
                "start_date": start_date,
                "end_date": end_date,
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
        var format = "YYYY-MM-DD HH:mm:ss"
        start_date = card.getDateRange().start_date.format(format);
        end_date = card.getDateRange().end_date.format(format);

        fetch_weight_history_report(start_date, end_date, function(res){

            // data manupulation: objects to arrays
            for (var i = res.length - 1; i >= 0; i--) {
                res[i] = [res[i].date, res[i].weight]
            };

            var BMI = [];
            $.map(res, function(i){
                BMI.push([
                    i[0],
                    i[1] / (height * height)
                ])
            });

            add_timeseries(res, 0)
            add_timeseries(BMI, 1)
        });
    }

    function refresh() {
        $container.html("")
        chart = Highcharts.chart(container_id, {
            chart: {
                type: 'scatter'
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
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} kg',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'Weight (Kg)',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }, { // Secondary yAxis
                title: {
                    text: 'BMI',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                min: 10,
                max: 40,
                plotLines: [{
                    value: 24.9,
                    color: '#7b9af7',
                    dashStyle: 'shortdash',
                    width: 1,
                    label: {
                        text: ''
                    }
                }],

                opposite: true
            }],
            plotOptions: {
                scatter: {
                    tooltip: {
                        headerFormat: '<b>{series.name}</b><br>',
                        pointFormat: '{point.x:%d %b %Y}<br>{point.y:.2f}'
                    },
                },
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: true
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'weight',
                color: "#ea825f",
                data: []
                // data: [7.0, 6.9, 9.5, 14.5, 18.4, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
            },{
                name: 'BMI',
                yAxis: 1,
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


var ConsumedNutrientsReports = (function(card){
    var container_id = "nutrients-card"
    var $container = $("#nutrients-card .card-body");
    var chart;

    var dateRange;
    var start_date;
    var end_date;

    var recommendations = [ // daily recommended nutrient
      {
        "amount": 65,
        "label": "Total fat",
        "unit": "g",
        "usda_category": "Proximates",
        "usda_label": "Total lipid (fat)"
      },
      {
        "amount": 20,
        "label": "Saturated fatty acids",
        "unit": "g",
        "usda_category": "Lipids",
        "usda_label": "Fatty acids, total saturated"
      },
      {
        "amount": 300,
        "label": "Cholesterol",
        "unit": "mg",
        "usda_category": "Proximates",
        "usda_label": "Cholesterol"
      },
      {
        "amount": 2400,
        "label": "Sodium",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Sodium, Na"
      },
      {
        "amount": 3500,
        "label": "Potassium",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Potassium, K"
      },
      {
        "amount": 300,
        "label": "Total carbohydrate",
        "unit": "g",
        "usda_category": "Proximates",
        "usda_label": "Carbohydrate, by difference"
      },
      {
        "amount": 25,
        "label": "Fiber",
        "unit": "g",
        "usda_category": "Proximates",
        "usda_label": "Fiber, total dietary"
      },
      {
        "amount": 50,
        "label": "Protein",
        "unit": "g",
        "usda_category": "Proximates",
        "usda_label": "Protein"
      },
      {
        "amount": 5000,
        "label": "Vitamin A",
        "unit": "IU",
        "usda_category": "Vitamins",
        "usda_label": "Vitamin A, IU"
      },
      {
        "amount": 60,
        "label": "Vitamin C",
        "unit": "mg",
        "usda_category": "Vitamins",
        "usda_label": "Vitamin C, total ascorbic acid"
      },
      {
        "amount": 1000,
        "label": "Calcium",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Calcium, Ca"
      },
      {
        "amount": 18,
        "label": "Iron",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Iron, Fe"
      },
      {
        "amount": 400,
        "label": "Vitamin D",
        "unit": "IU",
        "usda_category": "Vitamins",
        "usda_label": "Vitamin D"
      },
      {
        "amount": 20,
        "label": "Vitamin E",
        "unit": "mg",
        "usda_category": "Vitamins",
        "usda_label": "Vitamin E (alpha-tocopherol)"
      },
      {
        "amount": 80,
        "label": "Vitamin K",
        "unit": "µg",
        "usda_category": "Vitamins",
        "usda_label": "Vitamin K (phylloquinone)"
      },
      {
        "amount": 1.5,
        "label": "Thiamin",
        "unit": "mg",
        "usda_category": "Vitamins",
        "usda_label": "Thiamin"
      },
      {
        "amount": 1.7,
        "label": "Riboflavin",
        "unit": "mg",
        "usda_category": "Vitamins",
        "usda_label": "Riboflavin"
      },
      {
        "amount": 20,
        "label": "Niacin",
        "unit": "mg",
        "usda_category": "Vitamins",
        "usda_label": "Niacin"
      },
      {
        "amount": 2,
        "label": "Vitamin B6",
        "unit": "mg",
        "usda_category": "Vitamins",
        "usda_label": "Vitamin B-6"
      },
      {
        "amount": 400,
        "label": "Folate",
        "unit": "µg",
        "usda_category": "Vitamins",
        "usda_label": "Folate, DFE"
      },
      {
        "amount": 6,
        "label": "Vitamin B12",
        "unit": "µg",
        "usda_category": "Vitamins",
        "usda_label": "Vitamin B-12"
      },
      {
        "amount": 1000,
        "label": "Phosphorus",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Phosphorus, P"
      },
      {
        "amount": 400,
        "label": "Magnesium",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Magnesium, Mg"
      },
      {
        "amount": 15,
        "label": "Zinc",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Zinc, Zn"
      },
      {
        "amount": 2,
        "label": "Copper",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Copper, Cu"
      },
      {
        "amount": 2,
        "label": "Manganese",
        "unit": "mg",
        "usda_category": "Minerals",
        "usda_label": "Manganese, Mn"
      }
    ]
    function fetch_nutrients_report(start_date, end_date, onSuccess) {
        User.ajax({
            url: "/api/reports/nutrients/",
            method: "GET",
            data: {
                "start_date": start_date,
                "end_date": end_date,
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

    function render(report) {
        var entry_template = $("#template_nutrient_entry").html();
        Mustache.parse(entry_template);

        function get_consumption(label) {
            for (var i = report.data.length - 1; i >= 0; i--) {
                if (report.data[i].label == label)
                    return parseFloat(report.data[i].value);
            };
            return 0;
        }

        var day_diff = dateRange.end_date.diff(dateRange.start_date, "days");
        if (day_diff == 0)
            day_diff = 1 // to avoid zero multiply

        $.map(recommendations, function(nutrient){
            var recommended = nutrient.amount * day_diff;
            nutrient.consumption =
                get_consumption(nutrient.usda_label).toFixed(2);

            if (nutrient.consumption == 0)
                nutrient.percentage = 0
            else
                nutrient.percentage = Math.round(
                    (nutrient.consumption * 100 ) / recommended);

            if (nutrient.percentage > 100) {
                nutrient.percentage = 100;
                nutrient.bar_class = "progress-bar-primary-dark"
            }
            else {
                nutrient.bar_class = "progress-bar-warning"
            }

            nutrient.label = nutrient.label.toLocaleUpperCase()
            nutrient.tooltip = recommended + " " + nutrient.unit + " recommended, " + nutrient.consumption + " " + nutrient.unit + " consumed";

            var $rendered = $(Mustache.render(entry_template, nutrient));
            $container.append($rendered)
        });
        $('[data-toggle="tooltip"]').tooltip({container: 'body'});
    }

    function refresh() {
        $container.html("")

        var format = "YYYY-MM-DD HH:mm:ss"
        dateRange = card.getDateRange();
        start_date = dateRange.start_date.format(format);
        end_date = dateRange.end_date.format(format);
        fetch_nutrients_report(start_date, end_date, function(res){
            render(res)
        });

    }

    function init() {
        card.onDateRangeChange = refresh
        card.onRefresh = refresh
        refresh()
    }

    init();
});

var BMIReport = (function(){
    var $card = $("#BMI-card");

    function updateView(weight) {

        var height = User.userprofile.height / 100;
        var message_class, weight_change, advice="";
        var BMI = weight / (height * height);
        /*
        Underweight = <18.5
        Normal weight = 18.5–24.9
        Overweight = 25–29.9
        Obesity = BMI of 30 or greater
        */
        if (BMI < 18.5) {
            message_class = "text-danger";
            message = "You're Underweight!";
            weight_change = Math.ceil(18.5 * (height * height))+ 1;
            advice = 'You need to gain at least '+(weight_change-weight)+' Kg';
        } else if (BMI < 24.9) {
            message_class = "text-success";
            message = "You're quite normal.";
        } else if (BMI < 29.9) {
            message_class = "text-danger";
            message = "You're overweight.";
            weight_change = Math.ceil(24.9 * (height * height)) - 1;
            advice = 'You need to lose at least '+(weight-weight_change)+' Kg';
        } else {
            message_class = "text-danger";
            message = "You're obese!";
            weight_change = Math.ceil(24.9 * (height * height)) - 1;
            advice = 'You need to lose at least '+(weight-weight_change)+' Kg';
        }

        var content = '<span class="'+message_class+'">' + message + '</span>'
            +'<small>Your BMI is '+BMI.toFixed(1)+'. ' +advice+ '</small>'
        $(".content", $card).html(content);
    }

    Weights.getHistory({
        success: function(weights) {
            updateView(weights[0].weight);
        }
    })


});

$(document).ready(function(){

    materialadmin.AppCard.addCardLoader($("#content"));

    User.onAuthenticated(function(){
        EnergyReports(ChartCard($("#calorie-card")));
        WeightHistoryReports(ChartCard($("#weight-card")));
        ConsumedNutrientsReports(ChartCard($("#nutrients-card")));
        BMIReport();
        $('[data-toggle="tooltip"]').tooltip({container: 'body'});

        setTimeout(function(){
                materialadmin.AppCard.removeCardLoader($("#content"));
            }, 1500);
    });

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
//     User.ajax({
//         url: '/api/reports/',
//         type: 'GET',
//         success: callback.onSuccess
//     });
// }

