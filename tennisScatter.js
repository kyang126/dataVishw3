/// <reference path="typings/d3/d3.d.ts"/>
/**
 * X = Rank (expand x axis on change)
 * Y = Total wins (grouped by Surface)
 * Slider 1 = # wins
 * Slider 2 = Rank
 * Dropdown = Gender
 * Dropdown = Surface
 */

"use strict";

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

var maxWins = 0; //Global store for wins
var maxRank = 0; //Global store for rank

var format = d3.time.format("%b %Y");
var dataset;

$(document).ready(function() {
	d3.csv("newTennisData.csv", function(error, tennis) {
		if (error) {
			return console.log(error);
		}
		tennis.forEach(function(d) { //Convert data to Numbers
			d.rank = +d.Rank;
			d.wins = +d.Wins;
			if (d.rank >= maxRank) {
				maxRank = +d.rank;
			}
			if (d.wins >= maxWins) {
				maxWins = +d.wins;
			}
		});
		createGraphAxis();
		createSliders();

		dataset = tennis;
		drawVis(dataset);
	});
});  

var x, xAxis, y, yAxis;
function createGraphAxis() {
	x = d3.scale.linear()
				.domain([0, maxRank])
				.range([0, w]);

	xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom"); 

	y = d3.scale.linear()
				.domain([0, maxWins])
				.range([h, 0]);

	yAxis = d3.svg.axis()
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
		.text("Avg. Rank");

	svg.append("g")
		.attr("class", "axis")
		.call(yAxis)
	.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Wins");  
}


var mytype = "all"; //keep track of currently selected type; default is all 
var patt = new RegExp("all");  
function filterType(category, mtype)  { 
	mytype=mtype;       
	var res = patt.test(mytype);       
	if (res) {  
		var toVisualize = dataset;  //use all the data        
	} else {            
		var toVisualize = dataset.filter(function(d, i) { //filter to only the selected type         
			return d[category] == mytype;  
		});         
	}
	drawVis(toVisualize); 
} 


function filterData(attributes, values){
	// console.log(values);
	// for (var i = 0; i < attributes.length; i++){
	// 	if (attr == attributes[i]){
	// 		ranges[i] = values;
	// 	}
	// }
	var attributes = ["rank"];
	var ranges = [[values[0], values[1]]];
	var toVisualize = dataset.filter(function(d) {
	for (var i = 0; i < attributes.length; i++){ //for each attribute, return only if in range
		return d[attributes[i]] >= ranges[i][0] && d[attributes[i]] <= ranges[i][1]; }
	});
	//filter toVisualize by last selected type
	drawVis(toVisualize); 
}

function changeAxis(isYAxis, values) {
	if (isYAxis) {//Do stuff to the Y
		y = d3.scale.linear()
					.domain([values[0], values[1]])
					.range([h, 0]);
		yAxis = d3.svg.axis()
					.scale(y)
					.orient("left");
	} else { //Do stuff to the X
		x = d3.scale.linear()
			.domain([values[0], values[1]])
			.range([0, w]);
		xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom"); 
	}
	drawVis(dataset);
}

function createSliders() {
	console.log(maxWins);
	//Slider for the number of wins
	$( "#slider-wins" ).slider({
		range: true,
		min: 0,
		max: maxWins,
		values: [ 0, maxWins],
		slide: function( event, ui ) {
			$( "#amount-wins" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			filterData(["wins"], ui.values);
			changeAxis(true, ui.values);
		}
	});
	$( "#amount-wins" ).val($( "#slider-wins" ).slider( "values", 0 ) +
	  " - " + $( "#slider-wins" ).slider( "values", 1 ));

	//Slider for ranks
	$( "#slider-rank" ).slider({
		range: true,
		min: 0,
		max: maxRank,
		values: [0, maxRank],
		slide: function( event, ui ) {
			$( "#amount-rank" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			filterData(["wins"], ui.values);
			changeAxis(false, ui.values);
		}
	});
	$( "#amount-rank" ).val($( "#slider-rank" ).slider( "values", 0 ) +
	  " - " + $( "#slider-rank" ).slider( "values", 1 ));
}


function drawVis(data) {
//console.log("drawVis", data);
	var div = d3.select("#graph").append("div")   
		.attr("class", "tooltip")
		.style("opacity", 0);


	var circle = svg.selectAll("circle")            
	 .data(data); //join with new data  
			circle  //update existing circles – price, tValue, and type will change with type   
			.attr("cx", function(d) { return x(d.rank);  })            
			.attr("cy", function(d) { return y(d.wins);  })            
			.style("fill", function(d) { return col(d.Surface); });                  
			circle.exit().remove(); //remove any excess circles  
			
			circle.enter().append("circle")  //add new circles  
			.attr("cx", function(d) { return x(d.rank);  })            
			.attr("cy", function(d) { return y(d.wins);  })            
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
				div.html('<div>Name: ' + d.Name + '</div><div>Surface: ' + d.Surface + "</div><div>Avg Rank: " + d.rank + "</div><div>Wins: "  + d.wins + "</div><div>Gender: " + d.Gender + "</div>")  
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