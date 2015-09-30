import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';
import statsPlugin from './stats-plugins';

export default function(opts) {
  const {DEBUG, TEST, file, environment, isMainTask} = opts;
  const {isDevRoot, isMaster} = environment;
  const {CommonsChunkPlugin} = webpack.optimize;
  let cssBundle = DEBUG || TEST ? 'css/[name].css' : 'css/[chunkhash]-[name].css';

  let commons = [
    new CommonsChunkPlugin({
      name: 'vendors',
      filename: DEBUG || TEST ? 'js/[name].js' : 'js/[chunkhash]-[name].js',
      minChunks: Infinity
    })
  ];

  let plugins = [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jquery': 'jquery'
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(!isMaster && !isDevRoot ? 'development' : 'production'),
        TEST_FILE: file ? JSON.stringify(file) : null
      }
    }),
    new ExtractTextPlugin(cssBundle, {
      allChunks: true
    })
  ];

  let prodPlugins = [
    new webpack.optimize.DedupePlugin(),
    statsPlugin
  ];

  if (!DEBUG && !TEST) {
    plugins.push(...prodPlugins);
  }

  if (isMainTask) {
    plugins.push(...commons);
  }
  return plugins;
}
