Weights = {

}


Weights.getHistory = function(options) {
    User.ajax({
        url: "/api/weights/",
        method: "GET",
    }).success(function(res){
        if (options && options.success)
            options.success(res)
    }).error(function(res){
        if (options && options.error)
            options.error(res)
    });
}

Weights.insertWeight = function(date, weight, options) {
    User.ajax({
        url: "/api/weights/",
        method: "POST",
        data: {"date": date, "weight": weight}
    }).success(function(res){
        if (options && options.success)
            options.success(res)
    }).error(function(res){
        if (options && options.error)
            options.error(res)
    });
}
