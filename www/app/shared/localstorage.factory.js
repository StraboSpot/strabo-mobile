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
    var appDirectoryForCSVs = 'StraboSpotCSV';
    var appDirectoryForDistributedBackups = 'StraboSpotProjects';
    var dataBackupsDirectory = appDirectory + '/DataBackups';
    var imagesBackupsDirectory = appDirectory + '/ImageBackups';
    var imagesDirectory = appDirectory + '/Images';
    var zipsDirectory = appDirectoryTiles + '/TileZips';
    var tileCacheDirectory = appDirectoryTiles + '/TileCache';

    return {
      'checkDir': checkDir,
      'checkFilePermissions': checkFilePermissions,
      'checkImagesDir': checkImagesDir,
      'checkZipsDir': checkZipsDir,
      'clearFiles': clearFiles,
      'copyImage': copyImage,
      'deleteImageFromFileSystem': deleteImageFromFileSystem,
      'deleteMapFiles': deleteMapFiles,
      'exportProject': exportProject,
      'exportProjectForAVO': exportProjectForAVO,
      'exportProjectForDistribution': exportProjectForDistribution,
      'gatherLocalFiles': gatherLocalFiles,
      'gatherLocalDistributionFiles': gatherLocalDistributionFiles,
      'getDb': getDb,
      'getDeviceName': getDeviceName,
      'getDevicePath': getDevicePath,
      'getImageById': getImageById,
      'getImageFileURIById': getImageFileURIById,
      'getImagesDirectory': getImagesDirectory,
      'getTileCacheDirectory': getTileCacheDirectory,
      'getZipsDirectory': getZipsDirectory,
      'getMapCenterTile': getMapCenterTile,
      'getMapStorageDetails': getMapStorageDetails,
      'getTile': getTile,
      'importProject': importProject,
      'importProjectForDistribution': importProjectForDistribution,
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

    function getDeviceName() {
      var deviceName;
      try {
        deviceName = $cordovaDevice.getPlatform();
      } catch (err) {
        $log.error('Error getting device path', err);
      }
      return deviceName;
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
        //if (dbName !== 'configDb' && dbName !== 'mapNamesDb' && dbName !== 'mapTilesDb') {
        // let's include mapNamesDb because they are now being exported.
        if (dbName !== 'configDb' && dbName !== 'mapTilesDb') {
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

    // Write dummy file to make sure we have file permissions
    function checkFilePermissions() {
      if ($window.cordova) {
        return exportData(appDirectory, 'This file is for checking permissions', 'permissionsCheck.txt');
      }
      else return Promise.resolve();
    }

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
        checkImagesDir().then(function () {
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
      return exportData(zipsDirectory, 'This file is for checking permissions', 'permissionsCheck.txt');
    }

    function exportProject(name) {
      return gatherData().then(function (dataToExport) {
        return exportData(dataBackupsDirectory, angular.toJson(dataToExport), name + '.json', 'DataBackups');
      });
    }


    function gatherDataForDistribution() {
      var save = {};
      var deferred = $q.defer(); // init promise
      var promises = [];
      _.each(dbs, function (db) {
        $log.log("db here:",db);
        var dbName = db.config().name;
        //if (dbName !== 'configDb' && dbName !== 'mapTilesDb') {
        if (dbName !== 'configDb') {
          save[dbName] = {};
          var promise = db.iterate(function (value, key, i) {
            save[dbName][key] = value;
          }).then(function () {
            $log.log(save);
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


    //db.setItem(key, value).then(function (val) {

    function gatherOtherMapsForDistribution() { //collect othermaps data from configdb separately because we don't want to import all of configdb
      var save = {};
      var deferred = $q.defer(); // init promise
      var promises = [];
      _.each(dbs, function (db) {
        //$log.log("db here:",db);
        var dbName = db.config().name;
        //if (dbName !== 'configDb' && dbName !== 'mapTilesDb') {
        if (dbName == 'configDb') {
          save[dbName] = {};
          var promise = db.iterate(function (value, key, i) {
            save[dbName][key] = value;
          }).then(function () {
            $log.log(save);
          });
          promises.push(promise);
        }

      });
      $q.all(promises).then(function () {
        $log.log("CONFIG DB: ", save);
        if(save.configDb){
          if(save.configDb.other_maps){
            exportData(appDirectoryForDistributedBackups + '/data', angular.toJson(save.configDb.other_maps), 'other_maps.json').then(function (){
              $log.log('OTHER MAPS EXPORTED SUCCESSFULLY!');
              deferred.resolve();
            }, function(){
              $log.log('Couldnt export other maps data');
            });
          }else{
            $log.log('No save.configDB');
            deferred.resolve();
          }
        }else{
          $log.log('No save.configDB');
          deferred.resolve();
        }

      });
      return deferred.promise;
    }

    function checkDistributeDataDir() {
      //this function checks for a 'data' directory inside the distributed backups folder and deletes and recreates as necessarily
      //this ensures that there is an empty 'data' folder in the directory
      var deferred = $q.defer(); // init promise
      var devicePath = getDevicePath();
      if (devicePath) {
        $cordovaFile.checkDir(devicePath, appDirectoryForDistributedBackups + '/data').then(function (checkDirSuccess) {
          //exists. delete then add
          $log.log('data folder exists')
          $cordovaFile.removeRecursively(devicePath, appDirectoryForDistributedBackups + '/data').then(function () {
            $log.log('Success removing', devicePath + appDirectoryForDistributedBackups + '/data');
            $cordovaFile.createDir(devicePath, appDirectoryForDistributedBackups + '/data', false).then(function (createDirSuccess) {
                $log.log('Directory', appDirectoryForDistributedBackups + '/data', 'created.', createDirSuccess);
                deferred.resolve(devicePath + createDirSuccess.fullPath);
              },
              function (createDirError) {
                $log.error('Unable to create directory', dir, createDirError);
                deferred.reject(createDirError);
              });
          }, function (removeRecursivelyError) {
            $log.log('Error removing', devicePath + appDirectoryForDistributedBackups + '/data', removeRecursivelyError);
            deferred.reject('Error removing folder ' + devicePath + appDirectoryForDistributedBackups + '/data');
          });
        }, function (){
          //doesn't exist, just create
          $log.log('data folder doesnt exist')
          $cordovaFile.createDir(devicePath, appDirectoryForDistributedBackups + '/data', false).then(function (createDirSuccess) {
              $log.log('Directory', appDirectoryForDistributedBackups + '/data', 'created.', createDirSuccess);
              deferred.resolve(devicePath + createDirSuccess.fullPath);
            },
            function (createDirError) {
              $log.error('Unable to create directory', dir, createDirError);
              deferred.reject(createDirError);
            });
        });
      }else{
        deferred.reject('Device not found');
      }
      return deferred.promise;
    }



    //move image from images directory to distribution folder
    function moveDistributedImage(image_id) {
      var deferred = $q.defer(); // init promise
      var devicePath = getDevicePath();

      $cordovaFile.checkFile(devicePath + imagesDirectory + '/' , image_id + '.jpg').then(function (foundFile) {
        $log.log('found image');
        $cordovaFile.copyFile(devicePath + imagesDirectory, image_id + '.jpg', devicePath + appDirectoryForDistributedBackups + '/data/images', image_id + '.jpg').then(function (foundFile) {
          deferred.resolve();
        }, function(copyError){
          $log.log(copyError);
          deferred.resolve();
        })
      }, function(checkfileError){
        $log.log(checkfileError);
        deferred.resolve(); //still resolve, just didn't find image.
      });


      return deferred.promise;
    }

    // Copy any images in spotsDB to distribution directory
    function gatherImagesForDistribution(data) {
      $log.log('data: ',data);
      return new Promise(function (resolve, reject) {
        var promises = [];
        if(data.spotsDb){
          $log.log('spots exist.');
          _.each(data.spotsDb, function(spot){
            if(spot.properties.images){
              _.each(spot.properties.images, function(image){
                var promise = moveDistributedImage(image.id).then(function (moveFileSuccess) {
                    $log.log('Moved file:', moveFileSuccess);
                  }, function (moveFileError) {
                    $log.log('Error moving file:', moveFileError);
                  });
                promises.push(promise);
              })
            }
          });
          Promise.all(promises).then(function () {
            $log.log('Finished moving all images to distribution folder.');
            resolve();
          });
        }else{
          $log.log('Spots dont exist');
          resolve();
        }
      });
    }






    //move image from images directory to distribution folder
    function moveDistributedMap(map_id) {
      var deferred = $q.defer(); // init promise
      var devicePath = getDevicePath();

      $cordovaFile.checkFile(devicePath,  zipsDirectory + '/' + map_id + '.zip').then(function (foundFile) {
        $log.log('found map ' + map_id);

        $cordovaFile.copyFile(devicePath + zipsDirectory, map_id.toString() + '.zip', devicePath + appDirectoryForDistributedBackups + '/data/maps', map_id.toString() + '.zip').then(function (foundFile) {
          $log.log('copied map file ok');
          deferred.resolve(map_id);
        }, function(copyError){
          $log.log('error copying map file: ', copyError);
          deferred.resolve(map_id);
        });
      }, function(checkfileError){
        $log.log('couldnt find map ' + devicePath + '/' + zipsDirectory, map_id + '.zip');
        $log.log(checkfileError);
        deferred.resolve(); //still resolve, just didn't find image.
      });


      return deferred.promise;
    }

    // Copy any maps in mapNamesDb to distribution directory
    function gatherMapsForDistribution(data) {
      $log.log('data: ',data);
      return new Promise(function (resolve, reject) {
        var promises = [];
        if(data.mapNamesDb){
          $log.log('maps exist.');
          _.each(data.mapNamesDb, function(map){
            var promise = moveDistributedMap(map.mapid).then(function (moveFileSuccess) {
                $log.log('Moved map:', moveFileSuccess);
              }, function (moveFileError) {
                $log.log('Error moving map:', moveFileError);
              });
            promises.push(promise);
          });
          Promise.all(promises).then(function () {
            $log.log('Finished moving all maps to distribution folder.');
            resolve();
          });
        }else{
          $log.log('Maps dont exist');
          resolve();
        }
      });
    }


    function exportProjectForDistribution(name) {
      var deferred = $q.defer(); // init promise
      var devicePath = getDevicePath();
      $log.log('name passed in: ', name);

      //first, check for root folder
      checkDir(appDirectoryForDistributedBackups).then(function (successResponse) {
        //now delete folder if exists already
        checkDistributeDataDir().then(function (){
          //OK, empty data directory has been created... now move data/images/tiles in for ZIPping.
          gatherDataForDistribution().then(function (dataToExport) {
            exportData(appDirectoryForDistributedBackups + '/data', angular.toJson(dataToExport), 'data.json').then(function (){
              gatherOtherMapsForDistribution().then(function () {
                //create images directory
                checkDir(appDirectoryForDistributedBackups + '/data/images').then(function (successResponse) {
                  //now copy images (if any)
                  gatherImagesForDistribution(dataToExport).then(function (imagesSuccess){
                    $log.log('gathered images ok');
                    //now create maps Directory
                    checkDir(appDirectoryForDistributedBackups + '/data/maps').then(function (successResponse) {
                      $log.log('created maps directory.')
                      //Now copy maps (if any)
                      gatherMapsForDistribution(dataToExport).then(function (mapsSuccess){
                        //OK, we have everything we need now. Just move the folder to its new name
                        $cordovaFile.moveDir(devicePath, appDirectoryForDistributedBackups + '/data', devicePath, appDirectoryForDistributedBackups + '/' + name).then(function(){
                          deferred.resolve(name);
                        }, function(moveError){
                          $log.log('Error moving folder: ', moveError);
                          deferred.reject(moveError);
                        });
                      }, function(mapsError){
                        $log.log('Error gathering maps. ', mapsError);
                        deferred.reject('Error gathering maps. ', mapsError);
                      })
                    }, function (errorResponse){
                      $log.log('Error creating maps directory. ', errorResponse);
                      deferred.reject('Error creating maps directory. ', errorResponse);
                    });
                  }, function(imagesError){
                    $log.log('Error gathering images. ', imagesError);
                    deferred.reject('Error gathering images. ', imagesError);
                  })
                }, function (errorResponse){
                  $log.log('Error creating images directory. ', errorResponse);
                  deferred.reject('Error creating images directory. ', errorResponse);
                });
              }, function (errorResponse){
                $log.log('Error getting other maps. ', errorResponse);
                deferred.reject('Error getting other maps. ', errorResponse);
              });
            },function(exportError){
              $log.log('Error exporting data. ', exportError);
              deferred.reject('Error exporting data. ', exportError);
            })
          }, function(gatherError){
            $log.log('Error gathering data. ', gatherError);
            deferred.reject('Error gathering data. ', gatherError);
          });
        },function (checkDirError){
          $log.log('Error deleting/creating data dir in StraboSpotProjects. ', checkDirError);
          deferred.reject('Error deleting/creating data dir in StraboSpotProjects. ', checkDirError);
        })
      },function (errorResponse){
        $log.log("Error Creating StraboSpotProjects folder: ", errorResponse);
        deferred.reject("Error Creating StraboSpotProjects folder: ", errorResponse);
      });

      return deferred.promise;
    }

    function stripString(inString){
      if(inString){
        return inString.replace("'","").replace('"',"").replace(",","");
      }else{
        return "";
      }
    }

    function createCSVFromRawData(rawData){ //this function takes raw data and returns a CSV for the AVO group
      var deferred = $q.defer(); // init promise
      var promises = [];
      var outCSV = '';

      $log.log("rawData:", rawData);

      var tags = rawData.projectDb.tags;

      var projectId = stripString(rawData.projectDb.description.project_name);

      //$log.log("projectId", projectId);

      $log.log("tags:", tags);


      _.each(rawData.spotsDb, function(spot){
        if(spot.geometry){
          if(spot.geometry.type=="Point"){
            //get station id
            var stationId = stripString(spot.properties.name);

            var spotDate = stripString(spot.properties.date);
            var locationDesc = stripString(spot.properties.notes);
            var stationComment = locationDesc;

            //get latitude/Longitude
            if(spot.properties.image_basemap){
              var longdd = spot.properties.lng;
              var latdd = spot.properties.lat;
            }else{
              var longdd = spot.geometry.coordinates[0];
              var latdd = spot.geometry.coordinates[1];
            }

            var datum = "wgs84";

            var volcanoName = '';
            if(tags){
              _.each(tags, function(tag){
                _.each(tag.spots, function(tagspot){
                  if(tagspot == spot.properties.id){
                    if(tag.other_type.toLowerCase().substring(0,7)=="volcano"){
                      volcanoName = stripString(tag.name);
                    }
                  }
                });
              });
            }

            if(spot.properties.samples){
              _.each(spot.properties.samples, function(sample){
                var row = "";
                var sampleId = stripString(sample.sample_id_name);
                var SampType1 = stripString(sample.sample_type);
                var SampType2 = stripString(sample.main_sampling_purpose);
                var SampleDesc = stripString(sample.sample_notes);
                var SampComment = stripString(sample.sample_description);

                var sampUnit = stripString(sample.sample_unit);
                var color = stripString(sample.color);
                var lith = stripString(sample.lithology);



                //make row here
                //row += ",\"" +  + "\""
                row += "\"" + "\""                              //at_num
                row += ",\"" + stationId + "\"";                //stationId
                row += ",\"" + sampleId + "\"";                 //sampleId
                row += ",\"" + "\"";                            //Geologist
                row += ",\"" + projectId + "\"";                //ProjectID
                row += ",\"" + spotDate + "\"";                 //Date
                row += ",\"" + locationDesc + "\"";             //LocationDesc
                row += ",\"" + latdd + "\"";                    //Latdd
                row += ",\"" + longdd + "\"";                   //Longdd
                row += ",\"" + "\"";                            //UTM_E
                row += ",\"" + "\"";                            //UTM_N
                row += ",\"" + "\"";                            //UTM_ZONE
                row += ",\"" + datum + "\"";                    //Datum
                row += ",\"" + "\"";                            //StnUnit
                row += ",\"" + volcanoName + "\"";              //volcano
                row += ",\"" + stationComment + "\"";           //StationComment
                row += ",\"" + "\"";                            //possible_source_volcanoes
                row += ",\"" + SampType1 + "\"";                //SampType1
                row += ",\"" + "\"";                            //SampType2
                row += ",\"" + SampleDesc + "\"";               //SampleDesc
                row += ",\"" + color + "\"";                    //Color
                row += ",\"" + lith + "\"";                     //Lith
                row += ",\"" + sampUnit + "\"";                 //SampUnit
                row += ",\"" + SampComment + "\"";              //SampComment
                row += ",\"" + "\"\n";                          //EruptionID

                outCSV += row;
              });
            }

          }
        }
      })

      if(outCSV != ""){
        var row = "";
        row += "\"at_num\"";
        row += ",\"StationID\"";
        row += ",\"SampleID\"";
        row += ",\"Geologist\"";
        row += ",\"ProjectID\"";
        row += ",\"Date\"";
        row += ",\"LocationDesc\"";
        row += ",\"Latdd\"";
        row += ",\"Longdd\"";
        row += ",\"UTM_E\"";
        row += ",\"UTM_N\"";
        row += ",\"UTM_ZONE\"";
        row += ",\"Datum\"";
        row += ",\"StnUnit\"";
        row += ",\"volcano\"";
        row += ",\"StationComment\"";
        row += ",\"possible_source_volcanoes\"";
        row += ",\"SampType1\"";
        row += ",\"SampType2\"";
        row += ",\"SampleDesc\"";
        row += ",\"Color\"";
        row += ",\"Lith\"";
        row += ",\"SampUnit\"";
        row += ",\"SampComment\"";
        row += ",\"EruptionID\"\n";

        outCSV = row + outCSV;
        deferred.resolve(outCSV);
      }else{
        deferred.reject("No Sample Data Found in Project.");
      }

      return deferred.promise;
    }

    function gatherDataForAVO() {
      var save = {};
      var deferred = $q.defer(); // init promise
      var promises = [];
      _.each(dbs, function (db) {
        //$log.log("db here:",db);
        var dbName = db.config().name;
        //if (dbName !== 'configDb' && dbName !== 'mapTilesDb') {
        if (dbName !== 'configDb' && dbName !== 'mapTilesDb' && dbName !== 'mapNamesDb') {
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
        //create CSV file here
        //$log.log("All Data Here: ", save);
        createCSVFromRawData(save).then(function(csvData){
          deferred.resolve(csvData);
        },function(csvError){
          $log.log("CSVError: ", csvError);
          deferred.reject(csvError);
        })
      });
      return deferred.promise;
    }

    function exportProjectForAVO(name) {
      var deferred = $q.defer(); // init promise
      var devicePath = getDevicePath();
      $log.log('name passed in: ', name);

      //first, check for root folder
      checkDir(appDirectoryForCSVs).then(function (successResponse) {
        gatherDataForAVO().then(function (csvData) {
          exportData(appDirectoryForCSVs, csvData, name + '.csv').then(function (){
            //also copy to clipboard here.
            if(getDeviceName() == 'iOS'){
              HelpersFactory.copyToClipboard(csvData).then(function(){
                deferred.resolve(name);
              }, function(copyError){
                $log.log("Error Copying to Clipboard", copyError);
                deferred.resolve(name);
              });
            }else{
              $log.log("CSV Data:", csvData);
              deferred.resolve(name);
            }
          }, function(exportError){
            deferred.reject(exportError);
          });
        }, function(gatherError){
          $log.log('Error gathering data for CSV. ', gatherError);
          deferred.reject(gatherError);
        });
      },function (errorResponse){
        $log.log("Error Creating StraboSpotCSV folder: ", errorResponse);
        deferred.reject("Error Creating StraboSpotCSV folder: ", errorResponse);
      });

      return deferred.promise;
    }

    function gatherLocalDistributionFiles() {
      var deferred = $q.defer(); // init promise

      var devicePath = getDevicePath();
      if (devicePath) {
        $window.resolveLocalFileSystemURL(devicePath + appDirectoryForDistributedBackups,
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
        fileURI = $window.Ionic.WebView.convertFileSrc(fileURI);
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

    function getImagesDirectory() {
      return imagesDirectory;
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

    function importOtherMaps(name) {
      var deferred = $q.defer(); // init promise
      var devicePath = getDevicePath();

      $log.log("Import othermaps for name: ", name);


      $cordovaFile.readAsText(devicePath + appDirectoryForDistributedBackups + '/' + name, 'other_maps.json').then(function (otherMapsText) {
        $log.log("read other maps: ", otherMapsText);

        var inOtherMaps = angular.fromJson(otherMapsText);

        dbs.configDb.setItem('other_maps', inOtherMaps).then(function () {
          dbs.projectDb.setItem('other_maps', inOtherMaps).then(function () {
            deferred.resolve(otherMapsText);
          });
        });
      }, function(fileError){
        $log.log("COULDNT OPEN OTHER MAPS FILE", fileError)
        deferred.resolve();
      });


      return deferred.promise;
    }

    function importProjectForDistribution(name) {
      // add unzip map tiles here
      return unzipMapsForDistribution(name).then(function () {
        return copyImagesForDistribution(name).then(function () {
          return importData(appDirectoryForDistributedBackups + '/' + name, 'data.json').then(function (importedData) { //use this same function to import data.json
            return replaceDbs(importedData).then(function (){
              return importOtherMaps(name);
            });
          });
        });
      });
    }

    function copyImagesForDistribution(name) {
      var devicePath = getDevicePath();
      if (devicePath) {
        return new Promise(function (resolve, reject) {
          $cordovaFile.checkDir(devicePath, appDirectoryForDistributedBackups + '/' + name + '/images').then(function (checkDirSuccess) {
              $log.log('Found image backups folder', checkDirSuccess);
              listDir(devicePath + appDirectoryForDistributedBackups + '/' + name + '/images').then(function (fileEntries) {
                checkDir(imagesDirectory).then(function(){
                  var promises = [];
                  _.each(fileEntries, function (fileEntry) {
                    var promise = $cordovaFile.copyFile(devicePath + appDirectoryForDistributedBackups + '/' + name + '/images', fileEntry.name,
                      devicePath + imagesDirectory, fileEntry.name)
                      .then(function (copyFileSuccess) {
                        $log.log('Copied file:', copyFileSuccess);
                      }, function (copyFileError) {
                        $log.log('Error copying file:', copyFileError);
                      });
                    promises.push(promise);
                  });
                  Promise.all(promises).then(function () {
                    $log.log('Finished copying all files from backup.');
                    resolve();
                  });
                }, function(){
                  $log.log("Error checking images dir");
                  resolve();
                });
              }, function (listDirError) {
                $log.log('Error getting list of files in directory', listDirError);
                reject('Error getting list of files in directory');
              });
            },
            function (checkDirError) {
              $log.log('Image backups folder not found. No images to copy.', checkDirError);
              resolve();
            });
        });
      }
      else Promise.resolve();
    }

    function unzipMap(name, mapid) {
      var devicePath = getDevicePath();
      var deferred = $q.defer(); // init promise

      $log.log("mapid: ",mapid);

      zip.unzip(devicePath + '/' + appDirectoryForDistributedBackups + '/' + name + '/maps/' + mapid, devicePath + '/' + tileCacheDirectory + '/',
        function (returnvar) {
          deferred.resolve(mapid);
        });

      return deferred.promise;
    }

    function unzipMapsForDistribution(name) {
      var devicePath = getDevicePath();
      if (devicePath) {
        return new Promise(function (resolve, reject) {
          $cordovaFile.checkDir(devicePath, appDirectoryForDistributedBackups + '/' + name + '/maps').then(function (checkDirSuccess) {
              $log.log('Found map zips folder', checkDirSuccess);
              listDir(devicePath + appDirectoryForDistributedBackups + '/' + name + '/maps').then(function (fileEntries) {
                var promises = [];
                _.each(fileEntries, function (fileEntry) {
                  var promise = unzipMap(name, fileEntry.name).then(function (unzipFileSuccess) {
                      $log.log('Unzipped file:', unzipFileSuccess);
                    }, function (unzipFileError) {
                      $log.log('Error unzipping file:', unzipFileError);
                    });
                  promises.push(promise);
                });
                Promise.all(promises).then(function () {
                  $log.log('Finished unzipping all maps from backup.');
                  resolve();
                });
              }, function (listDirError) {
                $log.log('Error getting list of files in directory', listDirError);
                reject('Error getting list of files in directory');
              });
            },
            function (checkDirError) {
              $log.log('Image backups folder not found. No images to copy.', checkDirError);
              resolve();
            });
        });
      }
      else Promise.resolve();
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
            localforage.setDriver([
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
            deferred.resolve();
          }).catch(function (err) {
            $log.log(err);
            deferred.reject();
          });
        } catch (e) {
          $log.log(e);
          deferred.reject();
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
