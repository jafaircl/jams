// Type checking
function getType(elem) {
  return Object.prototype.toString.call(elem).slice(8, -1);
}



function isObject(elem) {
  return getType(elem) === 'Object';
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

      this.iterate(function () {
        if (input) {
          if (isObject(input)) {
            var obj = {};

            for (var field in input) {
              try {
                obj[field] = input[field].call(arguments, this);
              } catch (e) {
                obj[field] = input[field].call(this);
              }
            }
            arr.push(obj);
          } else {
            arr.push(input(this));
          }
        } else {
          arr.push(this);
        }
      });

      return arr;
    }
  }]);
  return Iterator;
}();

var conditions = ['Impressions > 0'];
var dateRange = 'LAST_30_DAYS';

var main = function main() {
  var ads = new Iterator({
    entity: AdWordsApp.ads(),
    conditions: conditions,
    dateRange: dateRange
  }).toArray({
    id: function id(ad) {
      return ad.getId();
    },
    adGroupId: function adGroupId(ad) {
      return ad.getAdGroup().getId();
    },
    stats: function stats(ad) {
      var stats = ad.getStatsFor(dateRange);
      return {
        clicks: stats.getClicks(),
        impressions: stats.getImpressions()
      };
    }
  });

  // Loop backwards so filtering the ads doesn't mess up indexing
  var i = ads.length - 1;
  for (i; i >= 0; i = ads.length - 1) {

    // Filter the array for ads in the same ad group
    var group = ads.filter(function (ad) {
      return ad.adGroupId === ads[i].adGroupId;
    });

    Logger.log(group[0].adGroupId);

    // Filter out the ads in this ad group from the main array
    ads = ads.filter(function (ad) {
      return ad.adGroupId !== ads[i].adGroupId;
    });
  }
};

main();
