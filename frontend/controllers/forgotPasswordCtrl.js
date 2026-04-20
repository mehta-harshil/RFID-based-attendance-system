app.controller("ForgotPasswordController", function($scope, $http, $location) {
    $scope.resetData = {};
    $scope.message = "";
    $scope.isError = false;
    $scope.isSuccess = false;
    $scope.showPassword = false;

    $scope.togglePassword = function() {
        $scope.showPassword = !$scope.showPassword;
    };

    $scope.resetPassword = function() {
        if ($scope.resetData.identifier && $scope.resetData.newPassword) {
            $http.post('http://' + window.location.hostname + ':5000/api/auth/reset-password', $scope.resetData)
            .then(function(response) {
                $scope.isError = false;
                $scope.isSuccess = true;
                $scope.message = response.data.message + ". Redirecting to login...";
                
                setTimeout(function() {
                    $scope.$apply(function() {
                        $location.path('/login');
                    });
                }, 2000);
            })
            .catch(function(error) {
                $scope.isSuccess = false;
                $scope.isError = true;
                $scope.message = (error.data && error.data.message) ? error.data.message : "Failed to reset password.";
            });
        }
    };
});
