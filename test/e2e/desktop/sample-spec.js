import {expect} from 'chai';
import setup from '../../config/e2e-setup';

const url = '/';

describe('local homepage parallel', function() {
  let client;

  before(function() {
    client = setup();
    return client.url(url);
  });

  it('should get the page title', (cb) => {
    client.getTitle().then((title) => {
      expect(title).to.eq('FrontendBoilerplate');
      cb();
    });
  });
});

