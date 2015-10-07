import nunjucks from 'nunjucks';

export const config = {
  engine: 'nunjucks',
  requires: {
    nunjucks: nunjucks.configure({
      watch: false,
      noCache: true
    })
  }
};
