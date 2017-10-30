import { trackAction, trackPageView } from '../../../util/analytics';

describe('analytics helpers', function() {
  describe('with GA loaded and on production', function() {
    let sandbox;
    const window = window || global;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      window.ga = function() {};
    });

    afterEach(() => {
      sandbox.restore();
      delete window.ga;
    });

    it('should track action with event', function() {
      const action = {
        source: 'test-source',
        type: 'test-type'
      };
      const expected = {
        hitType: 'event',
        eventCategory: action.source,
        eventAction: action.type
      };
      const spy = sandbox.spy(window, 'ga');

      trackAction(action);

      expect(spy).toHaveBeenCalledWith('send', expected);
    });

    it('should track page view with event', function() {
      const url = 'fake/url/for/testing';
      const expected = {
        hitType: 'pageview',
        page: url
      };
      const spy = sandbox.spy(window, 'ga');

      trackPageView(url);

      expect(spy).toHaveBeenCalledWith('send', expected);
    });
  });
});
