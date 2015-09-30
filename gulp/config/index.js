import {assign} from 'lodash';
import {join} from 'path';
import dashToCamel from './dash-to-camel';
import pkgInfo from '../../package';

export default function(config) {
  const {ENV, library} = config;
  const isDev = ENV === 'development';
  const scriptDir = 'js';
  const {TRAVIS_BRANCH} = process.env;
  const devBranch = 'devel';
  const isMaster = TRAVIS_BRANCH === 'master';
  const isDevRoot = TRAVIS_BRANCH === devBranch;
  const globalBundleName = 'global';
  const mainBundleName = 'main';

  const {
    devDependencies,
    dependencies,
    main,
    name,
    version
  } = pkgInfo;

  const sources = {
    buckets: {
      prod: 'campaign-contribute-prod',
      dev: 'campaign-contribute-dev'
    },
    buildDir: './dist',
    devHost: 'localhost',
    internalHost: 'local.hfa.io',
    devPort: 8000,
    globalBundleName,
    mainBundleName,
    entry: {},
    hotPort: 8080,
    libraryName: library || dashToCamel(name, true),
    srcDir: './src',
    taskDir: './gulp',
    testDir: './test'
  };

  sources.entry[globalBundleName] = ['./' + join(scriptDir, './global.js')];
  sources.entry[mainBundleName] = ['./' + join(scriptDir, './index.js')];

  const utils = {
    addbase(...args) {
      const base = [process.cwd()];
      const allArgs = [...base, ...args];
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

  let environment = {
    asset_path: '', // path for assets => local_dev: '', dev: , prod:
    link_path: TRAVIS_BRANCH ? 'TRAVIS_BRANCH' : '',
    image_dir: 'img',
    template_env: ENV,
    isDev,
    isMaster,
    isDevRoot
  };

  if (!isDev && TRAVIS_BRANCH) {
    let devAssetPath = '';
    const prodAssetPath = '';

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

  return assign(
    {},
    config,
    {environment},
    {pkg},
    {sources},
    {utils}
  );
}
