'use strict';

import {camel}    from 'change-case';
import request    from 'superagent';
import _          from 'lodash';

var APIUtils = {

  root: 'http://localhost:3000/v1/',

  getStreamUrl(track) {
    return this.root + 'stream/' + track.source + '/' + encodeURIComponent(track.sourceParam);
  },

  normalizeResponse(response) {
    let returnObj = {};

    _.forOwn(response, (value, key) => {
      returnObj[camel(key)] = value;
    });

    return returnObj;
  },

  get(path) {
    return new Promise((resolve, reject) => {
      request.get(this.root + path)
      .withCredentials()
      .end(res => {
        if ( !res.ok ) {
          reject(this.normalizeResponse(res));
        } else {
          resolve(this.normalizeResponse(res));
        }
      });
    });
  },

  post(path, body) {
    return new Promise((resolve, reject) => {
      request.post(this.root + path, body)
      .withCredentials()
      .end(res => {
        if ( !res.ok ) {
          reject(this.normalizeResponse(res));
        } else {
          resolve(this.normalizeResponse(res));
        }
      });
    });
  },

  patch(path, body) {
    return new Promise((resolve, reject) => {
      request.patch(this.root + path, body)
      .withCredentials()
      .end(res => {
        if ( !res.ok ) {
          reject(this.normalizeResponse(res));
        } else {
          resolve(this.normalizeResponse(res));
        }
      });
    });
  },

  put(path, body) {
    return new Promise((resolve, reject) => {
      request.put(this.root + path, body)
      .withCredentials()
      .end(res => {
        if ( !res.ok ) {
          reject(this.normalizeResponse(res));
        } else {
          resolve(this.normalizeResponse(res));
        }
      });
    });
  },

  del(path) {
    return new Promise((resolve, reject) => {
      request.del(this.root + path)
      .withCredentials()
      .end(res => {
        if ( !res.ok ) {
          reject(this.normalizeResponse(res));
        } else {
          resolve(this.normalizeResponse(res));
        }
      });
    });
  }

};

export default APIUtils;