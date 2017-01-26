(function () {
  'use strict';

  angular
    .module('app.DashboardModule')
    .controller('DashboardController', DashboardController);

  DashboardController.$inject = ['$compile', '$scope', '$rootScope'];

  function DashboardController($compile, $scope, $rootScope) {
    $scope.myLayout = new GoldenLayout({
      content: [{
        type: 'row',
        content: [{
          type: 'component',
          title: 'User',
          componentName: 'angularModule',
          componentState: {templateId: 'userNameTemplate'}
        }, {
          type: 'component',
          title: 'Age',
          componentName: 'angularModule',
          componentState: {templateId: 'userDetailTemplate'}
        }]
      }]
    });

    $scope.AngularModuleComponent = function (container, state) {
      var html = $('#' + state.templateId).html();
      html = $compile('<div>' + html + '</div>')($rootScope);
      container.getElement().html(html);
    };
    $scope.myLayout.registerComponent('angularModule', $scope.AngularModuleComponent);
    $scope.myLayout.init();

    // Destroy Golden Layout when changing state
    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams){
        $scope.myLayout.destroy();
      });
  }
}());
