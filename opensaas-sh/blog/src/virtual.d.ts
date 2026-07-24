declare module "virtual:starlight-blog/config" {
  const StarlightBlogConfig: import("starlight-blog").StarlightBlogConfig;

  export default StarlightBlogConfig;
}
declare module "virtual:starlight/user-config" {
  const Config: import("@astrojs/starlight/types").StarlightConfig;

  export default Config;
}
declare module "virtual:starlight/user-images" {
  type ImageMetadata = import("astro").ImageMetadata;
  export const logos: {
    dark?: ImageMetadata;
    light?: ImageMetadata;
  };
}
declare module "virtual:starlight/components/LanguageSelect" {
  const LanguageSelect: typeof import("@astrojs/starlight/components/LanguageSelect.astro").default;

  export default LanguageSelect;
}
declare module "virtual:starlight/components/Search" {
  const Search: typeof import("@astrojs/starlight/components/Search.astro").default;

  export default Search;
}
declare module "virtual:starlight/components/SiteTitle" {
  const SiteTitle: typeof import("@astrojs/starlight/components/SiteTitle.astro").default;

  export default SiteTitle;
}
declare module "virtual:starlight/components/SocialIcons" {
  const SocialIcons: typeof import("@astrojs/starlight/components/SocialIcons.astro").default;

  export default SocialIcons;
}
declare module "virtual:starlight/components/ThemeSelect" {
  const ThemeSelect: typeof import("@astrojs/starlight/components/ThemeSelect.astro").default;

  export default ThemeSelect;
}
declare module "virtual:astro-config" {
  const Config: import("@astrojs/types").Config;

  export default Config;
}
