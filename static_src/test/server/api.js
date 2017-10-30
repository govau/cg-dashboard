const anyEvents = require('./fixtures/events');
const appRoutes = require('./fixtures/app_routes');
const appSummaries = require('./fixtures/app_summaries');
const appStats = require('./fixtures/app_stats');
const organizations = require('./fixtures/organizations');
const organizationQuotaDefinitions = require('./fixtures/organization_quota_definitions');
const organizationUsers = require('./fixtures/organization_users');
const organizationUserRoles = require('./fixtures/organization_user_roles');
const organizationSummaries = require('./fixtures/organization_summaries');
const organizationMemoryUsage = require('./fixtures/organization_memory_usage');
const services = require('./fixtures/services');
const serviceBindings = require('./fixtures/service_bindings');
const serviceInstances = require('./fixtures/service_instances');
const servicePlans = require('./fixtures/service_plans');
const sharedDomains = require('./fixtures/shared_domains');
const spaces = require('./fixtures/spaces');
const spaceRoutes = require('./fixtures/space_routes');
const spaceSummaries = require('./fixtures/space_summaries');
const spaceQuotaDefinitions = require('./fixtures/space_quota_definitions');
const spaceUserRoles = require('./fixtures/space_user_roles');
const uaaRoles = require('./fixtures/uaa_roles');
const userOrganizations = require('./fixtures/user_organizations');
const userAssociationResponses = require('./fixtures/user_association_responses');
const userInviteResponses = require('./fixtures/user_invite_responses');
const userRoles = require('./fixtures/user_roles');
const userRoleOrgAddNewRole = require('./fixtures/user_role_org_add_new_role');
const userSpaces = require('./fixtures/user_spaces');

const BASE_URL = '/v2';

const ENV_NO_ORGS = process.env.NO_ORGS || false;
const ENV_NO_SPACES = process.env.NO_SPACES || false;
const ENV_NO_APPS = process.env.NO_APPS || false;
const ENV_NO_ORG_USERS = process.env.NO_ORG_USERS || false;
const ENV_NO_SPACE_USERS = process.env.NO_SPACE_USERS || false;

function SingleResponse(response) {
  return response;
}

function MultiResponse(responses) {
  return {
    total_results: responses.length,
    total_pages: 1,
    prev_url: null,
    next_url: null,
    resources: responses
  };
}

module.exports = function api(smocks) {
  smocks.route({
    id: 'uaa-uaainfo-no-uaa-permissions',
    label: 'UAA user info fake-personb - no special UAA permissions',
    path: '/uaa/uaainfo',
    handler(req, reply) {
      // 'cca7537f-601d-48c4-9705-4583ba54ea4c' == "cloud_controller.admin"
      // 'bba7537f-601d-48c4-9705-4583ba54ea4b' != "cloud_controller.admin"
      if (req.query.uaa_guid === 'cca7537f-601d-48c4-9705-4583ba54ea4c') {
        // UAA user with admin permissions
        // Noted in groups: []
        reply(uaaRoles.uaa_admin);
      } else {
        // No UAA permissions
        // Noted in groups: []
        reply(uaaRoles.default);
      }
    }
  });

  smocks.route({
    id: 'uaa-userinfo',
    label: 'UAA user info',
    path: '/uaa/userinfo',
    handler(req, reply) {
      let userRoleObject;
      if (
        req.state.testing_user_role &&
        userRoles[req.state.testing_user_role]
      ) {
        userRoleObject = userRoles[req.state.testing_user_role];
      } else {
        userRoleObject = userRoles.default;
      }
      reply(userRoleObject);
    }
  });

  smocks.route({
    id: 'uaa-user-invite',
    label: 'UAA user invite create',
    method: 'POST',
    path: '/uaa/invite/users',
    handler(req, reply) {
      let userInviteResponse;
      const { email } = req.payload;
      if (email && userInviteResponses[email]) {
        userInviteResponse = userInviteResponses[email];
        reply(userInviteResponse);
      } else if (!email.length || !/(.+)@(.+){2,}\.(.+){2,}/.test(email)) {
        reply({ message: 'Invalid email' }).code(500);
      } else {
        userInviteResponse = userInviteResponses.default;
        reply(userInviteResponse);
      }
    }
  });

  smocks.route({
    id: 'app-routes',
    label: 'App routes',
    path: `${BASE_URL}/apps/{guid}/routes`,
    handler(req, reply) {
      const routes = appRoutes;
      reply(MultiResponse(routes));
    }
  });

  smocks.route({
    id: 'app-summary',
    label: 'App summary',
    path: `${BASE_URL}/apps/{guid}/summary`,
    handler(req, reply) {
      const { guid } = req.params;
      const app = appSummaries.find(a => a.guid === guid);
      reply(SingleResponse(app));
    }
  });

  smocks.route({
    id: 'app-stats',
    label: 'App stats',
    path: `${BASE_URL}/apps/{guid}/stats`,
    handler(req, reply) {
      const { guid } = req.params;
      const appStat = appStats.find(app => app.guid === guid);
      if (guid === '3c37ff32-d954-4f9f-b730-15e22442fd82') {
        reply({ message: 'There is a problem with the server' }).code(503);
      } else {
        reply(SingleResponse(appStat));
      }
    }
  });

  smocks.route({
    id: 'organizations',
    label: 'Organizations',
    path: `${BASE_URL}/organizations`,
    handler(req, reply) {
      if (ENV_NO_ORGS) {
        reply(MultiResponse([]));
      } else {
        reply(MultiResponse(organizations));
      }
    }
  });

  smocks.route({
    id: 'organization',
    label: 'Organization',
    path: `${BASE_URL}/organizations/{guid}`,
    handler(req, reply) {
      const { guid } = req.params;
      const org = organizations.find(
        organization => organization.metadata.guid === guid
      );
      reply(SingleResponse(org));
    }
  });

  smocks.route({
    id: 'organizations-services',
    label: 'Organizations services',
    path: `${BASE_URL}/organizations/{guid}/services`,
    handler(req, reply) {
      reply(MultiResponse(services));
    }
  });

  smocks.route({
    id: 'organizations-summary',
    label: 'Organization Summary',
    path: `${BASE_URL}/organizations/{guid}/summary`,
    handler(req, reply) {
      const { guid } = req.params;
      const organization = organizationSummaries.find(
        organizationSummary => organizationSummary.guid === guid
      );
      reply(SingleResponse(organization));
    }
  });

  smocks.route({
    id: 'organization-memory-usage',
    label: 'Organization memory usage',
    path: `${BASE_URL}/organizations/{guid}/memory_usage`,
    handler(req, reply) {
      reply(SingleResponse(organizationMemoryUsage));
    }
  });

  smocks.route({
    id: 'organization-quota-definitions',
    label: 'Organization quota definitions',
    path: `${BASE_URL}/quota_definitions/{guid}`,
    handler(req, reply) {
      const { guid } = req.params;
      const quota = organizationQuotaDefinitions.find(
        orgQuota => orgQuota.metadata.guid === guid
      );
      reply(SingleResponse(quota));
    }
  });

  smocks.route({
    id: 'organization-users',
    label: 'Organization users',
    path: `${BASE_URL}/organizations/{guid}/users`,
    handler(req, reply) {
      if (ENV_NO_ORG_USERS) {
        reply(MultiResponse([organizationUsers[0]]));
      } else {
        reply(MultiResponse(organizationUsers));
      }
    }
  });

  smocks.route({
    id: 'user',
    label: 'User',
    path: `${BASE_URL}/users/{guid}`,
    handler(req, reply) {
      const { guid } = req.params;
      let user = organizationUsers.find(
        orgUser => orgUser.metadata.guid === guid
      );
      if (!user) {
        for (const userName of Object.keys(userInviteResponses)) {
          const invite = userInviteResponses[userName];
          if (invite.userGuid !== guid) {
            continue;
          }
          user = {
            metadata: {
              guid: invite.userGuid
            },
            entity: {
              username: userName
            }
          };
        }
      }

      if (user) {
        reply(SingleResponse(user));
      } else {
        reply({ message: 'User not found' }).code(400);
      }
    }
  });

  smocks.route({
    id: 'user-organizations',
    label: 'User organizations',
    path: `${BASE_URL}/users/{guid}/organizations`,
    handler(req, reply) {
      const { guid } = req.params;
      let userOrgFlag = 'default';
      if (userOrganizations[guid]) {
        userOrgFlag = guid;
      }
      reply(MultiResponse(userOrganizations[userOrgFlag]));
    }
  });

  smocks.route({
    id: 'user-associate-to-organizations',
    label: 'User associate to organization',
    method: 'PUT',
    path: `${BASE_URL}/organizations/{orgGuid}/users/{guid}`,
    handler(req, reply) {
      let userCreateResponse;
      const { guid } = req.params;
      if (guid && userAssociationResponses[guid]) {
        userCreateResponse = userAssociationResponses[guid];
      } else {
        userCreateResponse = userAssociationResponses.default;
      }
      reply(userCreateResponse);
    }
  });

  smocks.route({
    id: 'user-spaces',
    label: 'User spaces',
    path: `${BASE_URL}/users/{guid}/spaces`,
    handler(req, reply) {
      const { guid } = req.params;
      let userSpaceFlag = 'default';
      if (userSpaces[guid]) {
        userSpaceFlag = guid;
      }
      reply(MultiResponse(userSpaces[userSpaceFlag]));
    }
  });

  smocks.route({
    id: 'organization-users-roles',
    label: 'Organization user roles',
    path: `${BASE_URL}/organizations/{guid}/user_roles`,
    handler(req, reply) {
      let orgResponseName;
      const { guid } = req.params;
      if (organizationUserRoles[guid]) {
        orgResponseName = guid;
      } else {
        orgResponseName = 'default';
      }
      reply(MultiResponse(organizationUserRoles[orgResponseName]));
    }
  });

  smocks.route({
    id: 'user-roles-org-add-new-role',
    label: 'User roles Org Add New role',
    method: 'PUT',
    path: `${BASE_URL}/organizations/{orgGuid}/{role}/{userGuid}`,
    handler(req, reply) {
      const { orgGuid } = req.params;
      const { role } = req.params;
      const user = userRoleOrgAddNewRole(orgGuid);
      switch (role) {
        case 'managers':
        case 'auditors':
        case 'billing_managers':
        case 'users':
          reply(SingleResponse(user));
          break;
        default:
          reply().code(500);
      }
    }
  });

  smocks.route({
    id: 'user-roles-org-delete-role',
    label: 'User roles Org Delete role',
    method: 'DELETE',
    path: `${BASE_URL}/organizations/{orgGuid}/{role}/{userGuid}`,
    handler(req, reply) {
      const { role } = req.params;
      switch (role) {
        case 'managers':
        case 'auditors':
        case 'billing_managers':
        case 'users':
          reply(SingleResponse({}));
          break;
        default:
          reply().code(500);
      }
    }
  });

  smocks.route({
    id: 'spaces',
    label: 'Spaces',
    path: `${BASE_URL}/spaces`,
    handler(req, reply) {
      if (ENV_NO_SPACES) {
        reply(MultiResponse([]));
      } else {
        reply(MultiResponse(spaces));
      }
    }
  });

  smocks.route({
    id: 'space-events',
    label: 'Space events',
    path: `${BASE_URL}/spaces/{guid}/events`,
    handler(req, reply) {
      const { guid } = req.params;
      const spaceEvents = anyEvents.filter(
        event => event.entity.space_guid === guid
      );
      reply(MultiResponse(spaceEvents));
    }
  });

  smocks.route({
    id: 'space-service-instances',
    label: 'Space service instsances',
    path: `${BASE_URL}/spaces/{guid}/service_instances`,
    handler(req, reply) {
      const { guid } = req.params;
      const instances = serviceInstances.filter(
        serviceInstance => serviceInstance.entity.space_guid === guid
      );
      reply(MultiResponse(instances));
    }
  });

  smocks.route({
    id: 'space-routes',
    label: 'Space routes',
    path: `${BASE_URL}/spaces/{guid}/routes`,
    handler(req, reply) {
      const { guid } = req.params;
      const routes = spaceRoutes.filter(
        spaceRoute => spaceRoute.entity.space_guid === guid
      );
      reply(MultiResponse(routes));
    }
  });

  smocks.route({
    id: 'space-summary',
    label: 'Space summary',
    path: `${BASE_URL}/spaces/{guid}/summary`,
    handler(req, reply) {
      const { guid } = req.params;
      const space = spaceSummaries.find(
        spaceSummary => spaceSummary.guid === guid
      );
      if (ENV_NO_APPS) {
        space.apps = [];
      }
      reply(SingleResponse(space));
    }
  });

  smocks.route({
    id: 'space-quota-definitions',
    label: 'Space quota definitions',
    path: `${BASE_URL}/space_quota_definitions`,
    handler(req, reply) {
      reply(MultiResponse(spaceQuotaDefinitions));
    }
  });

  smocks.route({
    id: 'space-user-roles',
    label: 'Space user roles',
    path: `${BASE_URL}/spaces/{guid}/user_roles`,
    handler(req, reply) {
      let spaceResponseName = 'default';
      const { guid } = req.params;
      if (spaceUserRoles[guid] && !ENV_NO_SPACE_USERS) {
        spaceResponseName = guid;
      }
      reply(MultiResponse(spaceUserRoles[spaceResponseName]));
    }
  });

  smocks.route({
    id: 'user-roles-space-add-new-role',
    label: 'User roles Space Add New role',
    method: 'PUT',
    path: `${BASE_URL}/spaces/{spaceGuid}/{role}/{userGuid}`,
    handler(req, reply) {
      const { role } = req.params;
      switch (role) {
        case 'managers':
        case 'auditors':
        case 'developers':
        case 'users':
          reply(SingleResponse({}));
          break;
        default:
          reply().code(500);
      }
    }
  });

  smocks.route({
    id: 'user-roles-space-delete-role',
    label: 'User roles Space Delete role',
    method: 'DELETE',
    path: `${BASE_URL}/spaces/{spaceGuid}/{role}/{userGuid}`,
    handler(req, reply) {
      const { role } = req.params;
      switch (role) {
        case 'managers':
        case 'auditors':
        case 'developers':
        case 'users':
          reply(SingleResponse({}));
          break;
        default:
          reply().code(500);
      }
    }
  });

  smocks.route({
    id: 'service-bindings',
    label: 'Service bindings',
    path: `${BASE_URL}/service_bindings`,
    handler(req, reply) {
      reply(MultiResponse(serviceBindings));
    }
  });

  smocks.route({
    id: 'service-plans',
    label: 'Service plans',
    path: `${BASE_URL}/service_plans/{guid}`,
    handler(req, reply) {
      const { guid } = req.params;
      const plan = servicePlans.find(
        servicePlan => servicePlan.metadata.guid === guid
      );
      reply(MultiResponse(plan));
    }
  });

  smocks.route({
    id: 'service-service-plans',
    label: 'Service service plans',
    path: `${BASE_URL}/services/{guid}/service_plans`,
    handler(req, reply) {
      const serviceGuid = req.params.guid;
      const plans = servicePlans.filter(
        servicePlan => servicePlan.entity.service_guid === serviceGuid
      );
      reply(MultiResponse(plans));
    }
  });

  smocks.route({
    id: 'quota-definitions',
    label: 'Quota definitions',
    path: `${BASE_URL}/quota_definitions`,
    handler(req, reply) {
      // TODO should be renamed just quotaDefinitions?
      reply(MultiResponse(organizationQuotaDefinitions));
    }
  });

  smocks.route({
    id: 'shared-domains',
    label: 'Shared domains',
    path: `${BASE_URL}/shared_domains/{guid}`,
    handler(req, reply) {
      const { guid } = req.params;
      const domain = sharedDomains.find(
        sharedDomain => sharedDomain.metadata.guid === guid
      );
      reply(SingleResponse(domain));
    }
  });
};
