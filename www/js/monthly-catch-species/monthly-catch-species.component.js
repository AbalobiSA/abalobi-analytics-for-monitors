var catchQuerySubject = new Rx.Subject();
var responseData;

var asd = function HelloController($scope, $element, $attrs, MonitorResource) {

    var ctrl = this;
    var selectedMonth;
    var selectedCalculationMethod;
    var selectedCalculationMethodIndex = 0;
    var calculationSelectionKeys = ["num_kg__c", "num_items__c"]

    ctrl.$onInit = function() {
        MonitorResource.query({queryType: "total_species_weight_by_month"})
        .$promise.then(handleCatchResponse);

        selectedCalculationMethod = calculationSelectionKeys[selectedCalculationMethodIndex];
    }

    //month selection has been changed
    ctrl.monthChange = function(selection) {
        selectedMonth = selection;
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
        console.log("selected month => "+selectedMonth);
        console.log("selected calculation method => "+selectedCalculationMethod);

        Rx.Observable.from(responseData)
            .filter(info => info[selectedCalculationMethod] != null)
            .map(changeDate)
            .groupBy(info => info.month)
            .filter(monthGroup => monthGroup.key == selectedMonth)
            .flatMap(aggregateMonth)
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

        var monthGroupObs = Rx.Observable.from(data)
            .map(changeDate)
            .groupBy(info => info.month);

        monthGroupObs.map(monthGroup => monthGroup.key)
            .toArray()
            .subscribe(monthList => ctrl.months = monthList);
    }

    function changeDate(info) {
        info.month = info.odk_date__c.substring(0, 7);
        return info;
    }

    function aggregateMonth(infoObs) {
        var init = {species: '', totalKg: 0.0}
        return infoObs
            .groupBy(monthGroup => monthGroup.species__c)
            .flatMap(sumSpecies);
    }

    function sumSpecies(speciesGroup) {
        var init = {species: speciesGroup.key, totalKg: 0.0};
        return speciesGroup.reduce((acc, entry) => {
            acc.totalKg += entry[selectedCalculationMethod]; return acc;
        }, init);
    }
}

angular.module('monthlyCatchSpecies')
    .component('monthlyCatchSpeciesData', {
        templateUrl: 'js/monthly-catch-species/monthly-catch-species.html',
        controller: asd
    });
