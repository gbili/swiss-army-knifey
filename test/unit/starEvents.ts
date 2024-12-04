import sinon from 'sinon';
import createEventEmitter from '../../src/utils/starEvents';
import { expect } from 'chai';

describe('createEventEmitter', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should subscribe to and emit events', () => {
    const emitter = createEventEmitter();
    const callback = sinon.spy();

    emitter.on('test', callback);
    emitter.emit('test', 'hello');

    expect(callback.calledWith('hello')).to.be.true;
  });

  it('should handle star (*) events', () => {
    const emitter = createEventEmitter();
    const starCallback = sinon.spy();
    const regularCallback = sinon.spy();

    emitter.on('*', starCallback);
    emitter.on('test', regularCallback);
    emitter.emit('test', 'data');

    expect(starCallback.calledWith('data')).to.be.true;
    expect(regularCallback.calledWith('data')).to.be.true;
  });

  it('should unsubscribe from events', () => {
    const emitter = createEventEmitter();
    const callback = sinon.spy();

    emitter.on('test', callback);
    emitter.off('test', callback);
    emitter.emit('test', 'data');

    expect(callback.called).to.be.false;
  });

  it('should handle errors in event handlers', () => {
    const consoleError = sandbox.stub(console, 'error');
    const emitter = createEventEmitter();
    const errorCallback = () => {
      throw new Error('Test error');
    };

    emitter.on('test', errorCallback);
    emitter.emit('test');

    expect(consoleError.called).to.be.true;
  });

  it('should maintain separate subscriber lists for different events', () => {
    const emitter = createEventEmitter();
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();

    emitter.on('event1', callback1);
    emitter.on('event2', callback2);
    emitter.emit('event1', 'data1');

    expect(callback1.calledWith('data1')).to.be.true;
    expect(callback2.called).to.be.false;
  });

  it('should allow multiple subscribers for the same event', () => {
    const emitter = createEventEmitter();
    const callback1 = sinon.spy();
    const callback2 = sinon.spy();

    emitter.on('test', callback1);
    emitter.on('test', callback2);
    emitter.emit('test', 'data');

    expect(callback1.calledWith('data')).to.be.true;
    expect(callback2.calledWith('data')).to.be.true;
  });
});