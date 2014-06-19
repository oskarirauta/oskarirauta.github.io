// Initialize your app
var myApp = new Framework7({
    modalTitle: 'Tunnit'
});

// Export selectors engine
var $$ = Framework7.$;

// Add views
var mainView = myApp.addView('#view-database', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

var hoursData = localStorage.hoursData ? JSON.parse(localStorage.hoursData) : [];
var settingsData = localStorage.settingsData ? JSON.parse(localStorage.settingsData) : [{
    employer: '',
    company: '',
    emailAddr: '',
    emailCC: '',
    emailSubj: ''
}];

var dateSeparator = '-';
var timeSeparator = ':';
var editingId = '';
var days = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];
var needsInfo = false;
var amountHours = 0;


function storeOrder() {
    var row = 0;
    $$('.hour-items-list').find('li').each(function () {
        var id = this.getAttribute('data-id');
        for (var i = 0; i < hoursData.length; i++) {
            if (hoursData[i].id == id) {
                hoursData[i].row = row;
            }
        }
        row++;
    });
}

function buildShortDate(date) {
    // For iphone
    return parseInt(date.split(dateSeparator)[2], 10) + '.' + parseInt(date.split(dateSeparator)[1], 10);
    // For desktop
    // return parseInt(date.split(dateSeparator)[0], 10) + dateSeparator + parseInt(date.split(dateSeparator)[1], 10);
}

function validateTime(oldTime) {
    var hours = parseInt(oldTime.split(timeSeparator)[0], 10);
    var minutes = parseInt(oldTime.split(timeSeparator)[1], 10);
    var newMinutes = 0;
    var retHour = '';
    var retMin = '';

	if (isNaN(hours))
		return oldTime;

    if (minutes < 11) {
        newMinutes = 0;
    }
    if ((minutes > 10) && (minutes < 23)) {
        newMinutes = 15;
    }
    if ((minutes > 22) && (minutes < 42)) {
        newMinutes = 30;
    }
    if ((minutes > 41) && (minutes < 51)) {
        newMinutes = 45;
    }
    if (minutes > 50) {
		hours++; 
    }

    retHour = hours + "";
    retMin = newMinutes + "";
    if (retHour.length < 2) {
        retHour = "0" + retHour;
    }
    if (retMin.length < 2) {
        retMin = "0" + retMin;
    }

    return retHour + timeSeparator + retMin;
}

function validateSummary(amount) {
    var hourPart = parseInt((amount + "").split(".")[0], 10);
    var minPart = parseInt((amount + "").split(".")[1], 10);

    if (minPart == 25) {
        minPart = 0;
    } else if (minPart == 75) {
        minPart = 0;
        hourPart++;
    }

	return hourPart + ( isNaN(minPart) ? '' : ( '.' + minPart ));
}

function validateFormTime(fieldname) {
    var field;

    if (fieldname == "begins") {
        field = $$('.popup input[name="begins"]');
    } else if (fieldname == "ends") {
        field = $$('.popup input[name="ends"]');
    } else if (fieldname == "begins2") {
        field = $$('.popup input[name="begins2"]');
    } else if (fieldname == "ends2") {
        field = $$('.popup input[name="ends2"]');
    } else {
        return;
    }

    var newValue = validateTime(field.val().trim());
    field.val(newValue);
}

function buildTimeDiff(begins, ends) {
    var time1 = parseInt(begins.split(timeSeparator)[0], 10);
    var time2 = parseInt(ends.split(timeSeparator)[0], 10);
    var durationStr = (time2 < time1 ? (time2 + 24) : time2) - time1;

    if (parseInt(begins.split(timeSeparator)[1], 10) == 15) {
        durationStr -= 0.25;
    }
    if (parseInt(begins.split(timeSeparator)[1], 10) == 30) {
        durationStr -= 0.5;
    }
    if (parseInt(begins.split(timeSeparator)[1], 10) == 45) {
        durationStr -= 0.75;
    }

    if (parseInt(ends.split(timeSeparator)[1], 10) == 15) {
        durationStr += 0.25;
    }
    if (parseInt(ends.split(timeSeparator)[1], 10) == 30) {
        durationStr += 0.5;
    }
    if (parseInt(ends.split(timeSeparator)[1], 10) == 45) {
        durationStr += 0.75;
    }

    return durationStr;
}

function dayName(date) {
    var d = new Date(parseInt(date.split(dateSeparator)[0], 10), parseInt(date.split(dateSeparator)[1], 10) - 1, parseInt(date.split(dateSeparator)[2], 10), 1, 0, 0, 0);

    return days[d.getDay()];
}

function prepareReport() {
    needsInfo = false;
    amountHours = 0;
    
    for (var i = 0; i < hoursData.length; i++) {

        if ((hoursData[i].begins.length > 0) && (hoursData[i].ends.length > 0)) {
            amountHours += buildTimeDiff(hoursData[i].begins, hoursData[i].ends);
        }

        if (hoursData[i].info.length > 0) {
            needsInfo = true;
        }

    }
}

function exportHeader(preview) {
    var exportHtml = '';
    var nowrap = (preview == 1 ? '' : ' nowrap="nowrap"');
    var fontsize = (preview == 1 ? '13' : '13');

    exportHtml += '<table cellspacing="0" border="0" style="margin-top: 5px; margin-bottom: 20px; font: ' + fontsize + 'px \"Helvetica Neue\", Arial, Helvetica, Geneva, sans-serif; width: 200px;">';
    exportHtml += '<tr><td style="padding: 2px 23px 2px 0;"' + nowrap + '>Yritys</td><td style="padding: 2px 23px 2px 0;"' + nowrap + '>' + settingsData[0].company + '</td></tr>';
    exportHtml += '<tr><td style="padding: 2px 23px 2px 0;' + nowrap + '">Työntekijä</td><td style="padding: 2px 23px 2px 0;"' + nowrap + '>' + settingsData[0].employer + '</td>';
    exportHtml += '</tr></table>';

    return exportHtml;
}

function exportDB(preview) {
    var exportHtml = '';
    var nowrap = (preview == 1 ? '' : ' nowrap="nowrap"');
    var fontsize = (preview == 1 ? '11' : '11');

    exportHtml += '<table cellspacing="0" style="font: ' + fontsize + 'px \"Helvetica Neue\", Arial, Helvetica, Geneva, sans-serif; width: auto;">';

    exportHtml += '<td style="width: auto; border: solid 1px #000; padding: 2px;"' + nowrap + '><b>Päivä</b></td>';
    exportHtml += '<td style="width: auto; border: solid 1px #000; border-left: 0; padding: 2px;"' + nowrap + '><b>Pvm</b></td>';
    exportHtml += '<td style="width: auto; border: solid 1px #000; border-left: 0; padding: 2px;" nowrap="nowrap"><b>Aika</b></td>';
    exportHtml += '<td style="width: auto; border: solid 1px #000; border-left: 0; padding: 2px;"' + nowrap + '><b>Kesto</b></td>';
    exportHtml += '<td style="width: auto; border: solid 1px #000; border-left: 0; padding: 2px;"' + nowrap + '><b>Työ</b></td>';
    if (needsInfo) {
        exportHtml += '<td style="width: auto; min-width: 36px; border: solid 1px #000; border-left: 0; padding: 2px;"' + nowrap + '><b>Lisätiedot</b></td>';
    }
    exportHtml += '</tr>';

    for (var i = 0; i < hoursData.length; i++) {
        var timeStr = hoursData[i].begins;
        var durationStr = '';
        if ((hoursData[i].begins.length > 0) && (hoursData[i].ends.length > 0)) {
            timeStr += ' - ' + hoursData[i].ends;
            durationStr = buildTimeDiff(hoursData[i].begins, hoursData[i].ends);
        }

        exportHtml += '<tr>';
        exportHtml += '<td style="width: auto; border: solid 1px #000; border-top: 0; padding: 2px;" valign="top"' + nowrap + '>' + dayName(hoursData[i].date) + '</td>';
        exportHtml += '<td style="width: auto; border: solid 1px #000; border-left: 0; border-top: 0; padding: 2px;" valign="top"' + nowrap + '>' + buildShortDate(hoursData[i].date) + '</td>';
        exportHtml += '<td style="width: auto; border: solid 1px #000; border-left: 0; border-top: 0; padding: 2px;" valign="top" nowrap="nowrap">' + timeStr + '</td>';
        exportHtml += '<td style="width: auto; border: solid 1px #000; border-left: 0; border-top: 0; padding: 2px;" valign="top"' + nowrap + '>' + durationStr + (durationStr > 0 ? 'h' : '') + '</td>';
        exportHtml += '<td style="width: auto; border: solid 1px #000; border-left: 0; border-top: 0; padding: 2px; padding-right: 6px;" valign="top"' + nowrap + '>' + hoursData[i].description + '</td>';
        if (needsInfo) {
            exportHtml += '<td style="width: auto; min-width: 36px; border: solid 1px #000; border-left: 0; border-top: 0; padding: 2px; padding-right: 6px;" valign="top"' + nowrap + '>' + hoursData[i].info.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</td>';
        }
        exportHtml += '</tr>';
    }

    exportHtml += '</table>';

    return exportHtml;
}

function exportSummary(preview) {
    var exportHtml = '';
    var fontsize = (preview == 1 ? '12' : '12');

    exportHtml += '<table cellspacing="0" border="0" style="margin-top: 5px; margin-top: 20px; font: ' + fontsize + 'px \"Helvetica Neue\", Arial, Helvetica, Geneva, sans-serif; width: 200px;">';
    exportHtml += '<td style="padding-right: 10px;" nowrap="nowrap">Tunnit yhteensä:</td>';
    exportHtml += '<td style="padding-left: 5px; padding-right: 14px; border-bottom: solid 1px #000;" nowrap="nowrap">' + validateSummary(amountHours) + 'h</td>';
    exportHtml += '</tr>';
    exportHtml += '</table>';

    return exportHtml;
}


$$('.ac-report').on('click', function () {
    myApp.hideToolbar('.views');

    var exportHtml = '';
    var cc = '';

    if (settingsData[0].emailCC.length > 0) {
        cc += 'cc=' + settingsData[0].emailCC + '&';
    }

    var buttons = [{
        text: 'Mitk&auml; osat l&auml;hetet&auml;&auml;n?',
        label: true
    }, {
        text: 'Kaikki',
        bold: true,
        onClick: function () {
            myApp.showToolbar('.views');

            exportHtml += exportHeader(0);
            exportHtml += exportDB(0);
            exportHtml += exportSummary(0);
            exportHtml += '<br />';

            window.location.href = 'mailto:' + settingsData[0].emailAddr + '?' + cc + 'subject=' + settingsData[0].emailSubj + '&body=' + exportHtml;
        }
    }, {
        text: 'Otsake ja lista',
        bold: true,
        onClick: function () {
            myApp.showToolbar('.views');

            exportHtml += exportHeader(0);
            exportHtml += exportDB(0);
            exportHtml += '<br />';

            window.location.href = 'mailto:' + settingsData[0].emailAddr + '?' + cc + 'subject=' + settingsData[0].emailSubj + '&body=' + exportHtml;
        }
    }, {
        text: 'Pelkk&auml; lista',
        bold: true,
        onClick: function () {
            myApp.showToolbar('.views');

            exportHtml += exportDB(0);
            exportHtml += '<br />';

            window.location.href = 'mailto:' + settingsData[0].emailAddr + '?' + cc + 'subject=' + settingsData[0].emailSubj + '&body=' + exportHtml;
        }
    }, {
        text: 'Peruuta',
        red: true,
        onClick: function () {
            myApp.showToolbar('.views');
        }
    }, ];
    myApp.actions(buttons);

});

$$('.ac-clearlist').on('click', function () {
    myApp.hideToolbar('.views');

    var buttons = [{
        text: 'Poistetaanko kaikki merkinn&auml;t?',
        label: true
    }, {
        text: 'Kyll&auml;',
        bold: true,
        onClick: function () {
            while (hoursData.length > 0) {
                hoursData.splice(0, 1);
            }
            localStorage.hoursData = JSON.stringify(hoursData.sort(function (a, b) {
                return a.row - b.row;
            }));
            buildHoursListHtml();

            var newTab = $$('#view-database');
            var tabs = newTab.parent();
            var isAnimatedTabs = tabs.parent().hasClass('tabs-animated-wrap');
            if (isAnimatedTabs) {
                tabs.transform('translate3d(' + -newTab.index() * 100 + '%,0,0)');
            }
            var oldTab = tabs.children('.tab.active').removeClass('active');
            newTab.addClass('active');
            newTab.trigger('show');

            myApp.showToolbar('.views');
        }
    }, {
        text: 'Peruuta',
        red: true,
        onClick: function () {
            myApp.showToolbar('.views');
        }
    }, ];
    myApp.actions(buttons);

});


$$('.hour-items-list').on('close', function () {
    storeOrder();
    localStorage.hoursData = JSON.stringify(hoursData.sort(function (a, b) {
        return a.row - b.row;
    }));

});

function startEditor(id) {
    editingId = id;
    myApp.popup('.popup-edit', false);
}

$$('.savesettings').on('click', function () {
    settingsData[0].employer = $$('#view-settings input[name="employer"]').val().trim();
    settingsData[0].company = $$('#view-settings input[name="company"]').val().trim();
    settingsData[0].emailAddr = $$('#view-settings input[name="emailAddr"]').val().trim();
    settingsData[0].emailCC = $$('#view-settings input[name="emailCC"]').val().trim();
    settingsData[0].emailSubj = $$('#view-settings input[name="emailSubj"]').val().trim();

    localStorage.settingsData = JSON.stringify(settingsData);
    myApp.alert("Asetukset tallennettu.");
});


$$('.addbtn').on('click', function () {
    myApp.popup('.popup-add', false);
});

$$('#view-report').on('show', function () {
    buildReportHtml();
});

$$('#view-settings').on('show', function () {
    $$(this).find('input[name="employer"]').val(settingsData[0].employer);
    $$(this).find('input[name="company"]').val(settingsData[0].company);
    $$(this).find('input[name="emailAddr"]').val(settingsData[0].emailAddr);
    $$(this).find('input[name="emailCC"]').val(settingsData[0].emailCC);
    $$(this).find('input[name="emailSubj"]').val(settingsData[0].emailSubj);
});

$$('.popup-edit').on('open', function () {
    $$('body').addClass('with-popup');

    for (var i = 0; i < hoursData.length; i++) {
        if (hoursData[i].id == editingId) {
            $$(this).find('input[name="date2"]').val(hoursData[i].date);
            $$(this).find('input[name="begins2"]').val(hoursData[i].begins);
            $$(this).find('input[name="ends2"]').val(hoursData[i].ends);
            $$(this).find('input[name="description2"]').val(hoursData[i].description);
            $$(this).find('textarea[name="info2"]').val(hoursData[i].info);
        }
    }

});

$$('.popup-add').on('open', function () {
    $$('body').addClass('with-popup');
    $$(this).find('input[name="date"]').val('');
    $$(this).find('input[name="begins"]').val('');
    $$(this).find('input[name="ends"]').val('');
    $$(this).find('input[name="description"]').val('');
    $$(this).find('textarea[name="info"]').val('');
});

$$('.popup-add').on('opened', function () {
    $$(this).find('input[name="date"]').focus();
});

$$('.popup-add').on('close', function () {
    $$('body').removeClass('with-popup');
    $$(this).find('input[name="date"]').blur().val('');
    $$(this).find('input[name="begins"]').blur().val('');
    $$(this).find('input[name="ends"]').blur().val('');
    $$(this).find('input[name="description"]').blur().val('');
    $$(this).find('textarea[name="info"]').blur().val('');
});

$$('.popup-edit').on('close', function () {
    $$('body').removeClass('with-popup');
    $$(this).find('input[name="date2"]').blur().val('');
    $$(this).find('input[name="begins2"]').blur().val('');
    $$(this).find('input[name="ends2"]').blur().val('');
    $$(this).find('input[name="description2"]').blur().val('');
    $$(this).find('textarea[name="info2"]').blur().val('');
});

// Add hours
$$('.addhoursbtn').on('click', function () {

    var date = $$('.popup input[name="date"]').val().trim();
    var begins = $$('.popup input[name="begins"]').val().trim();
    var ends = $$('.popup input[name="ends"]').val().trim();
    var description = $$('.popup input[name="description"]').val().trim();
    var info = $$('.popup textarea[name="info"]').val().trim();
    var row = 0;

    if ((date.length === 0) || (description.length === 0)) {
        myApp.alert("Syötä ainakin päivämäärä ja kuvaus.");
        return;
    }

    for (var i = 0; i < hoursData.length; i++) {
        if (hoursData[i].row > row) {
            row = hoursData[i].row + 1;
        }
    }

    hoursData.push({
        date: date,
        begins: validateTime(begins),
        ends: validateTime(ends),
        description: description,
        info: info,
        row: row,
        id: (new Date()).getTime()
    });
    localStorage.hoursData = JSON.stringify(hoursData.sort(function (a, b) {
        return a.row - b.row;
    }));
    buildHoursListHtml();
    myApp.closeModal();
});

// Add hours
$$('.modifyhoursbtn').on('click', function () {

    var date = $$('.popup input[name="date2"]').val().trim();
    var begins = $$('.popup input[name="begins2"]').val().trim();
    var ends = $$('.popup input[name="ends2"]').val().trim();
    var description = $$('.popup input[name="description2"]').val().trim();
    var info = $$('.popup textarea[name="info2"]').val().trim();

    if ((date.length === 0) || (description.length === 0)) {
        myApp.alert("Syötä ainakin päivämäärä ja kuvaus.");
        return;
    }

    for (var i = 0; i < hoursData.length; i++) {
        if (hoursData[i].id == editingId) {
            hoursData[i].date = date;
            hoursData[i].begins = validateTime(begins);
            hoursData[i].ends = validateTime(ends);
            hoursData[i].description = description;
            hoursData[i].info = info;
        }
    }

    localStorage.hoursData = JSON.stringify(hoursData.sort(function (a, b) {
        return a.row - b.row;
    }));
    buildHoursListHtml();
    myApp.closeModal();
});

// Build Todo HTML
var hourItemTemplate = $$('#hour-item-template').html();

function buildHoursListHtml() {
    var html = '';
    for (var i = 0; i < hoursData.length; i++) {
        var descStr = '';
        var durationStr = '';
        if (hoursData[i].begins.length > 0) {
            descStr += hoursData[i].description + '<small><br />' + hoursData[i].begins;
        } else {
            descStr += '<div style="padding-top: 7px;">' + hoursData[i].description;
        }

        if ((hoursData[i].begins.length > 0) && (hoursData[i].ends.length > 0)) {
            descStr += ' - ' + hoursData[i].ends;
            durationStr = '<span class="badge">' + buildTimeDiff(hoursData[i].begins, hoursData[i].ends) + '</span>';
        }
        if (hoursData[i].begins.length > 0) {
            descStr += '</small>';
        } else {
            descStr += '</div>';
        }

        html += hourItemTemplate.replace(/{{date}}/g, buildShortDate(hoursData[i].date)).replace(/{{description}}/g, descStr).replace(/{{duration}}/g, durationStr).replace(/{{id}}/g, hoursData[i].id);
    }
    $$('.hour-items-list ul').html(html);
}

function buildReportHtml() {
    var reportHtml = '';
    prepareReport();
    reportHtml += exportHeader(1);
    reportHtml += exportDB(1);
    reportHtml += exportSummary(1);

    $$('#report-tables').html(reportHtml);
}

// Build HTML on App load
buildHoursListHtml();

// Delete item
$$('.hour-items-list').on('delete', '.swipeout', function () {
    var id = $$(this).attr('data-id') * 1;
    var index;
    for (var i = 0; i < hoursData.length; i++) {
        if (hoursData[i].id === id) {
            index = i;
        }
    }
    if (typeof (index) !== 'undefined') {
        hoursData.splice(index, 1);
        localStorage.hoursData = JSON.stringify(hoursData.sort(function (a, b) {
            return a.row - b.row;
        }));
    }
});

// Update app when manifest updated 
// http://www.html5rocks.com/en/tutorials/appcache/beginner/
// Check if a new cache is available on page load.
window.addEventListener('load', function (e) {
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            myApp.confirm('Uusi versio Tunnit sovelluksesta saatavilla. P&auml;ivitet&auml;&auml;nk&ouml; nyt?', function () {
                window.location.reload();
            });
        } else {
            // Manifest didn't changed. Nothing new to server.
        }
    }, false);
}, false);