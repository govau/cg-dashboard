
import React from 'react';
import Reactable from 'reactable';

import userActions from '../actions/user_actions.js';
import UserStore from '../stores/user_store.js';
import Tabnav from './tabnav.jsx';

var Table = Reactable.Table,
    unsafe = Reactable.unsafe;

const TAB_SPACE_NAME = 'space_users',
      TAB_ORG_NAME = 'org_users';

function stateSetter(currentState) {
  var users = [];
  if (currentState.currentTab === TAB_SPACE_NAME) {
    users = UserStore.getAllInSpace(currentState.currentSpaceGuid);
  } else {
    users = UserStore.getAllInOrg(currentState.currentOrgGuid);
  }
  return {
    users: users
  }
}

export default class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      currentOrgGuid: props.initialOrgGuid,
      currentSpaceGuid: props.initialSpaceGuid,
      currentTab: props.initialCurrentTab,
      users: []
    };
  }

  componentDidMount() {
    UserStore.addChangeListener(this._onChange);
    this._setTab(this.props.initialCurrentTab);
  }

  _onChange = () => {
    this.setState(stateSetter(this.state));
  }

  _setTab = (tab) => {
    this.setState({
      currentTab: tab
    });
    if (tab === TAB_SPACE_NAME) {
       userActions.fetchSpaceUsers(this.state.currentSpaceGuid); 
    } else {
       userActions.fetchOrgUsers(this.state.currentOrgGuid); 
    }
    this.setState(stateSetter(this.state));
  }

  handleTabClick = (tab, ev) => {
    ev.preventDefault();
    this._setTab(tab);
  }

  get subNav() {
    var tabs = [
      { name: 'space_users' },
      { name: 'org_users' }
    ];
    // TODO refactor link, use a special link component.
    tabs[0].element = (
      <a onClick={ this.handleTabClick.bind(this, tabs[0].name) }>
        Current space users
      </a>
    );

    tabs[1].element = (
      <a onClick={ this.handleTabClick.bind(this, tabs[1].name) }>
        All organization users
      </a>
    );

    return tabs;
  }

  get columns() {
    return [
      { label: 'Name', key: 'username' },
      { label: 'Date Created', key: 'created_at' }
    ];
  }

  render() {
    var content = <h4 className="test-none_message">No users</h4>;
    // TODO format rows in table
    if (this.state.users.length) {
      content = <Table data={ this.state.users } 
        columns={ this.columns }
        sortable={ true } className="table" />;
    }
    console.log('render', this.state);

    return (
      <div>
        <Tabnav items={ this.subNav } initialItem={ this.state.currentTab } />
        <div className="tab-content">
          <div role="tabpanel" className="tab-pane active">
            <div className="tableWrapper"> 
              { content }
            </div>
          </div>
        </div>
      </div>
    );
  }
};

UserList.propTypes = {
  initialCurrentTab: React.PropTypes.string.isRequired,
  initialOrgGuid: React.PropTypes.string.isRequired,
  initialSpaceGuid: React.PropTypes.string.isRequired
};

UserList.defaultProps = {
  initialCurrentTab: 'space_users'
}
