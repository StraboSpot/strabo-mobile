(function () {
  'use strict';

  angular
    .module('app')
    .factory('LocalStorageFactory', LocalStorageFactory);

  LocalStorageFactory.$inject = ['$cordovaDevice', '$cordovaFile', '$log', '$q', '$window', 'HelpersFactory', 'IS_WEB'];

  function LocalStorageFactory($cordovaDevice, $cordovaFile, $log, $q, $window, HelpersFactory, IS_WEB) {
    var dbs = {};
    dbs.configDb = {};        // global LocalForage for configuration and user data
    dbs.imagesDb = {};        // global LocalForage for images
    dbs.mapNamesDb = {};      // global LocalForage for map names
    dbs.mapTilesDb = {};      // global LocalForage for offline map tiles
    dbs.projectDb = {};       // global LocalForage for project data
    dbs.spotsDb = {};         // global LocalForage for spot data
    var appDirectory = 'StraboSpot';
    var dataBackupsDirectory = appDirectory + '/DataBackups';
    var imagesBackupsDirectory = appDirectory + '/ImageBackups';
    var imagesDirectory = appDirectory + '/Images';
    var zipsDirectory = appDirectory + '/TileZips';
    var tileCacheDirectory = appDirectory + '/TileCache';
    var importImagesCount = {'need': 0, 'have': 0, 'success': 0, 'failed': 0};

    return {
      'checkDir': checkDir,
      'checkImagesDir': checkImagesDir,
      'checkZipsDir': checkZipsDir,
      'clearFiles': clearFiles,
      'deleteMapFiles': deleteMapFiles,
      'exportImage': exportImage,
      'exportImages': exportImages,
      'exportProject': exportProject,
      'gatherLocalFiles': gatherLocalFiles,
      'getDb': getDb,
      'getDevicePath': getDevicePath,
      'getImageById': getImageById,
      'getTileCacheDirectory': getTileCacheDirectory,
      'getZipsDirectory': getZipsDirectory,
      'getMapCenterTile': getMapCenterTile,
      'getMapStorageDetails': getMapStorageDetails,
      'getTile': getTile,
      'importImages': importImages,
      'importProject': importProject,
      'saveImageToFileSystem': saveImageToFileSystem,
      'saveZip': saveZip,
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

    function checkImagesDir() {
      return verifyDirectoryOnce(imagesDirectory);
    }

    function exportData(directory, data, fileName) {
      return checkDir(appDirectory).then(function () {
        return checkDir(directory).then(function (fullPath) {
          $log.log('fullPath',fullPath);
          return writeFile(fullPath, data, fileName);
        });
      });
    }

    function exportDataWithoutCheck(fullPath, data, fileName) {
      return writeFile(fullPath, data, fileName);
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
        //$log.log(err);
        $log.error('Error getting device path');
      }
      return devicePath;
    }

    function getMedian(arr) {
      arr = arr.slice(0); // create copy
      var middle = (arr.length + 1) / 2,
        sorted = arr.sort( function(a,b) {return a - b;} );
      return (sorted.length % 2) ? sorted[middle - 1] : (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2;
    };

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

    function importImage(id) {//fix this
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
          $log.error('Error writing file!');
          deferred.reject(fullPath + fileName)
        }
      );
      return deferred.promise;
    }

    /**
     * Public Functions
     */

     function clearFiles(maps) { //clears all offline map files
       var deferred = $q.defer(); // init promise

       var devicePath = getDevicePath();

       $cordovaFile.removeRecursively(devicePath, zipsDirectory).then(function (success) {
         $cordovaFile.removeRecursively(devicePath, tileCacheDirectory).then(function (success) {
           deferred.resolve("Success!");
         },function(failure){
           $log.log('delete folder: ' + tileCacheDirectory + ' failed');
           $log.log('failure: ', failure);
           //deferred.reject();
           deferred.resolve();
         });
       },function(failure){
         $log.log('delete folder: ' + zipsDirectory + ' failed');
         $log.log('failure: ', failure);
         //deferred.reject();
         deferred.resolve();
       });

       return deferred.promise;
    }

    function deleteMapFiles(map) {
      var deferred = $q.defer(); // init promise
      var mapid = String(map.mapid);
      if(mapid!='') {
        var devicePath = getDevicePath();
        $log.log('deleteMapFiles mapid: ' + mapid);
        $cordovaFile.removeFile(devicePath + zipsDirectory, mapid + '.zip').then(function (success) {
          $cordovaFile.removeRecursively(devicePath + tileCacheDirectory, mapid).then(function (success) {
            deferred.resolve("Success!");
          },function(failure){
            $log.log('delete folder: ' + tileCacheDirectory + ' ' + mapid + ' failed');
            $log.log('failure: ', failure);
            //deferred.reject();
            deferred.resolve();
          });
        },function(failure){
          $log.log('delete file: ' + zipsDirectory + ' ' + mapid + '.zip failed');
          $log.log('failure: ', failure);
          //deferred.reject();
          deferred.resolve();
        });
      }else{
        $log.log('Map ID doesnt exist!');
        //deferred.reject();
        deferred.resolve();
      }
      return deferred.promise;
    }

    function exportImage(data, fileName) {
      return exportData(imagesBackupsDirectory, data, fileName)
    }

    function checkZipsDir() {
      return exportData(zipsDirectory, 'This file is for checking permissions', 'permissionsCheck.txt')
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

    function getImageById(imageId) { //read file from file system
      var deferred = $q.defer(); // init promise

      if ($window.cordova) {
        var devicePath = getDevicePath();
        var filePath = devicePath + imagesDirectory;
        var fileName = imageId + '.jpg';
        $log.log('Looking for file: ', filePath, fileName);
        $cordovaFile.checkFile(filePath + '/', fileName).then(function (checkDirSuccess) {
          //$cordovaFile.readAsText(filePath + '/', fileName).then(function(result){
          $cordovaFile.readAsDataURL(filePath + '/', fileName).then(function (result) {
            deferred.resolve(result);
          });
        }, function (checkDirFailed) {
          $log.log('Check file not found.', checkDirFailed);
          deferred.resolve('img/image-not-found.png');
        });
      }
      else {
        if (!IS_WEB) $log.warn('Not Web but no Cordova so unable to get local image source. Running for development?');
        deferred.resolve('img/image-not-found.png');
      }

      return deferred.promise;
    }

    function getMapCenterTile(mapid) {
      var deferred = $q.defer(); // init promise

      var devicePath = getDevicePath();
      if (devicePath) {
        $window.resolveLocalFileSystemURL(devicePath + tileCacheDirectory + '/' + mapid + '/tiles',
          function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(
              function (entries) {

                //loop over tiles to get center tiles
                var maxZoom = 0;
                var xvals = [];
                var yvals = [];

                for(var i = 0; i < entries.length; i++) {
                  var entry = entries[i];
                  var tileName = entry.name;
                  var tileName = tileName.replace('.png','');
                  var parts = tileName.split('_');
                  var z = Number(parts[0]);
                  var x = Number(parts[1]);
                  var y = Number(parts[2]);

                  if(z > maxZoom){
                    maxZoom = z;
                  }
                }

                if(maxZoom > 14) {
                  maxZoom = 14;
                }

                for(var i = 0; i < entries.length; i++) {
                  var entry = entries[i];
                  var tileName = entry.name;
                  var tileName = tileName.replace('.png','');
                  var parts = tileName.split('_');
                  var z = Number(parts[0]);
                  var x = Number(parts[1]);
                  var y = Number(parts[2]);

                  if(z == maxZoom) {
                    if(xvals.indexOf(x) == -1) {
                      xvals.push(x);
                    }
                    if(yvals.indexOf(y) == -1) {
                      yvals.push(y);
                    }
                  }
                }

                var middleX = Math.floor(getMedian(xvals));
                var middleY = Math.floor(getMedian(yvals));

                var returnTile = maxZoom + '_' + middleX + '_' + middleY;

                deferred.resolve(returnTile);
              },
              function (err) {
                console.log(err);
                if (err.code) deferred.reject(err.code);
                else deferred.reject('Unknown error reading tiles');
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

    function getMapStorageDetails(mapid) {
      var deferred = $q.defer(); // init promise

      var devicePath = getDevicePath();
      if (devicePath) {
        $window.resolveLocalFileSystemURL(devicePath + tileCacheDirectory + '/' + mapid + '/tiles',
          function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(
              function (entries) {
                //console.log(entries);
                deferred.resolve(entries.length);
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

    function getTile(mapid, tileId) {
      var deferred = $q.defer(); // init promise
      var devicePath = getDevicePath();
      $cordovaFile.checkDir(devicePath, tileCacheDirectory).then(function (foundDir) {
        $cordovaFile.checkDir(devicePath, tileCacheDirectory+'/'+mapid).then(function (foundDir) {
          $cordovaFile.checkDir(devicePath, tileCacheDirectory+'/'+mapid+'/tiles').then(function (foundDir) {

            $cordovaFile.checkFile(devicePath + '/' + tileCacheDirectory + '/' + mapid + '/tiles/', tileId).then(function (foundFile) {

              $cordovaFile.readAsArrayBuffer(devicePath + '/' + tileCacheDirectory + '/' + mapid + '/tiles/', tileId).then(function (success) {
                // success
                $log.log('tile '+tileId+'found!');
                var blob = new Blob([success], {type: "image/png"});

                deferred.resolve(blob);
              },function(){
                //Failed
                $log.log('Error getTile : could not read file');
                deferred.resolve(null);
              });
            },function(){
              //Failed
              $log.log('Error getTile : check file failed ' + tileId);
              deferred.resolve(null);
            });
          },function(){
            //Failed
            $log.log('Error getTile : check tiles directory failed');
            deferred.resolve(null);
          });
        },function(){
          //Failed
          $log.log('Error getTile : check mapid: '+mapid+' failed');
          deferred.resolve(null);
        });
      },function(){
        //Failed
        $log.log('Error getTile : check tilecache directory failed.');
        deferred.resolve(null);
      });
      return deferred.promise;
    }

    function getZipDetails(mapid){
      var deferred = $q.defer(); // init promise

      var devicePath = getDevicePath();
      if (devicePath) {
        $cordovaFile.checkDir(devicePath, tileCacheDirectory+'/'+mapid+'/'+tiles).then(function (foundDir) {
            $cordovaFile.checkFile(devicePath + '/' + tileCacheDirectory + '/' + mapid + '/', 'details.json').then(function (foundFile) {
                $cordovaFile.readAsText(devicePath + '/' + tileCacheDirectory + '/' + mapid + '/', 'details.json').then(function (data) {
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

    function getZipsDirectory() {
      return zipsDirectory;
    }

    function getTileCacheDirectory() {
      return tileCacheDirectory;
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

    function saveImageToFileSystem(data, fileName) {
      var devicePath = getDevicePath();
      var imagesPath = devicePath + imagesDirectory;
      return exportDataWithoutCheck(imagesPath, data, fileName);
    }

    function saveZip(data, fileName) {
      return exportData(zipsDirectory, data, fileName);
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

    //$cordovaFile sporadically reports directories as non-existent,
    //so we need an easy function to check directories once.
    function verifyDirectoryOnce(directory) {
      return checkDir(appDirectory).then(function () {
        return checkDir(directory);
      });
    }
  }
}());
