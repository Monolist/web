/**
 * @jsx React.DOM
 */
 'use strict';

var React                 = require('react/addons');
var Reflux                = require('reflux');
var Navigation            = require('react-router').Navigation;
var _                     = require('lodash');

var PlaylistActions       = require('../actions/PlaylistActions');
var ViewingPlaylistStore  = require('../stores/ViewingPlaylistStore');
var LayeredComponentMixin = require('../mixins/LayeredComponentMixin');
var DocumentTitle         = require('../components/DocumentTitle');
var Modal                 = require('../components/modal');
var PageControlBar        = require('../components/PageControlBar');
var SearchBar             = require('../components/SearchBar');
var Tracklist             = require('../components/Tracklist');
var PlaylistSidebar       = require('../components/PlaylistSidebar');

var PlaylistPage = React.createClass({

  mixins: [Navigation, React.addons.LinkedStateMixin, Reflux.ListenerMixin, LayeredComponentMixin],

  propTypes: {
    currentUser: React.PropTypes.object.isRequired,
    userCollaborations: React.PropTypes.array,
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
      query: '',
      showModal: false
    };
  },

  _onViewingPlaylistChange: function(playlist) {
    if ( playlist !== null ) {
      this.setState({ playlist: playlist });
    } else {
      this.transitionTo('Playlists');
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if ( nextProps.params.slug !== this.props.params.slug ) {
      PlaylistActions.open(nextProps.params.slug.toString(), this._onViewingPlaylistChange);
    }
  },

  componentWillMount: function() {
    PlaylistActions.open(this.props.params.slug.toString(), this._onViewingPlaylistChange);
    this.listenTo(ViewingPlaylistStore, this._onViewingPlaylistChange);
  },

  toggleModal: function() {
    this.setState({ showModal: !this.state.showModal });
  },

  userIsCollaborator: function() {
    var isCreator = !_.isEmpty(this.props.currentUser) && this.state.playlist.userId === this.props.currentUser.id;
    var isCollaborator = !!_.where(this.state.playlist.collaborations, { userId: this.props.currentUser.id }).length;

    return isCreator || isCollaborator;
  },

  transitionToTrackSearch: function() {
    this.transitionTo('TrackSearch');
  },

  addCollaborator: function() {
    console.log('add Collaborator');
  },

  quitOrDeletePlaylist: function() {
    if ( !_.isEmpty(this.props.currentUser) && this.props.currentUser.id === this.state.playlist.userId ) {
      PlaylistActions.delete(this.state.playlist.id, this.props.currentUser.id);
    } else {
      console.log('quit collaborating');
    }
  },

  getPossiblePlaylists: function() {
    return _.reject(this.props.userCollaborations, function(playlist) {
      return playlist.id === this.state.playlist.id;
    }.bind(this));
  },

  addTrackToPlaylist: function(playlist, track) {
    PlaylistActions.addTrack(playlist, track);
  },

  removeTrackFromPlaylist: function(track) {
    PlaylistActions.removeTrack(this.state.playlist, track);
  },

  renderPossiblePlaylists: function(playlists, track) {
    return _.map(playlists, function(playlist, index) {
      return (
        <li key={index} onClick={this.addTrackToPlaylist.bind(null, playlist, track)}>{playlist.title}</li>
      );
    }.bind(this));
  },

  renderAddTrackOption: function(track) {
    var element = null;
    var otherPlaylistOptions = this.getPossiblePlaylists();

    if ( !!otherPlaylistOptions.length ) {
      element = (
        <li>
          <i className="fa fa-plus"></i>
          Add Track To Playlist
          <ul>
            {this.renderPossiblePlaylists(otherPlaylistOptions, track)}
          </ul>
        </li>
      );
    }

    return element;
  },

  renderDeleteOption: function(track) {
    var element = null;

    if ( this.userIsCollaborator() ) {
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
    var menuItems = (
      <div>
        {this.renderAddTrackOption(track)}
        {this.renderDeleteOption(track)}
      </div>
    );

    e.stopPropagation();
    e.preventDefault();

    this.props.showContextMenu(e, menuItems);
  },

  renderPlaylistOptions: function() {
    var element = null;

    if ( this.userIsCollaborator() ) {
      element = (
        <ul className="playlist-options">
          <li onClick={this.transitionToTrackSearch}>
            <i className="fa fa-plus"></i>
            Add Track
          </li>
          <li onClick={this.toggleModal}>
            <i className="fa fa-user"></i>
            Add Collaborator
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

  renderLayer: function() {
    var element = (<span />);

    if ( this.state.showModal ) {
      element = (
        <Modal onRequestClose={this.toggleModal}>
          <h1>Hello!</h1>
        </Modal>
      );
    }

    return element;
  },

  render: function() {
    return (
      <div>

        <DocumentTitle title={this.state.playlist.title} />

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
                     currentUser={this.props.currentUser}
                     userIsCollaborator={this.userIsCollaborator()} />
        </section>

        <nav className="sidebar right">
          <PlaylistSidebar currentUser={this.props.currentUser} playlist={this.state.playlist} />
        </nav>

      </div>
    );
  }

});

module.exports = React.createFactory(PlaylistPage);