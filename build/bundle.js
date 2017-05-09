// Type checking
function getType(elem) {
  return Object.prototype.toString.call(elem).slice(8, -1);
}

function isArray(elem) {
  return getType(elem) === 'Array';
}









function isFunction(elem) {
  return getType(elem) === 'Function';
}





function isNull(elem) {
  return getType(elem) === 'Null';
}







// Error handling




// Remove duplicates from an array

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var repeatableMethods = {
  withIds: 'ids',
  withCondition: 'conditions',
  orderBy: 'orderBy'
};

function chainMethods(method, criteria, selector) {
  for (var i in criteria) {
    selector = selector[method](criteria[i]);
  }
  return selector;
}

var Iterator = function () {
  function Iterator(props) {
    classCallCheck(this, Iterator);

    this.props = props;
  }

  createClass(Iterator, [{
    key: 'select',
    value: function select() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.entity;


      for (var method in repeatableMethods) {
        selector = chainMethods(method, this.props[repeatableMethods[method]], selector);
      }
      return selector.forDateRange(this.props.dateRange).withLimit(this.props.limit).get();
    }
  }, {
    key: 'iterate',
    value: function iterate(logic) {
      this.iterator = this.select();

      while (this.iterator.hasNext()) {
        try {
          logic.call(arguments, this.iterator.next());
        } catch (e) {
          logic.call(this.iterator.next());
        }
      }
    }
  }, {
    key: 'toArray',
    value: function toArray$$1(input) {
      var arr = [];

      if (input) {

        this.iterate(function () {

          if (isFunction(input)) {

            arr.push(input.call(arguments, this));
          } else {

            var obj = {};
            for (var field in input) {
              obj[field] = input[field].call(arguments, this);
            }
            arr.push(obj);
          }
        });
      } else {

        this.iterate(function (item) {
          arr.push(item);
        });
      }

      return arr;
    }
  }]);
  return Iterator;
}();

var GooglePrediction = function () {
  function GooglePrediction(props) {
    classCallCheck(this, GooglePrediction);

    this.props = props;
  }

  createClass(GooglePrediction, [{
    key: 'createTrainingInstance',
    value: function createTrainingInstance(output) {
      var trainingInstances = Prediction.newInsertTrainingInstances();

      for (var _len = arguments.length, inputs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        inputs[_key - 1] = arguments[_key];
      }

      trainingInstances.csvInstance = inputs;
      trainingInstances.output = output;
      return trainingInstances;
    }
  }, {
    key: 'createTrainingModel',
    value: function createTrainingModel(trainingInstances) {
      var insert = Prediction.newInsert();
      insert.id = this.props.modelName;
      insert.trainingInstances = trainingInstances;

      var insertReply = Prediction.Trainedmodels.insert(insert, this.props.projectId);
      Logger.log(insertReply);
      Logger.log('Trained model with data.');
    }
  }, {
    key: 'queryTrainingStatus',
    value: function queryTrainingStatus() {
      return Prediction.Trainedmodels.get(this.props.projectId, this.props.modelName);
    }
  }, {
    key: 'makePrediction',
    value: function makePrediction() {
      var request = Prediction.newInput();
      request.input = Prediction.newInputInput();

      for (var _len2 = arguments.length, inputs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        inputs[_key2] = arguments[_key2];
      }

      request.input.csvInstance = inputs;
      return Prediction.Trainedmodels.predict(request, this.props.projectId, this.props.modelName).outputValue;
    }
  }, {
    key: 'updateTrainedModel',
    value: function updateTrainedModel(output) {
      var update = Prediction.newUpdate();

      for (var _len3 = arguments.length, inputs = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        inputs[_key3 - 1] = arguments[_key3];
      }

      update.csvInstance = inputs;
      update.output = output;

      return Prediction.Trainedmodels.update(update, this.props.projectId, this.props.modelName);
    }
  }]);
  return GooglePrediction;
}();



// returns a number between 0 and 1 for the hour
function hourlyPeriodicFormula(x) {
  return 0.5 + Math.pow(Math.sin(2 * Math.PI * (x / 24)) + Math.cos(2 * Math.PI * (x / 24)), 3) / 5.656;
}

function dailyPeriodicFormula(x) {
  return Math.sin(Math.PI * (x / 7)); // Sine Wave between 0 and 1
}

/**
 * Get the last day of the current month
 * @return {Date} last day of the month
 */


/**
 * Get the days between two dates
 * @param  {String} startDate any valid date string
 * @param  {String} endDate   any valid date string
 * @return {Integer}          number of days between start and end dates
 */


/**
 * Get the number of days since a date
 * @param  {String} startDate any valid date string
 * @return {Integer}          number of days since the start date
 */
function daysSince(startDate) {
  var diff = Math.abs(new Date() - new Date(startDate));
  return Math.ceil(diff / (1000 * 3600 * 24));
}





/**
* Converts a day of the week integer to a string.
* @method dayOfWeekAsString
* @param {Number} dayIndex day of the week as an integer
* @return {String}         day of the week as a string
*/
function dayOfWeekAsString(dayIndex) {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
}

/**
 * Converts a string day of the week to an integer.
 * @param  {String} string day of the week as string
 * @return {Number}        day of the week as an integer
 */
function dayOfWeekAsNumber(string) {
  if (string.length === 3) {
    return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(string.toLowerCase());
  } else {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(string.toLowerCase());
  }
}

/**
 * Convert a month to two digits
 * @param  {Number} m month
 * @return {String}   two digit month
 */
function twoDigitMonth(m) {
  return m < 10 ? '0' + m : m;
}

/**
 * Convert a date to two digits
 * @param  {Number} d date
 * @return {String}   two digit date
 */
function twoDigitDate(d) {
  return d < 10 ? '0' + d : d;
}

if (!Math.cbrt) {
  Math.cbrt = function (x) {
    var y = Math.pow(Math.abs(x), 1 / 3);
    return x < 0 ? -y : y;
  };
}

if (!Math.filterInt) {
  Math.filterInt = function (value) {
    if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) return Number(value);
    return NaN;
  };
}

function getRowByName(sheet, name) {
  var range = sheet.getRange(1, 1, sheet.getMaxRows());
  var values = range.getValues();
  var index = -1;
  for (var row in values) {
    if (values[row][0] === name) {
      index = Math.filterInt(row) + 1;
    }
  }
  return index;
}

var firstRun = true;
var runsLate = false;
var maxBid = 30;
var maxDisplayBid = 4;
var modelName = 'testing1';
var projectId = '168438661239';
var accountStartDate = '20170301';
var daysRunning = daysSince('March 1, 2017');
var spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1sh41PAf4K7GhkX4CPuxUx8DQWzy4Rvw366KaF1LMmz8/edit#gid=896040189';

var prediction = new GooglePrediction({
  modelName: modelName,
  projectId: projectId
});

var time = new Date();
var currentDate = '' + time.getFullYear() + twoDigitMonth(time.getMonth() + 1) + twoDigitDate(time.getDate());
var timeZone = AdWordsApp.currentAccount().getTimeZone();
var correctedDay = dayOfWeekAsNumber(Utilities.formatDate(time, timeZone, 'E'));
var correctedHour = Math.filterInt(Utilities.formatDate(time, timeZone, 'HH'));
var hour = runsLate ? correctedHour + 1 : correctedHour;
if (hour === 24) {
  hour = 0;
  if (correctedDay + 1 === 7) {
    correctedDay = 0;
  } else {
    correctedDay = correctedDay + 1;
  }
}

var ortb = function ortb(rate, budget, l, totalRequests) {
  var x = Math.cbrt(budget * Math.pow(l, 2) / totalRequests);
  return 2 * rate * x;
};

var config = ['keywords', ['display', 'audiences'], ['display', 'keywords'], ['display', 'topics']];

var ss = SpreadsheetApp.openByUrl(spreadsheetUrl);
var sheet = ss.getSheetByName(dayOfWeekAsString(correctedDay));

var main = function main() {

  if (firstRun === true) {

    var trainingInstances = [];
    var report = AdWordsApp.report('SELECT CampaignName,AdGroupName,DayOfWeek,HourOfDay,AverageCpc ' + ' FROM ADGROUP_PERFORMANCE_REPORT ' + ' WHERE Clicks > 0' + ' DURING ' + (accountStartDate + ',' + currentDate)).rows();

    while (report.hasNext()) {
      var row = report.next();
      var day = dailyPeriodicFormula(dayOfWeekAsNumber(row['DayOfWeek']));
      var _hour = hourlyPeriodicFormula(row['HourOfDay']);
      var cpc = row['AverageCpc'] * (0.5 + Math.abs(day)) * (0.5 + Math.abs(_hour));

      trainingInstances.push(prediction.createTrainingInstance(cpc, row['AdGroupName'], row['CampaignName'], day, _hour));
    }
    //Logger.log(trainingInstances);
    prediction.createTrainingModel(trainingInstances);
  } else {
    var test = prediction.queryTrainingStatus();
    Logger.log(test);

    new Iterator({
      entity: AdWordsApp.adGroups(),
      conditions: ['CampaignStatus = ENABLED', 'Status = ENABLED']
    }).iterate(function (adGroup) {
      var bid = Math.abs(prediction.makePrediction(adGroup.getName(), adGroup.getCampaign().getName(), dailyPeriodicFormula(correctedDay), hourlyPeriodicFormula(hour)));

      if (bid < maxBid) {
        adGroup.bidding().setCpc(bid);
      } else {
        adGroup.bidding().setCpc(maxBid);
      }

      //Logger.log(adGroup.getCampaign().getName() + ' - ' + adGroup.getName());

      for (var i in config) {
        try {
          var criteriaSelector = isArray(config[i]) ? adGroup[config[i][0]]()[config[i][1]]().get() : adGroup[config[i]]().get();

          while (criteriaSelector.hasNext()) {
            var criteria = criteriaSelector.next();
            var criteriaStats = criteria.getStatsFor('LAST_30_DAYS');

            criteria.bidding().clearCpc();

            var adjust = criteriaStats.getAveragePosition() === null ? 1 : criteriaStats.getAveragePosition();
            adjust = adjust * (1 + criteriaStats.getConversionRate());
            if (criteria.getEntityType() === 'Keyword' && config[i][0] !== 'display') {
              var qs = criteria.getQualityScore();
              if (!isNull(qs)) {
                adjust = adjust * (1 + qs / 40);
              }
            }

            var adGroupBid = adGroup.bidding().getCpc();
            var r = criteriaStats.getCtr();
            var l = adjust / (adGroupBid * r);
            var T = criteriaStats.getClicks() / daysRunning;
            var B = adGroup.getCampaign().getBudget();

            var criteriaBid = ortb(r, B, l, T);

            var rowName = adGroup.getCampaign().getName() + ' - ' + adGroup.getName() + ' - ' + criteria.getId();
            var _row = getRowByName(sheet, rowName);
            if (_row === -1) {
              _row = sheet.getMaxRows() + 1;
            }
            var cell = sheet.getRange('A' + _row);

            try {
              var fpCpc = criteria.getFirstPageCpc();

              if (isNaN(criteriaBid)) {
                if (fpCpc > adGroupBid && fpCpc < maxBid) {
                  //Logger.log(`First Page Cpc Bid - ${fpCpc} (${adGroupBid})`);
                  criteria.bidding().setCpc(fpCpc);
                } else if (fpCpc > adGroupBid && fpCpc > maxBid) {
                  //Logger.log(`Max Bid - ${maxBid} (${adGroupBid})`);
                  criteria.bidding().setCpc(maxBid);
                }
              } else {

                if (fpCpc > criteriaBid && fpCpc < maxBid) {
                  //Logger.log(`First Page Cpc Bid - ${fpCpc} (${criteriaBid})`);
                  criteria.bidding().setCpc(fpCpc);
                } else if (fpCpc > criteriaBid && fpCpc > maxBid) {
                  //Logger.log(`Max Bid - ${maxBid} (FPCPC: ${fpCpc}, Bid: ${criteriaBid})`);
                  criteria.bidding().setCpc(maxBid);
                } else if (criteriaBid < maxBid) {
                  //Logger.log('Predicted Bid - ' + criteriaBid);
                  criteria.bidding().setCpc(criteriaBid);

                  cell.setValue(rowName);
                  cell = sheet.getRange(_row, hour + 2);
                  cell.setValue(criteriaBid);
                } else {
                  Logger.log('No Match');
                }
              }
            } catch (e) {

              if (!isNaN(criteriaBid) && criteriaBid < maxDisplayBid) {
                criteria.bidding().setCpc(criteriaBid);
                //Logger.log('Predicted Bid - ' + criteriaBid);

                cell.setValue(rowName);
                cell = sheet.getRange(_row, hour + 2);
                cell.setValue(criteriaBid);
              } else if (!isNaN(criteriaBid) && criteriaBid > maxDisplayBid) {
                criteria.bidding().setCpc(maxDisplayBid);
                //Logger.log(`Max Bid - ${maxDisplayBid} (${criteriaBid})`);
              } else {
                Logger.log('No Match');
              }
            }
          }
        } catch (e) {
          Logger.log(e);
        }
      }
    });

    if (hour === '04') {
      var update = AdWordsApp.report('SELECT CampaignName,AdGroupName,DayOfWeek,HourOfDay,AverageCpc ' + ' FROM ADGROUP_PERFORMANCE_REPORT ' + ' WHERE Clicks > 0' + ' DURING YESTERDAY').rows();

      while (update.hasNext()) {
        var _row2 = update.next();
        var _day = dailyPeriodicFormula(dayOfWeekAsNumber(_row2['DayOfWeek']));
        var _hour2 = hourlyPeriodicFormula(_row2['HourOfDay']);
        var _cpc = _row2['AverageCpc'] * (0.5 + Math.abs(_day)) * (0.5 + Math.abs(_hour2));

        prediction.updateTrainedModel(_cpc, _row2['AdGroupName'], _row2['CampaignName'], _day, _hour2);
      }
    }
  }
};

main();
