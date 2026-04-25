app.controller("DashboardController", function($scope, $location, $http) {
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
        return null;
    }

    const username = getCookie("username");

    if (!username) {
        $location.path('/login');
        return;
    }

    $scope.userProfile = {};
    $scope.serverUrl = API_BASE_URL;

    // Fetch user profile
    $http.get($scope.serverUrl + '/api/auth/profile/' + username)
        .then(function(response) {
            $scope.userProfile = response.data;
            fetchStudents(); // Fetch students once we have moduleId
            fetchWifi(); // Fetch Wi-Fi config
        })
        .catch(function(error) {
            console.error("Error fetching profile", error);
        });

    $scope.logout = function() {
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        $location.path('/login');
    };

    // --- Tab Navigation Logic ---
    $scope.currentTab = 'dashboard';
    
    $scope.setTab = function(tabName) {
        $scope.currentTab = tabName;
    };

    // --- Student Info Management Logic ---
    $scope.studentTab = 'overview';
    $scope.setStudentTab = function(tab) {
        $scope.studentTab = tab;
    };

    $scope.studentsList = [];
    $scope.newStudent = { gender: 'Male' };
    $scope.deleteData = { enrollmentNumber: '', confirm1: false, confirm2: false };
    $scope.isScanning = false;

    function fetchStudents() {
        if (!$scope.userProfile.moduleId) return;
        $http.get($scope.serverUrl + '/api/student/list/' + $scope.userProfile.moduleId)
            .then(function(response) {
                $scope.studentsList = response.data;
            })
            .catch(function(error) {
                console.error("Error fetching students", error);
            });
    }

    $scope.enrollStudent = function() {
        if (!$scope.newStudent.enrollmentNumber || !$scope.newStudent.name || !$scope.newStudent.rfid) return;
        
        $scope.isScanning = true;

        var payload = {
            enrollmentNumber: $scope.newStudent.enrollmentNumber,
            name: $scope.newStudent.name,
            gender: $scope.newStudent.gender,
            rfid: $scope.newStudent.rfid,
            moduleId: $scope.userProfile.moduleId
        };

        $http.post($scope.serverUrl + '/api/student/add', payload)
            .then(function(response) {
                $scope.isScanning = false;
                alert("Success! Student saved to database.");
                $scope.newStudent = { gender: 'Male', rfid: '' }; // reset form
                fetchStudents();
            })
            .catch(function(error) {
                $scope.isScanning = false;
                alert("Failed: " + (error.data ? error.data.message : "Error adding student."));
            });
    };

    $scope.deleteStudent = function() {
        if (!$scope.deleteData.enrollmentNumber || !$scope.deleteData.confirm1 || !$scope.deleteData.confirm2) {
            alert("Please provide the enrollment number and check both confirmation boxes.");
            return;
        }

        $http.delete($scope.serverUrl + '/api/student/delete/' + $scope.userProfile.moduleId + '/' + $scope.deleteData.enrollmentNumber)
            .then(function(response) {
                alert("Student deleted successfully!");
                $scope.deleteData = { enrollmentNumber: '', confirm1: false, confirm2: false }; // reset form
                fetchStudents();
            })
            .catch(function(error) {
                alert(error.data.message || "Error deleting student.");
            });
    };

    // --- Wi-Fi Module Management Logic ---
    $scope.wifiList = [];
    $scope.newWifi = {};

    function fetchWifi() {
        if (!$scope.userProfile.moduleId) return;
        $http.get($scope.serverUrl + '/api/wifi/' + $scope.userProfile.moduleId)
            .then(function(response) {
                // Handle ESP32 format {"wifi":{"SSID":"password"},"module_id":"IT_A"}
                if (response.data && response.data.wifi) {
                    const ssid = Object.keys(response.data.wifi)[0];
                    const password = response.data.wifi[ssid];
                    $scope.wifiList = [{ name: ssid, password: password, selected: false }];
                } else if (Array.isArray(response.data)) {
                    $scope.wifiList = response.data;
                } else {
                    $scope.wifiList = [];
                }
            })
            .catch(function(error) {
                if (error.status === 404) {
                    // No Wi-Fi config found
                    $scope.wifiList = [];
                } else {
                    console.error("Error fetching Wi-Fi config", error);
                }
            });
    }

    $scope.addWifi = function() {
        if ($scope.wifiList.length >= 1) {
            alert("You can only add 1 Wi-Fi configuration at a time. Delete the existing one first.");
            return;
        }
        
        if ($scope.newWifi.name && $scope.newWifi.password) {
            $scope.wifiList.push({
                name: $scope.newWifi.name,
                password: $scope.newWifi.password,
                selected: false
            });
            $scope.newWifi = {}; // Reset form
        }
    };

    $scope.deleteWifi = function() {
        // Find if the single wifi is selected
        const isSelected = $scope.wifiList.some(w => w.selected);
        if (isSelected) {
            $http.delete($scope.serverUrl + '/api/wifi/' + $scope.userProfile.moduleId)
                .then(function() {
                    $scope.wifiList = [];
                })
                .catch(function(error) {
                    console.error("Error deleting Wi-Fi", error);
                });
        }
    };

    $scope.saveWifiList = function() {
        const payload = {
            moduleId: $scope.userProfile.moduleId,
            wifiList: $scope.wifiList
        };
        
        $http.post($scope.serverUrl + '/api/wifi/save', payload)
            .then(function(response) {
                alert("Wi-Fi list saved successfully to database!");
                fetchWifi();
            })
            .catch(function(error) {
                alert("Error saving Wi-Fi configuration.");
            });
    };

    $scope.factoryReset = function() {
        if (confirm("Are you sure you want to perform a factory reset? This will clear all Wi-Fi networks in the database.")) {
            $http.delete($scope.serverUrl + '/api/wifi/factory-reset/' + $scope.userProfile.moduleId)
                .then(function() {
                    $scope.wifiList = [];
                    alert("Factory reset successful.");
                })
                .catch(function(error) {
                    alert("Error during factory reset.");
                });
        }
    };

    // --- Dashboard Sub-Tab Logic ---
    $scope.dashboardSubTab = 'overview';
    $scope.setDashboardSubTab = function(tab) {
        $scope.dashboardSubTab = tab;
        if (tab === 'log') fetchAttendanceLogs();
    };

    // --- Date Formatter ---
    // Converts "YYYY-MM-DD" -> "DD/MM/YYYY" safely (avoids AngularJS date filter bug with plain strings)
    $scope.formatDate = function(dateStr) {
        if (!dateStr) return '';
        var parts = dateStr.split('-');
        if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
        return dateStr;
    };

    // --- Attendance Metrics ---
    $scope.metricsFilters = {};
    $scope.metricsData = null;
    $scope.metricsLoading = false;
    $scope.metricsError = null;

    $scope.fetchAttendanceMetrics = function() {
        if (!$scope.userProfile.moduleId) return;
        $scope.metricsLoading = true;
        $scope.metricsError = null;
        $scope.metricsData = null;

        var params = [];
        if ($scope.metricsFilters.enrollments) params.push('enrollments=' + encodeURIComponent($scope.metricsFilters.enrollments));
        if ($scope.metricsFilters.startDate)   params.push('startDate=' + $scope.metricsFilters.startDate);
        if ($scope.metricsFilters.endDate)     params.push('endDate=' + $scope.metricsFilters.endDate);
        if ($scope.metricsFilters.minPercent)  params.push('minPercent=' + $scope.metricsFilters.minPercent);
        if ($scope.metricsFilters.filterStudents) params.push('filterStudents=' + $scope.metricsFilters.filterStudents);
        if ($scope.metricsFilters.sortBy)      params.push('sortBy=' + $scope.metricsFilters.sortBy);

        var url = $scope.serverUrl + '/api/attendance-metrics/' + $scope.userProfile.moduleId;
        if (params.length) url += '?' + params.join('&');

        $http.get(url)
            .then(function(response) {
                $scope.metricsLoading = false;
                if (response.data.totalSessions === 0) {
                    $scope.metricsError = 'No attendance sessions found for this module.';
                } else {
                    $scope.metricsData = response.data;
                }
            })
            .catch(function(error) {
                $scope.metricsLoading = false;
                $scope.metricsError = 'Failed to load attendance data. ' + (error.data ? error.data.message : '');
            });
    };

    $scope.resetMetricsFilters = function() {
        $scope.metricsFilters = {};
        $scope.metricsData = null;
        $scope.metricsError = null;
    };

    // --- Attendance Session Logs ---
    $scope.attendanceLogs = [];

    function fetchAttendanceLogs() {
        if (!$scope.userProfile.moduleId) return;
        $http.get($scope.serverUrl + '/api/attendance-metrics/' + $scope.userProfile.moduleId + '/logs')
            .then(function(response) {
                $scope.attendanceLogs = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching attendance logs', error);
            });
    }

    // Auto-load metrics on dashboard tab open
    var originalFetchStudents = fetchStudents;
    function fetchStudents() {
        if (!$scope.userProfile.moduleId) return;
        $http.get($scope.serverUrl + '/api/student/list/' + $scope.userProfile.moduleId)
            .then(function(response) {
                $scope.studentsList = response.data;
                // Also auto-load attendance metrics on first load
                $scope.fetchAttendanceMetrics();
            })
            .catch(function(error) {
                console.error("Error fetching students", error);
            });
    }
});

