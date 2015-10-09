import {assign} from 'lodash';
import makeLoaders from './loaders';
import makePlugins from './plugins';

export default function(config) {
  const {
    isMainTask,
    sources,
    utils,
    ENV
  } = config;
  const {addbase} = utils;
  const {srcDir, entry} = sources;
  const DEBUG = ENV === 'development';
  const TEST = ENV === 'test';
  const SERVER = ENV === 'server';
  const extract = !isMainTask;
  const [expose] = entry.main.map( fp => addbase(srcDir, fp) );
  const sharedConfig = {DEBUG, TEST, SERVER};
  const loaderConfig = assign({}, config, sharedConfig, {extract, expose});
  const pluginConfig = assign({}, config, sharedConfig);
  const loaders = makeLoaders(loaderConfig);
  const plugins = makePlugins(pluginConfig);

  return assign({}, loaders, plugins);
}
