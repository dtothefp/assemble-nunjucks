import {readdirSync as read, statSync as stat, existsSync as exists} from 'fs';
import _ from 'lodash';
import path, {join} from 'path';
import gulp from 'gulp';
import assemble from 'assemble';
import yargs from 'yargs';
import pluginFn from 'gulp-load-plugins';
import makeConfig from './';
import './gulp-taskname';
import dashToCamel from './dash-to-camel';

const argv = yargs
            .usage('Usage: $0 <gulp> $1 <gulp_task> [-e <environment> -f <file_to_test>]')
            .alias('b', 'browser')
            .alias('e', 'ENV')
            .alias('f', 'file')
            .alias('l', 'library')
            .alias('r', 'release')
            .alias('q', 'quick')
            .argv;

const devKey = 'development';
const prodKey = 'production';
const devTasks = [
  'watch',
  'test:integration',
  'test:e2e',
  'test:tunnel',
  'test:tunnel:live',
  'test:e2e:mobile',
  'test:e2e:desktop'
];
const prodTasks = [
  'build'
];

argv.isWatch = process.argv.indexOf('watch') !== -1;

/**
 * Environment defaults to `DEV` unless CLI arg -e is specified or `gulp build`
 */
if (!argv.ENV) {
  if (_.intersection(process.argv, devTasks).length) {
    argv.ENV = devKey;
  } else if (process.argv.length <= 3 || _.intersection(process.argv, prodTasks).length) {
    argv.ENV = prodKey;
  }
}

const keys = Object.keys(argv);
const cliConfig = keys.filter((arg) => {
  //filter out alias argvs
  return arg.length > 1 && !/\$/.test(arg);
}).reduce((o, arg) => {
  let val = argv[arg];
  if (arg === 'ENV') {
    if (val === 'dev') {
      val = devKey;
    } else if (val === 'prod') {
      val = prodKey;
    }
  }
  o[arg] = val;

  return o;
}, {});

const config = makeConfig(cliConfig);
const {sources, utils} = config;
const {taskDir} = sources;
const {addbase} = utils;

process.env.NODE_ENV = config.ENV;
//hack for karma, ternary was making `undefined` a string
if (config.file) {
  process.env.TEST_FILE = config.file;
}

const plugins = _.assign({}, pluginFn({
  lazy: false,
  pattern: [
    'gulp-*',
    'gulp.*',
    'del',
    'run-sequence',
    'browser-sync'
  ],
  rename: {
    'gulp-util': 'gutil',
    'run-sequence': 'sequence',
    'gulp-if': 'gulpIf'
  }
}), {app: assemble()});

/**
 * Reqires all gulp tasks passing the `gulp` object, all `plugins` and `config` object
 * Eliminates a lot of
 * @param {String} taskPath
 * @param {Function|Callback} supplied as `gulp.task`
 */
function getTask(taskPath) {
  return require(taskPath)(gulp, plugins, config);
}

const tasksDir = addbase(taskDir, 'tasks');

/**
 * Creates an object with keys corresponding to the Gulp task name and
 * values corresponding to the callback function passed as the second
 * argument to `gulp.task`
 * @param {Array} all fill and directory names in the `gulp/task` directory
 * @return {Object} map of task names to callback functions to be used in `gulp.task`
 */
const tasks = read(tasksDir).reduce( (o, name) => {
  const taskPath = join(tasksDir, name);
  let isDir = stat(taskPath).isDirectory();
  let taskName;
  if (isDir) {
    if ( !exists(join(taskPath, 'index.js')) ) {
      throw new Error(`task ${name} directory must have filename index.js`);
    }
    taskName = name;
  } else {
    taskName = path.basename(name, '.js');
  }
  //TODO: add check for devDependencies and don't load depending on environment
  o[ dashToCamel(taskName) ] = getTask(taskPath);
  return o;
}, {});

export {tasks, config, plugins};
