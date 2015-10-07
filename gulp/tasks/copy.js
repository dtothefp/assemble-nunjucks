export default function(gulp, plugins, config) {
  const {sources, utils, environment} = config;
  const {buildDir, srcDir} = sources;
  const {rename} = plugins;
  const {isDev} = environment;
  const {addbase} = utils;

  const src = [
    addbase(srcDir, 'img/favicon.ico')
  ];

  if (isDev) {
    src.push(addbase(srcDir, 'templates/img/**/*'));
  }

  return () => {
    return gulp.src(src, {base: srcDir})
      .pipe(rename((fp) => {
        const {basename} = fp;

        if (basename === 'favicon') {
          fp.dirname = '';
        } else {
          fp.dirname = 'img';
        }
      }))
      .pipe(gulp.dest(buildDir));
  };
}

