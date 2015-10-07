import {assign} from 'lodash';
import path from 'path';

/**
 * Assemble plugin signature to retrieve hashes files and attach to the `assemble.data` context
 */
export default function(app) {
  return function webpackStats() {
    this.plugin('done', (stats) => {
      let statsJson = stats.toJson({
        assets: true,
        hash: true,
        version: false,
        timings: false,
        chunks: false,
        children: false,
        errors: false,
        chunkModules: false,
        modules: false,
        cached: false,
        reasons: false,
        source: false,
        errorDetails: false,
        chunkOrigins: false,
        modulesSort: false,
        chunksSort: false,
        assetsSort: false
      });

      let revData = {};
      const {assetsByChunkName} = statsJson;

      Object.keys(assetsByChunkName).forEach((key) => {
        let val = assetsByChunkName[key];

        val.reduce((o, fp) => {
          //HACK: normalize leading slash
          const dir = '/' + path.dirname(fp).split('/').slice(-1)[0];
          /*eslint-disable */
          const [hash, ...rest] = path.basename(fp).split('-');
          const base = path.join(dir, rest.join('-'));
          /*eslint-enable */

          if (!/\.map$/.test(fp)) {
            //HACK: normalize leading slash
            fp = fp[0] !== '/' ? `/${fp}` : fp;

            o[base] = fp;
          }

          return o;
        }, revData);
      });

      const prevData = app.get('cache.data.revData');
      app.data('revData', assign({}, prevData, revData));
    });
  };
}

