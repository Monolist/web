'use strict';

import React              from 'react';
import _                  from 'lodash';
import {Link, History}    from 'react-router';
import cx                 from 'classnames';

import Modals             from '../utils/Modals';
import PermissionsHelpers from '../utils/PermissionsHelpers';
import PlaylistActions    from '../actions/PlaylistActions';
import TagList            from './TagList';

const PlaylistSubheader = React.createClass({

  mixins: [History],

  propTypes: {
    currentUser: React.PropTypes.object,
    playlist: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      currentUser: {},
      playlist: {
        owner: {},
        tags: [],
        likes: [],
        plays: []
      }
    };
  },

  getInitialState() {
    return {
      currentUserDoesLike: false,
      numLikes: 0,
      currentUserDoesFollow: false
    };
  },

  componentWillReceiveProps(nextProps) {
    if ( !_.isEmpty(nextProps.playlist) && !_.isEqual(this.props.playlist, nextProps.playlist) ) {
      this.setState({
        currentUserDoesLike: _.some(nextProps.playlist.likes, { userId: nextProps.currentUser.id }),
        numLikes: nextProps.playlist.likes ? nextProps.playlist.likes.length : 0,
        currentUserDoesFollow: _.some(nextProps.playlist.followers, { userId: nextProps.currentUser.id })
      });
    }
  },

  toggleFollowPlaylist() {
    this.setState({
      currentUserDoesFollow: !this.state.currentUserDoesFollow
    }, PlaylistActions.follow.bind(null, this.props.playlist));
  },

  toggleLikePlaylist() {
    this.setState({
      currentUserDoesLike: !this.state.currentUserDoesLike,
      numLikes: this.state.currentUserDoesLike ? this.state.numLikes - 1 : this.state.numLikes + 1
    }, PlaylistActions.like);
  },

  deletePlaylist() {
    PlaylistActions.delete(this.props.playlist, () => {
      this.history.pushState(null, '/playlists');
    });
  },

  renderPlaylistImage() {
    if ( this.props.playlist.imageUrl ) {
      const imageStyles = {
        backgroundImage: `url(${this.props.playlist.imageUrl})`
      };

      return (
        <div className="entity-subheader-image-container">
          <div className="entity-subheader-image" style={imageStyles} />
        </div>
      );
    }
  },

  renderPlaylistCreatorLink() {
    const ownerIsUser = this.props.playlist.ownerType === 'user';
    const text = this.props.playlist.owner.username || this.props.playlist.owner.title;
    const destinationParam = ownerIsUser ? this.props.playlist.owner.username : this.props.playlist.owner.slug;
    const linkDestination = ownerIsUser ? '/profile/' : '/group/';

    return (
      <Link to={`${linkDestination}${destinationParam}`}>{text}</Link>
    );
  },

  renderPlaylistInfo() {
    if ( this.props.playlist.id ) {
      const privacyIconClasses = cx('entity-subheader-privacy-icon', 'delta', {
        'icon-globe': this.props.playlist.privacy === 'public',
        'icon-lock': this.props.playlist.privacy === 'private'
      });

      return (
        <div>
          <h1 className="entity-subheader-title">
            {this.props.playlist.title}
            <i className={privacyIconClasses} />
          </h1>
          <ul className="entity-subheader-stats">
            <li className="entity-subheader-stat-item">
              created by {this.renderPlaylistCreatorLink()}
            </li>
            <li className="entity-subheader-stat-item">
              <span className="nudge-quarter--right">
                <i className="icon-heart entity-subheader-stat-icon" /> {this.state.numLikes}
              </span>
              <span>
                <i className="icon-play entity-subheader-stat-icon" /> {this.props.playlist.plays ? this.props.playlist.plays.length : 0}
              </span>
            </li>
          </ul>
          <TagList type="playlist" tags={this.props.playlist.tags} className="nudge-quarter--ends" />
        </div>
      );
    }
  },

  renderManageCollaboratorsButton() {
    const userIsCreator = PermissionsHelpers.isUserPlaylistCreator(this.props.playlist, this.props.currentUser);

    if ( userIsCreator ) {
      const clickHandler = Modals.openUserSearch.bind(
        null,
        this.props.playlist.collaborators,
        this.props.currentUser,
        this.selectUser,
        this.deselectUser
      );

      return (
        <div className="btn entity-subheader-action-button" onClick={clickHandler}>
          <i className="icon-group" />
        </div>
      );
    }
  },

  renderAddTrackFromUrlButton() {
    const userIsCreator = PermissionsHelpers.isUserPlaylistCreator(this.props.playlist, this.props.currentUser);
    const userIsCollaborator = PermissionsHelpers.isUserPlaylistCollaborator(this.props.playlist, this.props.currentUser);

    if ( userIsCreator || userIsCollaborator ) {
      const clickHandler = Modals.openAddTrackByUrl.bind(null, this.props.playlist, this.props.currentUser);

      return (
        <div className="btn entity-subheader-action-button" onClick={clickHandler}>
          <i className="icon-plus" />
        </div>
      );
    }
  },

  renderFollowButton() {
    const userCanFollow = PermissionsHelpers.userCanFollowPlaylist(this.props.playlist, this.props.currentUser);
    const classes = cx('btn', 'entity-subheader-action-button', {
      'active-yellow': this.state.currentUserDoesFollow
    });

    if ( userCanFollow ) {
      return (
        <div ref="followButton" className={classes} onClick={this.toggleFollowPlaylist}>
          <i className="icon-rss-square" />
        </div>
      );
    }
  },

  renderLikeButton() {
    const classes = cx('btn', 'entity-subheader-action-button', {
      'active-red': this.state.currentUserDoesLike
    });

    if ( !_.isEmpty(this.props.currentUser) ) {
      return (
        <div ref="likeButton" className={classes} onClick={this.toggleLikePlaylist}>
          <i className="icon-heart"></i>
        </div>
      );
    }
  },

  renderShareButton() {
    if ( !_.isEmpty(this.props.playlist) && this.props.playlist.privacy !== 'private' ) {
      const clickHandler = Modals.openShare.bind(null, this.props.playlist);

      return (
        <div ref="shareButton" className="btn entity-subheader-action-button" onClick={clickHandler}>
          <i className="icon-share-alt"></i>
        </div>
      );
    }
  },

  renderEditButton() {
    if ( PermissionsHelpers.isUserPlaylistCreator(this.props.playlist, this.props.currentUser) ) {
      const clickHandler = Modals.openEditPlaylist.bind(null, this.props.playlist);

      return (
        <div className="btn entity-subheader-action-button" onClick={clickHandler}>
          <i className="icon-cog" />
        </div>
      );
    }
  },

  renderQuitCollaboratingButton() {
    const isOwnedByGroup = this.props.playlist.ownerType === 'group';
    const isGroupOwner = isOwnedByGroup && this.props.playlist.owner.id === this.props.currentUser.id;
    const isGroupMember = isOwnedByGroup && _.some(this.props.playlist.owner.memberships, { userId: this.props.currentUser.id });
    const userIsCollaborator = PermissionsHelpers.isUserPlaylistCollaborator(this.props.playlist, this.props.currentUser);

    if ( !isGroupMember && !isGroupOwner && userIsCollaborator ) {
      return (
        <div className="btn entity-subheader-action-button" onClick={this.quitCollaborating}>
          <i className="icon-user-times" />
        </div>
      );
    }
  },

  renderDeleteButton() {
    const userIsCreator = PermissionsHelpers.isUserPlaylistCreator(this.props.playlist, this.props.currentUser);

    if ( userIsCreator ) {
      const clickHandler = Modals.openConfirmation.bind(
        null,
        'Are you sure you want to delete this playlist?',
        this.deletePlaylist
      );

      return (
        <div className="btn entity-subheader-action-button" onClick={clickHandler}>
          <i className="icon-close" />
        </div>
      );
    }
  },

  render() {
    return (
      <div className="entity-subheader playlist-subheader">

        {this.renderPlaylistImage()}

        <div className="entity-subheader-info-container">
          {this.renderPlaylistInfo()}
        </div>

        <div className="entity-subheader-actions-container text-right">
          <div className="entity-subheader-button-group">
            {this.renderManageCollaboratorsButton()}
            {this.renderAddTrackFromUrlButton()}
            {this.renderFollowButton()}
            {this.renderLikeButton()}
            {this.renderShareButton()}
            {this.renderEditButton()}
            {this.renderQuitCollaboratingButton()}
            {this.renderDeleteButton()}
          </div>
        </div>

      </div>
    );
  }

});

export default PlaylistSubheader;