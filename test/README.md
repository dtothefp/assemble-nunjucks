## Test Config

### e2e tests using [BrowserStack](http://webdriver.io/) and [Webdriver.io](http://webdriver.io/)

#### Setup
- ensure you are on `node v0.12` or later
- npm i
- go to [Browserstack](https://www.browserstack.com) and create an account
- go to [Browserstack Automate](https://www.browserstack.com/automate) and copy `username` and `key`
- in `.bash_profile` or `.zshrc`
```shell
export BROWSERSTACK_USERNAME='<username>'
export BROWSERSTACK_API='<key>'
```
- when you first run `gulp selenium` you may be prompted to download the [JAVA Runtime](https://support.apple.com/kb/DL1572?locale=en_US)
- install [JAVA Runtime](https://support.apple.com/kb/DL1572?locale=en_US) specific for [Yosemite](http://fredericiana.com/2014/10/21/osx-yosemite-java-runtime-environment/)

### VM Broswer QA on BrowserStack Live
- test the local IP on BrowserStack virtual browsers
- run `gulp selenium:tunnel`
- [BrowserStack Live](https://www.browserstack.com/start) view local site in various browsers on BrowserStack
