import {createElement} from 'react';
import ReactDOM from 'react-dom';
import SampleHello from './components/sample';

/*eslint-disable */
console.log('MAIN JS LOADED');
/*eslint-enable */
const div = document.querySelector('[data-react]');

ReactDOM.render(createElement(SampleHello, {userName: window.userName}), div);
