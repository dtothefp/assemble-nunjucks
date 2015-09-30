import {expect} from 'chai';

describe('a sample spec', () => {
  it('should work', () => {
    expect(1).to.eq(1);
  });

  it('should work async', (cb) => {
    setTimeout(() => {
      expect(1).to.eq(1);
      cb();
    }, 1000);
  });
});
