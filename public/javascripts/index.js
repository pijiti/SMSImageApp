var app = angular.module('SMS_APP', ['ngMaterial']);
app.controller('appCtrl' , function($scope , $http , $mdDialog){

    $scope.loading = true;
    $http.get('http://localhost:3000/allmessages').then(function(response){
    	$scope.loading = false;
        if(response && response.data){
            $scope.messages = response.data;
        }  
    });

    $scope.print = function(message) {
    	console.log(message.content);
    	$scope.message = message;
        $mdDialog.show({
            templateUrl:'../templates/dialogue.html',
            locals : {'message' : $scope.message} ,
            controller: function DialogController($scope, $mdDialog , message) {
            	$scope.message=message;
                $scope.cancel = function() {
                	$mdDialog.hide();
                }
            } ,
            clickOutsideToClose:true
        });
    }
});