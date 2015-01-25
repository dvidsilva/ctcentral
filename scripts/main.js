angular.module('cogtech.central',[])
.controller('avgController', function ($interval, $avg) {
  var _this = this, rand, fetch, draw;
  _this.c = {};
  _this.r = {};
  _this.waves = ['alpha', 'beta', 'gamma', 'theta'];

  _this.r.alpha = [14,19];
  _this.c.alpha = 1;

  _this.r.beta = [14,19];
  _this.c.beta = 1;

  _this.r.gamma = [14,19];
  _this.c.gamma = 1;

  _this.r.theta = [14,19];
  _this.c.theta = 1;

  _this.totalvisitors = 102;

  $interval(function intervalCheck () {
    fetch();
  }, 30000);

  $interval(function intervalDraw () {
    draw();
  }, 1000);

  draw = function draw () {
    angular.forEach(_this.waves, function (v) {
      _this.c[v] = rand(_this.c[v], _this.r[v]);
    });
  };

  fetch = function fetch () {
    $avg.fetch().then(function (data) {
      if (!data) {
        return;
      }
      angular.forEach(_this.waves, function (v) {
        _this.c[v] = data[v].avg;
        _this.r[v] = [data[v].avg - data[v].std, data[v].avg + data[v].std];
      });
    });
    $avg.visitors().then(function (data) {
      _this.totalvisitors = parseInt(data.visitors, 10);
    });
  };

  rand = function (e,r) {
    var a, v;
    if(true) {
      return e;
    }
    a = Math.random() * 1000;
    if(e > r[1] || e < r[0]) {
      v = r[0];
    }
    if (e === r[0]) {
      v = e += 1;
    }
    if (e === r[1]) {
      v = e += -1;
    }
    if (a < 400) {
      v = e +=1;
    } else {
      v = e += -1;
    }
    if(v <= 0 ) {
      v = 1.5;
    }
    return v;
  };
  draw();
  fetch();

})
.service('$avg', function ($http) {
  var _this = this;
  _this.fetch = function fetch () {
    return $http.jsonp('http://cloudbrain.rocks/data/aggregates/fft?callback=JSON_CALLBACK')
    .then(function (response) {
      return response.data;
    });
  };
  _this.visitors = function visitors () {
    return $http.jsonp('http://cloudbrain.rocks/data/visitors?callback=JSON_CALLBACK')
    .then(function (response) {
      return response.data;
    });
  };
})
.directive('ctBar', function ($interval) {
  var f = {};
  f.scope = {
    'value': '=',
  };
  f.template = "<div class='bar {{data.color}}' >"+
    "<h2 class='title' data-ng-bind='data.title'></h2>" +
    "<div class='fill' ng-style=\"{'height': data.height , 'bottom' : data.bottom, 'top' : data.top }\">"+
    "<span ng-style=\"{'bottom': data.labelHeight }\">"+
    "{{data.value | double:2}} dB</span></div>" +
    "</div>";
  f.controllerAs = "data";
  f.controller = function ($timeout, $interval) {
    var _this;
    _this = this;
    _this.bottom = '100px';
    $interval(function () {
      _this.calcHeight();
    }, 2000);
    _this.calcHeight = function calcHeight () {
      _this.value = -10;
      if (_this.value >= 0 ) {
        _this.bottom = '100px';
        _this.top = "";
        _this.height =  _this.value > 0 ? (parseInt(_this.value * 10 ) * 0.6 ) + 20 + "px" : "10px";
        _this.labelHeight = _this.value > 0 ? parseInt(_this.bottom.replace("px","")) + 5: "15px";
      } else {
        _this.top = parseInt(_this.value * -10 ) * 0.6 + 100 + "px";
        _this.bottom = "";
        _this.height =   parseInt(_this.bottom.replace("px","")) - 100 +  "px";
        _this.labelHeight = "-25px";
      }
    };
    _this.calcHeight();
  };
  f.link = function (scope, elem, attrs, controller) {
    controller.title = attrs.title;
    controller.color = attrs.color;
    controller.value = scope.value ;
    $interval(function () {
      controller.value = scope.value ;
    }, 1000);
  };
  return f;
})
.filter('intg', function() {
  return function(input, zeroes) {
    return parseInt(input, zeroes);
  };
})
.filter('double', function () {
  return function(input) {
    return (input).toFixed(2);
  };
})
.controller('chartsController', function () {

})
// http://bl.ocks.org/mbostock/3048740 :(
// not using it
.directive('ctSpider', function ($log) {
  var f = {};
  f.controllerAs = "graph";
  f.controller = function () {
    var _this = this;
    _this.width = "300";
    _this.height= "300";
  };
  f.link = function(scope, elem, attrs, controller) {
    var formatDate, formatLabels, width, height, outerRadius, innerRadius,
    angle, radius, z, stack, nest, line, area, svg, labels;
    controller.waves = [];
    formatDate = d3.time.format("%a");
    labels = ['alpha', 'gamma', 'beta', 'theta'];
    formatLabels = function(d) {
      return labels[d];
    };

    width = controller.width;
    height = controller.height;
    outerRadius = height / 2 - 10;
    innerRadius = 0;

    angle = d3.time.scale()
    .range([0, 2 * Math.PI]);

    radius = d3.scale.linear()
    .range([innerRadius, outerRadius]);

    z = d3.scale.category20c();

    stack = d3.layout.stack()
    .offset("zero")
    .values(function(d) { return d.values; })
    .x(function(d) { return d.time; })
    .y(function(d) { return d.value; });

    nest = d3.nest()
    .key(function(d) { return d.key; });

    line = d3.svg.line.radial()
    .interpolate("cardinal-closed")
    .angle(function(d) { return angle(d.time); })
    .radius(function(d) { return radius(d.y0 + d.y); });

    area = d3.svg.area.radial()
    .interpolate("cardinal-closed")
    .angle(function(d) { return angle(d.y0); })
    .innerRadius(function(d) { return radius(d.y0); })
    .outerRadius(function(d) { return radius(d.y0 + d.y); });

    svg = d3.select(elem[0]).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    controller.waves = [
      {"key" : "0", "values" : [
        {"key" : "alpha", "y" : 20, "y0" : 0},
        {"key" : "beta", "y" : 20, "y0" : 1},
        {"key" : "gamma", "y" : 20, "y0" : 2},
        {"key" : "theta", "y" : 20, "y0" : 3},
    ]},
    {"key" : "1", "values" : [
      {"key" : "alpha", "y" : 19, "y0" : 0},
      {"key" : "beta", "y" : 19, "y0" : 1},
      {"key" : "gamma", "y" : 19, "y0" : 2},
      {"key" : "theta", "y" : 19, "y0" : 3},
    ]},
    {"key" : "2", "values" : [
      {"key" : "beta", "y" : 19, "y0" : 0},
      {"key" : "beta", "y" : 19, "y0" : 1},
      {"key" : "beta", "y" : 19, "y0" : 2},
      {"key" : "beta", "y" : 19, "y0" : 3},
    ]}
    ];
    console.log(controller.waves);

    angle.domain([0, d3.max(controller.waves, function(d) { return 4; })]);
    radius.domain([0, d3.max(controller.waves, function(d) { return 30; })]);
    svg.selectAll(".layer")
    .data(controller.waves)
    .enter().append("path")
    .attr("class", "layer")
    .attr("d", function(d) { return area(d.values); })
    .style("fill", function(d, i) { return d.key === "2" ? "black" : z(i); });
    svg.selectAll(".axis")
      .data(d3.range(angle.domain()[1]))
      .enter().append("g")
      .attr("class", "axis")
      .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
      .call(d3.svg.axis()
            .scale(radius.copy().range([-innerRadius, -outerRadius]))
            .orient("left"))
            .append("text")
            .attr("y",  (width / 2 ) - 20)
            .attr("dy", ".71em")
            .attr("text-anchor", "end")
            .text(function(d) { return formatLabels(d); });
  };
  return f;
})
.directive('radarChart', function ($log, $spacebrew) {
  var f = {};
  f.controller = function () {
    // 1280 * 720
  };
  f.link = function(scope, element, attributes, controller) {
    $log.info(scope, element, attributes, controller);
    var data, chart, svg;
    data = [
      {
      className : 'alpha',
      axes: [
        // xOffset, yOffset
        {axis: "Alpha", value: 16, xOffset: 10},
        {axis: "Alpha", value: 16, xOffset: 10},
        {axis: "Beta", value: 14},
        {axis: "Gama", value: 18},
        {axis: "Theta", value: 14},
      ]
    },
    {
      className : 'averageaverage',
      axes: [
        // xOffset, yOffset
        {axis: "Alpha", value: 19, xOffset: 10},
        {axis: "Alpha", value: 20, xOffset: 10},
        {axis: "Beta", value: 18},
        {axis: "Gama", value: 19},
        {axis: "Theta", value: 14},
      ]
    }

    ];
    //RadarChart.draw(elem[0], data);
    chart = RadarChart.chart();
    chart.config({
      maxValue: 25,
      radians: 2 * Math.PI,
      axisLine: true,
      levels: 10,
      circles: true,
      radius: 5,
      w: 230,
      h: 230
    });
    svg = d3.select(element[0]).append('svg')
    .attr('width', 600)
    .attr('height', 800);
    svg.append('g').classed('focus', 1).datum(data).call(chart);

  };
  return f;
})
.service('$spacebrew', function ($timeout, $log) {
  var sb, _this;
  _this = this;
  _this.museClients = [];
  _this.client = {};
  _this.options = {
    name: 'data-visualization',
    server : 'cloudbrain.rocks',
    description : 'Main dashboard in room'
  };
  _this.waves = [
    'alpha_absolute',
    'beta_absolute',
    'gamma_absolute',
    'theta_absolute'
  ];

  sb = function init () {
    var sb;
    sb = new Spacebrew.Client(
      _this.options.server, _this.options.name, _this.options.description, {debug: true}
    );
    sb.extend(Spacebrew.Admin);
    sb.onStringMessage = function (name, value) {
      $log.info('message received');
      $log.info(name, value);
    };
    sb.onOpen = function () {
      $log.info('connected to Spacebrew');
    };
    sb.onNewClient = function( client ) {
      $log.info(client);
      if(client.name && !!client.name.match(/muse/)) {
        _this.museClients.push(client);
        _this.addRoute();
      }
      if(client.name && client.name === _this.options.name) {
        _this.client = client;
        _this.addRoutes();
      }
    };
    sb.onRemoveClient(function (client) {
      $log.info(client);
    });
    angular.forEach(_this.waves, function (wave) {
      sb.addSubscribe(wave, "string");
    });
    sb.connect();
    return sb;
  }();

  _this.addRoutes = function addRoutes () {
    angular.forEach(_this.museClients, function (c) {
      _this.addRoute(c);
    });
  };

  _this.addRoute = function addRoute (client) {
    if(!_this.client.name) {
      $log.info('postponing creation of routes');
      return;
    }
    angular.forEach(_this.waves, function (wave) {
      $log.info('adding route', client.name, client.remoteAddress, wave);
      sb.addRoute( client.name, client.remoteAdress, wave,
                  _this.client.name, _this.client.remoteAdress, wave);
    });
  };

  // sb.addRoute( 'muse-001', 'remoteAdress', 'delta_absolute', 'data-viz', 'local adress', 'delta-absolute-muse-001' );

});
// http://cloudbrain.rocks/

// http://spacebrew.github.io/spacebrew/admin/admin.html?server=cloudbrain.rocks
// Request
// GET request on /link with the following parameters:
// publisher : The input data coming from the hardware (Muse headset for example).
// subscriber : Set it to 'cloudbrain' to keep historical data. Can also be set to your spacebrew client to get live data.
// pub_metric : The publisher name of the metric you want to route. See the Muse Metrics section below for the complete list.
// sub_metric : The subscriber name of the metric you want to route.
// Sample Request
// GET
//
// http://cloudbrain.rocks/link?pub_metric=beta_absolute&sub_metric=beta_absolute&publisher=muse-001&subscriber=data-visualization


//Radar chart
// var data = [
//   {
//     className : 'alpha',
//     axes: [
//       {axis: "Alpha", value: 6, yOffset: 10},
//       {axis: "Beta", value: 4},
//       {axis: "Gama", value: 0},
//       {axis: "Theta", value: 4, xOffset: -20}
//     ]
//   },
//   {
//     className : 'beta',
//     axes: [
//       {axis: "Alpha", value: 4},
//       {axis: "Beta", value: 6},
//       {axis: "Gama", value: 4},
//       {axis: "Theta", value: 0}
//     ]
//   },
//   {
//     className : 'gamma',
//     axes: [
//       {axis: "Alpha", value: 0},
//       {axis: "Beta", value: 4},
//       {axis: "Gama", value: 6},
//       {axis: "Theta", value: 4}
//     ]
//   },
//   {
//     className : 'theta',
//     axes: [
//       {axis: "Alpha", value: 4},
//       {axis: "Beta", value: 0},
//       {axis: "Gama", value: 4},
//       {axis: "Theta", value: 6}
//     ]
//   }
//   ];
//   //RadarChart.draw(elem[0], data);
//   var chart = RadarChart.chart();
//   chart.config({
//     maxValue: 10,
//     radians: 2 * Math.PI,
//     axisLine: false,
//     levels: 2,
//     circles: true,
//     radius: 5
//   });
//   var svg = d3.select(elem[0]).append('svg')
//   .attr('width', 600)
//   .attr('height', 800);
//   svg.append('g').classed('focus', 1).datum(data).call(chart);


