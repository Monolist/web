'use strict';

import React                                from 'react/addons';
import {Route, NotFoundRoute, DefaultRoute} from 'react-router';

import GlobalApp                            from './GlobalApp';
import InnerApp                             from './InnerApp';
import OuterApp                             from './OuterApp';
import RegisterPage                         from './pages/RegisterPage';
import LoginPage                            from './pages/LoginPage';
import ExplorePage                          from './pages/ExplorePage';
import TrackSearchPage                      from './pages/TrackSearchPage';
import PlaylistsPage                        from './pages/PlaylistsPage';
import PlaylistSearchPage                   from './pages/PlaylistSearchPage';
import PlaylistPage                         from './pages/PlaylistPage';
import CreatePlaylistPage                   from './pages/CreatePlaylistPage';
import ProfilePage                          from './pages/ProfilePage';
import SettingsPage                         from './pages/SettingsPage';
import ForgotPasswordPage                   from './pages/ForgotPasswordPage';
import ResetPasswordPage                    from './pages/ResetPasswordPage';
import ExploreRedirect                      from './pages/ExploreRedirect';
import NotFoundPage                         from './pages/NotFoundPage';

export default (
  <Route handler={GlobalApp} path={window.location.pathname}>

    <Route handler={InnerApp}>
      <DefaultRoute handler={ExploreRedirect} />
      <Route name="Explore" path="/explore" handler={ExplorePage} />
      <Route name="TrackSearch" path="/tracks/search" handler={TrackSearchPage} />
      <Route name="Playlists" path="/playlists" handler={PlaylistsPage} />
      <Route name="PlaylistSearch" path="/playlists/search" handler={PlaylistSearchPage} />
      <Route name="Playlist" path="/playlist/:slug" handler={PlaylistPage} />
      <Route name="CreatePlaylist" path="/create" handler={CreatePlaylistPage} />
      <Route name="Profile" path="/profile/:username" handler={ProfilePage} />
      <Route name="Settings" path="/settings" handler={SettingsPage} />
    </Route>

    <Route handler={OuterApp}>
      <Route name="Login" path="/login" handler={LoginPage} />
      <Route name="Register" path="/register" handler={RegisterPage} />
      <Route name="ForgotPassword" path="/forgot" handler={ForgotPasswordPage} />
      <Route name="ResetPassword" path="/reset/:userId/:key" handler={ResetPasswordPage} />
    </Route>

    <NotFoundRoute handler={NotFoundPage} />

  </Route>
);