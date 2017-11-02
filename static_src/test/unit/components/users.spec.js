import React from "react";
import Immutable from "immutable";
import sinon from "sinon";
import { shallow, mount } from "enzyme";
import { I18n } from "react-i18next";

import Users from "../../../components/users";
import PanelDocumentation from "../../../components/panel_documentation";
import UsersSelector from "../../../components/users_selector";
import UsersInvite from "../../../components/users_invite";
import UserStore from "../../../stores/user_store";
import SpaceStore from "../../../stores/space_store";

const buildRoles = (spaceGuid, roles = []) => {
  const obj = {};
  obj[spaceGuid] = roles;

  return obj;
};

const userGuid = "a-user-guid";
const spaceGuid = "space-guid";
const user = {
  guid: userGuid,
  roles: buildRoles(spaceGuid, ["org_manager"])
};

describe("<Users />", () => {
  SpaceStore._currentSpaceGuid = spaceGuid;
  UserStore._currentUserGuid = userGuid;

  describe("with a user", () => {
    beforeEach(() => {
      UserStore._data = Immutable.fromJS([user]);
    });

    describe("when at org level", () => {
      const makeWrapper = () => {
        console.log("make");
        const wrapper = mount(<Users />);
        wrapper.setState({ currentType: "org_users" });
        return {
          wrapper,
          cleanup() {
            wrapper.unmount();
          }
        };
      };

      it("has an `entityType` of organization", () => {
        const { wrapper, cleanup } = makeWrapper();
        const actual = wrapper.instance().entityType;

        expect(actual).toEqual("organization");

        cleanup();
      });

      describe("when a user is an org manager", () => {
        let wrapper;
        let cleanup;

        beforeEach(() => {
          const stub = sinon.stub(UserStore, "hasRole");
          stub.withArgs(userGuid, sinon.match.any, "org_manager").returns(true);
          stub
            .withArgs(userGuid, sinon.match.any, "space_manager")
            .returns(false);

          const { wrapper: w, cleanup: c } = makeWrapper();
          wrapper = w;
          cleanup = c;
        });

        afterEach(() => {
          cleanup();

          UserStore.hasRole.restore();
        });

        it("renders a <UsersInvite /> component", () => {
          expect(wrapper.find(UsersInvite).length).toBe(1);
        });

        it("should not render a <UsersSelector />", () => {
          expect(wrapper.find(UsersSelector).length).toBe(0);
        });

        it("should render a <UsersInvite />", () => {
          expect(wrapper.find(UsersInvite).length).toBe(1);
        });

        it("should not render a <PanelDocumentation />", () => {
          expect(wrapper.find(PanelDocumentation).length).toBe(0);
        });
      });

      describe("when a user is not an org manager", () => {
        const spaceUser = Object.assign({}, user, {
          roles: buildRoles(spaceGuid, ["space_manager"])
        });

        let wrapper;
        let cleanup;

        beforeEach(() => {
          UserStore._data = Immutable.fromJS([spaceUser]);
          const stub = sinon.stub(UserStore, "hasRole");
          stub
            .withArgs(userGuid, sinon.match.any, sinon.match.any)
            .returns(false);

          const { wrapper: w, cleanup: c } = makeWrapper();
          wrapper = w;
          cleanup = c;
        });

        afterEach(() => {
          cleanup();

          UserStore.hasRole.restore();
        });

        it("renders message telling user to ask an org manager to add users", () => {
          // TODO(jonathaningram)
          console.log("start test");
          console.log("xxx.I18n.length", wrapper.find(I18n).length);
          console.log("xxx.I18n", wrapper.find(I18n));
          console.log("xxx.I18n.children", wrapper.find(I18n).prop("children"));
          // console.log("xxx.Doc", wrapper.find(I18n).find(PanelDocumentation));
          expect(wrapper.find(I18n).find(PanelDocumentation).length).toBe(1);
          console.log("xxx", wrapper.find(PanelDocumentation).prop("children"));
          expect(wrapper.find(PanelDocumentation).prop("children")).toEqual(
            "Only an Org Manager can new invite users to this " +
              "organization via the dashboard. Speak to your Org Manager if " +
              "you need to add a user to this organization"
          );
        });

        it("should not render a <UsersSelector />", () => {
          expect(wrapper.find(UsersSelector).length).toBe(0);
        });

        it("should not render a <UsersInvite /> component", () => {
          expect(wrapper.find(UsersInvite).length).toBe(0);
        });
      });
    });

    describe("when at space level", () => {
      let wrapper;

      beforeEach(() => {
        wrapper = shallow(<Users />);
        wrapper.setState({ currentType: "space_users" });
      });

      afterEach(() => {
        wrapper.unmount();
      });

      it("has an `entityType` of space", () => {
        const actual = wrapper.instance().entityType;

        expect(actual).toEqual("space");
      });

      describe("when a user is an org manager and not space manager", () => {
        beforeEach(() => {
          const stub = sinon.stub(UserStore, "hasRole");
          stub.withArgs(userGuid, sinon.match.any, "org_manager").returns(true);
          stub
            .withArgs(userGuid, sinon.match.any, "space_manager")
            .returns(false);
          wrapper = shallow(<Users />);
        });

        afterEach(() => {
          wrapper.unmount();

          UserStore.hasRole.restore();
        });

        it("renders a <UsersInvite /> component", () => {
          expect(wrapper.find(UsersInvite).length).toBe(1);
        });

        it("should render a <UsersSelector />", () => {
          expect(wrapper.find(UsersSelector).length).toBe(1);
        });

        it("should not show a <PanelDocumentation />", () => {
          expect(wrapper.find(PanelDocumentation).length).toBe(0);
        });
      });

      describe("when a user is not an org manager and not a space manager", () => {
        const spaceUser = Object.assign({}, user, {
          roles: buildRoles(spaceGuid, [])
        });

        beforeEach(() => {
          UserStore._data = Immutable.fromJS([spaceUser]);
          wrapper = shallow(<Users />);
          const stub = sinon.stub(UserStore, "hasRole");
          stub
            .withArgs(userGuid, sinon.match.any, "org_manager")
            .returns(false);
          stub
            .withArgs(userGuid, sinon.match.any, "space_manager")
            .returns(false);
        });

        afterEach(() => {
          UserStore.hasRole.restore();

          wrapper.unmount();
        });

        it("should not render a <UsersInvite /> component", () => {
          expect(wrapper.find(UsersInvite).length).toBe(0);
        });

        it("should not show a <UsersSelector />", () => {
          expect(wrapper.find(UsersSelector).length).toBe(0);
        });

        it("should render a <PanelDocumentation />", () => {
          expect(wrapper.find(PanelDocumentation).length).toBe(1);
          expect(wrapper.find(PanelDocumentation).prop("children")).toEqual(
            "If you wish to invite users into this space, please ask an Org Manager or a Space Manager."
          );
        });
      });

      describe("when a user is not an org manager but is a space manager", () => {
        const spaceUser = Object.assign({}, user, {
          roles: buildRoles(spaceGuid, ["space_manager"])
        });

        beforeEach(() => {
          UserStore._data = Immutable.fromJS([spaceUser]);
          wrapper = shallow(<Users />);
          const stub = sinon.stub(UserStore, "hasRole");
          stub.withArgs(userGuid, sinon.match.any, "org_manager").returns(true);
          stub
            .withArgs(userGuid, sinon.match.any, "space_manager")
            .returns(false);
        });

        afterEach(() => {
          UserStore.hasRole.restore();

          wrapper.unmount();
        });

        it("should not render a <UsersInvite /> component", () => {
          expect(wrapper.find(UsersInvite).length).toBe(0);
        });

        it("should render a <UsersSelector />", () => {
          expect(wrapper.find(UsersSelector).length).toBe(1);
        });

        it("should show a <PanelDocumentation />", () => {
          expect(wrapper.find(PanelDocumentation).length).toBe(1);
          expect(wrapper.find(PanelDocumentation).prop("children")).toEqual(
            "As an Space Manager, you can invite existing organization users into your space. If you wish to invite a person who is not in the organization into your space, please ask an Org Manager"
          );
        });
      });
    });
  });
});
