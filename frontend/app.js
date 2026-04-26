var app = angular.module("attendanceApp", ["ngRoute"]);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "LoginController"
        })
        .when("/signup", {
            templateUrl: "views/signup.html",
            controller: "SignupController"
        })
        .when("/forgot-password", {
            templateUrl: "views/forgotPassword.html",
            controller: "ForgotPasswordController"
        })
        .when("/dashboard", {
            templateUrl: "views/dashboard.html",
            controller: "DashboardController"
        })
        .otherwise({
            redirectTo: "/signup"
        });
});

app.run(function ($rootScope, $location, $http) {
    $rootScope.location = $location;

    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
        return null;
    }

    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        var usernameCookie = getCookie("username");

        // If visiting dashboard but cookie does not exist
        if (!usernameCookie && next.$$route && next.$$route.originalPath === '/dashboard') {
            event.preventDefault();
            $location.path('/login');
            return;
        }

        // If visiting signup/login/forgot-password but cookie exists
        if (usernameCookie && (!next.$$route || next.$$route.originalPath === '/login' || next.$$route.originalPath === '/signup' || next.$$route.originalPath === '/forgot-password')) {
            event.preventDefault();

            $http.get(API_BASE_URL + '/api/auth/check/' + usernameCookie)
                .then(function (response) {
                    if (response.data.exists) {
                        $location.path('/dashboard');
                    } else {
                        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                        $location.path('/signup');
                    }
                })
                .catch(function () {
                    $location.path('/signup');
                });
        }
    });
});

// Custom directive to handle file uploads in AngularJS
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);
