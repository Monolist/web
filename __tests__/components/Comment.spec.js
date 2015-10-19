'use strict';

import ReactDOM    from 'react-dom';
import TestUtils   from 'react-addons-test-utils';
import $           from 'jquery';
import moment      from 'moment';

import TestHelpers from '../../utils/testHelpers';
import Comment     from '../../app/js/components/Comment';

describe('Component: Comment', function() {

  const comment = TestHelpers.fixtures.comment;

  it('should have a link to the poster\'s profile', function(done) {
    const commentComponent = TestHelpers.renderStubbedComponent(Comment, { comment: comment });

    $('a.author-link', ReactDOM.findDOMNode(commentComponent)).text().should.eql(comment.user.username);

    done();
  });

  it('should have the text body', function(done) {
    const commentComponent = TestHelpers.renderStubbedComponent(Comment, { comment: comment });

    $('.body', ReactDOM.findDOMNode(commentComponent)).text().should.eql(comment.body);

    done();
  });

  it('should have the formatted post time', function(done) {
    const commentComponent = TestHelpers.renderStubbedComponent(Comment, { comment: comment });

    $('.timestamp', ReactDOM.findDOMNode(commentComponent)).text().should.eql(moment(comment.createdAt).fromNow());

    done();
  });

  it('should render the delete button if current user is the poster', function(done) {
    const commentComponent = TestHelpers.renderStubbedComponent(Comment, { comment: comment, currentUser: comment.user });

    TestUtils.scryRenderedDOMComponentsWithClass(commentComponent, 'delete-button').length.should.equal(1);

    done();
  });

  it('#deleteComment should call props.deleteComment', function(done) {
    const spy = sandbox.spy();
    const commentComponent = TestHelpers.renderStubbedComponent(Comment, { comment: comment, deleteComment: spy });

    commentComponent.deleteComment();
    sinon.assert.calledOnce(spy);

    done();
  });

});