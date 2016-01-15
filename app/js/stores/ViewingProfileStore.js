'use strict';

import Reflux      from 'reflux';

import UserActions from '../actions/UserActions';
import UserAPI     from '../utils/UserAPI';
import Mixpanel    from '../utils/Mixpanel';

var ViewingProfileStore = Reflux.createStore({

  init() {
    this.profile = null;

    this.listenTo(UserActions.openProfile, this.loadUserProfile);
    this.listenTo(UserActions.follow, this.followUser);
  },

  loadUserProfile(username, cb = function() {}) {
    UserAPI.get(username).then((profile) => {
      this.profile = profile;
      Mixpanel.logEvent('view profile', this.profile);

      this.trigger(null, this.profile);
      cb(null, this.profile);

      UserAPI.getPlaylists(this.profile.id).then(playlists => {
        this.profile.playlists = playlists;
        this.trigger(null, this.profile);
      });

      UserAPI.getCollaborations(this.profile.id).then(collaborations => {
        this.profile.collaborations = collaborations;
        this.trigger(null, this.profile);
      });

      UserAPI.getLikes(this.profile.id).then(likes => {
        this.profile.likes = likes;
        this.trigger(null, this.profile);
      });

      UserAPI.getStars(this.profile.id).then(stars => {
        this.profile.starredTracks = stars;
        this.trigger(null, this.profile);
      });
    });
  },

  followUser(user, cb = function() {}) {
    UserAPI.follow(user.id).then(() => {
      cb(null);
    }).catch(err => {
      cb(err);
    });
  }

});

export default ViewingProfileStore;