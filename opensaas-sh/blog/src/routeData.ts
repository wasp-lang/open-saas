import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { getCurrentDocsPathname } from "./archivedDocsVersions.mjs";

export const onRequest = defineRouteMiddleware(async (context, next) => {
  // Run starlight-blog's middleware first so `locals.starlightBlog` is set.
  await next();

  const { starlightRoute, starlightBlog } = context.locals;

  // Old docs versions are near-duplicates of the current docs, so we point their
  // canonical URL (and `og:url`) at the equivalent current page.
  const currentPathname = getCurrentDocsPathname(context.url.pathname);
  if (currentPathname && context.site) {
    const currentHref = new URL(currentPathname, context.site).href;
    for (const { tag, attrs } of starlightRoute.head) {
      if (tag === "link" && attrs?.rel === "canonical") {
        attrs.href = currentHref;
      } else if (tag === "meta" && attrs?.property === "og:url") {
        attrs.content = currentHref;
      }
    }
  }

  // starlight-blog generates the blog index, pagination, tag, and author pages
  // without a description, so they all fall back to the site-wide one. This
  // gives each of them its own `description` and `og:description`.
  const description = getBlogListingDescription(
    starlightRoute.id,
    starlightRoute.entry.data.title,
    starlightBlog,
  );
  if (!description) return;

  starlightRoute.entry.data.description = description;
  for (const { tag, attrs } of starlightRoute.head) {
    if (
      tag === "meta" &&
      (attrs?.name === "description" || attrs?.property === "og:description")
    ) {
      attrs.content = description;
    }
  }
});

const BLOG_SUMMARY =
  "guides, case studies, and launch stories on building and growing a SaaS with React, Node.js, and Wasp";

function getBlogListingDescription(
  id: string,
  title: string,
  blog: App.Locals["starlightBlog"],
): string | undefined {
  if (id === "blog") {
    return `The Open SaaS blog: ${BLOG_SUMMARY}.`;
  }

  const page = id.match(/^blog\/(\d+)$/)?.[1];
  if (page) {
    return `Page ${page} of the Open SaaS blog: ${BLOG_SUMMARY}.`;
  }

  const tag = id.match(/^blog\/tags\/(.+)$/)?.[1];
  if (tag) {
    const count = blog.posts.filter((post) =>
      post.tags.some(({ href }) => href.endsWith(`/blog/tags/${tag}/`)),
    ).length;
    return `${count} Open SaaS blog ${count === 1 ? "post" : "posts"} tagged "${title}": ${BLOG_SUMMARY}.`;
  }

  if (id.startsWith("blog/authors/")) {
    const author = blog.authors.find(({ name }) => name === title);
    const role = author?.title ? ` (${author.title})` : "";
    return `Posts by ${title}${role} on the Open SaaS blog: ${BLOG_SUMMARY}.`;
  }
}
