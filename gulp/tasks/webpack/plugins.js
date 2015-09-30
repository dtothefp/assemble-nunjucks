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
      'window.jquery': 'jquery',
      'fetch': 'imports?this=>global!exports?global.fetch!isomorphic-fetch',
      'window.fetch': 'imports?this=>global!exports?global.fetch!isomorphic-fetch',
      'global.fetch': 'imports?this=>global!exports?global.fetch!isomorphic-fetch'
    }),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(!isMaster && !isDevRoot ? 'development' : 'production'),
        TEST_FILE: file ? JSON.stringify(file) : null,
        BASE_URL: JSON.stringify(isMaster ? '/api/' : 'https://api.hfa.io/'),
        GW_CLIENT_ID: JSON.stringify(isMaster ? '25def512a6857b7acd5c922796e923d25b631be064d1f4c217c0e438152dca6d' : 'SO/E+x58++2RGbil19qY9AjP2aZkPLb7EBAvlQ/oauGovBCney4uPKKaqtBJrbQOvXIdMLshLu+NBq79Q1a9pA==')
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
