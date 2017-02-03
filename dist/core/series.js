'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _generic = require('./generic');

var _generic2 = _interopRequireDefault(_generic);

var _utils = require('./utils');

var _dtype = require('./dtype');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Series = function (_NDFrame) {
  (0, _inherits3.default)(Series, _NDFrame);

  function Series() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Series);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Series.__proto__ || Object.getPrototypeOf(Series)).call(this, data, kwargs));

    if (Array.isArray(data)) {
      _this._values = _immutable2.default.List(data);
      _this._dtype = (0, _dtype.arrayToDType)(data);
    } else if (data instanceof _immutable2.default.List) {
      _this._values = data;
      _this._dtype = (0, _dtype.arrayToDType)(data);
    } else {
      _this._values = _immutable2.default.List.of(data);
      _this._dtype = (0, _dtype.arrayToDType)([data]);
    }

    _this.name = typeof kwargs.name !== 'undefined' ? kwargs.name : '';

    _this.set_axis(0, (0, _utils.parseIndex)(kwargs.index, _this.values));
    _this._setup_axes(_immutable2.default.List.of(0));

    _this._sort_ascending = _this._sort_ascending.bind(_this);
    _this._sort_descending = _this._sort_descending.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(Series, [{
    key: Symbol.iterator,
    value: function value() {
      var values = this.values;
      var index = -1;

      return {
        next: function next() {
          index += 1;
          return { value: values.get(index), done: !(index >= 0 && index < values.size) };
        }
      };
    }
  }, {
    key: 'map',
    value: function map(func) {
      var array = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _utils.enumerate)(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              val = _step$value[0],
              idx = _step$value[1];

          array.push(func(val, idx));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return new Series(array, { name: this.name, index: this.index });
    }
  }, {
    key: 'toString',
    value: function toString() {
      var _this2 = this;

      var vals = this.iloc(0, 10).values;

      var valString = '';
      vals.forEach(function (v, idx) {
        valString += _this2.index.get(idx) + '\t' + v + '\n';
      });

      return valString + 'Name: ' + this.name + ', dtype: ' + this.dtype;
    }
  }, {
    key: 'head',
    value: function head() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;

      return this.iloc(0, n);
    }
  }, {
    key: 'tail',
    value: function tail() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;

      return this.iloc(this.length - n, this.length);
    }
  }, {
    key: 'copy',
    value: function copy() {
      return new Series(this.values, { index: this.index, name: this.name });
    }
  }, {
    key: 'astype',
    value: function astype(nextType) {
      if (!(nextType instanceof _dtype.DType)) throw new Error('Next type must be a DType');

      if (nextType.dtype === this.dtype) return this;

      switch (nextType.dtype) {
        case 'int':
          {
            if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to int');
            var kwargs = { name: this.name, index: this.index };
            return new Series(this.values.map(function (v) {
              return Math.floor(v);
            }), kwargs);
          }
        case 'float':
          {
            if (this.dtype.dtype === 'object') throw new Error('Cannot convert object to float');
            var _kwargs = { name: this.name, index: this.index };
            return new Series(this.values.map(function (v) {
              return parseFloat(v);
            }), _kwargs);
          }
        default:
          throw new Error('Invalid dtype ' + nextType);
      }
    }
  }, {
    key: 'iloc',
    value: function iloc(startVal, endVal) {
      if (typeof endVal === 'undefined') return this.values.get(startVal);

      var name = this.kwargs.name;

      var index = this.index.slice(startVal, endVal);

      return new Series(this.values.slice(startVal, endVal), { name: name, index: index });
    }
  }, {
    key: 'sum',
    value: function sum() {
      return (0, _utils.sum)(this.values);
    }
  }, {
    key: 'mean',
    value: function mean() {
      return this.sum() / this.length;
    }
  }, {
    key: 'median',
    value: function median() {
      var sortedVals = this.values.sort();

      if (this.length % 2 === 1) return sortedVals.get(Math.floor(this.length / 2));

      var halfLength = this.length / 2;
      return (sortedVals.get(halfLength - 1) + sortedVals.get(halfLength)) / 2;
    }
  }, {
    key: 'variance',
    value: function variance() {
      var _this3 = this;

      var mean = this.mean();

      return this.values.reduce(function (s, v) {
        var diff = v - mean;
        return s + diff * diff / (_this3.length - 1);
      }, 0);
    }
  }, {
    key: 'std',
    value: function std() {
      return Math.sqrt(this.variance());
    }
  }, {
    key: 'abs',
    value: function abs() {
      if (['bool', 'string', 'object'].indexOf(this.dtype.dtype) >= 0) return this.copy();

      return new Series(this.values.map(function (v) {
        return Math.abs(v);
      }), { name: this.name, index: this.index });
    }
  }, {
    key: 'add',
    value: function add(val) {
      if (typeof val === 'number') return this.map(function (v) {
        return v + val;
      });else if (val instanceof Series) return this.map(function (v, idx) {
        return v + val.iloc(idx);
      });else if (Array.isArray(val)) return this.map(function (v, idx) {
        return v + val[idx];
      });else if (val instanceof _immutable2.default.List) return this.map(function (v, idx) {
        return v + val.get(idx);
      });

      throw new Error('add only supports numbers, Arrays, Immutable List and pandas.Series');
    }
  }, {
    key: 'sub',
    value: function sub(val) {
      if (typeof val === 'number') return this.map(function (v) {
        return v - val;
      });else if (val instanceof Series) return this.map(function (v, idx) {
        return v - val.iloc(idx);
      });else if (Array.isArray(val)) return this.map(function (v, idx) {
        return v - val[idx];
      });else if (val instanceof _immutable2.default.List) return this.map(function (v, idx) {
        return v - val.get(idx);
      });

      throw new Error('sub only supports numbers, Arrays, Immutable List and pandas.Series');
    }
  }, {
    key: 'mul',
    value: function mul(val) {
      if (typeof val === 'number') return this.map(function (v) {
        return v * val;
      });else if (val instanceof Series) return this.map(function (v, idx) {
        return v * val.iloc(idx);
      });else if (Array.isArray(val)) return this.map(function (v, idx) {
        return v * val[idx];
      });else if (val instanceof _immutable2.default.List) return this.map(function (v, idx) {
        return v * val.get(idx);
      });

      throw new Error('mul only supports numbers, Arrays, Immutable List and pandas.Series');
    }
  }, {
    key: 'multiply',
    value: function multiply(val) {
      return this.mul(val);
    }
  }, {
    key: 'div',
    value: function div(val) {
      if (typeof val === 'number') return this.map(function (v) {
        return v / val;
      });else if (val instanceof Series) return this.map(function (v, idx) {
        return v / val.iloc(idx);
      });else if (Array.isArray(val)) return this.map(function (v, idx) {
        return v / val[idx];
      });else if (val instanceof _immutable2.default.List) return this.map(function (v, idx) {
        return v / val.get(idx);
      });

      throw new Error('div only supports numbers, Arrays, Immutable List and pandas.Series');
    }
  }, {
    key: 'divide',
    value: function divide(val) {
      return this.div(val);
    }
  }, {
    key: 'cov',
    value: function cov(ds) {
      if (!(ds instanceof Series)) throw new Error('ds must be a Series');

      if (ds.length !== this.length) throw new Error('Series must be of equal length');

      var n = 0;
      var mean1 = 0;
      var mean2 = 0;
      var m12 = 0;

      this.values.forEach(function (v1, idx) {
        n += 1;
        var d1 = (v1 - mean1) / n;
        mean1 += d1;
        var d2 = (ds.values.get(idx) - mean2) / n;
        mean2 += d2;

        m12 += (n - 1) * d1 * d2 - m12 / n;
      });

      return n / (n - 1) * m12;
    }
  }, {
    key: 'corr',
    value: function corr(ds) {
      if (!(ds instanceof Series)) throw new Error('ds must be a Series');

      if (ds.length !== this.length) throw new Error('Series must be of equal length');

      return this.cov(ds) / (this.std() * ds.std());
    }
  }, {
    key: 'diff',
    value: function diff() {
      var _this4 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      return new Series(_immutable2.default.Repeat(null, periods).toList().concat(_immutable2.default.Range(periods, this.length).map(function (idx) {
        return _this4.values.get(idx) - _this4.values.get(idx - periods);
      }).toList()), { index: this.index, name: this.name });
    }
  }, {
    key: 'pct_change',
    value: function pct_change() {
      var _this5 = this;

      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (typeof periods !== 'number' || !Number.isInteger(periods)) throw new Error('periods must be an integer');
      if (periods <= 0) throw new Error('periods must be positive');

      return new Series(_immutable2.default.Repeat(null, periods).toList().concat(_immutable2.default.Range(periods, this.length).map(function (idx) {
        return _this5.values.get(idx) / _this5.values.get(idx - periods) - 1;
      }).toList()), { index: this.index, name: this.name });
    }
  }, {
    key: '_sort_ascending',
    value: function _sort_ascending(valueA, valueB) {
      var valA = this.iloc(valueA);
      var valB = this.iloc(valueB);

      if (valA < valB) return -1;else if (valA > valB) return 1;
      return 0;
    }
  }, {
    key: '_sort_descending',
    value: function _sort_descending(valueA, valueB) {
      var valA = this.iloc(valueA);
      var valB = this.iloc(valueB);

      if (valA > valB) return -1;else if (valA < valB) return 1;
      return 0;
    }
  }, {
    key: 'sort_values',
    value: function sort_values() {
      var _this6 = this;

      var ascending = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      var sortedIndex = ascending ? this.index.sort(this._sort_ascending) : this.index.sort(this._sort_descending);

      return new Series(sortedIndex.map(function (i) {
        return _this6.iloc(i);
      }), { name: this.name, index: sortedIndex });
    }
  }, {
    key: 'round',
    value: function round() {
      var decimals = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      return new Series(this.values.map(function (v) {
        return (0, _utils.round10)(v, -1 * decimals);
      }));
    }
  }, {
    key: '_alignSeries',
    value: function _alignSeries(series) {
      var _this7 = this;

      var seriesAlignment = _immutable2.default.Map({});

      this.index.forEach(function (idx1) {
        if (!seriesAlignment.has(idx1)) {
          seriesAlignment = seriesAlignment.set(idx1, _immutable2.default.Map({
            first: _immutable2.default.List.of(_this7.iloc(idx1)),
            second: _immutable2.default.List([])
          }));
        } else {
          seriesAlignment = seriesAlignment.updateIn([idx1, 'first'], function (l) {
            return l.concat(_this7.iloc(idx1));
          });
        }
      });

      series.index.forEach(function (idx2) {
        if (!seriesAlignment.has(idx2)) {
          seriesAlignment = seriesAlignment.set(idx2, _immutable2.default.Map({
            first: _immutable2.default.List([]),
            second: _immutable2.default.List.of(series.iloc(idx2))
          }));
        } else {
          seriesAlignment = seriesAlignment.updateIn([idx2, 'second'], function (l) {
            return l.concat(series.iloc(idx2));
          });
        }
      });

      return seriesAlignment;
    }
  }, {
    key: 'where',
    value: function where(other, op) {
      var name = this.name;
      var index = this.index;
      var kwargs = { name: name, index: index };

      if (!Array.isArray(other) && !(other instanceof _immutable2.default.List) && !(other instanceof Series)) return new Series(this.values.map(function (v) {
        return op(v, other);
      }), kwargs);

      if (Array.isArray(other)) {
        if (other.length !== this.length) throw new Error('Must be equal length for comparison');
        return new Series(this.values.map(function (v, idx) {
          return op(v, other[idx]);
        }), kwargs);
      } else if (other instanceof _immutable2.default.List) {
        if (other.size !== this.length) throw new Error('Must be equal length for comparison');
        return new Series(this.values.map(function (v, idx) {
          return op(v, other.get(idx));
        }), kwargs);
      } else if (other instanceof Series) {
        if (other.length !== this.length) throw new Error('Must be equal length for comparison');
        return new Series(this.values.map(function (v, idx) {
          return op(v, other.iloc(idx));
        }), kwargs);
      }

      throw new Error('Must be scalar value, Array, Series, or Immutable.List');
    }
  }, {
    key: 'eq',
    value: function eq(other) {
      return this.where(other, function (a, b) {
        return a === b;
      });
    }
  }, {
    key: 'lt',
    value: function lt(other) {
      return this.where(other, function (a, b) {
        return a < b;
      });
    }
  }, {
    key: 'lte',
    value: function lte(other) {
      return this.where(other, function (a, b) {
        return a <= b;
      });
    }
  }, {
    key: 'gt',
    value: function gt(other) {
      return this.where(other, function (a, b) {
        return a > b;
      });
    }
  }, {
    key: 'gte',
    value: function gte(other) {
      return this.where(other, function (a, b) {
        return a >= b;
      });
    }
  }, {
    key: 'notnull',
    value: function notnull() {
      return this.where(null, function (a, b) {
        return a !== b;
      });
    }
  }, {
    key: 'shift',
    value: function shift() {
      var periods = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      if (!Number.isInteger(periods)) throw new Error('periods must be an integer');

      if (periods === 0) {
        return this.copy();
      } else if (periods < 0) {
        var absPeriods = Math.abs(periods);

        if (absPeriods > this.length) throw new Error('Periods greater than length of Series');

        var _values = this.values.slice(absPeriods, this.length).concat(_immutable2.default.Repeat(null, absPeriods).toList());

        return new Series(_values, { name: this.name, index: this.index });
      }

      if (periods > this.length) throw new Error('Periods greater than length of Series');

      var values = _immutable2.default.Repeat(null, periods).toList().concat(this.values.slice(0, this.length - periods));

      return new Series(values, { name: this.name, index: this.index });
    }
  }, {
    key: 'unique',
    value: function unique() {
      return this.values.toSet().toList();
    }
  }, {
    key: 'filter',
    value: function filter(iterBool) {
      var _this8 = this;

      if (!Array.isArray(iterBool) && !(iterBool instanceof _immutable2.default.List) && !(iterBool instanceof Series)) throw new Error('filter must be an Array, List, or Series');

      var valueIndexMap = { values: [], index: [] };
      if (iterBool instanceof Series) iterBool.values.forEach(function (v, idx) {
        if (v === true) {
          valueIndexMap.values.push(_this8.values.get(idx));
          valueIndexMap.index.push(_this8.index.get(idx));
        }
      });else {
        iterBool.forEach(function (v, idx) {
          if (v === true) {
            valueIndexMap.values.push(_this8.values.get(idx));
            valueIndexMap.index.push(_this8.index.get(idx));
          }
        });
      }

      return new Series(valueIndexMap.values, { name: this.name, index: valueIndexMap.index });
    }
  }, {
    key: 'to_json',
    value: function to_json() {
      var _this9 = this;

      var kwargs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { orient: 'index' };

      var ALLOWED_ORIENT = ['records', 'split', 'index'];
      var orient = 'index';

      if (typeof kwargs.orient !== 'undefined') {
        if (ALLOWED_ORIENT.indexOf(kwargs.orient) < 0) throw new TypeError('orient must be in ' + ALLOWED_ORIENT);
        orient = kwargs.orient;
      }

      var json = void 0;
      switch (orient) {
        case 'records':
          return this.values.toArray();
        case 'split':
          return { index: this.index.toArray(), name: this.name, values: this.values.toJS() };
        case 'index':
          json = {};
          this.values.forEach(function (v, idx) {
            json[_this9.index.get(idx)] = v;
          });
          return json;
        default:
          throw new TypeError('orient must be in ' + ALLOWED_ORIENT);
      }
    }
  }, {
    key: 'kwargs',
    get: function get() {
      return {
        name: this.name,
        index: this._index
      };
    }
  }, {
    key: 'dtype',
    get: function get() {
      return this._dtype;
    }
  }, {
    key: 'index',
    get: function get() {
      return this._get_axis(0);
    },
    set: function set(index) {
      this.set_axis(0, (0, _utils.parseIndex)(index, this.values));
    }
  }, {
    key: 'length',
    get: function get() {
      return this.values.size;
    }
  }, {
    key: 'values',
    get: function get() {
      return (0, _get3.default)(Series.prototype.__proto__ || Object.getPrototypeOf(Series.prototype), 'values', this);
    }
  }]);
  return Series;
}(_generic2.default);

exports.default = Series;