'use strict';

import React               from 'react/addons';
import moment              from 'moment';

import NotificationHelpers from '../utils/NotificationHelpers';
import Avatar              from './avatar';

const Notification = React.createClass({

  propTypes: {
    notification: React.PropTypes.object.isRequired,
    key: React.PropTypes.number,
    navigateTo: React.PropTypes.func.isRequired,
    markAsRead: React.PropTypes.func.isRequired
  },

  getDefaultProps() {
    return {
      notification: {}
    };
  },

  getInitialState() {
    return {
      relatedEntity: {
        identifier: '',
        title: ''
      }
    };
  },

  componentDidMount() {
    let notification = this.props.notification;
    NotificationHelpers.getRelatedEntity(notification.entityType, notification.entityId).then((entity) => {
      this.setState({ relatedEntity: entity });
    });
  },

  handleLinkClick(url, evt) {
    if ( evt ) { evt.preventDefault(); }

    this.props.navigateTo(url);
  },

  markAsRead(evt) {
    if ( evt ) { evt.preventDefault(); }

    this.props.markAsRead(this.props.notification);
  },

  renderActorName() {
    let actor = this.props.notification.actor;
    let url = '/profile/' + actor.username;

    return (
      <a onClick={this.props.navigateTo.bind(null, url)}>
        {actor.username}
      </a>
    );
  },

  renderMarkAsReadButton() {
    if ( !this.props.notification.read ) {
      return (
        <i className="mark-read-button icon-circle-o"
           onClick={this.markAsRead}  />
      );
    }
  },

  renderDescription() {
    return NotificationHelpers.verbMap[this.props.notification.action];
  },

  renderEntityLink() {
    let url = NotificationHelpers.entityPathMap[this.props.notification.entityType] + this.state.relatedEntity.identifier;

    return (
      <a onClick={this.props.navigateTo.bind(null, url)}>{this.state.relatedEntity.title}</a>
    );
  },

  render() {
    return (
      <li className="notification" key={this.props.key}>

        <div className="avatar-container">
          <Avatar user={this.props.notification.actor} includeLink={false} size={30} />
        </div>

        <div className="body-container">
          <div className="body">
            {this.renderActorName()} {this.renderDescription()} {this.renderEntityLink()}.
          </div>
          <div className="timestamp">
            {moment(this.props.notification.createdAt).fromNow()}
          </div>
        </div>

        {this.renderMarkAsReadButton()}

      </li>
    );
  }

});

export default Notification;