'use strict';

var $                    = require('jquery');
var _                    = require('lodash');
var notifier             = require('../utils/Notifier');

var CurrentTrackStore    = require('../stores/CurrentTrackStore');
var TrackActions         = require('../actions/TrackActions');
var CurrentPlaylistStore = require('../stores/CurrentPlaylistStore');
var APIUtils             = require('../utils/APIUtils');

var PlayerControlsMixin = {

  playedIndices: [],

  getInitialState: function() {
    return {
      queue: [],
      index: -1,
      repeat: false,
      shuffle: false,
      volume: 0.7,
      time: 0,
      paused: true,
      audio: new Audio(),
      track: null
    };
  },

  componentDidMount: function() {
    $(document).keydown(this.handleGlobalKeyPress);
    this.listenTo(CurrentTrackStore, this.selectTrack);
    this.listenTo(CurrentPlaylistStore, this.selectPlaylist);
    this.addTrackListeners();
  },

  componentWillUnmount: function() {
    this.removeTrackListeners();
    this.state.audio.pause();
    this.state.audio.setAttribute('src', '');
  },

  handleGlobalKeyPress: function(evt) {
    var keyCode = evt.keyCode || evt.which;
    var isInInput = ($('input').is(':focus')) && !($('textarea').is(':focus'));
    var isControlKey = (keyCode === 32 || keyCode === 37 || keyCode === 39);

    // Only use global actions if user isn't in an input or textarea
    if ( !isInInput && isControlKey ) {
      evt.stopPropagation();
      evt.preventDefault();

      switch( keyCode ) {
        case 32: // Space bar
          this.togglePlay();
          break;
        case 37: // Left arrow
          this.lastTrack();
          break;
        case 39: // Right arrow
          this.nextTrack();
          break;
      }
    }
  },

  addTrackListeners: function() {
    this.state.audio.volume = this.state.volume;
    this.state.audio.addEventListener('timeupdate', this.updateProgress);
    this.state.audio.addEventListener('ended', this.nextTrack);
  },

  removeTrackListeners: function() {
    this.state.audio.removeEventListener('timeupdate', this.updateProgress);
    this.state.audio.removeEventListener('ended', this.nextTrack);
  },

  updateProgress: function() {
    this.setState({ time: this.state.audio.currentTime });
  },

  seekTrack: function(newTime) {
    this.setState({ time: newTime }, function() {
      this.state.audio.currentTime = newTime;
    }.bind(this));
  },

  updateVolume: function(newVolume) {
    this.setState({ volume: newVolume }, function() {
      this.state.audio.volume = this.state.volume;
    });
  },

  getRandomTrackIndex: function() {
    var index = Math.floor((Math.random() * this.state.playlist.tracks.length - 1) + 1);

    // Recurse until we're not playing the same or last track
    if ( index === this.state.index || index === this.playedIndices[this.playedIndices.length - 1] ) {
      return this.getRandomTrackIndex();
    }

    return index;
  },

  getLastTrackIndex: function() {
    var index = this.playedIndices.pop();
    var atTopOfPlaylist = this.state.index - 1 < 0;

    if ( typeof index === undefined ) {
      if ( atTopOfPlaylist ) {
        index = this.state.repeat ? this.state.playlist.tracks.length - 1 : -1;
      } else {
        index = null;
      }
    }

    return index;
  },

  getNextTrackIndex: function() {
    var index = null;

    if ( this.state.shuffle && !this.state.trackQueued ) {
      // Only loop back if user has 'repeat' toggled
      if ( this.state.repeat ) {
        index = this.getRandomTrackIndex();
      } else {
        index = ( this.playedIndices.length < this.state.playlist.tracks.length ) ? this.getRandomTrackIndex() : null;
      }
    } else {
      index = this.state.index + 1;

      // Only loop back if user has 'repeat' toggled
      if ( index > this.state.playlist.tracks.length - 1 ) {
        if ( this.state.repeat ) {
          index = 0;
        } else {
          index = null;
        }
      }
    }

    return index;
  },

  transitionToNewTrack: function() {
    if ( this.state.track ) {
      this.state.audio.setAttribute('src', APIUtils.getStreamUrl(this.state.track));

      notifier.notify(this.state.track.title, this.state.track.artist, this.state.track.imageUrl);
    }

    this.playTrack();
  },

  lastTrack: function() {
    var newIndex;

    // If past the beginning of a song, just rewind
    if ( this.state.audio.currentTime > 20 ) {
      this.state.audio.currentTime = 0;
    } else {
      newIndex = this.getLastTrackIndex();

      this.pauseTrack();

      this.setState({
        track: ( newIndex !== null ) ? this.state.playlist.tracks[newIndex] : null,
        index: ( newIndex !== null ) ? newIndex : -1
      }, this.transitionToNewTrack);
    }
  },

  nextTrack: function() {
    var newIndex = this.getNextTrackIndex();
    var newTrack = null;
    var queueCopy;

    this.pauseTrack();

    if ( this.state.queue.length ) {
      queueCopy = this.state.queue.slice();
      newTrack = queueCopy.pop();
      newIndex = this.state.index;
      this.setState({
        queue: queueCopy
      });
    } else if ( newIndex === null ) {
      newIndex = -1;
      this.state.audio.setAttribute('src', '');
    } else {
      newTrack = this.state.playlist.tracks[newIndex];
    }

    TrackActions.select(newTrack, newIndex);
  },

  selectTrack: function(track, index) {
    this.playedIndices.push(this.state.index);

    this.pauseTrack();

    this.setState({
      track: track,
      index: index,
      time: 0
    }, this.transitionToNewTrack);
  },

  selectPlaylist: function(newPlaylist, cb) {
    var isSamePlaylist = this.state.playlist && this.state.playlist.id === newPlaylist.id;

    cb = cb || function() {};

    // Ensure structure is correct
    if ( !newPlaylist.tracks ) {
      newPlaylist = {
        tracks: newPlaylist
      };
    }

    this.setState({
      playlist: newPlaylist,
      index: isSamePlaylist ? this.state.index : -1
    }, function() {
      this.playedIndices = [];

      cb();
    });
  },

  queueTrack: function(track) {
    var queueCopy = this.state.queue.slice();

    queueCopy.push(track);

    this.setState({ queue: queueCopy });
  },

  pauseTrack: function() {
    if ( this.state.track ) {
      this.setState({ paused: true }, function() {
        this.state.audio.pause();
      }.bind(this));
    }
  },

  playTrack: function() {
    if ( this.state.track ) {
      this.setState({ paused: false }, function() {
        this.state.audio.play();
      }.bind(this));
    }
  },

  togglePlay: function() {
    if ( !this.state.track && !_.isEmpty(this.state.playlist) ) {
      this.nextTrack();
    }

    if ( this.state.paused ) {
      this.playTrack();
    } else {
      this.pauseTrack();
    }
  },

  toggleRepeat: function() {
    this.setState({ repeat: !this.state.repeat });
  },

  toggleShuffle: function() {
    this.setState({ shuffle: !this.state.shuffle });
  }

};

module.exports = PlayerControlsMixin;