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

var winsMap    = new Map();
var winsMapArr = [];

var format     = d3.time.format("%b %Y");

var attributes = ["Rank", "Wins"];
var ranges     = [[0,maxRank],[0,maxWins]];

var dataset;
var winsBegin  = 0;
var winsEnd    = maxWins;
var rankBegin  = 0;
var rankEnd    = maxRank;

var currentSurface = "all";
var currentGender = "all";
	
$(document).ready(function() {

	d3.csv("newTennisData.csv", function(error, tennis) {
		if (error) {
			return console.log(error);
		}
		tennis.forEach(function(d) { //Convert data to Numbers
			//console.log(d);
			d.rank = +d.Rank;
			d.wins = +d.Wins;
			if (d.rank >= maxRank) {
				maxRank = +d.rank;
			}
			// if (d.wins >= maxWins) {
			// 	maxWins = +d.wins;
			// }
			countMap(d);
		});
		rankEnd = maxRank;
		console.log("maxrank " + rankEnd + " " + maxRank);
		winsMapArr = convertMapToArray(winsMap);
		//console.log(winsMap);
		createGraphAxis();
		createSliders();

		dataset = tennis;
		drawVis(winsMapArr);
	});
	$("#surfaceSelect").change(function(){ 
		var value = $('#surfaceSelect').val();  
		currentSurface = value;                      
		filterType(value);                  
	});
	$("#genderSelect").change(function(){                   
		var value = $('#genderSelect').val(); 
		currentGender = value;                       
		filterType(value);                  
	});
}); 

function countMap (d) {
	if (winsMap.has(d.Name)) { //if it has the name, increment
		winsMap.set(d.Name, 
			{
				Name: d.Name,
				Surface: "All",
				rank: d.rank,
				wins: winsMap.get(d.Name).wins + +d.wins,
				Gender: d.Gender
			}
		);
	} else { //insert the name
		winsMap.set(d.Name, 
			{
				Name: d.Name,
				Surface: "All",
				rank: d.rank,
				wins: +d.wins,
				Gender: d.Gender
			}
		);
	}
}

function convertMapToArray(map) {
	var arr = [];
	map.forEach(function(d) {
		arr.push(d);
		if (d.wins > maxWins) {
			maxWins = d.wins;
		}
	});
	winsEnd= maxWins
	//console.log(maxWins);
	return arr;
}

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
		.attr("class", "x axis")
		.attr("transform", "translate(0," + h + ")")
		.call(xAxis)
	.append("text")
		.attr("x", w)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Avg. Rank");

	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Wins");  
}

//filter info from the dropdown
//Type = currently selected type in dropdown
var patt = new RegExp("all");  
function filterType(type)  { 
	var res = patt.test(currentSurface);
	var res2 = patt.test(currentGender);       
	// if (res && res2) {
	// 	var toVisualize = winsMapArr;  //use all the data       
	// } else {
		var toVisualize = dataset.filter(function(d, i) { //filter to only the selected type
			if (d[attributes[0]] >= ranges[0][0] && d[attributes[0]] <= ranges[0][1] &&
 				d[attributes[1]] >= ranges[1][0] && d[attributes[1]] <= ranges[1][1]) {

				if(currentGender == "all" && currentSurface == "all"){
					return d[attributes[0]] >= ranges[0][0] && d[attributes[0]] <= ranges[0][1] &&
 				d[attributes[1]] >= ranges[1][0] && d[attributes[1]] <= ranges[1][1];
				}

				if (currentGender != "all" && currentSurface != "all") { //If neither is set to all
					return d["Gender"] == currentGender && d["Surface"] == currentSurface;
				} else if (currentGender == "all") { //If gender is set to all
					return d["Surface"] == currentSurface;
				} else if (currentSurface == "all") { //It surface is set to all
					return d["Gender"] == currentGender;
				} else { //everything is set to all
					return true;
				}
			}
			return false;	
		});
	//}
	drawVis(toVisualize); 
} 

//Filter info from the sliders
//Attr = wins/ranks
//Values = min/max of slider
function filterData(attr, values){   
	var toVisualize = dataset.filter(function(d, i) { 
		if (d[attributes[0]] >= ranges[0][0] && d[attributes[0]] <= ranges[0][1] &&
 				d[attributes[1]] >= ranges[1][0] && d[attributes[1]] <= ranges[1][1]) {

				if(currentGender == "all" && currentSurface == "all"){
					return d[attributes[0]] >= ranges[0][0] && d[attributes[0]] <= ranges[0][1] &&
 				d[attributes[1]] >= ranges[1][0] && d[attributes[1]] <= ranges[1][1];
				}

				if (currentGender != "all" && currentSurface != "all") { //If neither is set to all
					return d["Gender"] == currentGender && d["Surface"] == currentSurface;
				} else if (currentGender == "all") { //If gender is set to all
					return d["Surface"] == currentSurface;
				} else if (currentSurface == "all") { //If surface is set to all
					return d["Gender"] == currentGender;
				} else { //everythign is set to all
					return true;
				}
			}
			return false;
	});
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
		svg.selectAll(".y.axis")
			.call(yAxis);
	} else { //Do stuff to the X
		x = d3.scale.linear()
			.domain([values[0], values[1]])
			.range([0, w]);
		xAxis = d3.svg.axis()
					.scale(x)
					.orient("bottom"); 
		svg.selectAll(".x.axis")
			.call(xAxis);
	}
}

function createSliders() {
	$( "#slider-wins" ).slider({
		range: true,
		min: 0,
		max: maxWins,
		values: [ 0, maxWins],
		slide: function( event, ui ) {
			$( "#amount-wins" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			winsBegin = ui.values[0];
			winsEnd = ui.values[1];
			ranges = [[rankBegin, rankEnd],[winsBegin, winsEnd]];
			filterData(["Wins"], ui.values);
			changeAxis(true, ui.values);
		}
	});
	$( "#amount-wins" ).val($( "#slider-wins" ).slider( "values", 0 ) + " - " + $( "#slider-wins" ).slider( "values", 1 ));

	//Slider for ranks
	$( "#slider-rank" ).slider({
		range: true,
		min: 0,
		max: maxRank,
		values: [0, maxRank],
		slide: function( event, ui ) {
			$( "#amount-rank" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
			rankBegin = ui.values[0];
			rankEnd   = ui.values[1];
			ranges    = [[rankBegin,rankEnd], [winsBegin,winsEnd]];
			filterData(["Rank"], ui.values);
			changeAxis(false, ui.values);
		}
	});
	$( "#amount-rank" ).val($( "#slider-rank" ).slider( "values", 0 ) + " - " + $( "#slider-rank" ).slider( "values", 1 ));
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