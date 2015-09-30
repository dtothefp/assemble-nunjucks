import {merge} from 'lodash';
import selenium from 'selenium-standalone';

let config = {
  // check for more recent versions of selenium here:
  // http://selenium-release.storage.googleapis.com/index.html
  baseURL: 'http://selenium-release.storage.googleapis.com',
  drivers: {
    chrome: {
      // check for more recent versions of chrome driver here:
      // http://chromedriver.storage.googleapis.com/index.html
      version: '2.15',
      arch: process.arch,
      baseURL: 'http://chromedriver.storage.googleapis.com'
    },
    ie: {
      // check for more recent versions of internet explorer driver here:
      // http://selenium-release.storage.googleapis.com/index.html
      version: '2.45',
      arch: process.arch,
      baseURL: 'http://selenium-release.storage.googleapis.com'
    }
  },
  logger(message) {
    console.log(message);
  }
};

export default function(opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }
  merge(config, opts);
  selenium.install(config, cb);
}

