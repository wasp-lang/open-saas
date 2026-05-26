import { page, route, type Page, type Part, type Route } from "@wasp.sh/spec";

import { AnalyticsDashboardPage } from "./dashboards/analytics/AnalyticsDashboardPage" with { type: "ref" };
import { MessagesPage } from "./dashboards/messages/MessagesPage" with { type: "ref" };
import { UsersDashboardPage } from "./dashboards/users/UsersDashboardPage" with { type: "ref" };
import { CalendarPage } from "./elements/calendar/CalendarPage" with { type: "ref" };
import { SettingsPage } from "./elements/settings/SettingsPage" with { type: "ref" };
import { ButtonsPage } from "./elements/ui-elements/ButtonsPage" with { type: "ref" };

export const admin: Part[] = [
  createAdminRoute("AdminRoute", "/admin", AnalyticsDashboardPage),
  createAdminRoute("AdminUsersRoute", "/admin/users", UsersDashboardPage),
  createAdminRoute("AdminSettingsRoute", "/admin/settings", SettingsPage),
  createAdminRoute("AdminCalendarRoute", "/admin/calendar", CalendarPage),
  createAdminRoute("AdminUIButtonsRoute", "/admin/ui/buttons", ButtonsPage),
  // TODO: Add functionality to allow users to send messages to admin
  //       and make them accessible via the admin dashboard.
  createAdminRoute("AdminMessagesRoute", "/admin/messages", MessagesPage),
];

/**
 * All admin routes require authentication.
 */
function createAdminRoute(
  name: Route["name"],
  path: Route["path"],
  pageComponent: Page["component"],
): Route {
  return route(name, path, page(pageComponent, { authRequired: true }));
}
