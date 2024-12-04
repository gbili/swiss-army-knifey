import { expect } from 'chai';
import sinon from 'sinon';
import { createLogger, LoggerEnvironment } from '../../src/utils/logger';
import { dateToString } from '../../src';

describe('Logger', () => {
  let sandbox: sinon.SinonSandbox;
  let consoleLog: sinon.SinonSpy;
  let consoleWarn: sinon.SinonSpy;
  let consoleError: sinon.SinonSpy;
  let clock: sinon.SinonFakeTimers;
  const TEST_DATE = new Date('2023-01-01T00:00:00.000Z');
  const TEST_DATE_STRING = dateToString(TEST_DATE);

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clock = sandbox.useFakeTimers(TEST_DATE.getTime());
    consoleLog = sandbox.spy(console, 'log');
    consoleWarn = sandbox.spy(console, 'warn');
    consoleError = sandbox.spy(console, 'error');
  });

  afterEach(() => {
    clock.restore();
    sandbox.restore();
  });

  describe('with default environment (all enabled)', () => {
    it('should log info messages with correct timestamp', () => {
      const logger = createLogger();
      logger.info('test message');
      expect(consoleLog.calledWith(`[${TEST_DATE_STRING}]`, '[INFO]', 'test message')).to.be.true;
    });

    it('should log warnings with correct timestamp', () => {
      const logger = createLogger();
      logger.warn('warning message');
      expect(consoleWarn.calledWith(`[${TEST_DATE_STRING}]`, '[WARN]', 'warning message')).to.be.true;
    });

    it('should log errors with correct timestamp', () => {
      const logger = createLogger();
      const error = new Error('test error');
      logger.error('error message', error);
      expect(consoleError.calledWith(`[${TEST_DATE_STRING}]`, '[ERROR]', 'error message', error)).to.be.true;
    });

    it('should update timestamp as time progresses', () => {
      const logger = createLogger();
      logger.info('first message');
      expect(consoleLog.firstCall.args[0]).to.equal(`[${TEST_DATE_STRING}]`);

      // Advance time by 1 second
      clock.tick(1000);
      const nextDate = dateToString(new Date('2023-01-01T00:00:01.000Z'));

      logger.info('second message');
      expect(consoleLog.secondCall.args[0]).to.equal(`[${nextDate}]`);
    });
  });

  describe('with debug disabled', () => {
    const env: LoggerEnvironment = {
      LOGGER_DEBUG: false,
      LOGGER_LOG: true
    };

    it('should not log info messages', () => {
      const logger = createLogger(env);
      logger.info('test message');
      expect(consoleLog.called).to.be.false;
    });

    it('should still log warnings', () => {
      const logger = createLogger(env);
      logger.warn('warning message');
      expect(consoleWarn.called).to.be.true;
    });

    it('should still log errors', () => {
      const logger = createLogger(env);
      logger.error('error message');
      expect(consoleError.called).to.be.true;
    });
  });

  describe('with all logging disabled', () => {
    const env: LoggerEnvironment = {
      LOGGER_DEBUG: false,
      LOGGER_LOG: false
    };

    it('should not log any messages', () => {
      const logger = createLogger(env);
      logger.info('test message');
      logger.warn('warning message');
      logger.error('error message');

      expect(consoleLog.called).to.be.false;
      expect(consoleWarn.called).to.be.false;
      expect(consoleError.called).to.be.false;
    });
  });
});