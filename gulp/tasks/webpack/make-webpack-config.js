import makeEslintConfig from 'open-eslint-config';
import {assign, merge, omit} from 'lodash';
import {join} from 'path';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import formatter from 'eslint-friendly-formatter';
import getCommonjsMods from './gather-commonjs-mods.js';
import getLoaderPluginConfig from './get-loader-plugin-config';

export default function(config) {
  const {
    ENV,
    release,
    quick,
    paths,
    sources,
    isMainTask,
    utils,
    environment,
    publicPath,
    webpackConfig
  } = config;
  const {
    entry,
    srcDir,
    buildDir,
    hotPort,
    devHost,
    libraryName,
    globalBundleName,
    mainBundleName
  } = sources;
  const {alias} = webpackConfig;
  const {isDev} = environment;
  const {addbase} = utils;
  const {jsBundleName} = paths;
  const externals = {
    jquery: 'window.jQuery'
  };

  const {
    preLoaders,
    loaders,
    plugins
  } = getLoaderPluginConfig(config);

  const defaultConfig = {
    externals: release ? assign({}, externals, getCommonjsMods()) : externals,
    resolve: {
      extensions: [
        '',
        '.js',
        '.json',
        '.jsx',
        '.html',
        '.css',
        '.scss',
        '.yaml',
        '.yml'
      ],
      alias
    },
    node: {
      dns: 'mock',
      net: 'mock',
      fs: 'empty'
    }
  };

  const commons = {
    vendors: [
      'lodash',
      'nuclear-js',
      'react'
    ]
  };

  const configFn = {
    development(isProd) {
      const devPlugins = [
        new webpack.HotModuleReplacementPlugin()
      ];
      const hotEntry = [
        `webpack-dev-server/client?${devHost}:${hotPort}`,
        'webpack/hot/dev-server',
        'webpack/hot/only-dev-server'
      ];
      let taskEntry;

      if (isMainTask) {
        const main = omit(entry, globalBundleName);
        if (!isProd) {
          commons.vendors.push(...hotEntry);
          plugins.push(...devPlugins);
        }
        taskEntry = assign({}, main, commons);
      } else {
        taskEntry = omit(entry, mainBundleName);
      }

      const {rules, configFile} = makeEslintConfig({
        isDev,
        lintEnv: 'web'
      });

      const devConfig = {
        context: addbase(srcDir),
        cache: isDev,
        debug: isDev,
        entry: taskEntry,
        output: {
          path: addbase(buildDir),
          publicPath,
          filename: join('js', jsBundleName)
        },
        eslint: {
          rules,
          configFile,
          formatter,
          emitError: false,
          emitWarning: false,
          failOnWarning: !isDev,
          failOnError: !isDev
        },
        module: {
          preLoaders,
          loaders
        },
        plugins,
        postcss: [
          autoprefixer()
        ],
        devtool: 'source-map'
      };

      return merge({}, defaultConfig, devConfig);
    },

    production() {
      const makeDevConfig = this.development;
      const prodConfig = merge({}, makeDevConfig(true), {
        output: {
          library: libraryName,
          libraryTarget: 'umd'
        }
      });

      if (!quick) {
        prodConfig.plugins.push(
          new webpack.optimize.UglifyJsPlugin({
            output: {
              comments: false
            },
            compress: {
              warnings: false
            }
          })
        );
      }

      return prodConfig;
    },

    test() {
      const {rules, configFile} = makeEslintConfig({
        isDev,
        lintEnv: 'test'
      });

      const testConfig = {
        module: {
          preLoaders,
          loaders
        },
        eslint: {
          rules,
          configFile,
          formatter,
          emitError: true,
          emitWarning: true,
          failOnWarning: false,
          failOnError: false
        },
        plugins,
        watch: true,
        devtool: 'inline-source-map'
      };

      return merge({}, defaultConfig, testConfig);
    },

    ci() {
      const ciConfig = {
        // allow getting rid of the UglifyJsPlugin
        // https://github.com/webpack/webpack/issues/1079
        module: {
          loaders,
          postLoaders: [
            {
              test: /\.js$/,
              loader: 'uglify',
              exclude: /\-spec\.js$/
            }
          ]
        },
        plugins,
        'uglify-loader': {
          compress: {warnings: false}
        }
      };

      return merge({}, defaultConfig, ciConfig);
    }
  };

  return configFn[ENV]();
}
