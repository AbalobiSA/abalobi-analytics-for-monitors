var sablController = function sampleAveragesByLocationController(MonitorResource, SpeciesUtil, StringUtil) {

    var ctrl = this;
    var responseData;
    var selectedLocation;
    var selectedCalculationMethod;
    var selectedCalculationMethodIndex = 0;
    var calculationSelectionKeys = ["length_avg", "weight_avg"];
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
        MonitorResource.query({queryType: "samples_query", parameter: calcMethod})
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

    function updateData() {
        console.log("selected month => "+selectedMonth);
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

        Rx.Observable.from(responseData)
            .filter(info => info.month == selectedMonth)
            .filter(info => info.landing_site__c == selectedLocation.toLowerCase().replace(' ', '_'))
            .toMap(x => x.species__c, x => x[selectedCalculationMethod])
            .subscribe(data => {
                ctrl.dataMap = data
                ctrl.xTitle = "Species";
                ctrl.yTitle = getYTitle(selectedCalculationMethodIndex);
            });
    }

    function handleCatchResponse(data) {
        console.log("@@@@ average history received");

        ctrl.loading = false;
        responseData = data.map(SpeciesUtil.truncDateToMonth)
                        .map(SpeciesUtil.cleanAndCapitalise);

        ctrl.months = d3.set(data, x => x.month).values().sort();

        ctrl.locations = d3.set(data, x => x.landing_site__c)
                        .values()
                        .map(StringUtil.cleanAndCapitalise)
                        .sort(StringUtil.otherAtEndcomparator);

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

    function getYTitle(index){
        if(index == 0){
            return "Average Length (cm)";
        }else if (index == 1) {
            return "Average Weight (kg)";
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
        controller: sablController
    });
