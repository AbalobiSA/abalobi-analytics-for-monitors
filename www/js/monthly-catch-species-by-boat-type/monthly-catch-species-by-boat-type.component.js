var asd = function HelloController($scope, $element, $attrs, MonitorResource) {

    var ctrl = this;
    var responseData;
    var selectedMonth;
    var selectedLocation;
    var selectedCalculationMethod;
    var selectedCalculationMethodIndex = 0;
    var boatTypes = [];
    var calculationSelectionKeys = ["num_kg__c", "num_items__c"]

    ctrl.$onInit = function() {
        MonitorResource.query({queryType: "total_species_weight_by_month_by_boat_type"})
        .$promise.then(handleCatchResponse);

        selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
    }

    //month selection has been changed
    ctrl.monthChange = function(selection) {
        selectedMonth = selection;
        updateData();
    }

    //location selection has been changed
    ctrl.locationChange = function(selection) {
        selectedLocation = selection;
        updateData();
    }

    // calculation method changed (By weight or by numbers caught)
    ctrl.calculationToggleChange = function(value){
        console.log("toggle update => "+value);
        if(value == false){
            selectedCalculationMethodIndex = 0
        } else {
            selectedCalculationMethodIndex = 1
        }
        selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
        updateData();
    }

    function getYTitle(index){
        if(index == 0){
            return "Weight (KG)";
        }else if (index == 1) {
            return "Quantity Caught";
        }
    }

    function updateData(){
        console.log("selected month => "+selectedMonth);
        console.log("selected location => "+selectedLocation);
        console.log("selected calculation method => "+selectedCalculationMethod);

        Rx.Observable.from(responseData)
            .filter(info => info.boat_role__c != null)
            .filter(info => info[selectedCalculationMethod] != null)
            .groupBy(info => info.landing_site__c)
            .filter(locationGroup => locationGroup.key == selectedLocation)
            .map(locationGroup => locationGroup.filter(info => info.odk_date__c.substring(0,7) == selectedMonth))
            .flatMap(groupBySpecies)
            .toArray()
            .subscribe(data => {
                ctrl.dataMap = data;
                ctrl.xTitle = "Species";
                ctrl.yTitle = getYTitle(selectedCalculationMethodIndex);
            });
    }

    function handleCatchResponse(data) {
        console.log("@@@@ catch data by boat type received");
        responseData = data;

        var dataObs = Rx.Observable.from(data)
            .filter(record => record.boat_role__c != null);

        dataObs.map(record => record.boat_role__c)
            .distinct()
            .toArray()
            .subscribe(types => {console.log(types);boatTypes = types});

        dataObs.map(changeDate)
            .groupBy(info => info.month)
            .map(monthGroup => monthGroup.key)
            .toArray()
            .subscribe(monthList => ctrl.months = monthList);

        dataObs.groupBy(record => record.landing_site__c)
            .map(locationGroup => locationGroup.key)
            .toArray()
            .subscribe(locationList => ctrl.locations = locationList);
    }

    function changeDate(info) {
        info.month = info.odk_date__c.substring(0, 7);
        return info;
    }

    function groupBySpecies(obs) {
        return obs.groupBy(info => info.species__c)
                    .flatMap(aggregateSpecies)
    }

    function aggregateSpecies(speciesObs) {
        console.log("AG species");

        var records = new Map();
        for(var i = 0; i < boatTypes.length; i++){
            records.set(boatTypes[i], 0);
        }

        return speciesObs
            .groupBy(speciesGroup => speciesGroup.boat_role__c)
            .flatMap(it => it)
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
        acc.set(entry.boat_role__c, acc.get(entry.boat_role__c)+entry[selectedCalculationMethod]);
        return acc;
    }
}

angular.module('monthlyCatchSpeciesByBoatTypeModule')
    .component('monthlyCatchSpeciesByBoatTypeData', {
        templateUrl: 'js/monthly-catch-species-by-boat-type/monthly-catch-species-by-boat-type.html',
        controller: asd
    });
