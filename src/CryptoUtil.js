const crypto = require('crypto');

module.exports = class CryptoUtil {
  static async md5(text) {
    const hash = crypto.createHash('md5');
    hash.update(text)
    return hash.digest('hex')
  }
  static async sha1(text) {
    const hash = crypto.createHash('sha1');
    hash.update(text)
    return hash.digest('hex')
  }
  static async sha256(text) {
    const hash = crypto.createHash('sha256');
    hash.update(text)
    return hash.digest('hex')
  }
  static async sha512(text) {
    const hash = crypto.createHash('sha512');
    hash.update(text)
    return hash.digest('hex')
  }
}
