/**
 * @jsx React.DOM
 */
 'use strict';

var React                = require('react/addons');
var Reflux               = require('reflux');
var Navigation           = require('react-router').Navigation;
var _                    = require('underscore');

var PlaylistActions      = require('../actions/PlaylistActions');
var ViewingPlaylistStore = require('../stores/ViewingPlaylistStore');
var PageControlBar       = require('../components/PageControlBar');
var SearchBar            = require('../components/SearchBar');
var Tracklist            = require('../components/Tracklist');
var PlaylistSidebar      = require('../components/PlaylistSidebar');

var PlaylistPage = React.createClass({

  mixins: [Navigation, React.addons.LinkedStateMixin, Reflux.ListenerMixin],

  propTypes: {
    currentUser: React.PropTypes.object.isRequired,
    userCollaborations: React.PropTypes.array,
    updatePageTitle: React.PropTypes.func.isRequired,
    currentTrack: React.PropTypes.object,
    showContextMenu: React.PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      currentUser: {}
    };
  },

  getInitialState: function() {
    return {
      playlist: {},
      query: ''
    };
  },

  _onViewingPlaylistChange: function(playlist) {
    if ( playlist !== null ) {
      this.setState({
        playlist: playlist
      }, this.props.updatePageTitle(this.state.playlist.title));
    } else {
      this.transitionTo('Playlists');
    }
  },

  componentWillMount: function() {
    PlaylistActions.open(this.props.params.slug.toString(), this._onViewingPlaylistChange);
    this.listenTo(ViewingPlaylistStore, this._onViewingPlaylistChange);
  },

  transitionToTrackSearch: function() {
    this.transitionTo('TrackSearch');
  },

  quitOrDeletePlaylist: function() {
    if ( this.props.currentUser.id === this.state.playlist.userId ) {
      PlaylistActions.delete(this.state.playlist.id, this.props.currentUser.id);
    } else {
      console.log('quit collaborating');
    }
  },

  addTrackToPlaylist: function(playlist, track) {
    PlaylistActions.addTrack(playlist, track);
  },

  removeTrackFromPlaylist: function(track) {
    PlaylistActions.removeTrack(this.state.playlist, track);
  },

  showAddTrackOptions: function(track) {
    return _.map(this.props.userCollaborations, function(playlist, index) {
      return (
        <li key={index} onClick={this.addTrackToPlaylist.bind(null, playlist, track)}>{playlist.title}</li>
      );
    }.bind(this));
  },

  showDeleteOption: function(track) {
    var element = null;

    if ( this.state.playlist.userId === this.props.currentUser.id ) {
      element = (
        <li onClick={this.removeTrackFromPlaylist.bind(null, track)}>
          <i className="fa fa-remove"></i>
          Delete Track
        </li>
      );
    }

    return element;
  },

  showTrackContextMenu: function(track, e) {
    var menuItems = null;

    console.log('show menu for track:', track);

    menuItems = (
      <div>
        <li>
          <i className="fa fa-plus"></i>
          Add Track To Playlist
          <ul>
            {this.showAddTrackOptions(track)}
          </ul>
        </li>
        {this.showDeleteOption(track)}
      </div>
    );

    e.stopPropagation();
    e.preventDefault();

    this.props.showContextMenu(e, menuItems);
  },

  renderPlaylistOptions: function() {
    var element = null;

    if ( this.state.playlist.userId === this.props.currentUser.id ) {
      element = (
        <ul className="playlist-options">
          <li onClick={this.transitionToTrackSearch}>
            <i className="fa fa-plus"></i>
            Add Track
          </li>
          <li onClick={this.quitOrDeletePlaylist}>
            <i className="fa fa-remove"></i>
            Delete Playlist
          </li>
        </ul>
      );
    }

    return element;
  },

  render: function() {
    return (
      <div>

        <section className="content playlist">
          <PageControlBar type="playlist">
            <div className="options-container">
              {this.renderPlaylistOptions()}
            </div>
            <div className="search-container">
              <SearchBar valueLink={this.linkState('query')}
                         onChange={this.updateQuery}
                         placeholder="Search playlist...">
              </SearchBar>
            </div>
          </PageControlBar>
          <Tracklist type="playlist"
                     playlist={this.state.playlist}
                     filter={this.state.query}
                     currentTrack={this.props.currentTrack}
                     showContextMenu={this.showTrackContextMenu}
                     currentUser={this.props.currentUser} />
        </section>

        <nav className="sidebar right">
          <PlaylistSidebar currentUser={this.props.currentUser} playlist={this.state.playlist} />
        </nav>

      </div>
    );
  }

});

module.exports = React.createFactory(PlaylistPage);