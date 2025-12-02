# Troubleshooting - Debugging Wasp

## `wasp clean` Doesn't Help

Manually clean and reinstall:
```bash
rm -rf .wasp/ node_modules/
npm install
wasp start
```

## Operation Not Found at Runtime

1. verify function is exported: `export const myOperation = ...`
2. check import path in `main.wasp` matches file location
3. check for typos in operation name

## Port Already in Use

```bash
pkill -f wasp
# or: lsof -i :3000 && kill <PID>
```

## IDE Errors But Wasp Compiles

Trust Wasp compiler. To fix IDE:
1. restart TypeScript server
2. verify IDE isn't excluding `.wasp/out/sdk/wasp/`
3. close and reopen workspace

## Generated Code Location

For debugging, inspect `.wasp/out/`:
- Server: `.wasp/out/server/`
- Client: `.wasp/out/web-app/`
- SDK types: `.wasp/out/sdk/wasp/`

## Need More Help

- Wasp Discord: https://discord.gg/aCamt5wCpS
- Wasp Docs: https://wasp.sh/llms.txt
