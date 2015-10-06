'use strict';

import when                  from 'when';

import TestHelpers           from '../../utils/testHelpers';
import ViewingPostListStore  from '../../app/js/stores/ViewingPostListStore';
import GlobalActions         from '../../app/js/actions/GlobalActions';
import GroupActions          from '../../app/js/actions/GroupActions';
import PostActions           from '../../app/js/actions/PostActions';
import PostAPI               from '../../app/js/utils/PostAPI';

describe('Store: ViewingPostList', function() {

  let post = JSON.parse(JSON.stringify(TestHelpers.fixtures.post));

  beforeEach(function() {
    this.postAPIMock = sandbox.mock(PostAPI);
  });

  it('should load all global posts on action', function() {
    this.postAPIMock.expects('getNewest').returns(when([post]));

    GlobalActions.loadExplorePage();
  });

  it('should load all posts for a group on action', function() {
    this.postAPIMock.expects('getNewestForGroup').returns(when());

    GroupActions.open();
  });

  it('should create a new post on action', function() {
    this.postAPIMock.expects('create').withArgs(post).returns(when());

    PostActions.create(post);
  });

  it('should add a new comment to a post on action', function() {
    let commentBody = 'Test comment';

    this.postAPIMock.expects('addComment').withArgs(post.id, commentBody).returns(when());

    PostActions.addComment(post.id, commentBody);
  });

  it('should remove a comment from a post on action', function() {
    let commentId = 1;

    this.postAPIMock.expects('removeComment').withArgs(post.id, commentId).returns(when());

    PostActions.removeComment(post.id, commentId);
  });

  it('should delete a post on action', function() {
    this.postAPIMock.expects('delete').withArgs(post.id).returns(when());

    PostActions.delete(post.id);
  });

});