import autoprefixer from 'autoprefixer';
import makeEslintConfig from 'open-eslint-config';
import {assign, merge, omit} from 'lodash';
import {join} from 'path';
import webpack from 'webpack';
import formatter from 'eslint-friendly-formatter';
import makeLoaders from './loaders';
import makePlugins from './plugins';

export default function(config) {
  const {
    ENV,
    file,
    quick,
    sources,
    isMainTask,
    utils,
    environment,
    publicPath
  } = config;
  const {
    entry,
    srcDir,
    buildDir,
    hotPort,
    devHost,
    globalBundleName,
    mainBundleName,
    libraryName
  } = sources;
  const {isDev} = environment;
  const {addbase} = utils;
  const DEBUG = ENV === 'development';
  const TEST = ENV === 'test';
  const filename = isDev ? '[name].js' : '[chunkhash]-[name].js';
  let externals = {
    jquery: 'window.jQuery',
    ga: 'window.ga',
    optimizely: 'window.optimizely'
  };

  const {rules, configFile} = makeEslintConfig({
    isDev,
    lintEnv: 'web'
  });

  const expose = entry.main.map( fp => {
    return {
      libraryName,
      test: addbase(srcDir, fp)
    };
  })[0];

  const {preLoaders, loaders} = makeLoaders({
    DEBUG,
    TEST,
    expose,
    extract: !isMainTask,
    quick
  });

  const plugins = makePlugins({
    DEBUG,
    TEST,
    file,
    environment,
    isMainTask
  });

  const defaultConfig = {
    externals,
    module: {
      loaders: loaders
    },
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
      modulesDirectories: ['node_modules', 'src/js'],
      alias: {
        fetch: 'isomorphic-fetch'
      }
    },
    node: {
      dns: 'mock',
      net: 'mock',
      fs: 'empty'
    }
  };

  let commons = {
    vendors: [
      'react',
      'nuclear-js',
      'nuclear-js-react-addons',
      'js-cookie'
    ]
  };

  const configFn = {
    development(isProd) {
      let devPlugins = [
        new webpack.HotModuleReplacementPlugin()
      ];
      let hotEntry = [
        `webpack-dev-server/client?${devHost}:${hotPort}`,
        'webpack/hot/dev-server',
        'webpack/hot/only-dev-server'
      ];
      let taskEntry;

      if (isMainTask) {
        let main = omit(entry, globalBundleName);
        if (!isProd) {
          commons.vendors.push(...hotEntry);
          plugins.push(...devPlugins);
        }
        taskEntry = assign({}, main, commons);
      } else {
        taskEntry = omit(entry, mainBundleName);
      }

      let devConfig = {
        context: addbase(srcDir),
        cache: DEBUG,
        debug: DEBUG,
        entry: taskEntry,
        output: {
          path: addbase(buildDir),
          publicPath,
          filename: join('js', filename)
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
          preLoaders: preLoaders,
          loaders: loaders
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
      let makeDevConfig = this.development;
      let prodConfig = merge({}, makeDevConfig(true), {
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
      let testConfig = {
        module: {
          loaders
        },
        plugins,
        watch: true,
        devtool: 'inline-source-map'
      };

      return merge({}, defaultConfig, testConfig);
    },

    ci() {
      let ciConfig = {
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
