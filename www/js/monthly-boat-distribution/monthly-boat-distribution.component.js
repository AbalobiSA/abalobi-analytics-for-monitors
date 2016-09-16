var catchQuerySubject = new Rx.Subject();
var responseData;

var mController = function HelloController($scope, $element, $attrs, MonitorResource) {

    var ctrl = this;
    var boatTypes = [];

    ctrl.$onInit = function() {
        console.log("init monthly boat distribution");
        MonitorResource.query({queryType: "total-boat-types-by-month"})
        .$promise.then(handleCatchResponse);
    }

    ctrl.change = function(selectedLocation) {
        Rx.Observable.from(responseData)
            .filter(info => info.boat_role__c != null)
            .groupBy(info => info.landing_site__c)
            .filter(locationGroup => locationGroup.key == selectedLocation)
            .flatMap(groupByMonth)
            .toArray()
            .subscribe(x => {
                ctrl.data = x;
                ctrl.xTitle = 'Month';
                ctrl.yTitle = 'Number of Boats';
            });
    }

    function handleCatchResponse(data) {
        console.log("query successful");
        responseData = data;

        var dataObs = Rx.Observable.from(data)
            .filter(record => record.boat_role__c != null);

        dataObs.map(record => record.boat_role__c)
            .distinct()
            .toArray()
            .subscribe(types => {console.log(types);boatTypes = types});

        var locationGroupObs = dataObs
            .groupBy(record => record.landing_site__c);

        locationGroupObs.map(locationGroup => locationGroup.key)
            .toArray()
            .subscribe(locationList => ctrl.locations = locationList);
    }

    function createRecord(key, totals){
        var rec = {key: key};
        totals.forEach((v, k) => rec[k] = v);
        return rec;
    }

    function groupByMonth(locationObs) {
        return locationObs
                    .map(changeDate)
                    .groupBy(info => info.month)
                    .flatMap(aggregateMonth);
    }

    function changeDate(info) {
        info.month = info.odk_date__c.substring(0, 7);
        return info;
    }

    function aggregateMonth(monthObs) {
        console.log("AG month");

        var records = new Map();
        for(var i = 0; i < boatTypes.length; i++){
            records.set(boatTypes[i], 0);
        }

        return monthObs
            .groupBy(monthGroup => monthGroup.boat_role__c)
            .flatMap(it => it)
            .reduce(collectTotal, records)
            .map(summedRecords => {
                // var monthMap = new Map();
                // monthMap.set(monthObs.key, summedRecords);
                return createRecord(monthObs.key, summedRecords);
                // return monthMap;
            });
            // .flatMap(boatsGroup => sumBoats(monthObs.key, boatsGroup));
    }

    function collectTotal(acc, entry){
        acc.set(entry.boat_role__c, acc.get(entry.boat_role__c)+1);
        return acc;
    }

    function sumBoats(month, boatsGroup) {
        console.log("summing");
        var record = {month: month, boatType: boatsGroup.key, count: 0};
        return boatsGroup
            .count(boat => true)
            .map(boatCount => {record.count = boatCount; return record});
    }

    catchQuerySubject.subscribe(speciesCatchInfo => {ctrl.dataMap = speciesCatchInfo; console.log(ctrl.dataMap);});
}

angular.module('monthlyBoatDistributionModule')
    .component('monthlyBoatDistributionData', {
        templateUrl: 'js/monthly-boat-distribution/monthly-boat-distribution.template.html',
        controller: mController
    });
