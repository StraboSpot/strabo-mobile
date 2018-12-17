(function () {
  'use strict';

  angular
    .module('app')
    .factory('LocalStorageFactory', LocalStorageFactory);

  LocalStorageFactory.$inject = ['$cordovaDevice', '$cordovaFile', '$log', '$q', '$window', 'HelpersFactory'];

  function LocalStorageFactory($cordovaDevice, $cordovaFile, $log, $q, $window, HelpersFactory) {
    var dbs = {};
    dbs.configDb = {};        // global LocalForage for configuration and user data
    dbs.mapNamesDb = {};      // global LocalForage for map names
    dbs.mapTilesDb = {};      // global LocalForage for offline map tiles
    dbs.projectDb = {};       // global LocalForage for project data
    dbs.spotsDb = {};         // global LocalForage for spot data
    var appDirectory = 'StraboSpot';
    var appDirectoryTiles = 'StraboSpotTiles';
    var dataBackupsDirectory = appDirectory + '/DataBackups';
    var imagesBackupsDirectory = appDirectory + '/ImageBackups';
    var imagesDirectory = appDirectory + '/Images';
    var zipsDirectory = appDirectoryTiles + '/TileZips';
    var tileCacheDirectory = appDirectoryTiles + '/TileCache';

    return {
      'checkDir': checkDir,
      'checkImagesDir': checkImagesDir,
      'checkZipsDir': checkZipsDir,
      'clearFiles': clearFiles,
      'copyImage': copyImage,
      'deleteImageFromFileSystem': deleteImageFromFileSystem,
      'deleteMapFiles': deleteMapFiles,
      'exportProject': exportProject,
      'gatherLocalFiles': gatherLocalFiles,
      'getDb': getDb,
      'getDevicePath': getDevicePath,
      'getImageById': getImageById,
      'getImageFileURIById': getImageFileURIById,
      'getTileCacheDirectory': getTileCacheDirectory,
      'getZipsDirectory': getZipsDirectory,
      'getMapCenterTile': getMapCenterTile,
      'getMapStorageDetails': getMapStorageDetails,
      'getTile': getTile,
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

    // Copy any images in previously used ImageBackups folder to Images folder
    function copyImageBackups() {
      var devicePath = getDevicePath();
      if (devicePath) {
        return new Promise(function (resolve, reject) {
          $cordovaFile.checkDir(devicePath, imagesBackupsDirectory).then(function (checkDirSuccess) {
              $log.log('Found image backups folder', checkDirSuccess);
              listDir(devicePath + imagesBackupsDirectory).then(function (fileEntries) {
                var promises = [];
                _.each(fileEntries, function (fileEntry) {
                  var promise = $cordovaFile.moveFile(devicePath + imagesBackupsDirectory, fileEntry.name,
                    devicePath + imagesDirectory, fileEntry.name)
                    .then(function (moveFileSuccess) {
                      $log.log('Moved file:', moveFileSuccess);
                    }, function (moveFileError) {
                      $log.log('Error moving file:', moveFileError);
                    });
                  promises.push(promise);
                });
                Promise.all(promises).then(function () {
                  $log.log('Finished moving all files from Image Backups.');
                  $cordovaFile.removeRecursively(devicePath, imagesBackupsDirectory).then(function () {
                    $log.log('Success removing', devicePath + imagesBackupsDirectory);
                    resolve();
                  }, function (removeRecursivelyError) {
                    $log.log('Error removing', devicePath + imagesBackupsDirectory, removeRecursivelyError);
                    reject('Error getting the directory entry for ' + devicePath + imagesBackupsDirectory);
                  });
                });
              }, function (listDirError) {
                $log.log('Error getting list of files in directory', listDirError);
                reject('Error getting list of files in directory');
              });
            },
            function (checkDirError) {
              $log.log('Image backups folder not found. No leftover image backups to copy.', checkDirError);
              resolve();
            });
        });
      }
      else Promise.resolve();
    }

    function exportData(directory, data, fileName) {
      var rootDir = directory.split("/")[0];
      return checkDir(rootDir).then(function () {
        return checkDir(directory).then(function (fullPath) {
          $log.log('fullPath', fullPath);
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
        if (dbName !== 'configDb' && dbName !== 'mapNamesDb' && dbName !== 'mapTilesDb') {
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
      } catch (err) {
        $log.error('Error getting device path', err);
      }
      return devicePath;
    }

    function getDevicePathTemp() {
      var devicePath;
      try {
        switch ($cordovaDevice.getPlatform()) {
          case 'Android':
            devicePath = cordova.file.externalCacheDirectory;    // 'file:///storage/emulated/0/Android/data/gov.az.azgs.strabomobile/cache/'
            break;
          case 'iOS':
            devicePath = cordova.file.tempDirectory;
            break;
        }
      } catch (err) {
        $log.error('Error getting temporary device path', err);
      }
      return devicePath;
    }

    function getMedian(arr) {
      arr = arr.slice(0); // create copy
      var middle = (arr.length + 1) / 2,
        sorted = arr.sort(function (a, b) {
          return a - b;
        });
      return (sorted.length % 2) ? sorted[middle - 1] : (sorted[middle - 1.5] + sorted[middle - 0.5]) / 2;
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

    // List the files in a directory
    function listDir(path) {
      return new Promise(function (resolve, reject) {
        $window.resolveLocalFileSystemURL(path,
          function (fileSystem) {
            var reader = fileSystem.createReader();
            reader.readEntries(
              function (entries) {
                $log.log('Success reading entries in directory', path, entries);
                resolve(entries);
              },
              function (err) {
                $log.log('Error listing directory', path, err);
                reject('Error listing directory ' + path);
              }
            );
          }, function (err) {
            $log.log('Error resolving', path, err);
            reject('Error resolving ' + path);
          }
        );
      });
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
        }, function (failure) {
          $log.log('delete folder: ' + tileCacheDirectory + ' failed');
          $log.log('failure: ', failure);
          //deferred.reject();
          deferred.resolve();
        });
      }, function (failure) {
        $log.log('delete folder: ' + zipsDirectory + ' failed');
        $log.log('failure: ', failure);
        //deferred.reject();
        deferred.resolve();
      });

      return deferred.promise;
    }

    // Copy an image from temporary directory to permanent device storage in StraboSpot/Images
    function copyImage(imagePathTemp, imageName) {
      return new Promise(function (resolve, reject) {
        // Grab the file name of the photo in the temporary directory
        var tempImageName = imagePathTemp.replace(/^.*[\\\/]/, '');

        // Get temporary and permanent paths
        var devicePathTemp = getDevicePathTemp();
        var imagesPath = getDevicePath() + imagesDirectory;

        // Copy the file to permanent storage
        $cordovaFile.copyFile(devicePathTemp, tempImageName, imagesPath, imageName)
          .then(function (success) {
            $log.log('Successfully copied file to permanent storage. NativeURL:', success.nativeURL);
            resolve(success.nativeURL);
          })
          .catch(function (error) {
            $log.error('Failed copying file to permanent storage! Error Code: ' + error.code);
            reject('Error saving image to device.');
          });
      });
    }

    function deleteImageFromFileSystem(imageId) {
      return new Promise(function (resolve, reject) {
        var devicePath = getDevicePath();
        $cordovaFile.removeFile(devicePath + imagesDirectory, imageId + '.jpg').then(function (success) {
          $log.log('Deleted image', imageId, 'from', imagesDirectory);
          resolve();
        }, function (error) {
          $log.log('Error deleting image', imageId, error);
          reject();
        });
      });
    }

    function deleteMapFiles(map) {
      var deferred = $q.defer(); // init promise
      var mapid = String(map.mapid);
      if (mapid != '') {
        var devicePath = getDevicePath();
        $log.log('deleteMapFiles mapid: ' + mapid);
        $cordovaFile.removeFile(devicePath + zipsDirectory, mapid + '.zip').then(function (success) {
          $cordovaFile.removeRecursively(devicePath + tileCacheDirectory, mapid).then(function (success) {
            deferred.resolve("Success!");
          }, function (failure) {
            $log.log('delete folder: ' + tileCacheDirectory + ' ' + mapid + ' failed');
            $log.log('failure: ', failure);
            //deferred.reject();
            deferred.resolve();
          });
        }, function (failure) {
          $log.log('delete file: ' + zipsDirectory + ' ' + mapid + '.zip failed');
          $log.log('failure: ', failure);
          //deferred.reject();
          deferred.resolve();
        });
      }
      else {
        $log.log('Map ID doesnt exist!');
        //deferred.reject();
        deferred.resolve();
      }
      return deferred.promise;
    }

    function checkZipsDir() {
      return exportData(zipsDirectory, 'This file is for checking permissions', 'permissionsCheck.txt')
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

    // Get image URI
    function getImageById(imageId) {
      var devicePath = getDevicePath();
      var filePath = devicePath + imagesDirectory;
      var fileName = imageId.toString() + '.jpg';
      var fileURI = filePath + '/' + fileName;
      $log.log('Looking for file:', fileURI);
      return $cordovaFile.checkFile(filePath + '/', fileName).then(function () {
        $log.log('Found image file:', fileURI);
        if ($cordovaDevice.getPlatform() === 'iOS') fileURI = $window.Ionic.WebView.convertFileSrc(fileURI);
        return Promise.resolve(fileURI);
      }, function (err) {
        $log.log('Check file not found.', fileURI);
        return Promise.resolve('img/image-not-found.png');
      });
    }

    // Get image URI
    function getImageFileURIById(imageId) {
      var devicePath = getDevicePath();
      var filePath = devicePath + imagesDirectory;
      var fileName = imageId.toString() + '.jpg';
      var fileURI = filePath + '/' + fileName;
      $log.log('Looking for file:', fileURI);
      return $cordovaFile.checkFile(filePath + '/', fileName).then(function () {
        $log.log('Found image file:', fileURI);
        return Promise.resolve(fileURI);
      }, function (err) {
        $log.log('Check file not found.', fileURI);
        return Promise.resolve('img/image-not-found.png');
      });
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

                for (var i = 0; i < entries.length; i++) {
                  var entry = entries[i];
                  var tileName = entry.name;
                  var tileName = tileName.replace('.png', '');
                  var parts = tileName.split('_');
                  var z = Number(parts[0]);
                  var x = Number(parts[1]);
                  var y = Number(parts[2]);

                  if (z > maxZoom) {
                    maxZoom = z;
                  }
                }

                if (maxZoom > 14) {
                  maxZoom = 14;
                }

                for (var i = 0; i < entries.length; i++) {
                  var entry = entries[i];
                  var tileName = entry.name;
                  var tileName = tileName.replace('.png', '');
                  var parts = tileName.split('_');
                  var z = Number(parts[0]);
                  var x = Number(parts[1]);
                  var y = Number(parts[2]);

                  if (z == maxZoom) {
                    if (xvals.indexOf(x) == -1) {
                      xvals.push(x);
                    }
                    if (yvals.indexOf(y) == -1) {
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
        $cordovaFile.checkDir(devicePath, tileCacheDirectory + '/' + mapid).then(function (foundDir) {
          $cordovaFile.checkDir(devicePath, tileCacheDirectory + '/' + mapid + '/tiles').then(function (foundDir) {

            $cordovaFile.checkFile(devicePath + '/' + tileCacheDirectory + '/' + mapid + '/tiles/', tileId).then(
              function (foundFile) {

                $cordovaFile.readAsArrayBuffer(devicePath + '/' + tileCacheDirectory + '/' + mapid + '/tiles/',
                  tileId).then(function (success) {
                  // success
                  $log.log('tile ' + tileId + 'found!');
                  var blob = new Blob([success], {type: "image/png"});

                  deferred.resolve(blob);
                }, function () {
                  //Failed
                  $log.log('Error getTile : could not read file');
                  deferred.resolve(null);
                });
              }, function () {
                //Failed
                $log.log('Error getTile : check file failed ' + tileId);
                deferred.resolve(null);
              });
          }, function () {
            //Failed
            $log.log('Error getTile : check tiles directory failed');
            deferred.resolve(null);
          });
        }, function () {
          //Failed
          $log.log('Error getTile : check mapid: ' + mapid + ' failed');
          deferred.resolve(null);
        });
      }, function () {
        //Failed
        $log.log('Error getTile : check tilecache directory failed.');
        deferred.resolve(null);
      });
      return deferred.promise;
    }

    function getZipDetails(mapid) {
      var deferred = $q.defer(); // init promise

      var devicePath = getDevicePath();
      if (devicePath) {
        $cordovaFile.checkDir(devicePath, tileCacheDirectory + '/' + mapid + '/' + tiles).then(function (foundDir) {
            $cordovaFile.checkFile(devicePath + '/' + tileCacheDirectory + '/' + mapid + '/', 'details.json').then(
              function (foundFile) {
                $cordovaFile.readAsText(devicePath + '/' + tileCacheDirectory + '/' + mapid + '/', 'details.json').then(
                  function (data) {
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

    function importProject(name) {
      return copyImageBackups().then(function () {
        return importData(dataBackupsDirectory, name).then(function (importedData) {
          return replaceDbs(importedData);
        });
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
        } catch (e) {
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
      var rootDir = directory.split("/")[0];
      return checkDir(rootDir).then(function () {
        return checkDir(directory);
      });
    }
  }
}());
