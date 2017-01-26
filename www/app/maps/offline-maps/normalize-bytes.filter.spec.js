describe('normalizeBytes filter', function ($filter) {
  'use strict';

  var normalize;

  beforeEach(function () {
    module('app');

    inject(function (_$filter_) {
      $filter = _$filter_;
    });

    normalize = $filter('normalizeBytes');
  });

  it('returns unknown when given a null', function () {
    expect(normalize(null)).toEqual('unknown');
  });

  it('returns unknown when given undefined', function () {
    expect(normalize(undefined)).toEqual('unknown');
  });

  it('returns "0 bytes" when given 0', function () {
    expect(normalize(0)).toEqual('0 byte');
  });

  it('returns "123 bytes" when given 123', function () {
    expect(normalize(123)).toEqual('123 bytes');
  });

  it('returns "1.23 KB" when given 1234', function () {
    expect(normalize(1234)).toEqual('1.23 KB');
  });

  it('returns "4.56 MB" when given 4561234', function () {
    expect(normalize(4561234)).toEqual('4.56 MB');
  });
});
