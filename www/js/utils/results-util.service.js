angular.module('utilsModule')
    .service('ResultsUtil', function() {
        return {
            // Capitalises each specie name and replaces 'not_on_list' with 'Other'
            applyMapThreshold: function (data, threshold) {
                var values = data.map(record => d3.values(record).slice(1));
                var max = d3.max(values, arr => d3.sum(arr));

                return data.filter(record => {
                    var recordSum = d3.sum(d3.values(record).slice(1));
                    return recordSum >= threshold*max;
                });
            },
        }
    });
