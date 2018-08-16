const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const del = require('del');
const minify = require('gulp-minify');
 
const conf = {
  src: {
    scripts: ['./src/**/*.js'],
  },
  output: {
    dir: `./dist`,
  }
};

gulp.task('clean', function() {
  return del([conf.output.dir]);
});

// Code Tasks
gulp.task('scripts', function() {
  return gulp.src(conf.src.scripts)
    .pipe(minify({
        ext:{
            min:'.min.js'
        }
      }))
    .pipe(gulp.dest(conf.output.dir));
});

gulp.task('build', gulpSequence('clean', 'scripts'))

gulp.task('default', ['build']);