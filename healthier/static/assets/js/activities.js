var ActivityForm = (function(container, options) {

    var
        $container = $(container),
        $form = $($container.find("form")[0]),
        $measures = $("#activity_measure"),
        $what = $("#activity_what"),
        $when = $("#activity_when"),
        $quantity = $("#activity_quantity");

    var that = this;

    function reset() {
        $form[0].reset();
        $when.data("DateTimePicker").date(new Date())

    }

    function showLoader() {
        materialadmin.AppCard.addCardLoader($container);
    }

    function hideLoader() {
        materialadmin.AppCard.removeCardLoader($container);
    }

    function init() {
        showLoader();

        $when.datetimepicker({
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
            }
        });

        reset();

        $form.submit(function(event){
            event.preventDefault();
            submit();
        });

        $what.autocomplete({
            lookup: function(query, done) {
                $.ajax({
                    url: '/api/activities/',
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
            onSelect: function (suggestion) {}
        });




        hideLoader()
    };

    function submit() {
        showLoader();
        var a  = $when.data("DateTimePicker").date();
        console.log(a)
        submit_activity(
            $what.val(),
            moment($when.data("DateTimePicker").date()).tz(moment.tz.guess()).format(),
            $quantity.val(),
            $measures.val(),
            {
                "onError": function(e) {
                    hideLoader();
                    toastr.error("consumption couldn't be added. " + e)
                },
                "onSuccess": function (entry) {
                    hideLoader();
                    reset();
                    $('#activityModal').modal('hide');
                    toastr.success("activity has been added successfully. ", "success");
                    if (options["onActivitySaved"])
                        options["onActivitySaved"](entry)
                }
            }
        );
    }


    function submit_activity(what, when, quantity, measure, callback) {
        $.ajax({
            url: '/api/entries/',
            type: 'POST',
            data: {
                "category": "a",
                "what": what,
                "when": when,
                "measure": measure,
                "quantity": quantity,
                "extra": "{}"
            },
            error: function(e) {
                if (callback.onError)
                    callback.onError(e);
            },
            success: function(res) {
                callback.onSuccess(res);
            }
        });
    }


    init();

});

// function init_activity_form() {
//     $('#activity_when_picker').datetimepicker({
//         defaultDate: new Date(),
//         icons:{
//             time: 'fa fa-clock-o',
//             date: 'fa fa-calendar',
//             up: 'fa fa-chevron-up',
//             down: 'fa fa-chevron-down',
//             previous: 'fa fa-chevron-left',
//             next: 'fa fa-chevron-right',
//             today: 'fa fa-screenshot',
//             clear: 'fa fa-trash',
//             close: 'fa fa-remove'
//         }});

//     var $measures = $("#activity_measure"),
//         $ndbno = $("#activity_ndbno"),
//         $what = $("#activity_what"),
//         $when = $("#activity_when_picker"),
//         $quantity = $("#activity_quantity"),
//         $activity_form = $("#activity_form");

//     $('#activity_what').autocomplete({
//         lookup: function(query, done) {
//             $.ajax({
//                 url: '/api/activities/',
//                 type: 'GET',
//                 data: {
//                     q: query,
//                 },
//                 success: function(res) {
//                     var suggestions = $.map(res, function(item){
//                         return {value: item.name, data: item.ndbno}
//                     });
//                     var result = {"suggestions": suggestions};
//                     done(result);
//                 }
//             });
//         },
//         onSelect: function (suggestion) {
//             $ndbno.val(suggestion.data)
//         }
//     });


//     $("#activity_submit").click(function(){
//         submit_activity(
//             $what.val(),
//             moment($when.data("DateTimePicker").date()).format(),
//             $quantity.val(),
//             $measures.val(),
//             {
//                 "onError": function(e) {
//                     $.notify("activity couldn't be added. " + e)
//                 },
//                 "onSuccess": function (entry) {
//                     $('#activityModal').modal('hide');
//                     prepend_entry(entry, true);
//                     show_energy_bar(true);
//                     $.notify("activity has been added successfully.", "success");
//                 }
//             });
//     });



// }


// function submit_activity(what, when, quantity, measure, callback) {
//     $.ajax({
//         url: '/api/entries/',
//         type: 'POST',
//         data: {
//             "category": "a",
//             "what": what,
//             "when": when,
//             "measure": measure,
//             "quantity": quantity
//         },
//         error: function(e) {
//             if (callback.error)
//                 callback.onError(e);
//         },
//         success: function(res) {
//             callback.onSuccess(res);
//         }
//     });
// }


