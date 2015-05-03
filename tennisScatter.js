/// <reference path="typings/d3/d3.d.ts"/>
"use strict";

$(document).ready(function() {

var margin = {top: 20, right: 20, bottom: 30, left: 50};
	var w = 640 - margin.left - margin.right;
	var h = 480 - margin.top - margin.bottom;

var col = d3.scale.category10();

var col2 = d3.scale.linear()
	.domain([0, 1000])
	.range(["white", "black"]);

var svg = d3.select("#graph").append("svg")
	.attr("width", w + margin.left + margin.right)
	.attr("height", h + margin.top + margin.bottom)
.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.linear()
			.domain([0, 1000])
			.range([0, w]);

var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom"); 

var y = d3.scale.linear()
			.domain([0, 14500])
			.range([h, 0]);

var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");

svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + h + ")")
	.call(xAxis)
.append("text")
	.attr("x", w)
	.attr("y", -6)
	.style("text-anchor", "end")
	.text("Price");

svg.append("g")
	.attr("class", "axis")
	.call(yAxis)
.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("True Value");    

var format = d3.time.format("%b %Y");
var dataset;

d3.csv("tennisdataset.csv", function(error, tennis) {
if (error) {
	return console.log(error);
}
tennis.forEach(function(d) {
	d.price = +d.WRank;
	//console.log(d);
	// d.date = format.parse(d.date);
});

dataset = tennis;
drawVis(dataset);
});

var mytype = "all"; //keep track of currently selected type; default is all 
var patt = new RegExp("all");  
function filterType(mtype)  {   
	//console.log(mtype);  
	mytype=mtype;       
	var res = patt.test(mytype);       
	if (res) {  
		var toVisualize = dataset;  //use all the data        
	} else {            
		var toVisualize = dataset.filter(function(d, i) { //filter to only the selected type         
			return d["Surface"] == mytype;  
		});         
	}
	//console.log(toVisualize);     
	drawVis(toVisualize); 
} 


function filterData(attr, values){
	// console.log(values);
	// for (var i = 0; i < attributes.length; i++){
	// 	if (attr == attributes[i]){
	// 		ranges[i] = values;
	// 	}
	// }
	var attributes = ["WPts"];
	var ranges = [[values[0], values[1]]];
	var toVisualize = dataset.filter(function(d) {
	for (var i = 0; i < attributes.length; i++){ //for each attribute, return only if in range
		return d[attributes[i]] >= ranges[i][0] && d[attributes[i]] <= ranges[i][1]; }
	});
	//filter toVisualize by last selected type
	drawVis(toVisualize); 
}

$(function() {
	$( "#slider-range" ).slider({
		range: true,
		min: 0,
		max: 14085,
		values: [ 0, 14085],
		slide: function( event, ui ) {
			$( "#amount" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			filterData("WPts", ui.values);
		}
	});
	$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
	  " - $" + $( "#slider-range" ).slider( "values", 1 ) );
});


function drawVis(data) {
//console.log("drawVis", data);


var div = d3.select("#graph").append("div")   
	.attr("class", "tooltip")
	.style("opacity", 0);


var circle = svg.selectAll("circle")            
 .data(data); //join with new data  
		circle  //update existing circles – price, tValue, and type will change with type   
		.attr("cx", function(d) { return x(d.WRank);  })            
		.attr("cy", function(d) { return y(d.WPts);  })            
		.style("fill", function(d) { return col(d.Surface); });                  
		circle.exit().remove(); //remove any excess circles  
		circle.enter().append("circle")  //add new circles  
		.attr("cx", function(d) { return x(d.WRank);  })            
		.attr("cy", function(d) { return y(d.WPts);  })            
		.style("fill", function(d) { return col(d.Surface); })  
		.attr("r", 4)  .style("stroke", "black")
		.on("mouseover", function(d, i) {
//			var $name   = $('div').html('Name: ' + d.name);
//			var $type   = $('div').html('Type: ' + d.type);
//			var $price  = $('div').html('Price: ' + d.price);
//			var $tValue = $('div').html('tValue: ' + d.tValue);
//			var $vol    = $('div').html('vol: ' + d.vol);
			div.transition()        
				.duration(200)      
				.style("opacity", .9);      
			div.html('<div>Name: ' + d.Winner + '</div><div>Type: ' + d.Surface + "</div><div>Rank: " + d.WRank + "</div><div>Points: "  + d.WPts + "</div><div>Location: " + d.Location)  
			//div.html($name + $type + $price + $tValue + $vol)
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 28) + "px");
			})
		.on("mouseout", function(d, i) { 
			 div.transition()                
					.duration(500)                
					.style("opacity", 0);   
		});	
}
});