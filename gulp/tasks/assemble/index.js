//import babel from 'babel';
import _ from 'lodash';
import consolidate from 'consolidate';
import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import path from 'path';
import {config as njConfig} from './nunjucks-config';
import Plasma from 'plasma';
import loader from 'assemble-loader';
import jsxLoader from './jsx-loader';

export default function(gulp, plugins, config) {
  const {app, browserSync, gulpIf} = plugins;
  const {sources, utils, environment} = config;
  const {srcDir, scriptDir, buildDir, libraryName} = sources;
  const {addbase, logError} = utils;
  const {extname} = plugins;
  const {isDev, shouldRev} = environment;
  const {requires} = njConfig;
  const userName = process.cwd().split('/')[2];
  const plasma = new Plasma();
  const src = addbase(srcDir, 'templates/pages/**/*.html');
  //const ogRenameKey = app.option('renameKey');

  app.use(loader());

  plasma.dataLoader('yml', function(fp) {
    const str = readFileSync(fp, 'utf8');
    return safeLoad(str);
  });

  app.data(plasma.load(addbase('config/**/*.yml'), {namespace: false}));
  app.data({environment});

  app.engine('.html', function(content, options, fn) {
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

  app.create('snippet');

  app.option('renameKey', (fp) => {
    const dirname = path.dirname(fp).split('/').slice(-1)[0];
    const basename = path.basename(fp).split('.').slice(0)[0];
    return `${dirname}/${basename}`;
  });

  if (!isDev && shouldRev) {
    app.postRender(/\.html$/, (file, next) => {
      const manifestData = app.get('cache.data.revData');

      file.content = Object.keys(manifestData).reduce((content, unrevd) => {
        const revd = manifestData[unrevd];
        return /\.map$/.test(revd) ? content : content.replace(new RegExp(unrevd, 'g'), revd);
      }, file.content);

      next();
    });
  }

  return (cb) => {
    app.engine('.jsx', consolidate.react);
    app.snippets.use(jsxLoader(config));
    app.snippets.load(addbase(srcDir, scriptDir, 'components/**/*.jsx'), function(err) {
      if (err) {
        logError({err, plugin: '[assemble]: snippets'});
      }
      console.log('snippets loaded', app.views.snippets['components/sample'].content);
      //app.snippets.getView('foo.jsx')
        //.render(reactData, function(err, view) {
          //if (err) return console.error(err);
          //console.log(view.content);
        //});
    });

    //app.task('load-snippets', function (done) {
      //app.snippets.load('path/to/snippets/*.jsx', done);
    //});

    app.task('build', () => {
      return app.src(src)
        .pipe(app.renderFile())
        .pipe(extname())
        .pipe(app.dest(buildDir))
        .pipe(gulpIf(isDev, browserSync.stream()))
        .on('error', (err) => {
          logError({err, plugin: '[assemble]: build'});
        });
    });

    app.task('watch', ['build'], () => {
      app.watch(addbase(srcDir, 'templates/**/*.html'), ['build']);
      cb();
    });

    app.run(isDev ? ['watch'] : ['build'], (err) => {
      if (err) {
        logError({err, plugin: '[assemble]: run'});
      }
      cb();
    });
  };
}
