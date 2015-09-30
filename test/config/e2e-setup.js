import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

export default function() {
  chai.use(chaiAsPromised);
  chai.should();
  chaiAsPromised.transferPromiseness = global.browser.transferPromiseness;

  return global.browser;
}
