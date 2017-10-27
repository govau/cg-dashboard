import AppDispatcher from '../../../dispatcher';
import {
  assertAction,
  setupViewSpy,
  setupUISpy,
  setupServerSpy,
  wrapInRes
} from '../helpers';
import cfApi from '../../../util/cf_api';
import spaceActions from '../../../actions/space_actions';
import { spaceActionTypes } from '../../../constants';

describe('spaceActions', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('fetch()', () => {
    let expectedSpace,
      dispatcherSpy,
      fetchSpaceStub,
      receivedSpaceStub,
      expectedGuid;

    beforeEach(function(done) {
      dispatcherSpy = setupViewSpy(sandbox);
      fetchSpaceStub = sandbox
        .stub(cfApi, 'fetchSpace')
        .returns(Promise.resolve(expectedSpace));
      receivedSpaceStub = sandbox.stub(spaceActions, 'receivedSpace');
      expectedGuid = 'abc1';
      expectedSpace = { guid: expectedGuid };
      spaceActions.fetch(expectedGuid).then(done, done.fail);
    });

    it('dispatches SPACE_FETCH action', function() {
      const [action] = dispatcherSpy.getCall(0).args;

      expect(dispatcherSpy).toHaveBeenCalledOnce();
      expect(action.type).toBe(spaceActionTypes.SPACE_FETCH);
    });

    it('calls api method once', function() {
      expect(fetchSpaceStub).toHaveBeenCalledOnce();
    });

    it('calls api with the guid', function() {
      expect(fetchSpaceStub).toHaveBeenCalledWith(expectedGuid);
    });

    it('calls the receivedSpace action creator', function() {
      expect(receivedSpaceStub).toHaveBeenCalledWith(expectedSpace);
    });
  });

  describe('fetchAll()', () => {
    it('should dispatch a view event to fetch all spaces', () => {
      const spy = setupViewSpy(sandbox);
      const receivedSpaceStub = sandbox.stub(spaceActions, 'receivedSpace');

      spaceActions.fetchAll();

      const arg = spy.getCall(0).args[0];

      expect(arg.type).toEqual(spaceActionTypes.SPACES_FETCH);
    });
  });

  describe('fetchAllForOrg()', () => {
    it('should dispatch a view event to fetch all spaces for org', () => {
      const spy = setupViewSpy(sandbox);

      spaceActions.fetchAllForOrg('sdf');

      expect(spy).toHaveBeenCalledOnce();
      const arg = spy.getCall(0).args[0];

      expect(arg.type).toEqual(spaceActionTypes.SPACES_FOR_ORG_FETCH);
    });
  });

  describe('receivedSpace()', () => {
    it('should dispatch server event of type space received', () => {
      let expected = { guid: 'asdf' },
        spy = setupServerSpy(sandbox),
        expectedParams = {
          space: expected
        };

      spaceActions.receivedSpace(expected);

      assertAction(spy, spaceActionTypes.SPACE_RECEIVED, expectedParams);
    });
  });

  describe('receivedSpaces()', () => {
    it('should dispatch a server event for all spaces received', () => {
      const expected = wrapInRes([{ guid: 'fake-guid-one' }]);
      const expectedParams = false;
      const spy = setupServerSpy(sandbox);

      spaceActions.receivedSpaces(expected);

      const args = spy.getCall(0).args[0];
      const { type, spaces } = args;

      expect(type).toEqual(spaceActionTypes.SPACES_RECEIVED);
      expect(spaces).toEqual(expected);
    });
  });

  describe('changeCurrentSpace()', function() {
    it('should dispatch a ui even of type current space changed', function() {
      const expected = 'asdf';
      const spy = setupUISpy(sandbox);
      const expectedParams = {
        spaceGuid: expected
      };

      spaceActions.changeCurrentSpace(expected);

      assertAction(spy, spaceActionTypes.SPACE_CHANGE_CURRENT, expectedParams);
    });
  });
});
