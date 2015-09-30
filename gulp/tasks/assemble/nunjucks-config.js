import nunjucks from 'nunjucks';

const config = {
  engine: 'nunjucks',
  requires: {
    nunjucks: nunjucks.configure({
      watch: false
    })
  }
};

export {config};
