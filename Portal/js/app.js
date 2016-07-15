$(document).ready(function () {

    // ehrscape API
    var baseUrl = "https://rest.ehrscape.com/rest/v1";
    //var ehrId = "3fdf97c5-f87c-41ae-b951-8d682e9dc008"; // Mari
    var ehrId = "ebd63593-3e61-4f69-8c2c-f8b22549bda6"; // Mare
    var username = 'medrockweek2';
    var password = 'medrockweek2';

    $(".patient-records").sortable({
        handle: ".panel-heading",
        items: "div.panel",
        tolerance: "pointer"
    });

    $('.patient-records .panel-heading span.remove').on('click', function () {

        var target = $(this).closest('.panel');

        target.fadeOut(300, function () {
            $(this).remove();
        });

    });

    $(window).scroll(function () {
        if ($(this).scrollTop() < 200) {
            $('#smoothscroll').fadeOut();
        } else {
            $('#smoothscroll').fadeIn();
        }
    });

    $('#smoothscroll').on('click', function () {
        $('html, body').animate({scrollTop: 0}, 'fast');
        return false;
    });

    $('#timeline-example').ehrscapeTimeline({
        baseUrl: baseUrl,
        ehrId: ehrId,
        username: username,
        password: password
    });

    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var sessionId;

    var weight;
    var height;

    function login() {
        return $.ajax({
            type: "POST",
            url: baseUrl + "/session?" + $.param({username: username, password: password}),
            success: function (res) {
                sessionId = res.sessionId;
            }
        });
    }

    function logout() {
        return $.ajax({
            type: "DELETE",
            url: baseUrl + "/session",
            headers: {
                "Ehr-Session": sessionId
            }
        });
    }

    function patientData() {
        return $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (data) {
                var party = data.party;

                // Name
                party.firstNames = "Luka";
                if (party.lastNames == undefined)
                    party.lastNames = "";
                $("#patient-name").html(party.firstNames + ' ' + party.lastNames);

                // Complete age
                var age = getAge(formatDateUS(party.dateOfBirth));
                $(".patient-age").html(age);

                // Date of birth
                var date = new Date(party.dateOfBirth);
                var stringDate = monthNames[date.getMonth()] + '. ' + date.getDate() + ', ' + date.getFullYear();
                $(".patient-dob").html(stringDate);

                // Age in years
                $(".patient-age-years").html(getAgeInYears(party.dateOfBirth));

                // Gender
                var gender = party.gender;
                $("#patient-gender").html(gender.substring(0, 1) + gender.substring(1).toLowerCase());

                // Patient's picture
                var imageUrl;
                if (party.hasOwnProperty('partyAdditionalInfo')) {
                    party.partyAdditionalInfo.forEach(function (el) {
                        if (el.key === 'image_url') {
                            imageUrl = el.value;
                        }
                    });
                }
                if (imageUrl !== undefined) {
                    $('.patient-pic').css('background', 'url(' + imageUrl + ')');
                } else {
                    $('.patient-pic').css('background', 'url(img/' + gender.toLowerCase() + '.png)');
                }
            }
        });
    }

    function getWeight() {
        return $.ajax({
            url: baseUrl + "/view/" + ehrId + "/weight",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                // display newest
                weight = res[0].weight;
                $('.weight-placeholder-value').text(res[0].weight);
                $('.weight-placeholder-unit').text(res[0].unit);

                var cw = res[0].weight + " " + res[0].unit;
                $('.last-cw').text(cw);
                $('.last-cw-date').text(formatDate(res[0].time, true));

                res.forEach(function (el, i, arr) {
                    var date = new Date(el.time);
                    el.date = date.getTime();
                });

                $(window).bind("load", function () {
                    new Morris.Area({
                        element: 'chart-weight',
                        data: res.reverse(),
                        xkey: 'date',
                        ykeys: ['weight'],
                        lineColors: ['#4FC1E9', '#3BAFDA'],
                        labels: ['Weight'],
                        lineWidth: 2,
                        pointSize: 3,
                        hideHover: true,
                        behaveLikeLine: true,
                        smooth: false,
                        resize: true,
                        xLabels: "day",
                        xLabelFormat: function (x) {
                            var date = new Date(x);
                            return (date.getDate() + '-' + monthNames[date.getMonth()]);
                        },
                        dateFormat: function (x) {
                            return (formatDate(x, false));
                        }
                    });
                });
            }
        });
    }

    function getHeight() {
        return $.ajax({
            url: baseUrl + "/view/" + ehrId + "/height",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                // display newest
                height = res[0].height;
                $('.height-placeholder-value').text(res[0].height);
                $('.height-placeholder-unit').text(res[0].unit);

                var gender = $('#patient-gender').text().toLowerCase();

                if (gender) {
                    var picture = $('.patient-height-image');
                    var src = "img/body-blank-" + gender + ".png";
                    picture.attr("src", src);
                }

                var ch = res[0].height + " " + res[0].unit;
                $('.last-ch').text(ch);
                $('.last-ch-date').text(formatDate(res[0].time, true));

                res.forEach(function (el, i, arr) {
                    var date = new Date(el.time);
                    el.date = date.getDate() + '-' + monthNames[date.getMonth()];
                });

                $(window).bind("load", function () {
                    new Morris.Bar({
                        element: 'chart-height',
                        data: res.reverse(),
                        xkey: 'date',
                        ykeys: ['height'],
                        labels: ['Height'],
                        hideHover: true,
                        barColors: ['#48CFAD', '#37BC9B'],
                        xLabelMargin: 5,
                        resize: true
                    });
                });
            }
        });
    }

    function getBloodPressure() {
        $.ajax({
            url: baseUrl + "/view/" + ehrId + "/blood_pressure",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                if (res.length >= 1) {
                    var data = res[0];
                    var value = data.systolic + '/' + data.diastolic + ' ' + data.unit;
                    $(".last-bp").html(value);
                    var systolic_per = data.systolic / 230.0 * 100;
                    var diastolic_per = data.diastolic / 230.0 * 100;
                    $("#systolic-bar").width(systolic_per + '%');
                    $("#diastolic-bar").width(diastolic_per + '%');
                }
            }
        });
    }

    function getAllergies() {
        return $.ajax({
            url: baseUrl + "/view/" + ehrId + "/allergy",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                for (var i = 0; i < res.length; i++) {
                    $('ul.allergies').append('<li>' + res[i].agent + '</li>');
                }

                if (res.length == 0) {
                    $('ul.allergies').append('<li>no allergies</li>');
                }
            }
        });
    }

    function getMedications() {
        return $.ajax({
            url: baseUrl + "/view/" + ehrId + "/medication",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                res = [{ medicine: "NovoRapid (insulin aspart)", type: "Bolus", quantity_amount: ["8.5", "9.0", "9.0"], quantity_unit: "U" },
                    { medicine: "NovoRapid (insulin aspart)", type: "Correction", quantity_amount: ["1.8"], quantity_unit: "U" }]; // <-- doze
                var line = "";
                for (var i = 0; i < res.length; i++) {
                    line = '<li>' + res[i].medicine + '</li><li style="list-style-type: none;">';
                    for (var x = 0; x < res[i].quantity_amount.length; x++) {
                        if (x == 0)
                            line += res[i].type + ': ';
                        if (x > 0)
                            line += ' + ';
                        line += res[i].quantity_amount[x] + res[i].quantity_unit;
                    }
                    line += '</li>';
                    $('ul.medications').append(line);
                }

                if (res.length == 0) {
                    $('ul.medications').append('<li>no medication</li>');
                }
            }
        });
    }

    function getProblems() {
        return $.ajax({
            url: baseUrl + "/view/" + ehrId + "/problem",
            type: 'GET',
            headers: {
                "Ehr-Session": sessionId
            },
            success: function (res) {
                res = [{ diagnosis: "Diabetes mellitus type 1", time: "Apr. 12, 2010" }];
                for (var i = 0; i < res.length; i++) {
                    $('ul.problems').append('<li>' + res[i].diagnosis + '</li><li style="list-style-type: none;">' + res[i].time + '</li>');
                }

                if (res.length == 0) {
                    $('ul.problems').append('<li>no diagnosis</li>');
                }
            }
        });
    }

    function getInformations() {
        $('ul.informations').append('<li>Paradigm Veo 754 (insulin pump)</li>');
        $('ul.informations').append('<li>CGMS (sensor)</li>');
    }

    function getBMI() {
        if (height == undefined || weight == undefined)
            return;
        var unit = "kg/m2";
        var tmp = height / 100.0;
        tmp = tmp * tmp;
        var bmi = weight / tmp;
        bmi = Math.round(bmi * 10.0) / 10.0;
        $('.patient-bmi').html(bmi + ' ' + unit);
    }

    function normalRange(item){

        var range = "";
        if(item.normal_max && item.normal_min){
            range = item.normal_min + " - " + item.normal_max;
        }
        else{
            if(item.normal_max){
                range = "< " + item.normal_max;
            }
            else{
                if(item.normal_min){
                    range = "> " + item.normal_min;
                }
            }
        }

        return range;

    }

    function checkValue(item){

        var value = item.value, range = false, cellValue, icon;

        if(item.normal_max && item.normal_min){
            if(value >= item.normal_min && value <= item.normal_max) range = true;
            else{
                if(value < item.normal_min) icon = "down";
                else icon = "up";
            }
        }
        else{
            if(item.normal_max){
                if(value <= item.normal_max) range = true;
                else icon = "up";
            }
            else{
                if(item.normal_min){
                    if(value >= item.normal_min) range = true;
                    else icon = "down";
                }
            }
        }

        if (range) cellValue = '<span class="normal">' + value + '</span>';
        else  cellValue = '<span class="abnormal">' + value + '<i class="fa fa-chevron-circle-' + icon + '"></i></span>';

        return cellValue;

    }

    function summaryChart() {
        $(function () {
            var bg = [[Date.UTC(2016, 7, 13, 7, 15, 0), 6.3],
                    [Date.UTC(2016, 7, 13, 8, 45, 0), 5.1],
                    [Date.UTC(2016, 7, 13, 10, 45, 0), 9.7],
                    [Date.UTC(2016, 7, 13, 12, 50, 0), 7.7],
                    [Date.UTC(2016, 7, 13, 15, 05, 0), 11.4],
                    [Date.UTC(2016, 7, 13, 19, 35, 0), 4.7],
                    [Date.UTC(2016, 7, 13, 22, 35, 0), 5.1]];
            var activity = [[Date.UTC(2016, 7, 13, 1, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 2, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 3, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 4, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 5, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 6, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 7, 0, 0), 0.01],
                         [Date.UTC(2016, 7, 13, 8, 0, 0), 0.69],
                         [Date.UTC(2016, 7, 13, 9, 0, 0), 0.03],
                         [Date.UTC(2016, 7, 13, 10, 0, 0), 0.01],
                         [Date.UTC(2016, 7, 13, 11, 0, 0), 0.01],
                         [Date.UTC(2016, 7, 13, 12, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 13, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 14, 0, 0), 0.04],
                         [Date.UTC(2016, 7, 13, 15, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 16, 0, 0), 1.35],
                         [Date.UTC(2016, 7, 13, 17, 0, 0), 1.31],
                         [Date.UTC(2016, 7, 13, 18, 0, 0), 0.00],
                         [Date.UTC(2016, 7, 13, 19, 0, 0), 0.18],
                         [Date.UTC(2016, 7, 13, 20, 0, 0), 0.70],
                         [Date.UTC(2016, 7, 13, 21, 0, 0), 0.09],
                         [Date.UTC(2016, 7, 13, 22, 0, 0), 0.17],
                         [Date.UTC(2016, 7, 13, 23, 0, 0), 1.33],
                        [Date.UTC(2016, 7, 13, 24, 0, 0), 0.00]];

            var carbs = [[Date.UTC(2016, 7, 13, 8, 50, 0), 0],
                        [Date.UTC(2016, 7, 13, 10, 45, 0), 0],
                        [Date.UTC(2016, 7, 13, 12, 50, 0), 0],
                        [Date.UTC(2016, 7, 13, 17, 20, 0), 0],
                        [Date.UTC(2016, 7, 13, 19, 35, 0), 0]];
            var carbs_data = [75, 0, 90, 25, 60];
            var insul_data = [8.8, 2.8, 11.6, 1.2, 5.5];

            $('#blood-glucose-chart').highcharts({
                chart: {
                    zoomType: 'xy'
                },
                title: {
                    text: ''
                },
                xAxis: [{
                    type: 'datetime',
                    labels: {
                        formatter: function () {
                            return Highcharts.dateFormat('%H:%M', this.value);
                        },
                    }
                }],
                yAxis: [{
                    gridLineWidth: 0,
                    title: {
                        text: 'Blood glucose',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value} mmol/l',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    min: 2.2,
                    max: 21.9,
                    plotBands: [{
                        from: 3.9,
                        to: 7.8,
                        color: 'rgba(68, 170, 213, 0.1)',
                        label: {
                            text: 'Normal',
                            style: {
                                color: '#606060'
                            }
                        }
                    }, {
                        from: 0,
                        to: 3.2,
                        color: 'rgba(255, 60, 60, 0.1)',
                        label: {
                            text: 'LOW',
                            style: {
                                color: '#606060'
                            }
                        }
                    }, {
                        from: 10.0,
                        to: 25.0,
                        color: 'rgba(255, 110, 50, 0.1)',
                        label: {
                            text: 'HIGH',
                            style: {
                                color: '#606060'
                            }
                        }
                    }]
                }, {
                    gridLineWidth: 0,
                    title: {
                        text: 'Activity',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value} km',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    opposite: true
                }, {
                    gridLineWidth: 0,
                    title: {
                        text: 'Carbohydrates & Insulin',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        },
                        enabled: false
                    },
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    gridLineColor: 'transparent',
                    lineColor: 'transparent',
                    labels: {
                        enabled: false
                    },
                    minorTickLength: 0,
                    tickLength: 0,
                    opposite: false
                }],
                tooltip: {
                    formatter: function () {
                        var date_time = Highcharts.dateFormat('%H:%M', this.x);

                        if (this.series.name == "Blood glucose") {
                            return '<span style="font-size: 10px">' + date_time + '</span><br/>' + '<span style="color:' + this.series.color + '">\u25CF</span> Blood glucose : <b>' + this.y + ' mmol/l</b><br/>';
                        }
                        if (this.series.name == "Activity") {
                            return '<span style="font-size: 10px">' + date_time + '</span><br/>' + '<span style="color:' + this.series.color + '">\u25CF</span> Activity: <b>' + this.y + ' km</b><br/>';
                        }
                        if (this.series.name == "Carbohydrates & Insulin") {
                            var index = this.point.index;
                            var tmp = '<span style="font-size: 10px">' + date_time + '</span><br/>' + '<span style="color:' + this.series.color + '">\u25CF</span> Carbohydrates: <b>' + carbs_data[index] + ' g</b><br/>' + '<span style="color:' + this.series.color + '">\u25CF</span> Insulin: <b>' + insul_data[index] + ' U</b>';
							if (index == 3)
								tmp += '<br /><span style="color:' + this.series.color + '">\u25CF</span><span> no fat, added shugar</span>';
							return tmp;
                        }
                        return "no data";
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    x: 100,
                    verticalAlign: 'top',
                    y: 0,
                    floating: true,
                    backgroundColor: 'rgba(255, 110, 50, 0.0)'
                },
                series: [{
                    name: 'Activity',
                    type: 'column',
                    yAxis: 1,
                    data: activity,
                    tooltip: {
                        valueSuffix: ' km'
                    }
                }, {
                    name: 'Blood glucose',
                    type: 'spline',
                    yAxis: 0,
                    data: bg,
                    tooltip: {
                        valueSuffix: ' mmol/l'
                    }
                }, {
                    name: 'Carbohydrates & Insulin',
                    yAxis: 2,
                    data: carbs,
                    lineWidth: 0,
                    color: "#ffa500",
                    marker: {
                        enabled: true,
                        radius: 6,
                        fillColor: "#ffa500"
                    },
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    }
                }]
            });
            $('#last_bg_measurement').append('Jul. 13, 2016');
        });
    }

    function inrangeChart() {
        $(function () {
            $('#inrange-bg').highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: null
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Brands',
                    colorByPoint: true,
                    data: [{
                        name: '< 3.2 mmol/l',
                        y: 3.0
                    }, {
                        name: '3.3 - 3.9 mmol/l',
                        y: 4.5
                    }, {
                        name: '4.0 - 7.8 mmol/l',
                        y: 74.5,
                        sliced: true,
                        selected: true
                    }, {
                        name: '> 7.8 mmol/l',
                        y: 18.0
                    }]
                }]
            });
            $('#last_inrange').append('Jul. 2016');
        });
    }

    function activityChart() {
        $(function () {
            $('#average_activity').highcharts({
                chart: {
                    type: 'column'
                },
                title: {
                    text: null
                },
                xAxis: {
                    categories: [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec'
                    ],
                    crosshair: true
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Activity (km)'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:.1f} km</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Activity (km)',
                    data: [3.3, 3.1, 4.6, 5.5, 8.8, 12.3, 14.6, 13.2, 13.8, 11.5, 9.8, 7.3]

                }]
            });
            $('#last_activity').append('May. - Jul. 2016');
        });
    }

    // Helper functions (dates)

    function getAge(dateString) {
        var now = new Date();
        var today = new Date(now.getYear(), now.getMonth(), now.getDate());

        var yearNow = now.getYear();
        var monthNow = now.getMonth();
        var dateNow = now.getDate();

        var dob = new Date(dateString.substring(6, 10),
                dateString.substring(0, 2) - 1,
            dateString.substring(3, 5)
        );

        var yearDob = dob.getYear();
        var monthDob = dob.getMonth();
        var dateDob = dob.getDate();
        var age = {};
        var ageString = "";
        var yearString = "";
        var monthString = "";
        var dayString = "";


        var yearAge = yearNow - yearDob;

        if (monthNow >= monthDob)
            var monthAge = monthNow - monthDob;
        else {
            yearAge--;
            var monthAge = 12 + monthNow - monthDob;
        }

        if (dateNow >= dateDob)
            var dateAge = dateNow - dateDob;
        else {
            monthAge--;
            var dateAge = 31 + dateNow - dateDob;

            if (monthAge < 0) {
                monthAge = 11;
                yearAge--;
            }
        }

        age = {
            years: yearAge,
            months: monthAge,
            days: dateAge
        };

        if (age.years > 1) yearString = "y";
        else yearString = "y";
        if (age.months > 1) monthString = "m";
        else monthString = "m";
        if (age.days > 1) dayString = " days";
        else dayString = " day";


        if ((age.years > 0) && (age.months > 0) && (age.days > 0))
            ageString = age.years + yearString + " " + age.months + monthString;// + ", and " + age.days + dayString + " old";
        else if ((age.years == 0) && (age.months == 0) && (age.days > 0))
            ageString = age.days + dayString + " old";
        else if ((age.years > 0) && (age.months == 0) && (age.days == 0))
            ageString = age.years + yearString;// + " old. Happy Birthday!";
        else if ((age.years > 0) && (age.months > 0) && (age.days == 0))
            ageString = age.years + yearString + " and " + age.months + monthString;// + " old";
        else if ((age.years == 0) && (age.months > 0) && (age.days > 0))
            ageString = age.months + monthString; // + " and " + age.days + dayString + " old";
        else if ((age.years > 0) && (age.months == 0) && (age.days > 0))
            ageString = age.years + yearString;// + " and " + age.days + dayString + " old";
        else if ((age.years == 0) && (age.months > 0) && (age.days == 0))
            ageString = age.months + monthString;// + " old";
        else ageString = "Oops! Could not calculate age!";

        return ageString;
    }

    function formatDate(date, completeDate) {

        var d = new Date(date);

        var curr_date = d.getDate();
        curr_date = normalizeDate(curr_date);

        var curr_month = d.getMonth();
        curr_month++;
        curr_month = normalizeDate(curr_month);

        var curr_year = d.getFullYear();

        var curr_hour = d.getHours();
        curr_hour = normalizeDate(curr_hour);

        var curr_min = d.getMinutes();
        curr_min = normalizeDate(curr_min);

        var curr_sec = d.getSeconds();
        curr_sec = normalizeDate(curr_sec);

        var dateString, monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (completeDate){
            dateString = curr_date + "-" + monthNames[curr_month-1] + "-" + curr_year + " at " + curr_hour + ":" + curr_min; // + ":" + curr_sec;
        }
        else dateString = curr_date + "-" + monthNames[curr_month-1] + "-" + curr_year;

        return dateString;

    }

    function formatDateUS(date) {
        var d = new Date(date);

        var curr_date = d.getDate();
        curr_date = normalizeDate(curr_date);

        var curr_month = d.getMonth();
        curr_month++;
        curr_month = normalizeDate(curr_month);

        var curr_year = d.getFullYear();

        return curr_month + "-" + curr_date + "-" + curr_year;

    }

    function getAgeInYears(dateOfBirth) {
        var dob = new Date(dateOfBirth);
        var timeDiff = Math.abs(Date.now() - dob.getTime());
        return Math.floor(timeDiff / (1000 * 3600 * 24 * 365));
    }

    function normalizeDate(el) {
        el = el + "";
        if (el.length == 1) {
            el = "0" + el;
        }
        return el;
    }

    // display page
    login().done(function () {
        patientData().done(function() {
            $.when(
                getWeight(),
                getHeight(),
                getAllergies(),
                getMedications(),
                getProblems(),
                getBloodPressure()
            ).then(summaryChart)
             .then(inrangeChart)
             .then(activityChart)
             .then(getBMI)
             .then(getInformations)
             .then(logout)
        });
    });
});

