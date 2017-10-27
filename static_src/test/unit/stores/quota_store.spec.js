import Immutable from 'immutable';

import AppDispatcher from '../../../dispatcher';
import cfApi from '../../../util/cf_api';
import QuotaStore from '../../../stores/quota_store';
import { quotaActionTypes } from '../../../constants';

describe('QuotaStore', function() {
  let sandbox;

  beforeEach(() => {
    QuotaStore._data = Immutable.List();
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor()', function() {
    it('should start data as empty array', function() {
      expect(QuotaStore.getAll()).toBeEmptyArray();
    });
  });

  describe('on ORGS_QUOTAS_FETCH', function() {
    it('should fetch quotas for all organizations', function() {
      const spy = sandbox.spy(cfApi, 'fetchOrgsQuotas');
      AppDispatcher.handleViewAction({
        type: quotaActionTypes.ORGS_QUOTAS_FETCH
      });

      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('on ORGS_QUOTAS_RECEIVED', function() {
    it('should call mergeMany with new quotas', function() {
      const spy = sandbox.spy(QuotaStore, 'mergeMany');
      const quotas = [
        {
          metadata: {
            guid: 'fake-guid'
          },
          entity: {}
        }
      ];
      AppDispatcher.handleViewAction({
        type: quotaActionTypes.ORGS_QUOTAS_RECEIVED,
        quotas
      });

      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('on SPACES_QUOTAS_FETCH', function() {
    it('should fetch quotas for all organizations', function() {
      const spy = sandbox.spy(cfApi, 'fetchSpacesQuotas');
      AppDispatcher.handleViewAction({
        type: quotaActionTypes.SPACES_QUOTAS_FETCH
      });

      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('on SPACES_QUOTAS_RECEIVED', function() {
    it('should call mergeMany with new quotas', function() {
      const spy = sandbox.spy(QuotaStore, 'mergeMany');
      const quotas = [
        {
          metadata: {
            guid: 'fake-guid'
          },
          entity: {}
        }
      ];
      AppDispatcher.handleViewAction({
        type: quotaActionTypes.SPACES_QUOTAS_RECEIVED,
        quotas
      });

      expect(spy).toHaveBeenCalledOnce();
    });
  });
});
