import AppDispatcher from '../../../dispatcher';
import {
  assertAction,
  setupViewSpy,
  setupServerSpy,
  setupUISpy
} from '../helpers';
import cfApi from '../../../util/cf_api';
import quotaActions from '../../../actions/quota_actions';
import { quotaActionTypes } from '../../../constants';

describe('quotaActions', function() {
  var sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('fetchQuotasForAllOrgs()', function() {
    it('should dispatch a view event to get all organization quotas', function() {
      let spy = setupViewSpy(sandbox);

      quotaActions.fetchQuotasForAllOrgs();

      assertAction(spy, quotaActionTypes.ORGS_QUOTAS_FETCH);
    });
  });

  describe('receivedQuotasForAllOrgs()', function() {
    it('should dispatch a server event to process recieved organizations quotas', function() {
      let spy = setupServerSpy(sandbox);
      let quotas = [{ guid: 'fake-quota-one' }];

      quotaActions.receivedQuotasForAllOrgs(quotas);

      assertAction(spy, quotaActionTypes.ORGS_QUOTAS_RECEIVED, { quotas });
    });
  });

  describe('fetchQuotasForAllSpaces()', function() {
    it('should dispatch a view event to get all space quotas', function() {
      let spy = setupViewSpy(sandbox);

      quotaActions.fetchQuotasForAllSpaces();

      assertAction(spy, quotaActionTypes.SPACES_QUOTAS_FETCH);
    });
  });

  describe('receivedQuotasForAllSpaces()', function() {
    it('should dispatch a server event to process recieved spaces quotas', function() {
      let spy = setupServerSpy(sandbox);
      let quotas = [{ guid: 'fake-quota-one' }];

      quotaActions.receivedQuotasForAllSpaces(quotas);

      assertAction(spy, quotaActionTypes.SPACES_QUOTAS_RECEIVED, { quotas });
    });
  });
});
