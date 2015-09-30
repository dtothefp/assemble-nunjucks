import {assign} from 'lodash';
import {join} from 'path';
import dashToCamel from './dash-to-camel';
import pkgInfo from '../../package';

export default function(config) {
  const globalBundleName = 'global';
  const mainBundleName = 'main';
  const {ENV, library} = config;
  const isDev = ENV === 'development';
  const {
    devDependencies,
    dependencies,
    main,
    name,
    version
  } = pkgInfo;

  const sources = {
    srcDir: './src',
    libraryName: library || dashToCamel(name.replace('@hfa/', ''), true),
    testDir: './test',
    taskDir: './gulp',
    buildDir: './dist',
    devHost: 'localhost',
    devPort: 8000,
    hotPort: 8080,
    globalBundleName,
    mainBundleName,
    entry: {
      [mainBundleName]: ['./index.js'],
      [globalBundleName]: ['./global.js']
    }
  };

  const utils = {
    addbase(...args) {
      let base = [process.cwd()];
      let allArgs = [...base, ...args];
      return join(...allArgs);
    },
    getTaskName(task) {
      const split = task.name.split(':');
      const len = split.length;
      let ret;

      if (len === 2) {
        ret = split.slice(-1)[0];
      } else if (len > 2) {
        ret = split.slice(1);
      }

      return ret;
    }
  };

  const environment = {
    branch: process.env.TRAVIS_BRANCH,
    public_path: isDev ? '' : '',
    link_path: isDev ? '' : '',
    isDev: ENV === 'development'
  };

  const pkg = {
    devDependencies: Object.keys(devDependencies),
    dependencies: Object.keys(dependencies),
    name,
    version,
    main
  };

  const tasks = {
    devTasks: [
      'clean',
      'browserSync'
    ]
  };

  return assign(
    {},
    config,
    {environment},
    {pkg},
    {sources},
    {tasks},
    {utils}
  );
}
