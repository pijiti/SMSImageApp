var app = angular.module('SMS_APP', ['ngMaterial']);
app.controller('appCtrl' , function($scope , $http){

    $scope.loading = true;
    $http.get('http://localhost:3000/allmessages').then(function(response){
        if(response && response.data){
            $scope.messages = response.data;
            $scope.loading = false;
        }  
    });
});