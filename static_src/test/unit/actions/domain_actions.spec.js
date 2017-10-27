import AppDispatcher from '../../../dispatcher';
import { assertAction, setupViewSpy, setupServerSpy } from '../helpers';
import domainActions from '../../../actions/domain_actions';
import { domainActionTypes } from '../../../constants';

describe('domainActions', function() {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('fetch()', function() {
    it('should dispatch a view event of type domain fetch', function() {
      let expectedDomainGuid = 'xzzzasdflkjz',
        expectedParams = {
          domainGuid: expectedDomainGuid
        };

      const spy = setupViewSpy(sandbox);

      domainActions.fetch(expectedDomainGuid);

      assertAction(spy, domainActionTypes.DOMAIN_FETCH, expectedParams);
    });
  });

  describe('receivedDomain()', function() {
    it('should dispatch a view event of type domain resceived', function() {
      let expected = { guid: 'asdfavcx1z13c5', name: 'al.gov' },
        expectedParams = {
          domain: expected
        };

      const spy = setupServerSpy(sandbox);

      domainActions.receivedDomain(expected);

      assertAction(spy, domainActionTypes.DOMAIN_RECEIVED, expectedParams);
    });
  });
});
