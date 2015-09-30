const {TEST_FILE} = process.env;
const re = TEST_FILE !== null ? new RegExp(`${TEST_FILE}.js`) : /-spec\.js$/;

const context = require.context('../integration', true, /-spec\.js$/);
context.keys().forEach((key) => {
  if (re.test(key)) {
    context(key);
  }
});
