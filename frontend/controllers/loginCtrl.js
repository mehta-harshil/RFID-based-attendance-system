app.controller("LoginController", function($scope, $location, $http) {
    $scope.user = {};
    $scope.errorMessage = "";
    $scope.showPassword = false;

    $scope.togglePassword = function() {
        $scope.showPassword = !$scope.showPassword;
    };

    $scope.login = function() {
        if ($scope.user.identifier && $scope.user.password) {
            $http.post('http://' + window.location.hostname + ':5000/api/auth/login', {
                identifier: $scope.user.identifier,
                password: $scope.user.password
            })
            .then(function(response) {
                // Minimal: Set simple cookie (no overhead) with username
                document.cookie = "username=" + response.data.user.username + "; path=/; max-age=86400";
                $location.path("/dashboard");
            })
            .catch(function(error) {
                $scope.errorMessage = (error.data && error.data.message) ? error.data.message : "Invalid credentials";
            });
        } else {
            $scope.errorMessage = "Please enter both username/email and password.";
        }
    };
});
