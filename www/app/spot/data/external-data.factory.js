(function() {
	'use strict';

	angular
		.module('app')
		.factory('ExternalDataFactory', ExternalDataFactory);

	ExternalDataFactory.$inject = ['$log', '$q', 'HelpersFactory', 'LocalStorageFactory'];

	function ExternalDataFactory($log, $q, HelpersFactory, LocalStorageFactory) {

		return {
			'destroy': destroy,
			'getDataFileById': getDataFileById,
			'saveDataFile': saveDataFile
		};

		/**
		 * Private Functions
		 */

		/**
		 * Public Functions
		 */
		function getDataFileById(fileId) {
			var deferred = $q.defer(); // init promise
			LocalStorageFactory.getDb().dataFilesDB.getItem(fileId.toString()).then(function (value) {
				$log.log("Get File", value);
				deferred.resolve(value);
			});
			return deferred.promise;
		}

		// removes file from LocalStorageFactory
		function destroy(fileToDelete) {
			var deferred = $q.defer(); // init promise
			LocalStorageFactory.getDb().dataFilesDB.removeItem(fileToDelete.toString()).then(function () {
				$log.log('Removed from dataFilesDB!');
				deferred.resolve();
			}).catch(function (err) {
				$log.log(err);
			});
			return deferred.promise;
		}

		function saveDataFile(saveFile) {
			var deferred = $q.defer(); // init promise
			LocalStorageFactory.getDb().dataFilesDB.setItem(saveFile.fileNameId.toString(), saveFile).then(function () {
				$log.log('File Saved!');
				deferred.resolve();
			}).catch(function (err) {
				$log.log(err);
			});
			return deferred.promise;
		}
	}
}());
