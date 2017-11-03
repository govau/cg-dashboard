import React from "react";
import { shallow } from "enzyme";

import { Form } from "../../../components/form";
import PanelDocumentation from "../../../components/panel_documentation";
import { UsersInvite } from "../../../components/users_invite";
import Action from "../../../components/action";

describe("<UsersInvite />", () => {
  const entityType = "space";
  const props = {
    t(k) {
      return k;
    },
    entityType,
    currentUserAccess: true
  };
  let wrapper;

  describe("when user has access to inviting other users", () => {
    beforeEach(() => {
      wrapper = shallow(<UsersInvite {...props} />);
    });

    it("renders one <Form /> component", () => {
      expect(wrapper.find(Form).length).toEqual(1);
    });

    it("renders one <Action /> component", () => {
      expect(wrapper.find(Action).length).toEqual(1);
    });

    describe("conditional documentation based on entityType", () => {
      it("refers to `space` when type is space", () => {
        const doc = "Invite a new or existing user to this space.";

        expect(
          wrapper
            .find(PanelDocumentation)
            .find("p")
            .text()
        ).toBe(doc);
      });

      it("refers to `organization` when type is organization", () => {
        const doc = "Invite a new or existing user to this organization.";
        const orgProps = {
          ...props,
          entityType: "organization"
        };
        wrapper = shallow(<UsersInvite {...orgProps} />);

        expect(
          wrapper
            .find(PanelDocumentation)
            .find("p")
            .text()
        ).toBe(doc);
      });

      it("refers to `organization` when type is organization in the action button", () => {
        const buttonHTML =
          '<button class="action action-primary usa-button ' +
          'usa-button-primary" aria-label="submit" type="submit">' +
          "Add user to this organization</button>";
        const orgProps = {
          ...props,
          entityType: "organization"
        };
        wrapper = shallow(<UsersInvite {...orgProps} />);

        expect(wrapper.find(Action).html()).toEqual(buttonHTML);
      });
    });
  });

  describe("when user does not have ability to invite other users", () => {
    it("does not render <Form /> component", () => {
      const noAccessProps = {
        ...props,
        currentUserAccess: false
      };
      wrapper = shallow(<UsersInvite {...noAccessProps} />);

      expect(wrapper.find(Form).length).toEqual(0);
    });
  });
});
