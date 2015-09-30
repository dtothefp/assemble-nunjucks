import makeEslintConfig from 'open-eslint-config';
import formatter from 'eslint-friendly-formatter';

export default function(gulp, plugins, config) {
  const {eslint} = plugins;
  const {sources, utils, environment} = config;
  const {isDev} = environment;
  const {testDir, taskDir} = sources;
  const {addbase, getTaskName} = utils;
  let src;

  return () => {
    const lintEnv = getTaskName(gulp.currentTask);

    if (lintEnv === 'test') {
      src = [addbase(testDir, '**/*.js')];
    } else if (lintEnv === 'build') {
      src = [
        addbase(taskDir, '**/*.js'),
        addbase('gulpfile.babel.js'),
        '!' + addbase(taskDir, 'tasks/selenium/wdio-config/*.js')
      ];
    }

    const pluginConfig = makeEslintConfig({isDev, lintEnv});

    return gulp.src(src)
      .pipe(eslint(pluginConfig))
      .pipe(eslint.format(formatter));
  };
}
