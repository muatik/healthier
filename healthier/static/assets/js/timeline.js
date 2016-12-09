var Timeline = (function(){
    var $timeline = $("#timeline-entries");

    $(".timeline-form-buttons button").click(function(){
        showTimelineForms($(this).attr("data-target"))
    });

    $(".timeline-form-views .btn-hide").click(function(){
        $(".timeline-form-views").hide()
        $(".timeline-form-buttons").fadeIn()
    });

    function insertEntry(entry) {

    };

    var cf = ConsumptionForm($("#consumption-form"), {
        onConsumptionSaved: function(entry){
            prepend_entry(entry)
        }
    });
    var af = ActivityForm($("#activity-form"), {
        onActivitySaved: function(entry){
            prepend_entry(entry)
        }
    });

    function fetch_entries(callback) {
        User.ajax({
            url: '/api/entries/',
            type: 'GET',
            error: callback.onError,
            success: callback.onSuccess,
        });
    }

    function createEntryGroupElement(data) {
        var template = $("#template_entry_group").html();
        Mustache.parse(template);

        var $rendered = $(Mustache.render(template, data));

        // function findPosition () {
        //     var $entry_groups = $(".entry-group", $timeline);
        //     console.log("entry_groups.length", $entry_groups.length)
        //     if ($entry_groups.length == 0) {
        //         // will be the first item after the container's header
        //         return false;
        //     }

        //     var $afterElement = false;
        //     for (var i = $entry_groups.length - 1; i >= 0; i--) {
        //         var $entry_group = $entry_groups[i];
        //         var entryTimestamp = $("input[name='timestamp']", $entry_group).val();
        //         $afterElement = $entry_group;
        //         console.log("dates", data.when, entryTimestamp, data.timestamp)
        //         if (entryTimestamp < data.timestamp) {
        //             console.log("breaking")
        //             break;
        //         }
        //     };

        //     return $afterElement;
        // }

        // var $afterElement = findPosition();
        // console.log($afterElement)
        // if ($afterElement)
        //     $rendered.insertAfter($afterElement);
        // else
        //     $timeline.append($rendered)
        $timeline.append($rendered);
        return $rendered;
    }

    function prepend_entry(data, animation) {

        var template = $("#template_entry").html();
        Mustache.parse(template);

        var datez = moment(data.when).tz(moment.tz.guess())
        data.dateId = "day-" + datez.format('YYYY-MM-DD') // used to group entries
        data.dateOfEntry = datez.format("dddd, D MMM");
        data.timestamp = datez.format("x");
        data.humanized_date = datez.fromNow();
        data.faIcon = (data.category == "a" ? "fa-bicycle" : "fa-cutlery");

        var $container = $("#" + data.dateId)

        if (!$container.length) {
            var $container = createEntryGroupElement(data)
        }
        data.when =datez
        var $rendered = $(Mustache.render(template, data));
        $(".toggle-nutrients", $rendered).click(function(){
            toggleEntryNutrients(data.id);
        });

        if (animation)
            $rendered.hide();

        function findPosition () {
            var $entries = $(".entry", $container);
            var $afterElement = $(".entry-group-header", $container);
            if ($entries.length == 0) {
                // will be the first item after the container's header
                return $afterElement;
            }

            for (var i = $entries.length - 1; i >= 0; i--) {
                var $entry = $entries[i];
                var entryTimestamp = $("input[name='timestamp']", $entry).val();
                if (entryTimestamp < data.timestamp)
                    break;
                $afterElement = $entry;
            };

            return $afterElement;
        }

        $rendered.insertAfter(findPosition());
        if (animation)
            $rendered.toggle("fold")
    }

    function showNutrientsLoader(entryId) {
        // materialadmin.AppCard.addCardLoader("entry-id-" + entryId);
    }
    function removeNutrientsLoader(entryId) {
        // materialadmin.AppCard.removeCardLoader("entry-id-" + entryId);
    }

    function toggleEntryNutrients(entryId) {
        showNutrientsLoader(entryId);
        var $nutrients = $(".nutrients-list", "#entry-id-"+entryId);
        $nutrients.toggle();
        if ($nutrients.is(":hidden")) {
            return;
        }

        User.ajax({
            url: '/api/entries/'+entryId+'/nutrients/',
            type: 'GET',
            always: function() {removeNutrientsLoader(entryId);},
            success: function(res) {
                prepend_entry_nutrients(entryId, res);
                removeNutrientsLoader(entryId);
            },
        });
    }

    function prepend_entry_nutrients(entryId, nutrients) {
        nutrients = {
            "nutrients": nutrients,
            "formattedQuantity": function() {
                return this.quantity.toFixed(3);
            }
        }
        var $container = $(".nutrients-list", "#entry-id-"+entryId);
        var template = $("#template_entry_nutrients").html();
        Mustache.parse(template);
        var rendered = Mustache.render(template, nutrients);
        $container.html("");
        $container.prepend(rendered);
        $container.show();
    };



    function init() {
        fetch_entries({
            onSuccess: function(res) {
                $.map(res, function(entry){prepend_entry(entry, false)})
            },
            onError: function() {
                alert("fetching failed");
            }
        })

    }
    init();
});

$(document).ready(function(){
    t = Timeline();
});

function showTimelineForms(viewName) {
    $(".timeline-form-buttons").hide()
    $(".timeline-form-views").hide()
    $("#"+viewName).slideDown("fast")
}





