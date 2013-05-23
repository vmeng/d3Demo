var RadarChart = {
  g: null,
  draw: function(id, d, options){
    var self = this;
    var cfg = {
     radius: 5,
     w :600, 
     h: 600, 
     factor: 1, 
     factorLegend:.85,
     total: 4,
     levels: 3,
     maxValue: 1000,
     radians: 2 * Math.PI, 
     minDistance : 50,
     opacityArea: 0.5
   }
    if(options != undefined){
      for(var i in options){
        cfg[i] = options[i];
      }
    }
    cfg.maxValue = d3.max(d, function(i){return Math.max.apply(Math,i.map(function(o){return o.value;}))});
    var allAxis = (d[0].map(function(i, j){return i.axis}));
    total = allAxis.length;
    var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
    d3.select(id).select("svg").remove();
    var g = d3.select(id).append("svg").attr("width", cfg.w).attr("height", cfg.h).append("g");

    for(var j=0; j<cfg.levels; j++){
      var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
      g.selectAll(".levels").data(allAxis).enter().append("svg:line")
       .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
       .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
       .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
       .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
       .attr("class", "line").style("stroke", "grey").style("stroke-width", "0.5px")
       .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");;

    }

    var color = (options && options.color)? options.color : d3.scale.category10();

    series = 0;

    var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");

    axis.append("line")
        .attr("x1", cfg.w/2)
        .attr("y1", cfg.h/2)
        .attr("x2", function(j, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
        .attr("y2", function(j, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
        .attr("class", "line").style("stroke", "grey").style("stroke-width", "1px");

    axis.append("text").attr("class", "legend")
        .text(function(d){return d}).style("font-family", "sans-serif").style("font-size", "10px").attr("transform", function(d, i){return "translate(0, -10)"})
        .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-20*Math.sin(i*cfg.radians/total);})
        .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))+20*Math.cos(i*cfg.radians/total);});

 
    for(x in d){
      dataValues = [];
      y = d[x];
      d3.select(id+" g").selectAll(".nodes")
        .data(y, function(j, i){
          dataValues.push([
            cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
            cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
          ]);
        });
      dataValues.push(dataValues[0]);
      var area = g.select(id+" g").selectAll(".area")
                     .data([dataValues])
                     .enter()
                     .append("polygon")
                     .attr("class", "serie"+series)
                     .style("stroke-width", "2px")
                     .style("stroke", color(series))
                     .on('mouseover', function (d){
                                        z = "polygon."+d3.select(this).attr("class");
                                        g.selectAll("polygon").transition(200).style("fill-opacity", 0.1); 
                                        g.selectAll(z).transition(200).style("fill-opacity", .7);
                                      })
                     .on('mouseout', function(){
                                        g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                     });
      area.transition(2000)
      .attr("points",function(d) {return d}).style("fill", function(j, i){return color(series)})
      .style("fill-opacity", cfg.opacityArea).ease("elastic");
      series++;
    }
    series=0;


    for(x in d){
      y = d[x];
      var nodes = d3.select(id+" g").selectAll(".nodes")
        .data(y).enter()
        .append("svg:circle").attr("class", "serie"+series)
        .attr("alt", function(j){return Math.max(j.value, 0)})
        .attr("data-id", function(j){return j.axis})
        .style("fill", color(series)).style("fill-opacity", .9)
        .on('mouseover', function (d){
                    newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                    newY =  parseFloat(d3.select(this).attr('cy')) - 5;
                    tooltip.attr('x', newX).attr('y', newY).text(d.value).transition(200).style('opacity', 1);
                    z = "polygon."+d3.select(this).attr("class");
                    g.selectAll("polygon").transition(200).style("fill-opacity", 0.1); 
                    g.selectAll(z).transition(200).style("fill-opacity", .7);
                  })
        .on('mouseout', function(){
                    tooltip.transition(200).style('opacity', 0);
                    g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
                  })
        .append("svg:title")
        .text(function(j){return Math.max(j.value, 0)});
        
      nodes.transition(2000).attr('r', cfg.radius).attr("cx", function(j, i){
          dataValues.push([
            cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
            cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
        ]);
        return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
        })
        .attr("cy", function(j, i){
          return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
        });
      series++;
    }
    //Tooltip
    tooltip = g.append('text').style('opacity', 0).style('font-family', 'sans-serif').style('font-size', 13);
  },
}

//below chart is for xRadar
var xRadarChart = {
	chartTool: RadarChart,
	names: [],
	series_data: [],
	show_data:[],
	opt:{},
	id:"",
	draw: function(id, data, options){
	   var legendHtm = '';
	   xRadarChart.id = id;
	   xRadarChart.opt = options;
       xRadarChart.names = data.map(function(i, j){return {"name":i.name, "select": true}});
       
       xRadarChart.names.forEach(function(entry, index){
       	var color = xRadarChart.opt.color(index);
       	legendHtm = legendHtm + "<span style='cursor:pointer' onclick='xRadarChart.selectSeries("+index+", this)'> "
       	+ "<div style='width:10px;height:10px;border-radius:10px;background-color:"+color+";border:2px solid "+color+";display: inline-block;'>&nbsp;</div>"
       	+entry.name+"</span>&nbsp;"
       })
       d3.select(xRadarChart.id).append("div").style("text-align","right");
       $(xRadarChart.id+ " div").html(legendHtm);
       xRadarChart.series_data = data.map(function(i, j){return i.data});  
       xRadarChart.show_data = $.extend(true, [], xRadarChart.series_data);
        
	   xRadarChart.chartTool.draw(xRadarChart.id, xRadarChart.show_data, xRadarChart.opt);
	},
	selectSeries: function(index, btn){
        jeremy = btn;
		xRadarChart.names[index].select = !xRadarChart.names[index].select;
		if(xRadarChart.names[index].select){
			$(btn).find("div").css("background-color", xRadarChart.opt.color(index));
			xRadarChart.show_data[index] =$.extend(true, [], xRadarChart.series_data[index]);
		}else {
			var dataInSeries = xRadarChart.show_data[index];
			for(var i=0; i < dataInSeries.length; i++){
				dataInSeries[i].value = 0;
			}
			$(btn).find("div").css("background-color","transparent");
		}
		xRadarChart.chartTool.draw(xRadarChart.id, xRadarChart.show_data, xRadarChart.opt);
	}
}
