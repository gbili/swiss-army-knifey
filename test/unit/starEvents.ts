import sinon, { SinonSpy } from 'sinon';
import createEventEmitter from '../../src/utils/starEvents';
import { expect } from 'chai';
import { Logger } from '../../src/utils/logger';

describe('createEventEmitter', () => {
  let sandbox: sinon.SinonSandbox;
  let logger: Logger & {
    log: SinonSpy;
    debug: SinonSpy;
    info: SinonSpy;
    warn: SinonSpy;
    error: SinonSpy;
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    logger = {
      log: sandbox.spy(),
      debug: sandbox.spy(),
      info: sandbox.spy(),
      warn: sandbox.spy(),
      error: sandbox.spy()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should subscribe to and emit events', () => {
    const emitter = createEventEmitter({ logger });
    const callback = sinon.spy();

    emitter.on('test', callback);
    emitter.emit('test', 'hello');

    expect(callback.calledWith('hello')).to.be.true;
    expect(logger.info.calledWith('Added subscriber for event "test"')).to.be.true;
  });

  it('should handle star (*) events', () => {
    const emitter = createEventEmitter({ logger });
    const starCallback = sinon.spy();
    const regularCallback = sinon.spy();

    emitter.on('*', starCallback);
    emitter.on('test', regularCallback);
    emitter.emit('test', 'data');

    expect(starCallback.calledWith('data')).to.be.true;
    expect(regularCallback.calledWith('data')).to.be.true;
  });

  it('should prevent emitting wildcard events directly', () => {
    const emitter = createEventEmitter({ logger });
    expect(() => emitter.emit('*', 'data')).to.throw('Cannot emit wildcard (*) event directly');
  });

  it('should unsubscribe from events', () => {
    const emitter = createEventEmitter({ logger });
    const callback = sinon.spy();

    emitter.on('test', callback);
    emitter.off('test', callback);
    emitter.emit('test', 'data');

    expect(callback.called).to.be.false;
    expect(logger.info.calledWith('Removed subscriber for event "test"')).to.be.true;
  });

  it('should remove all subscribers for an event', () => {
    const emitter = createEventEmitter({ logger });
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();

    emitter.on('test', callback1);
    emitter.on('test', callback2);
    emitter.offAll('test');
    emitter.emit('test', 'data');

    expect(callback1.called).to.be.false;
    expect(callback2.called).to.be.false;
    expect(logger.info.calledWith('Deleted all subscribers for event "test"')).to.be.true;
  });

  it('should handle errors in event handlers', () => {
    const emitter = createEventEmitter({ logger });
    const error = new Error('Test error');
    const errorCallback = () => { throw error; };

    emitter.on('test', errorCallback);
    emitter.emit('test');

    expect(logger.error.calledWith(
      'Error in subscriber #1 for event "test":',
      error
    )).to.be.true;
  });

  it('should maintain separate subscriber lists for different events', () => {
    const emitter = createEventEmitter({ logger });
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();

    emitter.on('event1', callback1);
    emitter.on('event2', callback2);
    emitter.emit('event1', 'data1');

    expect(callback1.calledWith('data1')).to.be.true;
    expect(callback2.called).to.be.false;
  });

  it('should allow multiple subscribers for the same event', () => {
    const emitter = createEventEmitter({ logger });
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();

    emitter.on('test', callback1);
    emitter.on('test', callback2);
    emitter.emit('test', 'data');

    expect(callback1.calledWith('data')).to.be.true;
    expect(callback2.calledWith('data')).to.be.true;
  });
});