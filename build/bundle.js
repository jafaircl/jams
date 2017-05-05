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

var main = function main() {

  // Use selectors
  var selector = new Iterator({
    entity: AdWordsApp.campaigns()
  }).select();

  while (selector.hasNext()) {
    var campaign = selector.next();
    Logger.log(campaign.getName());
  }

  // Go straight to iterating:
  // Use arrows
  new Iterator({
    entity: AdWordsApp.campaigns()
  }).iterate(function (campaign) {
    Logger.log(campaign.getName());
  });

  // Don't use arrows
  new Iterator({
    entity: AdWordsApp.campaigns()
  }).iterate(function () {
    Logger.log(this.getName());
  });

  // Create an array of objects using arrow functions
  var arrowArray = new Iterator({
    entity: AdWordsApp.campaigns()
  }).toArray({
    id: function id(campaign) {
      return campaign.getId();
    },
    clicks: function clicks(campaign) {
      var stats = campaign.getStatsFor('YESTERDAY');
      return {
        clicks: stats.getClicks(),
        ctr: stats.getCtr()
      };
    }
  });

  Logger.log(arrowArray);

  // Create an array of objects
  var thisArray = new Iterator({
    entity: AdWordsApp.campaigns()
  }).toArray({
    name: function name() {
      return this.getName();
    },
    conversions: function conversions() {
      var stats = this.getStatsFor('YESTERDAY');
      return {
        conversions: stats.getConversions(),
        conversionRate: stats.getConversionRate()
      };
    }
  });

  Logger.log(thisArray);

  // Create an array from a single property
  var singleArray = new Iterator({
    entity: AdWordsApp.campaigns()
  }).toArray(function (campaign) {
    return campaign.getName();
  });

  Logger.log(singleArray);
};

main();
