app.controller('MainController', function ($scope, $rootScope, $http, $mdMedia) {
        $rootScope.bigScreen = true;
        $rootScope.idHolder = {};
        $scope.objects = [
            {
                title: 'Test1',
                short: 'Short1',
                view: "views/home.html"
            },
            {
                title: 'Test1',
                short: 'Short1',
                view: "views/.html"
            }];
        $rootScope.$watch(function () {
            return $mdMedia('gt-sm');
        }, function (big) {
            $rootScope.bigScreen = big;
        });
        $rootScope.buttons = [
            {
                name: "Home",
                icon: "home",
                view: "home",
                current: true
            },
            {
                name: "Table",
                icon: "table",
                view: "table"
            },
            {
                name: "Search",
                icon: "search",
                view: "search"
            },
            {
                name: "Form",
                icon: "form",
                view: "form"
            },
            {
                name: "Settings",
                icon: "settings",
                view: "settings",
                settings: true
            }
        ];
        $rootScope.country = "Israel";
        $rootScope.limitSearch = true;
        $rootScope.view = "views/" + $scope.buttons[0].view + ".html";
        $rootScope.isStringEmpty = function (string) {
            return string == null || !string || 0 === string.length
        };
        $scope.teams = undefined;

        $rootScope.loadAll = function (index) {
            $http({
                method: 'GET',
                url: 'http://www.thebluealliance.com/api/v2/teams/' + index,
                headers: {
                    'X-TBA-App-Id': 'greenblitz:scouting-system:v01'
                }
            }).then(function successCallback(response) {
                for (var i = 0; i < response.data.length; i++) {

                    if (!$rootScope.isStringEmpty(response.data[i].nickname)) {
                        response.data[i].name = response.data[i].nickname;
                    }
                    if ($rootScope.isStringEmpty(response.data[i].name)) {
                        console.log("remove " + i);
                        response.data.splice(i, 1);
                    }
                }
                if ($scope.teams == null) {
                    $scope.teams = response.data
                }
                else {
                    addArrayTo(response.data, $scope.teams)
                }
                $rootScope.teams = $scope.teams
            }, function errorCallback(response) {
                return response;
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        };
        $rootScope.loadAllRanks = function () {
            $http({
                method: 'GET',
                url: 'http://www.thebluealliance.com/api/v2/event/2015ista/rankings',
                headers: {
                    'X-TBA-App-Id': 'greenblitz:scouting-system:v01'
                }
            }).then(function successCallback(response) {
                $rootScope.ranksFirst = [];
                $rootScope.ranksLast = [];
                var halfSize = response.data.length % 2 === 0 ?
                    response.data.length / 2 :
                    (response.data.length - 1) / 2;
                for (var i = 1; i < response.data.length; i++) {
                    if (i < halfSize){
                    $rootScope.ranksFirst[i] = {
                        index: response.data[i][0],
                        team: response.data[i][1],
                        average: response.data[i][2]
                    };
                    }
                    else{
                        $rootScope.ranksLast[i -  halfSize] = {
                            index: response.data[i][0],
                            team: response.data[i][1],
                            average: response.data[i][2]
                        };
                    }
                }
                if (response.data.length % 2 !== 0) {
                    $rootScope.ranksFirst[halfSize] = {
                        index: "1",
                        team: "1",
                        average: "1"
                    };
                    $rootScope.ranksLast[halfSize] = {
                        index: response.data[response.data.length - 1][0],
                        team: response.data[response.data.length - 1][1],
                        average: response.data[response.data.length - 1][2]
                    };
                }
            })
        };
        $rootScope.loadRankForTeam = function (team) {
            $http({
                method: 'GET',
                url: 'http://www.thebluealliance.com/api/v2/event/2015ista/rankings',
                headers: {
                    'X-TBA-App-Id': 'greenblitz:scouting-system:v01'
                }
            }).then(function successCallback(response) {
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i][1] == team || response.data[i][1] == team) {
                        switch (response.data[i][0] % 10) {
                            case 1:
                                $rootScope.teamrank = response.data[i][0] + "st";
                                break;
                            case 2:
                                $rootScope.teamrank = response.data[i][0] + "nd";
                                break;
                            case 3:
                                $rootScope.teamrank = response.data[i][0] + "rd";
                                break;
                            default:
                                $rootScope.teamrank = response.data[i][0] + "th";
                                break;
                        }
                        $rootScope.teamavg = response.data[i][2];
                        break;
                    }
                }
            })
        };
        $rootScope.loadMatches = function (team) {
            list = [""];
            $http({
                method: 'GET',
                url: 'http://www.thebluealliance.com/api/v2/event/2015ista/matches',
                headers: {
                    'X-TBA-App-Id': 'greenblitz:scouting-system:v01'
                }
            }).then(function successCallback(response) {
                list = [];
                qml = [];
                qfl = [];
                sfl = [];
                fl = [];
                for (var i = 0; i < response.data.length; i++) {
                    if (response.data[i].alliances.blue.teams.includes("frc" + team) || response.data[i].alliances.red.teams.includes("frc" + team)) {
                        switch (response.data[i].comp_level) {
                            case "qm":
                                qml.push(response.data[i]);
                                break;
                            case "qf":
                                qfl.push(response.data[i]);
                                break;
                            case "sf":
                                sfl.push(response.data[i]);
                                break;
                            case "f":
                                fl.push(response.data[i]);
                        }
                    }
                }
                sortArrayMatches(qml);
                sortArrayMatches(qfl);
                sortArrayMatches(sfl);
                sortArrayMatches(fl);
                addArrayTo(qml, list);
                addArrayTo(qfl, list);
                addArrayTo(sfl, list);
                addArrayTo(fl, list);
                $scope.objects = [];
                for (var i = 0; i < list.length; i++) {
                    match = list[i];
                    $scope.objects.push({
                        title: "Red " + match.alliances.red.score + " - Blue " + match.alliances.blue.score,
                        RedScore: match.alliances.red.score,
                        BlueScore: match.alliances.blue.score,
                        short: "Match no." + match.match_number,
                        details: match,
                        view: "views/matchDetails.html"
                    });
                }
                $rootScope.frcteam = "frc" + team;
                $rootScope.team = team;
                console.log(list);
            }, function errorCallback(response) {
                return response;
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        };
        $rootScope.loadData = function () {
            $scope.teams = null;
            $rootScope.teams = null;
            for (var i = 0; i < 12; i++) {
                $rootScope.loadAll(i)
            }
        }
        ;
        $rootScope.loadData();

        function addArrayTo(arr1, arr2) {
            for (var i = 0; i < arr1.length; i++) {
                arr2.push(arr1[i])
            }
        }

        function sortArrayMatches(arr) {
            var swapped;
            do {
                swapped = false;
                for (var i = 0; i < arr.length - 1; i++) {
                    if (arr[i].match_number > arr[i + 1].match_number) {
                        var temp = arr[i];
                        arr[i] = arr[i + 1];
                        arr[i + 1] = temp;
                        swapped = true;
                    }
                }
            } while (swapped);
        }
        $rootScope.checkIfTeamInAlliance = function(alliance, frcteam){
            for (var i = 0; i<alliance.teams.length;i++){
                if(alliance.teams[i]==frcteam){
                    return true;
                }
            }
            return false;
        }
    }
);