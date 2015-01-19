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
  }, 120000);

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
});
