import {assign} from 'lodash';
import {join} from 'path';
import gutil, {PluginError} from 'gulp-util';
import dashToCamel from './dash-to-camel';
import pkgInfo from '../../package';
import makePaths from './make-paths';

export default function(config) {
  const shouldRev = false;
  const shouldUpload = false;
  let devAssetPath = '/';
  const prodAssetPath = '/';
  const globalBundleName = 'global';
  const mainBundleName = 'main';
  const {ENV, library} = config;
  const isDev = ENV === 'development';
  const scriptDir = 'js';
  const {TRAVIS_BRANCH} = process.env;
  const devBranch = 'devel';
  const isMaster = TRAVIS_BRANCH === 'master';
  const isDevRoot = TRAVIS_BRANCH === devBranch;

  const {
    devDependencies,
    dependencies,
    main,
    name,
    version
  } = pkgInfo;

  const sources = {
    buckets: {
      prod: '', //enter prod bucket here
      dev: '' //enter dev bucket here
    },
    scriptDir,
    srcDir: './src',
    libraryName: library || dashToCamel(name.replace('@hfa/', ''), true),
    testDir: './test',
    taskDir: './gulp',
    buildDir: './dist',
    devHost: 'localhost',
    devPort: 8000,
    hotPort: 8080,
    includePaths: [],
    globalBundleName,
    mainBundleName,
    entry: {
      [mainBundleName]: [`./${scriptDir}/index.js`],
      [globalBundleName]: [`./${scriptDir}/global.js`]
    }
  };

  const webpackConfig = {
    alias: {
      fetch: 'isomorphic-fetch'
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
    },
    logError({err, plugin}) {
      const pluginErr = new PluginError(plugin, err, {showStack: true});
      gutil.log(gutil.colors.magenta(pluginErr.plugin));
      gutil.log(gutil.colors.blue(pluginErr.message));
      gutil.log(pluginErr.stack);
      process.exit(1);
    }
  };

  const environment = {
    asset_path: '', // path for assets => local_dev: '', dev: hrc-assets.hfa.io/contribute, prod: a.hrc.onl/contribute
    link_path: TRAVIS_BRANCH ? 'TRAVIS_BRANCH' : '',
    image_dir: 'img',
    shouldRev,
    shouldUpload,
    template_env: ENV,
    isDev,
    isMaster,
    isDevRoot
  };

  if (!isDev && TRAVIS_BRANCH) {
    // if branch is not `devel` or `master` add the branch name to the asset path
    if (!isDevRoot && !isMaster) {
      devAssetPath += `/${TRAVIS_BRANCH}`;
    }

    assign(environment, {
      asset_path: !isMaster ? devAssetPath : prodAssetPath,
      branch: TRAVIS_BRANCH,
      link_path: isDevRoot || isMaster ? '' : `/${TRAVIS_BRANCH}` // for creating <a href={{link_path}}/something
    });
  }

  const pkg = {
    devDependencies: Object.keys(devDependencies),
    dependencies: Object.keys(dependencies),
    name,
    version,
    main
  };

  const paths = {
    fileLoader: [
      'file-loader?name=[path][name].[ext]',
      'file-loader?name=[path][hash]-[name].[ext]'
    ],
    cssBundleName: [
      'css/[name].css',
      'css/[chunkhash]-[name].css'
    ],
    jsBundleName: [
      '[name].js',
      '[chunkhash]-[name].js'
    ]
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
    {utils},
    {paths: makePaths({isDev, shouldRev, paths})},
    {webpackConfig}
  );
}
