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
