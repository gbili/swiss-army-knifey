import { expect } from 'chai';
import nock from 'nock';
import {
  get,
  getPHPSESSIDWithoutPathOrEmpty,
  createHeadersOptionWithCookie,
  createHeadersWithPHPSESSID
} from '../../src/utils/node/request';
import { IncomingMessage } from 'http';

// ========================
// Tests for the request (get) function
// ========================
describe('request (HTTP wrapper)', () => {
  // Clean up after each test
  afterEach(() => {
    nock.cleanAll();
  });

  it('should resolve with data and response on a successful GET', async () => {
    const responseBody = 'Hello, world!';
    // Intercept GET requests to the test endpoint
    nock('http://mock.test')
      .get('/test')
      .reply(200, responseBody, {
        // Provide a set-cookie header for later tests
        'set-cookie': ['PHPSESSID=PHP123456; path=/']
      });

    const result = await get('http://mock.test/test');
    expect(result).to.have.property('data', responseBody);
    expect(result).to.have.property('response');
    expect(result.response).to.have.property('headers');
    expect(result.response.headers).to.have.property('set-cookie');
  });

  it('should reject when a connection error occurs', async () => {
    // Simulate a connection error using replyWithError
    nock('http://mock.test')
      .get('/error')
      .replyWithError('Connection failed');

    try {
      await get('http://mock.test/error');
      throw new Error('Expected request to throw an error');
    } catch (err: any) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.include('Connection failed');
    }
  });

  it('should work correctly with POST requests', async () => {
    const postData = 'my post data';
    const responseBody = 'Posted';
    nock('http://mock.test')
      .post('/post', postData)
      .reply(200, responseBody);

    const result = await get('http://mock.test/post', { method: 'POST', data: postData });
    expect(result).to.have.property('data', responseBody);
  });
});

// ========================
// Tests for getPHPSESSIDWithoutPathOrEmpty
// ========================

// Example for getPHPSESSIDWithoutPathOrEmpty test:
describe('getPHPSESSIDWithoutPathOrEmpty', () => {
  it('should return an empty array if no set-cookie header exists', () => {
    // Cast the minimal object as IncomingMessage.
    const fakeResponse = { response: { headers: {} } as IncomingMessage };
    const result = getPHPSESSIDWithoutPathOrEmpty(fakeResponse);
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should return an empty array if set-cookie header is undefined', () => {
    const fakeResponse = {
      response: { headers: { 'set-cookie': undefined } } as IncomingMessage,
    };
    const result = getPHPSESSIDWithoutPathOrEmpty(fakeResponse);
    expect(result).to.be.an('array').that.is.empty;
  });

  it('should extract only PHPSESSID cookies from the set-cookie header', () => {
    const cookies = [
      'PHPSESSID=PHP123456; path=/',
      'OTHER=xxx; path=/'
    ];
    const fakeResponse = {
      response: { headers: { 'set-cookie': cookies } } as IncomingMessage,
    };
    const result = getPHPSESSIDWithoutPathOrEmpty(fakeResponse);
    expect(result).to.deep.equal(['PHPSESSID=PHP123456']);
  });
});


// ========================
// Tests for createHeadersOptionWithCookie
// ========================
describe('createHeadersOptionWithCookie', () => {
  it('should return an object with a Cookie header when a cookie string is provided', () => {
    const cookieStr = 'PHPSESSID=PHP123456';
    const result = createHeadersOptionWithCookie(cookieStr);
    expect(result).to.have.property('headers');
    expect(result.headers).to.deep.equal({ Cookie: cookieStr });
  });

  it('should return an object with empty headers when no cookie string is provided', () => {
    const result = createHeadersOptionWithCookie(undefined);
    expect(result).to.have.property('headers');
    expect(result.headers).to.deep.equal({});
  });
});

// ========================
// Tests for createHeadersWithPHPSESSID (composed function)
// ========================
describe('createHeadersWithPHPSESSID', () => {
  it('should return headers with a Cookie property when a PHPSESSID cookie is present', () => {
    const fakeResponse = {
      response: {
        headers: {
          'set-cookie': [
            'PHPSESSID=PHP123456; path=/',
            'OtherCookie=abc; path=/'
          ]
        }
      } as IncomingMessage
    };
    const result = createHeadersWithPHPSESSID(fakeResponse);
    expect(result).to.have.property('headers');
    expect(result.headers).to.have.property('Cookie', 'PHPSESSID=PHP123456');
  });

  it('should return empty headers when no PHPSESSID cookie is found', () => {
    const fakeResponse = {
      response: {
        headers: {
          'set-cookie': ['OtherCookie=abc; path=/']
        }
      } as IncomingMessage
    };
    const result = createHeadersWithPHPSESSID(fakeResponse);
    expect(result).to.have.property('headers');
    // Since createHeadersOptionWithCookie returns an empty object when given undefined,
    // we expect no Cookie property.
    expect(result.headers).to.deep.equal({});
  });
});
