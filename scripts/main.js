angular.module('cogtech.central',[])
.controller('avgController', function ($interval) {
  var _this = this, rand;
  _this.c = {};
  _this.r = {};
  _this.r.lowAlphaRange = [10,20];
  _this.c.lowAlpha = 10;

  _this.r.highAlphaRange = [14,19];
  _this.c.highAlpha = 13;

  _this.totalvisitors = 102;
  _this.sampleRange = [10,20];

  $interval(function () {
    _this.c.lowAlpha = rand(_this.c.lowAlpha, _this.r.lowAlphaRange);
    _this.c.highAlpha = rand(_this.c.highAlpha, _this.r.highAlphaRange);
    console.log(_this.c.lowAlpha);
  }, 1000);

  rand = function (e,r) {
    var a = Math.random() * 1000;
    if(e > r[1] || e < r[0]) {
      return r[0];
    }
    if (e === r[0]) {
      return e += 1;
    }
    if (e === r[1]) {
      return e += -1;
    }
    if(a<400){
      return e +=1;
    }
    return e += -1;
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
    var _this = this;
    _this.height = (_this.value * 10 ) + "px";
    $interval(function () {
      _this.height = (_this.value * 10 ) + "px";
    }, 1000);
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
});
