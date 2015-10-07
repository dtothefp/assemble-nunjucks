/**
 * Webpack takes a regex or a function to determine which modules to exclude.
 * This creates and exclusion for modules we do not want to compile with Babel
 * @param {String} fp filepath
 * @return {Boolean} true to exclude, false to compile with Babel
 */
export default function(fp) {
  const isFetch = /isomorphic-fetch/.test(fp);
  let shouldExclude = false;

  if (!isFetch) {
    const split = fp.split('/@hfa/');
    /*eslint-disable*/
    const [first, middle, ...rest] = split;
    /*eslint-enable*/

    //node_module of current package that is not @hfa module
    const isNodeModule =
      split.length === 1 &&
      /node_modules/.test(fp);

    //node_module of top level @hfa module
    const moduleOfModule =
      split.length === 2 &&
      /node_modules/.test(middle);

    //node_module of nested @hfa module
    const moduleOfModuleOfModule =
      split.length > 2 &&
      /node_modules/.test(rest.splice(-1)[0]);

    shouldExclude =
      moduleOfModule ||
      moduleOfModuleOfModule ||
      isNodeModule;
  }

  return shouldExclude;
}
