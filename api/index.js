'use strict';

var path    = require('path');
var express = require('express');
var api     = express();
var routes  = require(path.join(__dirname, 'routes'));

/* ====================================================== */

// Auth endpoints
api.put('/register', routes.auth.register);
api.post('/login', routes.auth.login);

/* ====================================================== */

// User endpoints
api.get('/user/:identifier', routes.user.get);
api.get('/user/:id/playlists', routes.user.getPlaylists);
api.get('/user/:id/collaborations', routes.user.getCollaborations);

/* ====================================================== */

// Playlist endpoints
api.get('/playlist/:identifier', routes.playlist.get);
api.put('/playlist', routes.playlist.create);
api.post('/playlist/:id/like/:userId', routes.playlist.like);
api.delete('/playlist/:id', routes.playlist.delete);
api.put('/playlist/:id/track', routes.playlist.addTrack);
api.delete('/playlist/:playlistId/track/:trackId', routes.playlist.removeTrack);

/* ====================================================== */

// Track endpoints
api.get('/track/:id', routes.track.get);
api.post('/track/:id/upvote', routes.track.upvote);
api.post('/track/:id/downvote', routes.track.downvote);
api.put('/track/:id/comment', routes.track.addComment);

/* ====================================================== */

// SoundCloud redirect URI endpoint
api.get('/sc_redirect', routes.soundcloudRedirect);

/* ====================================================== */

// one search endpoint
api.get('/search/:query', routes.search);

/* ====================================================== */

// mp3 streaming endpoints
api.get('/stream/youtube/:videoId', routes.streaming.youtube);
api.get('/stream/soundcloud/:trackId', routes.streaming.soundcloud);
api.get('/stream/spotify/:trackId', routes.streaming.spotify);
api.get('/stream/bandcamp/:trackUrl', routes.streaming.bandcamp);

/* ====================================================== */

module.exports = api;