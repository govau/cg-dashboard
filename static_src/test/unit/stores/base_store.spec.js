import Immutable from 'immutable';

import BaseStore, { MAX_LISTENERS_THRESHOLD } from '../../../stores/base_store';

describe('BaseStore', () => {
  let sandbox, store;

  beforeEach(() => {
    store = new BaseStore();
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor()', () => {
    it('should set _data to empty list', () => {
      expect(store._data).toEqual(Immutable.List());
    });
  });

  describe('subscribe()', function() {
    it('it should set the dispatch token to an app dispatcher register', function() {});
  });

  describe('get dispatchToken()', function() {
    it('should return the hidden dispatch token', function() {
      const expected = {};

      store._dispatchToken = expected;

      expect(store.dispatchToken).toEqual(expected);
    });
  });

  describe('emitChange()', function() {
    it('should emit an event with string CHANGE', function() {
      const spy = sandbox.spy();

      store.on('CHANGE', spy);

      store.emitChange();

      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('addChangeListener()', function() {
    it('should add a listener on CHANGE with the callback passed', function() {
      const spy = sandbox.spy();

      store.addChangeListener(spy);

      store.emit('CHANGE');

      expect(spy).toHaveBeenCalledOnce();
    });

    it('warns if called more than MAX_LISTENERS_THRESHOLD', function() {
      sinon.stub(console, 'warn');

      for (let i = 1; i <= MAX_LISTENERS_THRESHOLD + 1; i++) {
        store.addChangeListener(() => {});
      }

      expect(console.warn).toHaveBeenCalledOnce();

      console.warn.restore();
    });
  });

  describe('removeChangeListener()', function() {
    it('should remove a listener of type CHANGE with callback passed', function() {
      const spy = sandbox.spy();

      store.addChangeListener(spy);
      store.removeChangeListener(spy);

      store.emit('CHANGE');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('get()', function() {
    it('should get an entity by guid if it exists', function() {
      const expectedGuid = 'adkfjlzcxv',
        expected = { guid: expectedGuid };

      store.push(expected);

      const actual = store.get(expectedGuid);

      expect(actual).toEqual(expected);
    });

    it("should returned undefined if entity with guid it doesn't exist", function() {
      const actual = store.get('adjlfk');

      expect(actual).toBe(undefined);
    });

    it('should return undefined if not guid is passed in', function() {
      store.push({ guid: 'adsf' });

      const actual = store.get();

      expect(actual).toBe(undefined);
    });
  });

  describe('getAll()', function() {
    it('should get all entities if there are some', function() {
      const expected = [{ guid: 'adf' }, { guid: 'adsfjk' }];

      expected.forEach(e => store.push(e));

      const actual = store.getAll();

      expect(actual).toBeTruthy();
      expect(actual.length).toEqual(2);
      expect(actual).toEqual(expected);
    });

    it('should return an empty array if there are no entities', function() {
      const actual = store.getAll();

      expect(actual).toBeEmptyArray();
    });
  });

  describe('push()', function() {
    it('should increment the count when an item is added', function() {
      const initialCount = store.getAll().length;
      store.push({ guid: 'pushtest' });
      const pushedCount = store.getAll().length;

      expect(pushedCount).toEqual(initialCount + 1);
    });

    it('should convert any pushed data to immutable types', function() {
      store.push({ guid: 'pushtest' });
      const pushed = store._data.get(0);

      expect(pushed.asImmutable).toBeDefined();
    });
  });

  describe('dataHasChanged()', function() {
    describe('passed regular JS objects', function() {
      it('should return true if new data is different from _data', function() {
        const oldData = { guid: 'pushtest' };
        const newData = { guid: 'pushtestyetagain' };

        store.push(oldData);

        expect(store.dataHasChanged(newData)).toBe(true);
      });

      it('should return false if the data is the same as _data', function() {
        const oldData = { guid: 'pushtest' };
        const newData = Immutable.fromJS([oldData]);

        store.push(oldData);

        expect(store.dataHasChanged(newData)).toBe(false);
      });
    });

    describe('passed ImmutableJS objects', function() {
      it('should return true if new data is different from _data', function() {
        const oldData = { guid: 'pushtest' };
        const newData = { guid: 'pushtestyetagain' };

        store.push(oldData);

        expect(store.dataHasChanged(newData)).toBe(true);
      });
    });
  });

  describe('delete()', function() {
    it('should remove items that match the guid and call .emitChange()', function() {
      const spy = sandbox.spy(store, 'emitChange');
      const guid = 'deleteFakeGuid';
      store._data = Immutable.fromJS([{ guid }]);

      expect(store.getAll().length).toEqual(1);

      store.delete(guid);

      expect(spy).toHaveBeenCalledOnce();
      expect(store.getAll().length).toEqual(0);
    });

    it('should do nothing if the guid does not match', function() {
      const spy = sandbox.spy(store, 'emitChange');
      const guid = 'deleteFakeGuid';
      store._data = Immutable.fromJS([{ guid }]);

      expect(store.getAll().length).toEqual(1);

      store.delete('nonExistentFakeGuid');

      expect(spy).not.toHaveBeenCalledOnce();
      expect(store.getAll().length).toEqual(1);
    });
  });

  describe('deleteProp', function() {
    const existingEntityA = {
      guid: 'zznbmbz',
      name: 'ea',
      cpu: 34
    };
    const existingEntityB = {
      guid: 'zzlkcxv',
      name: 'eb',
      cpu: 66
    };

    beforeEach(function() {
      store.push(existingEntityA);
      store.push(existingEntityB);
    });

    it('should remove the property that match the guid and prop and call .emitChange()', function() {
      const spy = sandbox.spy(store, 'emitChange');
      const guidA = existingEntityA.guid;
      const guidB = existingEntityB.guid;

      expect(store.getAll().length).toEqual(2);
      expect(store.get(guidB)).toEqual(existingEntityB);
      expect(store.get(guidA)).toEqual(existingEntityA);

      store.deleteProp(guidB, 'cpu');

      expect(spy).toHaveBeenCalledOnce();
      expect(store.getAll().length).toEqual(2);
      expect(store.get(guidB).cpu).toEqual(undefined);
      expect(store.get(guidB).guid).toEqual(existingEntityB.guid);
      expect(store.get(guidB).name).toEqual(existingEntityB.name);
      expect(store.get(guidA)).toEqual(existingEntityA);
    });

    it('should do nothing if the guid does not match', function() {
      const spy = sandbox.spy(store, 'emitChange');
      const guidA = existingEntityA.guid;
      const guidB = existingEntityB.guid;

      expect(store.getAll().length).toEqual(2);
      expect(store.get(guidB)).toEqual(existingEntityB);
      expect(store.get(guidA)).toEqual(existingEntityA);

      store.deleteProp('nonExistentFakeGuid', 'cpu');

      expect(spy).not.toHaveBeenCalledOnce();
      expect(store.getAll().length).toEqual(2);
      expect(store.get(guidB)).toEqual(existingEntityB);
      expect(store.get(guidA)).toEqual(existingEntityA);
    });

    it('should do nothing if the prop does not match but will call emitChange', function() {
      // Currently there's no way to detect in a thread safe way that the deleteIn
      // was successful, so emitChange will be called.
      // There will still be no change though.
      const spy = sandbox.spy(store, 'emitChange');
      const guidA = existingEntityA.guid;
      const guidB = existingEntityB.guid;

      expect(store.getAll().length).toEqual(2);
      expect(store.get(guidB)).toEqual(existingEntityB);
      expect(store.get(guidA)).toEqual(existingEntityA);

      store.deleteProp(guidA, 'ram');

      expect(spy).toHaveBeenCalledOnce();
      expect(store.getAll().length).toEqual(2);
      expect(store.get(guidB)).toEqual(existingEntityB);
      expect(store.get(guidA)).toEqual(existingEntityA);
    });
  });

  describe('merge()', function() {
    const existingEntityA = {
      guid: 'zznbmbz',
      name: 'ea',
      cpu: 34
    };
    const existingEntityB = {
      guid: 'zzlkcxv',
      name: 'eb'
    };

    beforeEach(function() {
      store.push(existingEntityA);
      store.push(existingEntityB);
    });

    it('should call cb with true when data is updated', function() {
      const updateA = {
        guid: existingEntityA.guid,
        name: 'zzz',
        memory: 1024
      };

      store.merge('guid', updateA, changed => {
        expect(changed).toEqual(true);
      });
    });

    it('should call cb with false when no data is updated', function(done) {
      store.merge('guid', existingEntityA, changed => {
        expect(changed).toEqual(false);
        done();
      });
    });

    it('should update a single existing entity with the same guid ', function(
      done
    ) {
      const updateA = {
        guid: existingEntityA.guid,
        name: 'zzz',
        memory: 1024
      };

      store.merge('guid', updateA, () => {
        const updated = store.get(updateA.guid);

        expect(updated).toEqual(Object.assign({}, existingEntityA, updateA));
        expect(store.get(existingEntityB.guid)).toEqual(existingEntityB);

        done();
      });
    });

    it('should update a multiple existing entities with the same guids ', function() {
      const toUpdateA = {
        guid: existingEntityA.guid,
        name: 'ea',
        memory: 1024
      };
      const toUpdateB = {
        guid: existingEntityB.guid,
        name: 'eb',
        memory: 1024
      };

      store.mergeMany('guid', [toUpdateA, toUpdateB], changed => {
        expect(changed).toBeTruthy();

        const updatedA = store.get(toUpdateA.guid);

        expect(updatedA).toEqual(Object.assign({}, existingEntityA, toUpdateA));

        const updatedB = store.get(toUpdateB.guid);

        expect(updatedB).toEqual(Object.assign({}, existingEntityB, toUpdateB));
      });
    });
  });

  describe('mergeAll()', function() {
    const existingEntityA = {
      guid: 'fakeguidone',
      name: 'ea',
      cpu: 34
    };
    const existingEntityB = {
      guid: 'fakeguidtwo',
      name: 'eb'
    };
    const existingEntityC = {
      guid: 'fakeguidthree',
      name: 'eb'
    };

    beforeEach(function() {
      store.push(existingEntityA);
      store.push(existingEntityB);
      store.push(existingEntityC);
    });

    it('should do nothing if there is no match', function() {
      const oldData = Immutable.fromJS(store.getAll());
      const toMerge = {
        guid: 'mergeguid',
        name: 'fakename'
      };

      store.mergeAll('name', toMerge, function(changed) {
        const data = Immutable.fromJS(store.getAll());
        const merged = store.get(toMerge.guid);

        expect(Immutable.is(data, oldData)).toEqual(true);
        expect(merged).toEqual(undefined);
        expect(changed).toEqual(false);
      });
    });

    it('should merge into all matching entities based on the merge key', function() {
      const toMerge = {
        name: 'eb',
        green: true
      };

      store.mergeAll('name', toMerge, function(changed) {
        const first = store.get('fakeguidone');
        const second = store.get('fakeguidtwo');
        const third = store.get('fakeguidthree');

        expect(first.green).toEqual(undefined);
        expect(second.green).toEqual(true);
        expect(third.green).toEqual(true);
        expect(changed).toEqual(true);
      });
    });
  });

  describe('load()', function() {
    describe('when called', function() {
      let spy;

      beforeEach(function(done) {
        spy = sinon.spy();
        store.on('CHANGE', spy);

        // unresolved promise
        const promise = new Promise(function() {});

        store.load([promise]);
        setImmediate(done);
      });

      it('sets loading true', function() {
        expect(store.loading).toBe(true);
      });

      it('emits change', function() {
        expect(spy).toHaveBeenCalledOnce();
      });
    });

    describe('when request is resolved', function() {
      let request, spy;

      beforeEach(function(done) {
        spy = sinon.spy();
        store.on('CHANGE', spy);

        const promise = new Promise(function(resolve, reject) {
          request = { resolve, reject };
        });

        store.load([promise]);
        request.resolve();
        setImmediate(done);
      });

      it('sets loading false', function() {
        expect(store.loading).toBe(false);
      });

      it('emits change', function() {
        expect(spy).toHaveBeenCalledTwice();
      });
    });
  });
});
