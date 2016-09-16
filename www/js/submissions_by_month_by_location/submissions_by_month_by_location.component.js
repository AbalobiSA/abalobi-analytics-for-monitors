var catchQuerySubject = new Rx.Subject();
var responseData;

var controller = function submissionsByMonthLocationController($scope, MonitorResource) {

    var ctrl = this;
    var selectedLocation;

    ctrl.$onInit = function() {
        MonitorResource.query({queryType: "submissions_by_month_by_location"})
        .$promise.then(handleCatchResponse);
    }

    //location selection has been changed
    ctrl.locationChange = function(selection) {
        selectedLocation = selection;
        updateData();
    }

    function updateData() {
        console.log("selected location => "+selectedLocation);

        Rx.Observable.from(responseData)
            .map(changeDate)
            .filter(info => info.landing_site__c == selectedLocation)
            .groupBy(info => info.month)
            .flatMap(aggregateMonth)
            .toMap(x => x.month, x => x.count)
            .subscribe(data => {
                ctrl.dataMap = data
                ctrl.xTitle = "Month";
                ctrl.yTitle = "Number of Submissions";
            });
    }

    function handleCatchResponse(data) {
        console.log("@@@@ submission history received");
        responseData = data;

        Rx.Observable.from(data)
            .groupBy(info => info.landing_site__c)
            .map(landingSightGroup => landingSightGroup.key)
            .toArray()
            .subscribe(locationList => ctrl.locations = locationList);
    }

    function changeDate(info) {
        info.month = info.odk_date__c.substring(0, 7);
        return info;
    }

    function aggregateMonth(infoObs) {
        return infoObs
                .count()
                .map(function(c){ return {month: infoObs.key, count: c}});

    }

    function sumSpecies(speciesGroup) {
        var init = {species: speciesGroup.key, totalKg: 0.0};
        return speciesGroup.reduce((acc, entry) => {
            acc.totalKg += entry[selectedCalculationMethod]; return acc;
        }, init);
    }
}

angular.module('submissionsByMonthLocationModule')
    .component('submissionsByMonthLocation', {
        templateUrl: 'js/submissions_by_month_by_location/submissions_by_month_by_location.template.html',
        controller: controller
    });
