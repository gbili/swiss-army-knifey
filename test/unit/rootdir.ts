import { expect } from 'chai';
import { getRootDir } from '../../src/node';

describe('getRootDir', function () {
  describe(`getRootDir(__dirname)`, function() {
    const projectName = "swiss-army-knifey";
    it(`should return a path with ${projectName} at the end`, async function() {
      const rootDir = getRootDir(__dirname);
      expect(rootDir.substring(rootDir.length - projectName.length)).to.equal(projectName);
    });
  });
});

