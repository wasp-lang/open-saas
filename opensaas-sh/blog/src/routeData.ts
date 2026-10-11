import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { getCurrentDocsPathname } from "./archivedDocsVersions.mjs";

// Old docs versions are near-duplicates of the current docs, so we point their
// canonical URL (and `og:url`) at the equivalent current page.
export const onRequest = defineRouteMiddleware((context) => {
  const currentPathname = getCurrentDocsPathname(context.url.pathname);
  if (!currentPathname || !context.site) return;

  const currentHref = new URL(currentPathname, context.site).href;
  for (const { tag, attrs } of context.locals.starlightRoute.head) {
    if (tag === "link" && attrs?.rel === "canonical") {
      attrs.href = currentHref;
    } else if (tag === "meta" && attrs?.property === "og:url") {
      attrs.content = currentHref;
    }
  }
});
