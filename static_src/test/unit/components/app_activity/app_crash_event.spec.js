import React from "react";
import { shallow } from "enzyme";

import AppCrashEvent from "../../../../components/app_activity/app_crash_event";

const crashPrefix = "The app crashed because";

describe("<AppCrashEvent />", () => {
  it("renders a fallback if no props supplied", () => {
    const wrapper = shallow(<AppCrashEvent />);

    expect(wrapper.text()).toBe(`${crashPrefix} of an unknown reason.`);
  });

  it("renders the correct messages based on props", () => {
    const exitStatus = 200;

    const descriptions = {
      "app instance exited": `the app instance exited with ${exitStatus} status.`,
      "out of memory": "it ran out of memory.",
      "failed to accept connections within health check timeout":
        "it failed to accept connections within health check timeout.",
      "failed to start": "it failed to start."
    };

    Object.keys(descriptions).forEach(exitDescription => {
      const props = { exitDescription, exitStatus };
      const wrapper = shallow(<AppCrashEvent {...props} />);

      expect(wrapper.text()).toBe(
        `${crashPrefix} ${descriptions[exitDescription]}`
      );
    });
  });
});
