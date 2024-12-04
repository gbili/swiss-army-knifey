import { expect } from "chai";
import { SinonSpy } from "sinon";
import { createSubscribers } from "../../src/utils/starEvents";
import sinon from "sinon";
import { Logger } from "../../src/utils/logger";

describe('Subscribers', () => {
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

  it('should log when adding a subscriber', () => {
    const subscribers = createSubscribers(logger);
    const callback = () => {};

    subscribers.add('test', callback);
    expect(logger.info.calledWith('Added subscriber for event "test"')).to.be.true;
  });

  it('should log when removing a subscriber', () => {
    const subscribers = createSubscribers(logger);
    const callback = () => {};

    subscribers.add('test', callback);
    subscribers.remove('test', callback);

    expect(logger.info.calledWith('Removed subscriber for event "test"')).to.be.true;
  });

  it('should log when removing last subscriber', () => {
    const subscribers = createSubscribers(logger);
    const callback = () => {};

    subscribers.add('test', callback);
    subscribers.remove('test', callback);

    expect(logger.info.calledWith('All subscribers removed for event "test"')).to.be.true;
  });

  it('should log when deleting all subscribers for an event', () => {
    const subscribers = createSubscribers(logger);
    const callback = () => {};

    subscribers.add('test', callback);
    subscribers.delete('test');

    expect(logger.info.calledWith('Deleted all subscribers for event "test"')).to.be.true;
  });

  it('should log when clearing all subscribers', () => {
    const subscribers = createSubscribers(logger);
    const callback = () => {};

    subscribers.add('test', callback);
    subscribers.clear();

    expect(logger.info.calledWith('Cleared all subscribers')).to.be.true;
  });

  it('should not log when removing non-existent subscriber', () => {
    const subscribers = createSubscribers(logger);
    const callback = () => {};

    subscribers.remove('test', callback);
    expect(logger.info.called).to.be.false;
  });

  it('should not log when deleting non-existent event', () => {
    const subscribers = createSubscribers(logger);
    subscribers.delete('test');
    expect(logger.info.called).to.be.false;
  });
});