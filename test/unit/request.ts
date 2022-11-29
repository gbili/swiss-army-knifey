import { expect } from 'chai';
import { stringify } from 'querystring';
import { couldDownload, get } from '../../src/utils/request';

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
});
