var app = angular.module('SMS_APP', ['ngMaterial' , 'ngFileUpload']);
app.controller('appCtrl' , function($scope , $http , $mdDialog , $location){

    $scope.loading = true;
    $scope.search = {query : ''}
    $http.get('/allmessages').then(function(response){
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

    $scope.delete = function(sms){
        $http.delete('/sms/' + sms._id).then(function(response){
            var index = $scope.messages.indexOf(sms);

            $scope.messages.splice(index , 1);
        });
    }
});

app.controller('uploadCtrl' , function($scope , $http , $mdDialog , Upload , $timeout){

    $scope.loading = true;
    var vm = this;
    $http.get('/upload/images').then(function(response){
        $scope.loading = false;
        if(response && response.data){
            $scope.images = response.data;
        }  
    });

    vm.submit = function(){ //function to call on form submit
        if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
            vm.upload(vm.file , vm.name); //call upload function
        }
    }
    
    vm.upload = function (file , name) {
        $scope.loading = true;
        Upload.upload({
            url: '/upload', 
            data:{file:file , name : name} 
        }).then(function (resp) { 
            $scope.loading = false;
            if(resp && resp.status == 200){ //validate success
                $scope.images.push(resp.data)
            } else {
                alert('an error occured');
            }
        })
    };

    $scope.delete = function(image){
        $http.delete('/upload/images/' + image._id).then(function(response){
            var index = $scope.images.indexOf(image);

            $scope.images.splice(index , 1);
        });
    }
})