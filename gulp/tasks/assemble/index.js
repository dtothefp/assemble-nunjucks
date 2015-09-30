import babel from 'babel';
import _ from 'lodash';
import consolidate from 'consolidate';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import path from 'path';
import {config as njConfig} from './nunjucks-config';
import Plasma from 'plasma';

export default function(gulp, plugins, config) {
  const {assemble, browserSync, gulpIf} = plugins;
  const {sources, utils, environment} = config;
  const {srcDir, buildDir, libraryName} = sources;
  const {addbase} = utils;
  const {extname} = plugins;
  const {isDev} = environment;
  const {requires} = njConfig;
  const userName = process.cwd().split('/')[2];
  const plasma = new Plasma();
  const src = addbase(srcDir, 'templates/pages/**/*.html');
  //const ogRenameKey = assemble.option('renameKey');

  plasma.dataLoader('yml', function(fp) {
    const str = readFileSync(fp, 'utf8');
    return safeLoad(str);
  });

  assemble.data(plasma.load(addbase('config/**/*.yml'), {namespace: false}));
  assemble.data({environment});

  assemble.engine('.jsx', function(content, options, fn) {
    const compiled = babel.transform(content, {
      stage: 0,
      code: true,
      env: process.env.NODE_ENV
    });
    return consolidate.react.render(compiled.code, options, fn);
  });

  assemble.engine('.html', function(content, options, fn) {
    const opts = _.merge({}, options, {
      layouts(fp) {
        return `${addbase(srcDir, 'templates/layouts', fp)}.html`;
      },
      requires,
      userName,
      libraryName
    });
    return consolidate.nunjucks.render(content, opts, fn);
  });

  assemble.create('snippet');

  assemble.option('renameKey', (fp) => {
    const dirname = path.dirname(fp).split('/').slice(-1)[0];
    const basename = path.basename(fp).split('.').slice(0)[0];
    return `${dirname}/${basename}`;
  });

  assemble.snippets(addbase(srcDir, 'js/components/**/*.jsx'));

  if (!isDev) {
    const manifestData = assemble.get('data').revData;

    assemble.postRender(/\.html$/, (file, next) => {
      file.content = Object.keys(manifestData).reduce((content, unrevd) => {
        const revd = manifestData[unrevd];
        return /\.map$/.test(revd) ? content : content.replace(new RegExp(unrevd, 'g'), revd);
      }, file.content);

      next();
    });
  }

  assemble.task('build', () => {
    assemble.src(src)
      .pipe(extname())
      .pipe(assemble.dest(buildDir))
      .pipe(gulpIf(isDev, browserSync.stream()))
      .on('error', (err) => console.log(err));
  });

  assemble.task('watch', ['build'], () => {
    assemble.watch(addbase(srcDir, 'templates/**/*.html'), ['build']);
  });

  return (cb) => {
    assemble.run(isDev ? ['build', 'watch'] : ['build'], () => {
      if (typeof cb === 'function') {
        const gulpCb = cb;
        cb = null;
        gulpCb();
      }
    });
  };
}
