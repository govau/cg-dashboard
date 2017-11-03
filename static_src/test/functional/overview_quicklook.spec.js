import OrgQuicklookElement from "./pageobjects/org_quicklook.element";

describe("Overview page", () => {
  it("navigates to page", () => {
    browser.url("/");
  });

  it("has a title", () => {
    expect(browser.getTitle()).toBe("cloud.gov dashboard");
  });

  it("has a page header", () => {
    const pageHeader = browser.element(`[data-test="page-header-title"]`);

    expect(pageHeader.getText()).toBe("Overview");
  });

  describe("quicklook", () => {
    let quicklookElement;

    it("exists", () => {
      quicklookElement = new OrgQuicklookElement(
        browser,
        browser.element(`[data-test="organizations-panel-row"]`)
      );

      expect(quicklookElement.isVisible()).toBe(true);
    });

    it("has org name", () => {
      const orgName = quicklookElement.title();

      expect(orgName).toBe("fake-cf");
    });

    it("is collapsed", () => {
      expect(quicklookElement.isExpanded()).toBe(false);
    });

    it("is clicked", () => {
      quicklookElement.expand();
    });

    it("is expanded", () => {
      expect(quicklookElement.isExpanded()).toBe(true);
    });

    it("has 2 rows", () => {
      expect(quicklookElement.rows().length).toBe(2);
    });
  });
});
