var mController = function StackedBarChartController($element){
    var ctrl = this;
    var legendSquareSize = 18;

    ctrl.$onInit = function() {
        // console.log("Init stacked bar chart");
        data = [];
        ytitle = "";
        xtitle = "";

        Object.defineProperty(ctrl, 'data', {
            get: function(){
                return data;
            },
            set: function(newVal){
                // console.log("new data given");
                data = newVal;
                display();
            }
        });

        Object.defineProperty(ctrl, 'ytitle', {
            get: function(){
                return ytitle;
            },
            set: function(newVal){
                ytitle = newVal;
                display();
            }
        });

        Object.defineProperty(ctrl, 'xtitle', {
            get: function(){
                return xtitle;
            },
            set: function(newVal){
                xtitle = newVal;
                display();
            }
        });

        display();
    }

    function getLengendSquareX(position, arr) {
        return (position > 0)? d3.sum(arr.slice(0, position).map(label => label.length))*13 : 0
    }

    function display() {
        var margin = {top: 20, right: 20, bottom: 100, left: 60},
            width = 600 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        var xValues = ctrl.data.map(record => record.key);
        var yValues = ctrl.data.map(record => d3.values(record).slice(1));
        var zValues = d3.keys(ctrl.data[0]).slice(1);

        var x = d3.scaleBand()
                    .range([0, width])
                    .padding(0.1)
                    .align(0.1);

        var y = d3.scaleLinear()
                    .rangeRound([height, 0]);

        var z = null;
        if(zValues.length < 10 ){
            z = d3.scaleOrdinal(d3.schemeCategory10);
        } else {
            z = d3.scaleOrdinal(d3.schemeCategory20);
        }

        var stack = d3.stack();

        x.domain(xValues);
        y.domain([0, d3.max(yValues, function(d) { return d3.sum(d); })]).nice();
        z.domain(zValues);

        // var data = d3.zip(xValues, yValues);
        var xAxis = d3.axisBottom()
            .scale(x)
            .tickValues(xValues);

        var yAxis = d3.axisLeft()
            .scale(y)
            .ticks(10, ",f");

        var container = $element.find("div")[1];

        d3.select(container).selectAll("*").remove();
        var svg = d3.select(container).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            // .attr("dx", "-1.8em");
            .attr("dy", "1.55em");

        svg.append("g")
            .attr("class", "y-axis")
            .call(yAxis);

        svg.append("text")
            .attr("y", 0+height+(margin.bottom/2))
            .attr("x", width/2)
            // .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(ctrl.xtitle);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0-margin.left/1.8)
            .attr("x", 0-(height/2))
            .style("text-anchor", "middle")
            .text(ctrl.ytitle);

        svg.selectAll(".serie")
            .data(stack.keys(zValues)(ctrl.data))
            .enter().append("g")
            .attr("class", "serie")
            .attr("fill", d => z(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("x", d => x(d.data.key))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth());

        var legend = svg.selectAll(".legend")
            .data(zValues)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + height + ")"; })
            .style("font", "12pt sans-serif");

        legend.append("rect")
          .attr("x", (d,i) => getLengendSquareX(i, zValues))
          .attr("y", margin.bottom/1.5)
          .attr("width", legendSquareSize)
          .attr("height", legendSquareSize)
          .attr("fill", z);

        legend.append("text")
          .attr("x", (d,i) => getLengendSquareX(i, zValues)+24)
          .attr("y", margin.bottom/1.5)
          .attr("dy", "1em")
          .attr("text-anchor", "start")
          .text(function(d) { return d; });
    }
}


angular.module('stackedBarChartModule')
    .component('stackedBarChart', {
        templateUrl: 'js/bar-chart/bar-chart.template.html',
        controller: mController,
        bindings: {
            data: '=?',
            xtitle: '=',
            ytitle: '='
        }
    });
