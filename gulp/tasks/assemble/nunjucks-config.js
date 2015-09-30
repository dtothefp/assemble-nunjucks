import nunjucks from 'nunjucks';

const config = {
  engine: 'nunjucks',
  requires: {
    nunjucks: nunjucks.configure({
      watch: true
    })
  }
};

export {config};
