'use strict';

const assert = require('assert');
const clear = require('./clear');
const mocha = require('mocha');
const Parse = require('../../node');

const TestObject = Parse.Object.extend('TestObject');

describe('Increment', () => {
  before((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => {
      done();
    });
  });

  it('can increment a field', (done) => {
    let object = new TestObject();
    object.set('score', 1);
    object.save().then(() => {
      object.increment('score');
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('score'), 2);
      done();
    });
  });

  it('can increment on a fresh object', () => {
    let object = new TestObject();
    object.set('score', 1);
    object.increment('score');
    assert.equal(object.get('score'), 2);
  });

  it('can increment by a value', (done) => {
    let object = new TestObject();
    object.set('score', 1);
    object.save().then(() => {
      object.increment('score', 10);
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('score'), 11);
      done();
    });
  });

  it('can increment with negative numbers', (done) => {
    let object = new TestObject();
    object.set('score', 1);
    object.save().then(() => {
      object.increment('score', -1);
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('score'), 0);
      done();
    });
  });

  it('can increment with floats', (done) => {
    let object = new TestObject();
    object.set('score', 1.0);
    object.save().then(() => {
      object.increment('score', 1.5);
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('score'), 2.5);
      done();
    });
  });

  it('increments atomically', (done) => {
    let object = new TestObject();
    object.set('score', 1);
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      object.increment('score');
      o.increment('score');
      return o.save();
    }).then(() => {
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('score'), 3);
      done();
    });
  });

  it('gets a new value back on increment', (done) => {
    let object = new TestObject();
    let objectAgain;
    object.set('score', 1);
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      objectAgain = o;
      assert.equal(o.get('score'), 1);
      object.increment('score');
      assert.equal(object.get('score'), 2);
      return object.save();
    }).then(() => {
      assert.equal(object.get('score'), 2);
      objectAgain.increment('score');
      return objectAgain.save();
    }).then(() => {
      assert.equal(objectAgain.get('score'), 3);
      done();
    });
  });

  it('can combine increment with other updates', (done) => {
    let object = new TestObject();
    object.set('score', 1);
    object.set('name', 'hungry');
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      o.increment('score');
      o.set('name', 'parse');
      return o.save();
    }).then(() => {
      object.increment('score');
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('name'), 'parse');
      assert.equal(o.get('score'), 3);
      done();
    });
  });

  it('does not increment non-numbers', (done) => {
    let object = new TestObject();
    object.set('not_score', 'foo');
    object.save().then(() => {
      try {
        object.increment('not_score');
      } catch (e) {
        done();
      }
    });
  });

  it('can increment on a deleted field', (done) => {
    let object = new TestObject();
    object.set('score', 1);
    object.save().then(() => {
      object.unset('score');
      object.increment('score');
      assert.equal(object.get('score'), 1);
      return object.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('score'), 1);
      done();
    });
  });

  it('can increment with an empty field on a fresh object', (done) => {
    let object = new TestObject();
    object.increment('score');
    object.save().then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      o.get('score', 1);
      done();
    });
  });

  it('can increment with an empty field', () => {
    let object = new TestObject();
    let objectAgain;
    object.save().then(() => {
      object.increment('score');
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      objectAgain = o;
      o.increment('score');
      return object.save();
    }).then(() => {
      return objectAgain.save();
    }).then(() => {
      let query = new Parse.Query(TestObject);
      return query.get(object.id);
    }).then((o) => {
      assert.equal(o.get('score'), 2);
      done();
    });
  });

  it('solidifies the type by incrementing', (done) => {
    let object = new TestObject();
    object.increment('numeric');
    object.save().then(() => {
      object.set('numeric', 'x');
      return object.save();
    }).fail(() => {
      done();
    });
  });
});
