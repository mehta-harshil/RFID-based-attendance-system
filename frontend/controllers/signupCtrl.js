app.controller("SignupController", function($scope, $location, $http) {
    $scope.currentStep = 1;
    $scope.user = {};
    $scope.showPassword = false;

    $scope.nextStep = function() {
        // In a real app, you would validate Step 1 fields here before proceeding
        if($scope.user.email && $scope.user.adminName && $scope.user.username && $scope.user.password) {
            $scope.currentStep = 2;
        } else {
            alert("Please fill all required fields in Step 1.");
        }
    };

    $scope.prevStep = function() {
        $scope.currentStep = 1;
    };

    $scope.togglePassword = function() {
        $scope.showPassword = !$scope.showPassword;
    };

    $scope.submitSignup = function() {
        if($scope.user.moduleId && $scope.user.orgName) {
            // Use FormData for file upload
            var fd = new FormData();
            fd.append('email', $scope.user.email);
            fd.append('adminName', $scope.user.adminName);
            fd.append('username', $scope.user.username);
            fd.append('password', $scope.user.password);
            fd.append('moduleId', $scope.user.moduleId);
            fd.append('orgName', $scope.user.orgName);
            
            if ($scope.user.logo) {
                fd.append('logo', $scope.user.logo);
            }

            $http.post(API_BASE_URL + '/api/auth/register', fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .then(function(response) {
                alert("Signup successful! Redirecting to login...");
                $location.path("/login");
            })
            .catch(function(error) {
                alert("Signup failed: " + (error.data ? error.data.message : "Server error"));
            });
        } else {
            alert("Please fill all required fields in Step 2.");
        }
    };
});
