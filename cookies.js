'use strict';

let ToughCookie = require('tough-cookie');
let WebStorageCookieStore = require('tough-cookie-web-storage-store');

let path = require('path');
let remote = require('remote');

function enable(options) {
  let origin = options ? options.origin : null;
  let cookieStore = new WebStorageCookieStore(global.localStorage);
  let cookieJar = new ToughCookie.CookieJar(cookieStore);

  Object.defineProperty(global.document, 'cookie', {
    enumerable: true,
    configurable: true,
    get() {
      let url = _getLocationString(origin);
      let cookies = cookieJar.getCookiesSync(url);
      return cookies.map(cookie => cookie.cookieString()).join('; ');
    },
    set(cookieString) {
      let url = _getLocationString(origin);
      cookieJar.setCookieSync(cookieString, url);
    },
  });
}

function _getLocationString(origin) {
  let location = global.location;
  if (!origin || location.protocol !== 'file:') {
    return location.toString();
  }

  let app = remote.require('app');
  let appPath = app.getAppPath();
  let relativePath = path.relative(appPath, location.pathname);
  return `${origin}/${relativePath}${location.search}${location.hash}`;
}

function disable() {
  delete global.document.cookie;
}

exports.enable = enable;
exports.disable = disable;