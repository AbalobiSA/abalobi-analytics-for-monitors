(function() {
    'use strict';

    var csblController = function CatchSpeciesByLocationController(MonitorResource, SpeciesUtil, StringUtil, ResultsUtil) {

        var ctrl = this;
        var responseData;
        var selectedLocation;
        var selectedCalculationMethod;
        var selectedCalculationMethodIndex = 0;
        var calculationSelectionKeys = ["weight_total", "numbers_total"];
        var months = [];
        var species = [];

        ctrl.$onInit = function() {
            selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
            requestData(selectedCalculationMethod);
        }

        //month selection has been changed
        ctrl.locationChange = function(selection) {
            selectedLocation = selection;
            updateData();
        }

        // calculation method changed (By weight or by numbers caught)
        ctrl.calculationToggleChange = function(value){
            if(value == false){
                selectedCalculationMethodIndex = 0;
            } else {
                selectedCalculationMethodIndex = 1;
            }
            selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
            requestData(selectedCalculationMethod);
        }

        function requestData(calcMethod){
            ctrl.loading = true;
            MonitorResource.query({queryType: "total_species_weight_by_location", parameter: calcMethod})
                .$promise.then(handleCatchResponse);
        }

        function getYTitle(index){
            if(index == 0){
                return "Weight (kg)";
            }else if (index == 1) {
                return "Quantity Caught";
            }
        }

        function getItemsPerRow(index){
            if(index == 0){
                return 3;
            }else if (index == 1) {
                return 2;
            }
        }

        function updateData() {
            console.log("selected location => "+selectedLocation);
            console.log("selected calculation method => "+selectedCalculationMethod);

            Rx.Observable.from(responseData)
                .filter(info => info.landing_site__c == selectedLocation.toLowerCase().replace(' ', '_'))
                .groupBy(info => info.month)
                .flatMap(aggregateMonth)
                .toArray()
                .map(list => list.sort((a, b) => SpeciesUtil.speciesComparator(a, b, "key")))
                .map(data => ResultsUtil.applyMapThreshold(data, 0.001))
                .subscribe(data => {
                    ctrl.dataMap = data;
                    ctrl.xTitle = "Species";
                    ctrl.yTitle = getYTitle(selectedCalculationMethodIndex);
                    ctrl.itemsperrow = getItemsPerRow(selectedCalculationMethodIndex);
                });
        }

        function handleCatchResponse(data) {
            console.log("@@@@ catch data received");
            ctrl.loading = false;
            responseData = data.map(SpeciesUtil.truncDateToMonth)
                            .map(SpeciesUtil.cleanAndCapitalise);

            ctrl.locations = d3.set(data, x => x.landing_site__c)
                            .values()
                            .map(StringUtil.cleanAndCapitalise)
                            .sort(StringUtil.otherAtEndcomparator);

            species = d3.set(data, x => x.species__c)
                            .values()
                            .map(StringUtil.cleanAndCapitalise)
                            .sort(StringUtil.otherAtEndcomparator);

            if(ctrl.locations.indexOf(ctrl.selectedLocation) === -1){
                ctrl.selectedLocation = ctrl.locations[0];
            }

            ctrl.locationChange(ctrl.selectedLocation);
        }

        function aggregateMonth(monthObs) {
            var records = new Map();
            for(var i = 0; i < species.length; i++){
                records.set(species[i], 0);
            }

            return monthObs
                .reduce(collectTotal, records)
                .map(summedRecords => {
                    return createRecord(monthObs.key, summedRecords);
                });
        }

        function collectTotal(acc, entry){
            acc.set(entry.species__c, acc.get(entry.species__c)+entry[selectedCalculationMethod]);
            return acc;
        }

        function createRecord(key, totals){
            var rec = {key: key};
            totals.forEach((v, k) => rec[k] = v);
            return rec;
        }
    }

    angular.module('catchSpeciesByLocationModule')
        .component('catchSpeciesByLocation', {
            templateUrl: 'js/catch-species-by-location/catch-species-by-location.template.html',
            controller: csblController
        });

    csblController.$inject = ["MonitorResource", "SpeciesUtil", "StringUtil", "ResultsUtil"];
})();
