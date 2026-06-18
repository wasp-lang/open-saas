import { options } from "@wasp.sh/file-based-routing";

export default options({
  // Prerendering routes with static content creates HTML files at build time that are served immediately,
  // improving SEO, search engine/AI crawling, and performance: https://wasp.sh/docs/advanced/prerendering
  route: { prerender: true },
});
