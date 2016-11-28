(function() {
    'use strict';

    var sbmlController = function submissionsByMonthLocationController(MonitorResource, SpeciesUtil, StringUtil) {

        var ctrl = this;
        var responseData;
        var selectedMonth;
        var selectedLocation;

        ctrl.$onInit = function() {
            requestData();
        }

        //location selection has been changed
        ctrl.locationChange = function(selection) {
            selectedLocation = selection;
            updateData();
        }

        function requestData(){
            ctrl.loading = true;
            MonitorResource.query({queryType: "submissions_by_month_by_location", parameter: ""})
                .$promise.then(handleCatchResponse);
        }

        function updateData() {
            Rx.Observable.from(responseData)
                .filter(info => info.landing_site__c == selectedLocation.toLowerCase().replace(' ', '_'))
                .toMap(x => x.month, x => parseInt(x.count))
                .subscribe(data => {
                    ctrl.dataMap = data
                    ctrl.xTitle = "Month";
                    ctrl.yTitle = "Number of Submissions";
                });
        }

        function handleCatchResponse(data) {
            console.log("@@@@ submission history received");
            responseData = data.map(SpeciesUtil.truncDateToMonth);

            ctrl.loading = false;

            ctrl.locations = d3.set(data, x => x.landing_site__c)
                                .values()
                                .map(StringUtil.cleanAndCapitalise)
                                .sort();

            ctrl.selectedLocation = ctrl.locations[0];
            ctrl.locationChange(ctrl.selectedLocation);
        }
    }

    angular.module('submissionsByMonthLocationModule')
        .component('submissionsByMonthLocation', {
            templateUrl: 'js/submissions_by_month_by_location/submissions_by_month_by_location.template.html',
            controller: sbmlController
        });
    sbmlController.$inject = ["MonitorResource", "SpeciesUtil", "StringUtil"];
})();
