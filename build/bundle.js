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
    key: 'build',
    value: function build() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props.entity;


      for (var method in repeatableMethods) {
        selector = chainMethods(method, this.props[repeatableMethods[method]], selector);
      }
      return selector.forDateRange(this.props.dateRange).withLimit(this.props.limit).get();
    }
  }, {
    key: 'run',
    value: function run(logic) {
      this.iterator = this.build();

      while (this.iterator.hasNext()) {
        logic.call(this.iterator.next());
      }
    }

    /*
    let keywords = new Iterator({
      entity: AdWordsApp.keywords(),
      conditions: keywordConditions,
      dateRange: dateRange
    }).toArray({
      adGroupId(){ return this.getAdGroup().getId(); },
      text(){ return this.getText(); },
    });
    */

  }, {
    key: 'toArray',
    value: function toArray$$1(input) {
      this.iterator = this.build();
      var arr = [];

      while (this.iterator.hasNext()) {
        this.item = this.iterator.next();

        if (input) {
          var obj = {};
          for (var field in input) {
            obj[field] = input[field].call(this.item);
          }
          arr.push(obj);
        } else {
          arr.push(this.item);
        }
      }
      return arr;
    }
  }]);
  return Iterator;
}();

var conditions = ['Impressions > 0'];
var dateRange = 'LAST_30_DAYS';

(function main() {
  var ads = new Iterator({
    entity: AdWordsApp.ads(),
    conditions: conditions,
    dateRange: dateRange
  }).toArray({
    id: function id() {
      return this.getId();
    },
    adGroupId: function adGroupId() {
      return this.getAdGroup().getId();
    },
    stats: function stats() {
      var stats = this.getStatsFor(dateRange);
      return {
        clicks: stats.getClicks(),
        impressions: stats.getImpressions()
      };
    }
  });

  var _loop = function _loop(i) {
    // Filter the array for ads in the same ad group
    var group = ads.filter(function (ad) {
      return ad.adGroupId === ads[i].adGroupId;
    });

    // Sort the group by impressions in descending order
    group.sort(function (a, b) {
      return b.stats.impressions - a.stats.impressions;
    });

    Logger.log(group);

    for (var j in group) {

      // Get the index of the logged ad & remove it so we don't keep logging the same ad groups
      ads.splice(ads.indexOf(group[j]), 1);
    }
  };

  for (var i in ads) {
    _loop(i);
  }
})();
