'use strict';

var when     = require('when');
var request  = require('superagent');

var APIUtils = require('./APIUtils');

var awsAPI = {

  uploadUserImage: function(image, userId) {
    var deferred = when.defer();

    request.put(APIUtils.API_ROOT + 'upload/user/' + userId)
      .attach('image', image)
      .end(function(res){
        if ( !res.ok ) {
          deferred.reject(JSON.parse(res.text));
        } else {
          deferred.resolve(APIUtils.normalizeResponse(res));
        }
      });

    return deferred.promise;
  },

  uploadPlaylistImage: function(image, playlistId) {
    var deferred = when.defer();

    request.put(APIUtils.API_ROOT + 'upload/playlist/' + playlistId)
      .attach('image', image)
      .end(function(res){
        if ( !res.ok ) {
          deferred.reject(JSON.parse(res.text));
        } else {
          deferred.resolve(APIUtils.normalizeResponse(res));
        }
      });

    return deferred.promise;
  }

};

module.exports = awsAPI;