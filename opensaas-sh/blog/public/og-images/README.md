Images stored here must follow the naming convention `<post-slug>.webp` and must always be .webp files, e.g. `2023-11-21-coverlettergpt.webp`.

This is because OG Image URLs are automatically generated for each blog post based on the logic in `src/components/HeadWithOGImage.astro`:

```tsx
const ogImageUrl = new URL(
  `/og-images/${Astro.props.id.replace(/blog\//, '').replace(/\.\w+$/, '.webp')}`,
  Astro.site,
)
```