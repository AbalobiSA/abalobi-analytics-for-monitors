(function() {
    'use strict';

    var mcsController = function MonthlyCatchSpeciesController(MonitorResource, SpeciesUtil) {

        var ctrl = this;
        var responseData;
        var selectedMonth;
        var selectedCalculationMethod;
        var selectedCalculationMethodIndex = 0;
        var calculationSelectionKeys = ["weight_total", "numbers_total"];

        ctrl.$onInit = function() {
            selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
            requestData(selectedCalculationMethod);
        }

        //month selection has been changed
        ctrl.monthChange = function(selection) {
            selectedMonth = selection;
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
            MonitorResource.query({queryType: "total_species_weight_by_month", parameter: calcMethod})
                .$promise.then(handleCatchResponse);
        }

        function getYTitle(index){
            if(index == 0){
                return "Weight (kg)";
            }else if (index == 1) {
                return "Quantity Caught";
            }
        }

        function updateData() {
            Rx.Observable.from(responseData)
                .filter(info => info.month == selectedMonth)
                .map(SpeciesUtil.cleanAndCapitalise)
                .toArray()
                .map(list => list.sort(SpeciesUtil.speciesComparator))
                .flatMap(list => Rx.Observable.from(list))
                .toMap(item => item.species__c, item => item[selectedCalculationMethod])
                .subscribe(data => {
                    ctrl.dataMap = data;
                    ctrl.xTitle = "Species";
                    ctrl.yTitle = getYTitle(selectedCalculationMethodIndex);
                });
        }

        function handleCatchResponse(data) {
            ctrl.loading = false;
            responseData = data.map(SpeciesUtil.truncDateToMonth);
            ctrl.months = d3.set(data, x => x.month).values().sort();
            // make sure to select the right item in the dropdown
            ctrl.selected = ctrl.months[ctrl.months.length-1];
            // and also initiate a re-render of graph
            ctrl.monthChange(ctrl.selected);
        }
    }

    angular.module('monthlyCatchSpecies')
        .component('monthlyCatchSpeciesData', {
            templateUrl: 'js/monthly-catch-species/monthly-catch-species.template.html',
            controller: mcsController
        });
    mcsController.$inject = ["MonitorResource", "SpeciesUtil"];
})();
