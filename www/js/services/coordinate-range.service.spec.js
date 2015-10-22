'use strict';

describe('a CoordinateRange', function () {
  var CoordinateRange;
  var mock_data;

  beforeEach(module('app'));

  // CoordinateRange instance we're testing
  beforeEach(inject(function (_CoordinateRange_) {
    CoordinateRange = _CoordinateRange_;
  }));

  beforeEach(function () {
    mock_data = [{
      'geometry': {
        'type': 'Point',
        'coordinates': [-119.89, 34.43]
      }
    }, {
      'geometry': {
        'type': 'Point',
        'coordinates': [-150, 22]
      }
    }, {
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-119.89110849350129, 34.43351248079004],
            [-119.8922779366318, 34.43299039048476],
            [-119.8915591046158, 34.43216742795748],
            [-119.89019654243624, 34.43388413630822],
            [-119.89147327392732, 34.43398147438511],
            [-119.89110849350129, 34.43351248079004]
          ]
        ]
      }
    }, {
      'geometry': {
        'type': 'LineString',
        'coordinates': [
          [-119.89540002792515, 34.43095509205388],
          [-119.89501378982699, 34.43160993260916],
          [-119.894477348024, 34.43001706826627]
        ]
      }
    }];
    CoordinateRange.setAllCoordinates(mock_data);
  });

  // Begin Spec

  it('should be defined', function () {
    expect(CoordinateRange).toBeDefined();
  });

  it('should return a list of coordinates within a list', function () {
    expect(CoordinateRange.getAllCoordinates(mock_data)).toEqual([
      [-119.89, 34.43],
      [-150, 22],
      [-119.89110849350129, 34.43351248079004],
      [-119.8922779366318, 34.43299039048476],
      [-119.8915591046158, 34.43216742795748],
      [-119.89019654243624, 34.43388413630822],
      [-119.89147327392732, 34.43398147438511],
      [-119.89110849350129, 34.43351248079004],
      [-119.89540002792515, 34.43095509205388],
      [-119.89501378982699, 34.43160993260916],
      [-119.894477348024, 34.43001706826627]
    ]);
  });

  it('should return the max latitude', function () {
    expect(CoordinateRange.getMaxLatitude()).toEqual(34.43398147438511);
  });

  it('should return the min latitude', function () {
    expect(CoordinateRange.getMinLatitude()).toEqual(22);
  });

  it('should return the max longitude', function () {
    expect(CoordinateRange.getMaxLongitude()).toEqual(-119.89);
  });

  it('should return the min longitude', function () {
    expect(CoordinateRange.getMinLongitude()).toEqual(-150);
  });
});
