var controller = function CatchSpeciesByLocationController($scope, $element, $attrs, MonitorResource) {

    var ctrl = this;
    var responseData;
    var selectedLocation;
    var selectedCalculationMethod;
    var selectedCalculationMethodIndex = 0;
    var calculationSelectionKeys = ["weight_kg__c", "num_items__c"]

    ctrl.$onInit = function() {
        MonitorResource.query({queryType: "total_species_weight_by_month"})
        .$promise.then(handleCatchResponse);

        selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
    }

    //month selection has been changed
    ctrl.monthChange = function(selection) {
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

    function updateData() {
        console.log("selected location => "+selectedLocation);
        console.log("selected calculation method => "+selectedCalculationMethod);

        Rx.Observable.from(responseData)
            .filter(info => info[selectedCalculationMethod] != null)
            .groupBy(info => info.landing_site__c)
            .filter(locationGroup => locationGroup.key == selectedLocation)
            .flatMap(aggregateLocation)
            .toMap(x => x.species, x => x.totalKg)
            .subscribe(data => {
                ctrl.dataMap = data;
                ctrl.xTitle = "Species";
                ctrl.yTitle = getYTitle(selectedCalculationMethodIndex);
            });
    }

    function handleCatchResponse(data) {
        console.log("@@@@ catch data received");
        responseData = data;
        console.log(data);

        var locationGroupObs = Rx.Observable.from(data)
            .groupBy(info => info.landing_site__c)
            .map(locationGroup => locationGroup.key)
            .toArray()
            .subscribe(locationList => ctrl.locations = locationList);
    }

    function aggregateLocation(infoObs) {
        console.log("AG loc");
        var init = {species: '', totalKg: 0.0}
        return infoObs
            .groupBy(group => group.species__c)
            .flatMap(sumSpecies);
    }

    function sumSpecies(speciesGroup) {
        var init = {species: speciesGroup.key, totalKg: 0.0};
        return speciesGroup.reduce((acc, entry) => {
            acc.totalKg += entry[selectedCalculationMethod]; return acc;
        }, init);
    }
}

angular.module('catchSpeciesByLocationModule')
    .component('catchSpeciesByLocation', {
        templateUrl: 'js/catch-species-by-location/catch-species-by-location.template.html',
        controller: controller
    });
