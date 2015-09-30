import through from 'through2';
import {assign} from 'lodash';
import path from 'path';

export default function(gulp, plugins, config) {
  const {assemble, rev, gutil} = plugins;
  const {sources} = config;
  const {srcDir, buildDir} = sources;
  const manifest = rev.manifest('image-stats.json');

  return () => {
    let revData = {};

    manifest.on('data', (data) => {
      const revd = JSON.parse(data.contents.toString());
      assign(revData, revd);
    });

    manifest.on('end', (err) => {
      if (err) {
        new gutil.PluginError('[rev: manifest]', err, {showStack: true});
      }
      assemble.data({revData});
    });

    return gulp.src(`${srcDir}/templates/images/*.{jpg,jpeg,png,svg}`)
      .pipe(rev())
      .pipe(through.obj(function(file, enc, cb) {
        let hash = file.revHash;
        let ext = path.extname(file.path);
        let base = `${hash}-` + path.basename(file.path).split(hash)[0];

        file.path = path.join(path.dirname(file.path), base.substring(0, base.length - 1) + ext);

        this.push(file);
        cb();
      }))
      .pipe(gulp.dest(`${buildDir}/img`))
      .pipe(manifest);
  };
}
