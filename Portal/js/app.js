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
            ).then(getBMI)
             .then(getInformations)
             .then(logout)
        });
    });
});

