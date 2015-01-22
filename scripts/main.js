angular.module('cogtech.central',[])
.controller('avgController', function ($interval, $avg) {
  var _this = this, rand, fetch, draw;
  _this.c = {};
  _this.r = {};
  _this.waves = ['alpha', 'beta', 'gamma', 'theta'];

  _this.r.alpha = [14,19];
  _this.c.alpha = 13;

  _this.r.beta = [14,19];
  _this.c.beta = 13;

  _this.r.gamma = [14,19];
  _this.c.gamma = 13;

  _this.r.theta = [14,19];
  _this.c.theta = 13;

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
    "<div class='fill' ng-style=\"{'height': data.height }\"></div>"+
    "<h2 class='title' data-ng-bind='data.title'></h2></div>";
  f.controllerAs = "data";
  f.controller = function ($timeout, $interval) {
    var _this;
    _this = this;
    $interval(function () {
      _this.calcHeight();
    }, 2000);
    _this.calcHeight = function calcHeight () {
      _this.height = _this.value > 0 ? parseInt(_this.value * 10 ) + "px" : "10px";
    };
    _this.calcHeight();
  };
  f.link = function (scope, elem, attrs, controller) {
    controller.title = attrs.title;
    controller.color = attrs.color;
    controller.value = scope.value;
    $interval(function () {
      controller.value = scope.value;
    }, 1000);
  };
  return f;
})
.filter('intg', function() {
    return function(input) {
      return parseInt(input, 10);
    };
})
.controller('spiderController', function ($spacebrew) {

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

