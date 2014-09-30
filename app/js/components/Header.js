/**
 * @jsx React.DOM
 */
'use strict';

var React        = require('react/addons');
var Link         = require('react-router').Link;
var transitionTo = require('react-router').transitionTo;

var SearchBar = require('./SearchBar');

var Header = React.createClass({

  mixins: [React.addons.LinkedStateMixin],

  propTypes: {
    title: React.PropTypes.string,
    icon: React.PropTypes.string
  },

  getInitialState: function() {
    return {
      query: ''
    };
  },

  submitOnEnter: function(evt) {
    var keyCode = evt.keyCode || evt.which;

    if ( keyCode === '13' || keyCode === 13 ) {
      this.doGlobalSearch();
    }
  },

  doGlobalSearch: function() {
    transitionTo('PlaylistSearch', {}, { q: this.state.query });

    this.setState({
      query: ''
    }, function() {
      this.refs.SearchBar.refs.input.getDOMNode().blur();
    });
  },

  renderIcon: function() {
    var element = null;
    var iconClasses;

    if ( this.props.icon ) {
      iconClasses = 'fa ' + this.props.icon;
      element = (
        <div className="icon-container">
          <i className={iconClasses}></i>
        </div>
      );
    }

    return element;
  },

  renderTitle: function() {
    var element = null;

    if ( this.props.title ) {
      element = (
        <div>
          <h5 className="title">{this.props.title}</h5>
          {this.renderIcon()}
        </div>
      );
    }

    return element;
  },

  render: function() {
    return (
      <header>

        <div className="logo-container">
          <Link to="Home">
            <img className="logo" src="../images/logo.png" alt="Monolist logo" />
          </Link>
        </div>

        <div className="page-title-container">
          {this.renderTitle()}
        </div>

        <div className="search-container">
          <SearchBar ref="SearchBar"
                     valueLink={this.linkState('query')}
                     onKeyPress={this.submitOnEnter}
                     placeholder="Search all playlists..." />
        </div>

      </header>
    );
  }

});

module.exports = Header;