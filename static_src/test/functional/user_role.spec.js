import UserRoleElement from "./pageobjects/user_role.element";

describe("User roles", () => {
  let cookieResult;
  let userRoleElement;
  let cookieValue;

  const guidManagerOrgX = "org-manager-x-uid-601d-48c4-9705";
  const guidManagerOrgY = "org-manager-y-uid-601d-48c4-9705";
  const guidManagerOrgXSpaceXX = "org-x-space-manager-xx-uid-601d-48c4-9705";
  const guidManagerOrgXSpaceYY = "org-x-space-manager-yy-uid-601d-48c4-9705";
  const cookieManagerOrgY = "org_manager_org_y";
  const cookieManagerOrgX = "org_manager_org_x";
  const cookieManagerOrgXSpaceXX = "org_x_space_manager_space_xx";
  const cookieManagerOrgXSpaceYY = "org_x_space_manager_space_yy";
  const urlOrgY = "/#/org/user_role-org_y-ffe7-4aa8-8e85-94768d6bd250";
  const urlOrgX = "/#/org/user_role-org_x-ffe7-4aa8-8e85-94768d6bd250";
  const urlOrgXSpaceXX =
    "/#/org/user_role-org_x-ffe7-4aa8-8e85-94768d6bd250/spaces/user_role-org_x-space_xx-4064-82f2-d74df612b794";
  const urlOrgXSpaceYY =
    "/#/org/user_role-org_x-ffe7-4aa8-8e85-94768d6bd250/spaces/user_role-org_x-space_yy-4064-82f2-d74df612b794";

  describe("A user on page for an org", () => {
    describe("on page for org X should see only manager X has user permissions", () => {
      it("should navigates to org X", () => {
        browser.url(urlOrgX);

        browser.waitForExist(`[data-test="users"]`);
        userRoleElement = new UserRoleElement(
          browser,
          browser.element(`[data-test="users"]`)
        );

        expect(userRoleElement.isVisible()).toBe(true);
      });

      it("should see manager X has Org Manager access", () => {
        expect(userRoleElement.isUserOrgManager(guidManagerOrgX)).toBe(true);
      });

      it("should see manager Y does not have Org Manager access", () => {
        expect(userRoleElement.isUserOrgManager(guidManagerOrgY)).toBe(false);
      });
    });

    describe("on page for org Y should see only manager Y has user permissions", () => {
      it("should navigates to org Y", () => {
        browser.url(urlOrgY);

        browser.waitForExist(`[data-test="users"]`);
        userRoleElement = new UserRoleElement(
          browser,
          browser.element(`[data-test="users"]`)
        );

        expect(userRoleElement.isVisible()).toBe(true);
      });

      it("should see manager Y has Org Manager access", () => {
        expect(userRoleElement.isUserOrgManager(guidManagerOrgY)).toBe(true);
      });

      it("should see manager X does not have Org Manager access", () => {
        expect(userRoleElement.isUserOrgManager(guidManagerOrgX)).toBe(false);
      });
    });
  });

  describe("Testing org user roles", () => {
    it("Setup userRoleElement", () => {
      browser.url(urlOrgX);
      browser.waitForExist(`[data-test="users"]`);
      userRoleElement = new UserRoleElement(
        browser,
        browser.element(`[data-test="users"]`)
      );
    });

    describe("As org manager Y", () => {
      beforeEach(() => {
        // sets cookie to org Y manager
        cookieValue = cookieManagerOrgY;
      });

      describe("shouldn't have permission to edit fields on org X pages", () => {
        it("should set url to org X", () => {
          browser.url(urlOrgX);
        });

        it("verifies that the current user is a user with only permissions to org Y", () => {
          cookieResult = userRoleElement.setAndGetUserRole(cookieValue);

          expect(cookieResult).toBe(cookieManagerOrgY);
        });

        it("verify org Y manager cannot modify org X page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(false);
        });
      });

      describe("should have permission to edit fields on org Y pages", () => {
        it("should set url to org Y", () => {
          browser.url(urlOrgY);
        });

        it("verifies that the current user is a user with only permissions to org Y", () => {
          cookieResult = userRoleElement.setAndGetUserRole(cookieValue);

          expect(cookieResult).toBe(cookieManagerOrgY);
        });

        it("verify org Y manager can modify org Y page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(true);
        });

        it("should give manager X all the permissions", () => {
          expect(
            userRoleElement.toggleOrgManagerAccess(guidManagerOrgX, true)
          ).toBe(true);

          expect(
            userRoleElement.toggleBillingManagerAccess(guidManagerOrgX, true)
          ).toBe(true);

          expect(
            userRoleElement.toggleOrgAuditorAccess(guidManagerOrgX, true)
          ).toBe(true);
        });

        it("should take all permissions from manager X", () => {
          expect(
            userRoleElement.toggleOrgManagerAccess(guidManagerOrgX, false)
          ).toBe(true);

          expect(
            userRoleElement.toggleBillingManagerAccess(guidManagerOrgX, false)
          ).toBe(true);

          expect(
            userRoleElement.toggleOrgAuditorAccess(guidManagerOrgX, false)
          ).toBe(true);
        });
      });
    });

    describe("As org manager X", () => {
      beforeEach(() => {
        // sets cookie to org X manager
        cookieValue = cookieManagerOrgX;
      });

      describe("shouldn't have permission to edit fields on org Y pages", () => {
        it("should set url to org Y", () => {
          browser.url(urlOrgY);
        });

        it("verifies that the current user is a user with only permissions to org X", () => {
          cookieResult = userRoleElement.setAndGetUserRole(cookieValue);

          expect(cookieResult).toBe(cookieManagerOrgX);
        });

        it("verify org X manager cannot modify org Y page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(false);
        });
      });

      describe("should have permission to edit fields on org X pages", () => {
        it("should set url to org X", () => {
          browser.url(urlOrgX);
        });

        it("verifies that the current user is a user with only permissions to org X", () => {
          cookieResult = userRoleElement.getUserRole(cookieManagerOrgX);

          expect(cookieResult).toBe(cookieManagerOrgX);
        });

        it("verify org X manager can modify org X page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(true);
        });

        it("should give manager Y all the permissions", () => {
          expect(
            userRoleElement.toggleOrgManagerAccess(guidManagerOrgY, true)
          ).toBe(true);

          expect(
            userRoleElement.toggleBillingManagerAccess(guidManagerOrgY, true)
          ).toBe(true);

          expect(
            userRoleElement.toggleOrgAuditorAccess(guidManagerOrgY, true)
          ).toBe(true);
        });

        it("should take all permissions from manager Y", () => {
          expect(
            userRoleElement.toggleOrgManagerAccess(guidManagerOrgY, false)
          ).toBe(true);

          expect(
            userRoleElement.toggleBillingManagerAccess(guidManagerOrgY, false)
          ).toBe(true);

          expect(
            userRoleElement.toggleOrgAuditorAccess(guidManagerOrgY, false)
          ).toBe(true);
        });

        describe("alerts when toggling users own org manager role", () => {
          beforeEach(() => {
            browser.click(`#org_manager${guidManagerOrgX}`);
          });

          it("should not toggle role when alert is dismissed", () => {
            browser.alertDismiss();

            expect(userRoleElement.isFirstUserRoleEnabled()).toBe(true);
          });

          it("should toggle role when alert is accepted", () => {
            browser.alertAccept();

            expect(userRoleElement.isFirstUserRoleEnabled()).toBe(false);
          });
        });
      });
    });

    it("delete cookie after", () => {
      browser.deleteCookie("testing_user_role");
    });
  });

  describe("A user on page for a space", () => {
    describe("for org X space XX, should see only manager XX has user permissions", () => {
      it("should navigates to org X space XX", () => {
        browser.url(urlOrgXSpaceXX);

        browser.waitForExist(`[data-test="users"]`);
        userRoleElement = new UserRoleElement(
          browser,
          browser.element(`[data-test="users"]`)
        );

        expect(userRoleElement.isVisible()).toBe(true);
      });

      it("should see user XX has Space Manager access for space XX", () => {
        expect(userRoleElement.isUserSpaceManager(guidManagerOrgXSpaceXX)).toBe(
          true
        );
      });

      it("should see user YY does not have Space Manager access for space XX", () => {
        expect(
          userRoleElement.isUserSpaceDeveloper(guidManagerOrgXSpaceYY)
        ).toBe(false);
      });
    });

    describe("for org X space YY, should see only manager YY has user permissions", () => {
      it("should navigates to org X space YY", () => {
        browser.url(urlOrgXSpaceYY);

        browser.waitForExist(`[data-test="users"]`);
        userRoleElement = new UserRoleElement(
          browser,
          browser.element(`[data-test="users"]`)
        );

        expect(userRoleElement.isVisible()).toBe(true);
      });

      it("should see user XX does not have Space Manager access for space YY", () => {
        expect(userRoleElement.isUserSpaceManager(guidManagerOrgXSpaceXX)).toBe(
          false
        );
      });

      it("should see user YY has Space Manager access for space YY", () => {
        expect(
          userRoleElement.isUserSpaceDeveloper(guidManagerOrgXSpaceYY)
        ).toBe(true);
      });
    });

    describe("As org manager X", () => {
      beforeEach(() => {
        // sets cookie to org Y manager
        cookieValue = cookieManagerOrgX;
      });

      describe("should have permission to edit fields on space Y pages", () => {
        it("should set url to org X space XX", () => {
          browser.url(urlOrgXSpaceXX);
        });

        it("verifies that the current user is a user with only permissions to org X", () => {
          cookieResult = userRoleElement.setAndGetUserRole(cookieValue);

          expect(cookieResult).toBe(cookieManagerOrgX);
        });

        it("verify org X manager can modify space XX page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(true);
        });
      });
    });
  });

  describe("Testing space user roles", () => {
    it("Setup userRoleElement", () => {
      browser.url(urlOrgXSpaceXX);
      browser.waitForExist(`[data-test="users"]`);
      userRoleElement = new UserRoleElement(
        browser,
        browser.element(`[data-test="users"]`)
      );
    });

    describe("As space manager org X space XX ", () => {
      beforeEach(() => {
        // sets cookie to space manager XX
        cookieValue = cookieManagerOrgXSpaceXX;
      });

      describe("shouldn't have permission to edit fields on space YY org X pages", () => {
        it("should set url to org X space YY", () => {
          browser.url(urlOrgXSpaceYY);
        });

        it("verifies that the current user is a user with onlypermissions to org X space YY", () => {
          cookieResult = userRoleElement.setAndGetUserRole(cookieValue);

          expect(cookieResult).toBe(cookieManagerOrgXSpaceXX);
        });

        it("verify space manager org X space XX cannot modify space YY org X page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(false);
        });
      });

      describe("should have permission to edit fields on space XX org X pages", () => {
        it("should set url to org X space XX", () => {
          browser.url(urlOrgXSpaceXX);
        });

        it("verifies that the current user is a user with only permissions to org Y", () => {
          cookieResult = userRoleElement.setAndGetUserRole(cookieValue);

          expect(cookieResult).toBe(cookieManagerOrgXSpaceXX);
        });

        it("verify space manager org X space XX can modify space XX org X page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(true);
        });

        it("should give all the space permissions for org X space XX to the user of the other space (org X space YY)", () => {
          expect(
            userRoleElement.toggleSpaceManagerAccess(
              guidManagerOrgXSpaceYY,
              true
            )
          ).toBe(true);

          expect(
            userRoleElement.toggleSpaceDeveloperAccess(
              guidManagerOrgXSpaceYY,
              true
            )
          ).toBe(true);

          expect(
            userRoleElement.toggleSpaceAuditorAccess(
              guidManagerOrgXSpaceYY,
              true
            )
          ).toBe(true);
        });

        it("should take all space permissions from the the user of the other space (org X space YY)", () => {
          expect(
            userRoleElement.toggleSpaceManagerAccess(
              guidManagerOrgXSpaceYY,
              false
            )
          ).toBe(true);

          expect(
            userRoleElement.toggleSpaceDeveloperAccess(
              guidManagerOrgXSpaceYY,
              false
            )
          ).toBe(true);

          expect(
            userRoleElement.toggleSpaceAuditorAccess(
              guidManagerOrgXSpaceYY,
              false
            )
          ).toBe(true);
        });
      });
    });

    describe("As space manager org X space YY", () => {
      beforeEach(() => {
        // sets cookie to space manager YY
        cookieValue = cookieManagerOrgXSpaceYY;
      });

      describe("shouldn't have permission to edit fields on org X space XX pages", () => {
        it("should set url to org Y", () => {
          browser.url(urlOrgXSpaceXX);
        });

        it("verifies that the current user is a user with only permissions to org X", () => {
          cookieResult = userRoleElement.setAndGetUserRole(cookieValue);

          expect(cookieResult).toBe(cookieManagerOrgXSpaceYY);
        });

        it("verify org X manager cannot modify org Y page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(false);
        });
      });

      describe("should have permission to edit fields on org X space YY pages", () => {
        it("should set url to org X space YY", () => {
          browser.url(urlOrgXSpaceYY);
        });

        it("verifies that the current user is a user with only permissions to org X space YY", () => {
          cookieResult = userRoleElement.setAndGetUserRole(cookieValue);

          expect(cookieResult).toBe(cookieManagerOrgXSpaceYY);
        });

        it("verify space manager org X space YY can modify space YY org X page", () => {
          browser.waitForExist(".test-user-role-control");

          expect(userRoleElement.isFirstUserRoleEnabled()).toBe(true);
        });

        it("should give all the space permissions for org X space YY to the user of the other space (org X space XX)", () => {
          expect(
            userRoleElement.toggleSpaceManagerAccess(
              guidManagerOrgXSpaceXX,
              true
            )
          ).toBe(true);

          expect(
            userRoleElement.toggleSpaceDeveloperAccess(
              guidManagerOrgXSpaceXX,
              true
            )
          ).toBe(true);

          expect(
            userRoleElement.toggleSpaceAuditorAccess(
              guidManagerOrgXSpaceXX,
              true
            )
          ).toBe(true);
        });

        it("should take all space permissions from the the user of the other space (org X space XX)", () => {
          expect(
            userRoleElement.toggleSpaceManagerAccess(
              guidManagerOrgXSpaceXX,
              false
            )
          ).toBe(true);

          expect(
            userRoleElement.toggleSpaceDeveloperAccess(
              guidManagerOrgXSpaceXX,
              false
            )
          ).toBe(true);

          expect(
            userRoleElement.toggleSpaceAuditorAccess(
              guidManagerOrgXSpaceXX,
              false
            )
          ).toBe(true);
        });
      });
    });

    it("delete cookie after", () => {
      browser.deleteCookie("testing_user_role");
    });
  });

  describe("Space page", () => {
    beforeEach(() => {
      const orgGuid = "user_role-org_x-ffe7-4aa8-8e85-94768d6bd250";
      const spaceGuid = "user_role-org_x-space_xx-4064-82f2-d74df612b794";

      browser.url(`/#/org/${orgGuid}/spaces/${spaceGuid}`);
    });

    it("navigates to a org's space page", () => {
      browser.waitForExist(`[data-test="page-header-title"]`, 2000);
      const pageHeader = browser.element(`[data-test="page-header-title"]`);

      expect(pageHeader.getText()).toBe("user_role-org_x-space_xx");
    });

    describe("space manager for space XX then they should", () => {
      it("be able to edit roles for space XX", () => {
        browser.setCookie({
          name: "testing_user_role",
          value: "space_manager_space_xx"
        });
        browser.url("/uaa/userinfo");
        cookieResult = browser.getCookie("testing_user_role").value;

        expect(cookieResult).toBe("space_manager_space_xx");

        browser.deleteCookie("testing_user_role");
        browser.url("/uaa/userinfo");
        cookieResult = browser.getCookie("testing_user_role");

        expect(cookieResult).toBeFalsy();
      });

      it("not be able to edit roles for space YY", () => {});
    });
  });
});
