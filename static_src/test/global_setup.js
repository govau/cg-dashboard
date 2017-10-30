/* eslint-disable jasmine/no-global-setup,no-console */
import 'babel-polyfill';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

import jasmineEnzyme from 'jasmine-enzyme';
import LoginStore from '../stores/login_store';
import UserStore from '../stores/user_store';

Function.prototype.bind =
  Function.prototype.bind ||
  function(thisp) {
    // eslint-disable-line
    const fn = this;
    return (...args) => fn.apply(thisp, args);
  };

beforeEach(function() {
  jasmineEnzyme();
});

beforeEach(() => {
  console.warn = msg => {
    fail(
      `Unexpected call to console.warn during a test. Please add an expectation or fix the test. The logged message was: ${msg}`
    );
  };
});

// TODO Stub out axios.{get,delete,patch,post,put}, all async calls should be
// stubbed or mocked, otherwise it's an error.

// TODO Stores should have a different singleton strategy so that state can
// be cleared and managed consistently in tests. Currently, all the singleton
// stores are listening to dispatch events, which often cause events to be
// processed twice.
// UserStore is only an issue because the store calls cfApi. cfApi calls should
// be moved to the actions.
LoginStore.unsubscribe();
UserStore.unsubscribe();
