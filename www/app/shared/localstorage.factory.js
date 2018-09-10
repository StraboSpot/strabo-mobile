(function () {
  'use strict';

  angular
    .module('app')
    .factory('LocalStorageFactory', LocalStorageFactory);

  LocalStorageFactory.$inject = ['$cordovaDevice', '$cordovaFile', '$log', '$q', '$window', 'HelpersFactory'];

  function LocalStorageFactory($cordovaDevice, $cordovaFile, $log, $q, $window, HelpersFactory) {
    var dbs = {};
    dbs.configDb = {};        // global LocalForage for configuration and user data
    dbs.dataFilesDB = {};          // global LocalForage for CSV data
    dbs.imagesDb = {};        // global LocalForage for images
    dbs.mapNamesDb = {};      // global LocalForage for map names
    dbs.mapTilesDb = {};      // global LocalForage for offline map tiles
    dbs.projectDb = {};       // global LocalForage for project data
    dbs.spotsDb = {};         // global LocalForage for spot data
    var appDirectory = 'StraboSpot';
    var dataBackupsDirectory = appDirectory + '/DataBackups';
    var imagesBackupsDirectory = appDirectory + '/ImageBackups';
    var importImagesCount = {'need': 0, 'have': 0, 'success': 0, 'failed': 0};

    return {
      'exportImage': exportImage,
      'exportImages': exportImages,
      'exportProject': exportProject,
      'gatherLocalFiles': gatherLocalFiles,
      'getDb': getDb,
      'importImages': importImages,
      'importProject': importProject,
      'setupLocalforage': setupLocalforage
    };


    /**
     * Private Functions
     */

    function checkDir(dir) {
      var deferred = $q.defer(); // init promise
      var devicePath = getDevicePath();
      if (devicePath) {
        $cordovaFile.checkDir(devicePath, dir).then(function (checkDirSuccess) {
          $log.log('Directory', dir, 'exists.', checkDirSuccess);
          deferred.resolve(devicePath + checkDirSuccess.fullPath);
        }, function () {
          $cordovaFile.createDir(devicePath, dir, false).then(function (createDirSuccess) {
              $log.log('Directory', dir, 'created.', createDirSuccess);
              deferred.resolve(devicePath + createDirSuccess.fullPath);
            },
            function (createDirError) {
              $log.error('Unable to create directory', dir, createDirError);
              deferred.reject(createDirError);
            });
        });
      }
      else deferred.reject('Device not found');
      return deferred.promise;
    }

    function exportData(directory, data, fileName) {
      return checkDir(appDirectory).then(function () {
        return checkDir(directory).then(function (fullPath) {
          return writeFile(fullPath, data, fileName);
        });
      });
    }

    function gatherData() {
      var save = {};
      var deferred = $q.defer(); // init promise
      var promises = [];
      _.each(dbs, function (db) {
        //$log.log(db);
        var dbName = db.config().name;
        if (dbName !== 'configDb' && dbName !== 'mapNamesDb' && dbName !== 'mapTilesDb' && dbName !== 'imagesDb') {
          save[dbName] = {};
          var promise = db.iterate(function (value, key, i) {
            save[dbName][key] = value;
          }).then(function () {
            //$log.log(save);
          });
          promises.push(promise);
        }

      });
      $q.all(promises).then(function () {
        $log.log(save);
        deferred.resolve(save);
      });
      return deferred.promise;
    }

    function getDevicePath() {
      var devicePath;
      try {
        switch ($cordovaDevice.getPlatform()) {
          case 'Android':
            devicePath = cordova.file.externalRootDirectory;    // 'file:///storage/emulated/0/'
            break;
          case 'iOS':
            devicePath = cordova.file.documentsDirectory;
            break;
          default:
            // uh oh?  TODO: what about windows and blackberry?
            devicePath = cordova.file.externalRootDirectory;
            break;
        }
      }
      catch (err) {
        $log.log(err);
      }
      return devicePath;
    }

    function importData(directory, name) {
      var deferred = $q.defer(); // init promise

      var devicePath = getDevicePath();
      if (devicePath) {
        $cordovaFile.checkDir(devicePath, directory).then(function (foundDir) {
            //$log.log(foundDir);
            $cordovaFile.checkFile(devicePath + '/' + directory + '/', name).then(function (foundFile) {
                $cordovaFile.readAsText(devicePath + '/' + directory + '/', name).then(function (data) {
                  //$log.log(data);
                  deferred.resolve(angular.fromJson(data));
                }, function (noData) {
                  $log.log('Error reading data', noData);
                  deferred.reject('Error reading data', noData);
                })
              },
              function (notFoundFile) {
                $log.log('File not found', notFoundFile);
                deferred.reject('File not found', notFoundFile);
              }
            )
          },
          function (notFoundDir) {
            $log.log('Directory not found', notFoundDir);
            deferred.reject('Directory not found', notFoundDir);
          });
      }
      else deferred.reject('Device not found');

      return deferred.promise;
    }

    function importImage(id) {
      var deferred = $q.defer(); // init promise

      var devicePath = getDevicePath();
      if (devicePath) {
        $cordovaFile.readAsDataURL(devicePath + imagesBackupsDirectory, id + '.jpg').then(function (file) {
          dbs.imagesDb.setItem(id.toString(), file).then(function () {
            importImagesCount.success++;
            deferred.resolve();
          }, function (setItemErr) {
            importImagesCount.failed++;
            $log.log('Error setting item in db with localforage:', setItemErr);
            deferred.resolve();
          }).catch(function (err) {
            $log.log('Catch localforage error:', err);
          });
        }, function (readErr) {
          importImagesCount.failed++;
          $log.log('Error reading file:', readErr);
          deferred.resolve();
        });
      }
      else deferred.reject('Device not found');
      return deferred.promise;
    }

    function replaceDbs(data) {
      var promisesInner = [];
      var promisesOuter = [];
      _.each(dbs, function (db) {
        var dbName = db.config().name;
        if (dbName !== 'configDb' && dbName !== 'mapNamesDb' && dbName !== 'mapTilesDb') {
          var promiseOuter = db.clear().then(function () {
            if (data[dbName]) {
              _.each(data[dbName], function (value, key) {
                var promiseInner = db.setItem(key, value).then(function (val) {
                  //$log.log('Set', val)
                }).catch(function (setError) {
                  $log.log('Error setting', key, ':', value, setError);
                });
                promisesInner.push(promiseInner);
              });
            }
          }).catch(function (clearError) {
            $log.log('Error clearing db', db, clearError);
          });
          promisesOuter.push(promiseOuter);
        }
      });
      return $q.all(promisesOuter).then(function () {
        return $q.all(promisesInner).then(function () {
          $log.log('Finished importing data');
        });
      });
    }

    function writeFile(fullPath, data, fileName) {
      var deferred = $q.defer(); // init promise
      $cordovaFile.writeFile(fullPath, fileName, data, true).then(
        function (success) {
          $log.log('File successfully written!', success);
          deferred.resolve(fullPath + fileName);
        },
        function (writeError) {
          $log.log('Error writing file!', writeError);
          deferred.reject(fullPath + fileName)
        }
      );
      return deferred.promise;
    }

    /**
     * Public Functions
     */

    function exportImage(data, fileName) {
      return exportData(imagesBackupsDirectory, data, fileName)
    }

    function exportImages() {
      var deferred = $q.defer(); // init promise
      var promises = [];
      dbs.imagesDb.iterate(function (base64Image, key, i) {
        // Process the base64 string - split the base64 string into the data and data type
        var block = base64Image.split(';');
        var dataType = block[0].split(':')[1];    // In this case 'image/jpg'
        var base64Data = block[1].split(',')[1];  // In this case 'iVBORw0KGg....'
        var dataBlob = HelpersFactory.b64toBlob(base64Data, dataType);
        var filename = key + '.jpg';
        var promise = exportImage(dataBlob, filename).then(function (filePath) {
          $log.log('Image saved to ' + filePath);
        }, function (error) {
          $log.log('Unable to save image.' + error);
        });
        promises.push(promise);
      }).then(function () {
        $q.all(promises).then(function () {
          deferred.resolve();
        }, function () {
          deferred.reject();
        });
      });
      return deferred.promise;
    }

    function exportProject(name) {
      return gatherData().then(function (dataToExport) {
        return exportData(dataBackupsDirectory, angular.toJson(dataToExport), name + '.json', 'DataBackups');
      });
    }

    function gatherLocalFiles() {
      var deferred = $q.defer(); // init promise

      var devicePath = getDevicePath();
      if (devicePath) {    
        $window.resolveLocalFileSystemURL(devicePath + dataBackupsDirectory,
          function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(
              function (entries) {
                //console.log(entries);
                deferred.resolve(entries);
              },
              function (err) {
                console.log(err);
                if (err.code) deferred.reject(err.code);
                else deferred.reject('Unknown error');
              }
            );
          }, function (err) {
            console.log(err);
            if (err.code) deferred.reject(err.code);
            else deferred.reject('Unknown error');
          }
        );
      }
      else deferred.reject('Device not found');
      return deferred.promise;
    }

    function getDb() {
      return dbs;
    }

    function importImages() {
      var deferred = $q.defer(); // init promise
      var promisesOuter = [];
      var promises = [];
      importImagesCount = {'need': 0, 'have': 0, 'success': 0, 'failed': 0};
      dbs.spotsDb.iterate(function (value, key, iterationNumber) {
        if (value.properties.images) {
          _.each(value.properties.images, function (image) {
            if (image.id) {
              var promiseOuter = dbs.imagesDb.getItem(image.id.toString()).then(function (foundImage) {
                if (foundImage) importImagesCount.have++;
                else {
                  importImagesCount.need++;
                  var promise = importImage(image.id);
                  promises.push(promise);
                }
              });
              promisesOuter.push(promiseOuter);
            }
          });
        }
      }).then(function () {
        $q.all(promisesOuter).then(function () {
          $q.all(promises).then(function () {
            deferred.resolve(importImagesCount);
          }, function () {
            deferred.reject();
          });
        })
      });
      return deferred.promise;
    }

    function importProject(name) {
      return importData(dataBackupsDirectory, name).then(function (importedData) {
        return replaceDbs(importedData);
      });
    }

    function setupLocalforage() {
      var deferred = $q.defer(); // init promise
      var doInitialize = _.some(dbs, function (db) {
        return _.isEmpty(db);
      });
      if (doInitialize) {
        try {
          localforage.defineDriver(window.cordovaSQLiteDriver).then(function () {
            return localforage.setDriver([
              window.cordovaSQLiteDriver._driver,
              localforage.INDEXEDDB,
              localforage.WEBSQL,
              localforage.LOCALSTORAGE
            ]);
          }).then(function () {
            $log.log('Creating', localforage.driver(), 'databases ... ');
            _.each(dbs, function (db, key) {
              dbs[key] = localforage.createInstance({
                'driver': localforage.driver(),
                'name': key
              });
              $log.log('Created db', key, ':', dbs[key]);
            });
            deferred.resolve(true);
          }).catch(function (err) {
            $log.log(err);
            deferred.resolve(false);
          });
        }
        catch (e) {
          $log.log(e);
          deferred.resolve(false);
        }
      }
      else deferred.resolve(true);

      return deferred.promise;
    }
  }
}());
