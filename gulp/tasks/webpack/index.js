import {assign, isFunction, isUndefined} from 'lodash';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import makeConfig from './make-webpack-config';

export default function(gulp, plugins, config) {
  const {sources, utils, environment} = config;
  const {isDev, asset_path, branch} = environment;
  const {addbase, getTaskName} = utils;
  const {mainBundleName, buildDir, hotPort, devPort, devHost} = sources;
  const {gutil, app} = plugins;

  return (cb) => {
    const task = getTaskName(gulp.currentTask);
    const isMainTask = task === mainBundleName;
    let publicPath;

    if (isMainTask) {
      publicPath = '/';
    } else {
      /*eslint-disable */
      publicPath = isUndefined(branch) || isDev ? `http://${devHost}:${devPort}/` : `${asset_path}/`;
      /*eslint-enable */
    }

    const webpackConfig = makeConfig(assign({}, config, {isMainTask, publicPath, app}));
    const compiler = webpack(webpackConfig);

    function logger(err, stats) {
      if (err) {
        throw new new gutil.PluginError({
          plugin: `[webpack]`,
          message: err.message
        });
      }

      if (!isDev) {
        gutil.log(stats.toString());
      }
    }

    compiler.plugin('compile', () => {
      gutil.log(`Webpack Bundling ${task} bundle`);
    });

    compiler.plugin('done', (stats) => {
      gutil.log(`Webpack Bundled ${task} bundle in ${stats.endTime - stats.startTime}ms`);

      if (stats.hasErrors() || stats.hasWarnings()) {
        const {errors, warnings} = stats.toJson({errorDetails: true});

        [errors, warnings].forEach((stat, i) => {
          let type = i ? 'warning' : 'error';
          if (stat.length) {
            const [statStr] = stat;
            /*eslint-disable*/
            const [first, ...rest] = statStr.split('\n\n');
            /*eslint-enable*/
            if (rest.length) {
              gutil.log(`[webpack: ${task} bundle ${type}]\n`, rest.join('\n\n'));
            } else {
              gutil.log(`[webpack: ${task} bundle ${type}]`, stats.toString());
            }
          }
        });

        if (!isDev) {
          process.exit(1);
        }
      }

      //avoid multiple calls of gulp callback
      if (isFunction(cb)) {
        let gulpCb = cb;
        cb = null;

        gulpCb();
      }
    });

    if (isDev) {
      if (isMainTask) {
        new WebpackDevServer(compiler, {
          contentBase: addbase(buildDir),
          // TODO: figure out why can't use publicPath as absolute path when proxying wepback dev server
          publicPath,
          hot: true,
          quiet: true,
          noInfo: true,
          watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
          },
          headers: { 'X-Custom-Header': 'yes' },
          stats: { colors: true }
        }).listen(hotPort, devHost, () => {});
      } else {
        compiler.watch({
          aggregateTimeout: 300,
          poll: true
        }, logger);
      }
    } else {
      compiler.run(logger);
    }
  };
}
