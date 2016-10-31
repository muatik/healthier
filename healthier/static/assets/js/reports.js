
function show_energy_bar(delayed) {

    fetch_energy_report({"onSuccess": function(report) {
        var totalEnergy = report.energy.outtake + report.energy.intake
        var data = {
            "outtake": {
                "quantity": report.energy.outtake,
                "percentage": Math.round(report.energy.outtake / totalEnergy * 1000) / 10,
            },
            "intake": {
                "quantity": report.energy.intake,
                "percentage": Math.round(report.energy.intake / totalEnergy * 1000) / 10,
            }
        };

        var template = $("#template_energy_bar").html();
        Mustache.parse(template);
        var $rendered = $(Mustache.render(template, data));
        setTimeout(function() {
            $("#energy_bar").html($rendered);
        }, delayed ? 1000 : 0);

    }})



}


function fetch_energy_report(callback) {
    $.ajax({
        url: '/api/reports/',
        type: 'GET',
        success: callback.onSuccess
    });
}

