$(document).ready(function(){
    // show_energy_bar(false);
    init_timeline();
    init_consumption_form();
    init_activity_form();
    $('[data-toggle="tooltip"]').tooltip()
    console.log("document is now ready.")

    $(".btn-consumption").click(showConsumptionView)
    $(".btn-activity").click(showActivityView)
    $(".btn-back").click(showTimeline)
});

function prepareToolbar(btn) {
    if (btn == "back") {
        $(".btn-back").show()
        $(".btn-consumption").hide()
        $(".btn-activity").hide()
    } else {
        $(".btn-back").hide()
        $(".btn-consumption").show()
        $(".btn-activity").show()
    }
}

function showView(view) {
    $("#timeline").hide();
    $("#consumptionView").hide();
    $("#activityView").hide();
    $("#" + view).show();
}

function showTimeline() {
    prepareToolbar("timeline")
    showView("timeline")
}

function showConsumptionView() {
    prepareToolbar("back")
    showView("consumptionView")
}

function showActivityView() {
    prepareToolbar("back")
    showView("activityView");
}

function init_consumption_form() {
    $('#entry_when_picker').datetimepicker({
        defaultDate: new Date(),
        icons:{
            time: 'fa fa-clock-o',
            date: 'fa fa-calendar',
            up: 'fa fa-chevron-up',
            down: 'fa fa-chevron-down',
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        }});

    var $measures = $("#consumption_measure"),
        $ndbno = $("#entry_ndbno"),
        $what = $("#entry_what"),
        $when = $("#entry_when_picker"),
        $quantity = $("#entry_quantity"),
        $consumption_form = $("#consumption_form");

    $('#consumption_what').autocomplete({
        serviceUrl: '/autocomplete/countries',
        lookup: function(query, done) {
            $.ajax({
                url: '/api/food/',
                type: 'GET',
                data: {
                    q: query,
                },
                success: function(res) {
                    var suggestions = $.map(res, function(item){
                        return {value: item.name, data: item.ndbno}
                    });
                    var result = {"suggestions": suggestions};
                    done(result);
                }
            });
        },
        onSelect: function (suggestion) {
            $ndbno.val(suggestion.data)
            update_measures(suggestion.data)
        }
    });



    function update_measures(ndbno) {
        $.ajax({
            url: '/api/food/' + ndbno + '/measures/',
            type: 'GET',
            error: function() {
                alert("something terrible happened :(")
            },
            success: function(res) {
                $measures.html("");
                $.map(res, function(item){
                    $measures.append("<option>" + item + "</option>");
                });
            }
        });
    }

    $("#consumption_submit").click(function(){
        submit_consumption(
            $ndbno.val(),
            $what.val(),
            moment($when.data("DateTimePicker").date()).format(),
            $quantity.val(),
            $measures.val(),
            {
                "onError": function(e) {
                    $.notify("consumption couldn't be added. " + e)
                },
                "onSuccess": function (entry) {
                    $('#consumptionModal').modal('hide');
                    prepend_entry(entry, true);
                    show_energy_bar(true);
                    $.notify("consumption has been added successfully. ", "success");
                }
            });
    });



}




function submit_consumption(ndbno, what, when, quantity, measure, callback) {
    $.ajax({
        url: '/api/entries/',
        type: 'POST',
        data: {
            "category": "c",
            "ndbno": ndbno,
            "what": what,
            "when": when,
            "measure": measure,
            "quantity": quantity
        },
        error: function(e) {
            if (callback.error)
                callback.onError(e);
        },
        success: function(res) {
            callback.onSuccess(res);
        }
    });
}



