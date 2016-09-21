angular.module('utilsModule')
    .service('SpeciesUtil', function() {
        return {
            // Capitalises each specie name and replaces 'not_on_list' with 'Other'
            cleanAndCapitalise: function (info) {
                if (info.species__c == "not_on_list"){
                    info.species__c = "Other";
                } else {
                    info.species__c = info.species__c.substring(0,1).toUpperCase()+info.species__c.substring(1);
                }
                return info;
            },

            // Sorts the items according to species pushing "Other"
            // to the end of the list
            speciesComparator: function (a, b) {
                if(a.species__c == "Other" || a.species__c > b.species__c) {
                    return 1;
                }else if(b.species__c == "Other" || a.species__c < b.species__c){
                    return -1;
                }
                return 0;
            },

            //TODO doesn't actually belong here, didn't want to create a new service for 1 method
            // truncates the date received from DB response to monthly precision
            truncDateToMonth: function (info) {
                info.month = info.year_month.substring(0, 7);
                return info;
            }
        }
    });
