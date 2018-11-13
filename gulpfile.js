var gulp = require('gulp');


gulp.task('sass', function (sass) {
  return gulp.src('./node_modules/node-sass')
			.pipe(sass().on('error', sass.logError))
			.pipe(gulp.dest('./css'));
});
