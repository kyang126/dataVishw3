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
			.domain([0, 1000])
			.range([h, 0]);

var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")

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

// var circles = svg.selectAll("circle")
//  .data(data)
//  .enter()
//  .append("circle")
//     .attr("cx", function(d) { return x(d.price);  })
//     .attr("cy", function(d) { return y(d.tValue);  })
//     .attr("r", 4)
//     .style("stroke", "black")
//     .style("opacity", 0.5)
//     .style("fill", function(data) { return col2(data.vol);})

var format = d3.time.format("%b %Y");
var dataset;

d3.csv("stocks.csv", function(error, stocks) {
if (error) {
	return console.log(error);
}
stocks.forEach(function(d) {
	d.price = +d.price;
	//console.log(d);
	// d.date = format.parse(d.date);
});

dataset = stocks;
drawVis(dataset);
});

var mytype = "all"; //keep track of currently selected type; default is all 
var patt = new RegExp("all");  
function filterType(mtype)  {   
//console.log(mtype);  
mytype=mtype;       
var res = patt.test(mytype);       
if(res){  
	var toVisualize = dataset;  //use all the data        
}else{            
	var toVisualize= dataset.filter(function(d, i) { //filter to only the selected type         
		return d["type"] == mytype;  
	});         
}
//console.log(toVisualize);     
drawVis(toVisualize); 
} 


function drawVis(data) {
console.log('drawVis', data);


var div = d3.select("#graph").append("div")   
	.attr("class", "tooltip")               
	.style("opacity", 0);


var circle = svg.selectAll("circle")            
 .data(data); //join with new data  
        circle  //update existing circles – price, tValue, and type will change with type   
        .attr("cx", function(d) { return x(d.price);  })            
        .attr("cy", function(d) { return y(d.tValue);  })            
        .style("fill", function(d) { return col(d.type); });                  
        circle.exit().remove(); //remove any excess circles  
        circle.enter().append("circle")  //add new circles  
        .attr("cx", function(d) { return x(d.price);  })            
        .attr("cy", function(d) { return y(d.tValue);  })            
        .style("fill", function(d) { return col(d.type); })  
        .attr("r", 4)  .style("stroke", "black")
        .on("mouseover", function(d, i) {
			div.transition()        
				.duration(200)      
				.style("opacity", .9);      
			div.html(d.name + "<br/>" + d.type + "<br/>" + d.price + "<br/>"  + d.tValue + "<br/>" + d.vol)  
				.style("left", (d3.event.pageX) + "px")     
				.style("top", (d3.event.pageY - 28) + "px");
			})
		.on("mouseout", function(d, i) { 
			 tooltip.transition()                
					.duration(500)                
					.style("opacity", 0);   
		});

		



/*	d3.select('select')
	.on("change", function() {
		console.log('change?');


	key = this.selectedIndex;

	var circles = svg.selectAll("circle")
		 .data(data)
		 .enter()
		 .append("circle")
			.attr("cx", function(d) { return x(d.price);  })
			.attr("cy", function(d) { return y(d.tValue);  })
			.attr("r", 4)
			.style("stroke", "black")
			.style("opacity", 0.5)
			.style("fill", function(d) {
				//console.log('fill area', d); 
				return col(d.type); 
			}) 
			.on("mouseover", function(d, i) {
				div.transition()        
					.duration(200)      
					.style("opacity", .9);      
				div.html(d.name + "<br/>" + d.type + "<br/>" + d.price + "<br/>"  + d.tValue + "<br/>" + d.vol)  
					.style("left", (d3.event.pageX) + "px")     
					.style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function(d, i) { 
				 tooltip.transition()                
						.duration(500)                
						.style("opacity", 0);   
			});
	
	 circles.exit().remove(); 
	 circles.enter().append("circle")  //add new circles  
		.attr("cx", function(d) { 
			return x(d.price);  
		})            
		.attr("cy", function(d) { 
			return y(d.tValue);  
		})            
		.style("fill", function(d) { 
			return col(d.type); 
		})  
		.attr("r", 4)  
		.style("stroke", "black");  
		// if a data point is selected highlight other 
		// data points of the same color
		
}); */
	
}