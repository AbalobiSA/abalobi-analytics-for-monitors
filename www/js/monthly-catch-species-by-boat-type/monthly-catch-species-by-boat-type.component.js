var mcsbbtController = function MonthlyCatchSpeciesByBoatTypeController(MonitorResource, SpeciesUtil, StringUtil) {

    var ctrl = this;
    var responseData;
    var selectedMonth;
    var selectedLocation;
    var selectedCalculationMethod;
    var selectedCalculationMethodIndex = 0;
    var boatTypes = [];
    var calculationSelectionKeys = ["weight_total", "numbers_total"];
    var renderGraph = true;
    ctrl.months = [];
    ctrl.locations = [];

    ctrl.$onInit = function() {
        selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
        requestData(selectedCalculationMethod)
    }

    //month selection has been changed
    ctrl.monthChange = function(selection) {
        selectedMonth = selection;
        updateLocationList();
        if(ctrl.locations.indexOf(ctrl.selectedLocation) === -1){
            ctrl.selectedLocation = ctrl.locations[0];
        }
        ctrl.locationChange(ctrl.selectedLocation);
    }

    //location selection has been changed
    ctrl.locationChange = function(selection) {
        selectedLocation = selection;
        updateData();
    }

    // calculation method changed (By weight or by numbers caught)
    ctrl.calculationToggleChange = function(value){
        if(value == false){
            selectedCalculationMethodIndex = 0
        } else {
            selectedCalculationMethodIndex = 1
        }
        selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
        requestData(selectedCalculationMethod)
    }

    function requestData(calcMethod){
        ctrl.loading = true;
        MonitorResource.query({queryType: "total_species_weight_by_month_by_boat_type", parameter: calcMethod})
            .$promise.then(handleCatchResponse);
    }

    function updateLocationList(){
        l = responseData
            .filter(info => info.month == selectedMonth)
            .map(info => info.landing_site__c);

        ctrl.locations = d3.set(l)
            .values()
            .map(StringUtil.cleanAndCapitalise)
            .sort(StringUtil.otherAtEndcomparator);
    }

    function getYTitle(index){
        if(index == 0){
            return "Weight (kg)";
        }else if (index == 1) {
            return "Quantity Caught";
        }
    }

    function updateData(){
        if(renderGraph == false){
            return;
        }
        console.log("selected month => "+selectedMonth);
        console.log("selected location => "+selectedLocation);
        console.log("selected calculation method => "+selectedCalculationMethod);

        Rx.Observable.from(responseData)
            .filter(info => info.month == selectedMonth)
            .filter(info => info.landing_site__c == selectedLocation.toLowerCase().replace(' ', '_'))
            .groupBy(info => info.species__c)
            .flatMap(aggregateSpecies)
            .toArray()
            .map(list => list.sort((a, b) => SpeciesUtil.speciesComparator(a, b, "key")))
            .subscribe(data => {
                ctrl.dataMap = data;
                ctrl.xTitle = "Species";
                ctrl.yTitle = getYTitle(selectedCalculationMethodIndex);
            });
    }

    function handleCatchResponse(data) {
        console.log("catch data by boat type received");
        ctrl.loading = false;
        responseData = data.map(SpeciesUtil.truncDateToMonth)
                        .map(SpeciesUtil.cleanAndCapitalise);

        ctrl.months = d3.set(data, x => x.month).values().sort();

        ctrl.locations = d3.set(data, x => x.landing_site__c)
                        .values()
                        .map(StringUtil.cleanAndCapitalise)
                        .sort(StringUtil.otherAtEndcomparator);

        boatTypes = d3.set(data, x => x.boat_type)
                        .values().sort(StringUtil.otherAtEndcomparator);

        // make sure to select the right item in the dropdown
        if(ctrl.months.indexOf(ctrl.selectedMonth) === -1){
            ctrl.selectedMonth = ctrl.months[ctrl.months.length-1];
        }

        //deactivate graph rendering so graph doesn't rerender on each change
        renderGraph = false;

        // re-render of graph
        ctrl.monthChange(ctrl.selectedMonth);
        renderGraph = true;
        ctrl.locationChange(ctrl.selectedLocation);
    }

    function aggregateSpecies(speciesObs) {
        var records = new Map();
        for(var i = 0; i < boatTypes.length; i++){
            records.set(boatTypes[i], 0);
        }

        return speciesObs
            .reduce(collectTotal, records)
            .map(summedRecords => {
                return createRecord(speciesObs.key, summedRecords);
            });
    }

    function createRecord(key, totals){
        var rec = {key: key};
        totals.forEach((v, k) => rec[k] = v);
        return rec;
    }

    function collectTotal(acc, entry){
        acc.set(entry.boat_type, acc.get(entry.boat_type)+entry[selectedCalculationMethod]);
        return acc;
    }
}

angular.module('monthlyCatchSpeciesByBoatTypeModule')
    .component('monthlyCatchSpeciesByBoatTypeData', {
        templateUrl: 'js/monthly-catch-species-by-boat-type/monthly-catch-species-by-boat-type.html',
        controller: mcsbbtController
    });
