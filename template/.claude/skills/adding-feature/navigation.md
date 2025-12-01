# Navigation

## Adding to Navbar

1. read [`../../../app/src/client/components/AppNavBar.tsx`](../../../app/src/client/components/AppNavBar.tsx)
2. find the appropriate section (authenticated vs. public links)
3. add link using `Link` component from react-router-dom
4. follow existing patterns for styling and structure

## Example

```tsx
<Link to="/feature-path">Feature Name</Link>
```

## Notes

- only add to navbar if feature should be easily accessible
- consider whether link should be public or authenticated-only
- follow existing styling patterns
