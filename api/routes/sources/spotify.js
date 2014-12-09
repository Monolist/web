'use strict';

var when    = require('when');
var request = require('request');
var _       = require('lodash');

/* ====================================================== */

exports.search = function(query, limit) {

  var mainDeferred = when.defer();

  var getSearchResults = function(searchQuery) {
    var deferred = when.defer();
    var searchUrl = 'https://api.spotify.com/v1/search?q=';
    var searchResults;

    searchQuery = searchQuery.replace(/(%20)|( )/gi, '+');

    searchUrl += searchQuery;
    searchUrl += '&type=track';
    searchUrl += '&limit=' + limit;

    request(searchUrl, function(err, response, body) {
      if ( err ) {
        deferred.reject(err);
      } else {
        // convert from string to JSON
        body = JSON.parse(body);

        if ( body.tracks ) {
          // process each search result
          searchResults = _.map(body.tracks.items, function(item) {
            return {
              source: 'spotify',
              title: item.name,
              album: item.album ? item.album.name : null,
              artist: (item.artists && item.artists[0]) ? item.artists[0].name : null,
              imageUrl: (item.album && item.album.images[0]) ? item.album.images[0].url : null,
              id: item.id,
              uri: item.uri
            };
          });
        }

        deferred.resolve(searchResults);
      }
    });

    return deferred.promise;
  };

  getSearchResults(query).then(function(results) {
    mainDeferred.resolve(results);
  }, function(err) {
    mainDeferred.reject(err);
  });

  return mainDeferred.promise;

};

/* ====================================================== */

exports.stream = function(req, res) {

  res.status(200).send('Spotify track ID: ' + req.params.trackId);

};