import {assign, merge} from 'lodash';
import makeConfig from '../../config';
import makeWebpackConfig from '../webpack/make-webpack-config';

let {NODE_ENV, TEST_FILE} = process.env;
const config = makeConfig({ENV: NODE_ENV});
const {utils, sources} = config;
const testPath = utils.addbase(sources.testDir, 'config/karma-index.js');
let preprocessors = {};
let ENV;

if (NODE_ENV === 'development') {
  preprocessors[testPath] = [ 'webpack', 'sourcemap' ];
  ENV = 'test';
} else {
  ENV = 'ci';
  preprocessors[testPath] = [ 'webpack'];
}

const webpackConfig = makeWebpackConfig(assign({}, config, {ENV}, {file: TEST_FILE}));

export default function(config) {
  const envConfigs = {
    test: {
      autoWatch: true,
      singleRun: false,
      reporters: [ 'spec' ],
      browsers: [ 'Chrome' ]
    },
    ci: {
      autoWatch: false,
      singleRun: true,
      reporters: [ 'dots' ],

      // global config of your BrowserStack account
      browserStack: {
        username: process.env.BROWSERSTACK_USERNAME,
        accessKey: process.env.BROWSERSTACK_API
      },

      // define browsers
      customLaunchers: {
        bs_firefox_mac: {
          base: 'BrowserStack',
          browser: 'firefox',
          browser_version: '21.0',
          os: 'OS X',
          os_version: 'Mountain Lion'
        },
        bs_ie_windows: {
          base: 'BrowserStack',
          'browser': 'ie',
          'browser_version': '11.0',
          'os': 'Windows',
          'os_version': '8.1'
        },
        bs_op_windows: {
          base: 'BrowserStack',
          'browser': 'opera',
          'browser_version': '12.15',
          'os': 'Windows',
          'os_version': 'XP'
        },
        bs_iphone5: {
          base: 'BrowserStack',
          'browserName': 'iPhone',
          'device': 'iPhone 5',
          os: 'ios',
          os_version: '6.0'
        }

      },

      browsers: ['bs_firefox_mac', /*'bs_iphone5',*/ 'bs_ie_windows', 'bs_op_windows']
    }
  };

  config.set(merge({}, envConfigs[ENV], {
    frameworks: [ 'mocha' ],
    files: [
      testPath
    ],
    preprocessors,
    client: {
      captureConsole: false,
      mocha: {
        ui: 'bdd',
        timeout: 10000
      }
    },
    webpack: webpackConfig,
    webpackServer: {
      noInfo: true
    }
  }));
}
