import { expect } from 'chai';
import { stringify } from 'querystring';
import { couldDownload, createHeadersWithPHPSESSID, get, getPHPSESSIDWithoutPathOrEmpty } from '../../src/utils/node/request';

describe('request', function () {
  describe(`couldDownload`, function() {
    it(`should return success: true on good link`, async function() {
      const res = couldDownload('https://mirrors.layeronline.com/linuxmint/stable/20.3/linuxmint-20.3-cinnamon-64bit.iso');
      expect(res).to.eventually.has.property('success', true);
    });
    it(`should throw on bad link`, async function() {
      const res = couldDownload('https://mirrors.layeronline.com/linuxmint/stable/20.3/____________BAD_LINK_________.iso');
      console.log(res);
      expect(res).to.eventually.be.rejectedWith('Unsupported code or Error code 404');
    });
  });

  describe(`get`, function() {
    it(`should return data: with account info on good link`, async function() {
      const args = {
        func: 'Authenticate',
        u: '32411',
        p: '32411PAGE',
      };
      const uri = 'https://bibliogateway.meow.ch?' + stringify(args);
      const res = get(uri);
      expect(res).to.eventually.has.property('data', '{"result":{"Authenticate":{"firstName":"Guillermo","lastName":"Pages","displayName":"Pages Guillermo","freeOne":"12.07.2019","addressId":"4216","mail":"g@lespagesweb.ch","mobilePhone":"079\\/256.39.12","privatePhone":"","officePhone":"","id":"102225","login":"32411","origin":"BBR"}}}');
    });
  });

  describe(`getPHPSESSIDWithoutPathOrEmpty`, function() {
    it(`should return a phpsessid`, async function() {
      const args = {
        func: 'Authenticate',
        u: '32411',
        p: '32411PAGE',
      };
      const uri = 'https://bibliogateway.meow.ch?' + stringify(args);
      const res = await get(uri);
      expect(getPHPSESSIDWithoutPathOrEmpty(res).length).to.equal(1);
    });
  });

  describe(`createHeadersWithPHPSESSID`, async function() {

    it(`should return an object with headers property`, async function() {
      const args = {
        func: 'Authenticate',
        u: '32411',
        p: '32411PAGE',
      };
      const uri = 'https://bibliogateway.meow.ch?' + stringify(args);
      const res = await get(uri);
      expect(createHeadersWithPHPSESSID(res)).to.have.property('headers');
    });

    it(`should return an object with headers and Cookie property`, async function() {
      const args = {
        func: 'Authenticate',
        u: '32411',
        p: '32411PAGE',
      };
      const uri = 'https://bibliogateway.meow.ch?' + stringify(args);
      const res = await get(uri);
      expect(createHeadersWithPHPSESSID(res).headers).to.have.property('Cookie');
    });

    it(`should return an object with headers anc Cookie with a string value`, async function() {
      const args = {
        func: 'Authenticate',
        u: '32411',
        p: '32411PAGE',
      };
      const uri = 'https://bibliogateway.meow.ch?' + stringify(args);
      const res = await get(uri);
      expect(typeof createHeadersWithPHPSESSID(res).headers.Cookie).to.be.equal('string');
    });

    it(`should return an object with headers anc Cookie with a string value starting with PHP`, async function() {
      const args = {
        func: 'Authenticate',
        u: '32411',
        p: '32411PAGE',
      };
      const uri = 'https://bibliogateway.meow.ch?' + stringify(args);
      const res = await get(uri);
      expect(createHeadersWithPHPSESSID(res).headers.Cookie?.substring(0,3)).to.be.equal('PHP');
    });

  });

});
