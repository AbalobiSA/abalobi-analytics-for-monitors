(function() {
    'use strict';

    var mbdController = function monthlyBoatDistributionController(MonitorResource, SpeciesUtil, StringUtil, ResultsUtil) {

        var ctrl = this;
        var responseData;
        var boatTypes = [];

        ctrl.$onInit = function() {
            requestData();
        }

        ctrl.locationChange = function(selectedLocation) {
            ctrl.selectedLocation = selectedLocation;
            updateData();
        }

        function updateData(){
            Rx.Observable.from(responseData)
                .filter(info => info.landing_site__c == ctrl.selectedLocation.toLowerCase().replace(' ', '_'))
                .groupBy(info => info.month)
                .flatMap(aggregateBoatType)
                .toArray()
                .map(data => ResultsUtil.applyMapThreshold(data, 0.001))
                .subscribe(x => {
                    ctrl.data = x;
                    ctrl.xTitle = 'Month';
                    ctrl.yTitle = 'Number of Boats';
                });
        }

        function requestData(){
            ctrl.loading = true;
            MonitorResource.query({queryType: "total_boat_types_by_month", parameter: ""})
                .$promise.then(handleCatchResponse);
        }

        function handleCatchResponse(data) {
            responseData = data.map(SpeciesUtil.truncDateToMonth);

            ctrl.loading = false;

            boatTypes = d3.set(data, x => x.boat_type)
                            .values()
                            .sort(StringUtil.otherAtEndcomparator);

            ctrl.locations = d3.set(data, x => x.landing_site__c)
                                .values()
                                .map(StringUtil.cleanAndCapitalise)
                                .sort(StringUtil.otherAtEndcomparator);

            ctrl.selectedLocation = ctrl.locations[0];
            ctrl.locationChange(ctrl.selectedLocation);
        }

        function changeDate(info) {
            info.month = info.odk_date__c.substring(0, 7);
            return info;
        }

        function aggregateBoatType(boatTypeObs) {
            var records = new Map();
            for(var i = 0; i < boatTypes.length; i++){
                records.set(boatTypes[i], 0);
            }

            return boatTypeObs
                .reduce(collectTotal, records)
                .map(summedRecords => {
                    return createRecord(boatTypeObs.key, summedRecords);
                });
        }

        function collectTotal(acc, entry){
            acc.set(entry.boat_type, entry.count);
            return acc;
        }

        function createRecord(key, totals){
            var rec = {key: key};
            totals.forEach((v, k) => rec[k] = v);
            return rec;
        }
    }

    angular.module('monthlyBoatDistributionModule')
        .component('monthlyBoatDistributionData', {
            templateUrl: 'js/monthly-boat-distribution/monthly-boat-distribution.template.html',
            controller: mbdController
        });
    mbdController.$inject = ["MonitorResource", "SpeciesUtil", "StringUtil", "ResultsUtil"];
})();
