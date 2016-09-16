var controller = function submissionsByMonthLocationController($scope, MonitorResource) {

    var ctrl = this;
    var responseData;
    var selectedLocation;
    var selectedCalculationMethod;
    var selectedCalculationMethodIndex = 0;
    var calculationSelectionKeys = ["length_cm__c", "weight_kg__c"];

    ctrl.$onInit = function() {
        MonitorResource.query({queryType: "samples_query"})
        .$promise.then(handleCatchResponse);

        selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
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
        updateData();
    }

    function updateData() {
        console.log("selected location => "+selectedLocation);

        Rx.Observable.from(responseData)
            .filter(info => info.landing_site__c == selectedLocation)
            .filter(info => info[selectedCalculationMethod] != null)
            .groupBy(info => info.species__c)
            .flatMap(aggregateSpecies)
            .toMap(x => x.species, x => x.average)
            .subscribe(data => {
                ctrl.dataMap = data
                ctrl.xTitle = "Species";
                ctrl.yTitle = getYTitle(selectedCalculationMethodIndex);
            });
    }

    function handleCatchResponse(data) {
        console.log("@@@@ average history received");
        console.log(data);
        responseData = data;

        Rx.Observable.from(data)
            .groupBy(info => info.landing_site__c)
            .map(landingSightGroup => landingSightGroup.key)
            .toArray()
            .subscribe(locationList => ctrl.locations = locationList);
    }

    function getYTitle(index){
        if(index == 0){
            return "Average Length (CM)";
        }else if (index == 1) {
            return "Average Weight (KG)";
        }
    }

    function aggregateSpecies(infoObs) {
        return infoObs
                .average(x =>  x[selectedCalculationMethod])
                .map(function(c){ return {species: infoObs.key, average: c}});

    }
}

angular.module('sampleAveragesByLocationModule')
    .component('sampleAveragesByLocation', {
        templateUrl: 'js/sample-averages-by-location/sample-averages-by-location.template.html',
        controller: controller
    });
