$(document).ready(function(){
    $(".timeline-form-buttons button").click(function(){
        showTimelineForms($(this).attr("data-target"))
    });

    $(".timeline-form-views .btn-hide").click(function(){
        $(".timeline-form-views").hide()
        $(".timeline-form-buttons").fadeIn()
    });
})

function showTimelineForms(viewName) {
    $(".timeline-form-buttons").hide()
    $(".timeline-form-views").hide()
    $("#"+viewName).slideDown("fast")
}








function init_timeline() {
    var $timeline = $("#timeline");
    fetch_entries({
        onSuccess: function(res) {
            $.map(res, function(entry){prepend_entry(entry, false)})
        },
        onError: function() {
            alert("fetching failed");
        }
    })

}

function prepend_entry(data, animation) {
    var template = $("#template_entry").html();
    Mustache.parse(template);
    data.humanized_date = moment(data.when).fromNow();
    data.faIcon = (data.category == "c" ? "fa-cutlery" : "fa-bicycle");

    var $rendered = $(Mustache.render(template, data));
    $(".toggle-detil", $rendered).click(function(){
        toggleEntryNutrients(data.id);
    });

    if (animation)
        $rendered.hide();
    $("#entries").prepend($rendered);
    if (animation)
        $rendered.toggle("fold")
}


function fetch_entries(callback) {
    $.ajax({
        url: '/api/entries/',
        type: 'GET',
        error: callback.onError,
        success: callback.onSuccess,
    });
}

function toggleEntryNutrients(entryId) {
    var $nutrients = $(".nutrients", "#entry-id-"+entryId);
    $nutrients.toggle();
    if ($nutrients.is(":hidden")) {
        return;
    }

    $.ajax({
        url: '/api/entries/'+entryId+'/nutrients/',
        type: 'GET',
        success: function(res) {
            prepend_entry_nutrients(entryId, res);
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
    var $container = $(".nutrients", "#entry-id-"+entryId);
    var template = $("#template_entry_nutrients").html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, nutrients);
    $container.html("");
    $container.prepend(rendered);
}