import React from "react";

import Panel from "dashboard/components/panel";
import PanelGroup from "dashboard/components/panel_group";
import InfoActivities from "./info_activities";
import InfoEnvironments from "./info_environments";
import InfoSandbox from "./info_sandbox";
import InfoStructure from "./info_structure";

export const panels = [
  () => (
    <Panel title="Cheatsheet">
      {[
        InfoActivities,
        InfoStructure,
        InfoSandbox,
        InfoEnvironments
      ].map((Tile, i) => {
        if (i % 2 === 0) {
          return (
            <div key={`tile-${i}`}>
              <PanelGroup columns={6}>
                <Tile />
              </PanelGroup>
            </div>
          );
        }
        return (
          <PanelGroup columns={6} key={`tile-${i}`}>
            <Tile />
          </PanelGroup>
        );
      })}
    </Panel>
  )
];
