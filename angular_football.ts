/// <reference path="../DefinitelyTyped/angularjs/angular.d.ts"/>
/// <reference path="football.ts"/>

interface FootballScope extends ng.IScope {
	game: Game;
};

module FootballModule {
	"use strict";
	angular.module("footballApp", []);
	export var getModule: () => ng.IModule = () => {
		return angular.module("footballApp");
	}

	var app = getModule();
	class FootballController {
		constructor(private $scope: FootballScope, private $interval: ng.IIntervalService) {
			$scope.game = new Game(<HTMLCanvasElement>document.getElementById("field"));
			var intervalFn = () => {
			};
			$interval(intervalFn, 100);
			intervalFn();
		}
		public static $inject: string[] = ["$scope", "$interval"];
	}
	app.controller("FootballCtrl", FootballController);
}