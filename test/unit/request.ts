import { expect } from 'chai';
import { couldDownload } from '../../src/utils/request';

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
});
