import {union} from 'lodash';

export default function({pkgConfig, ignore}) {
  const {dependencies, devDependencies} = pkgConfig;
  const depKeys = union(dependencies, devDependencies).filter(dep => dep.indexOf(ignore) === -1);

  return depKeys.reduce((o, mod) => {
    o[mod] = `commonjs ${mod}`;
    return o;
  }, {});
}
