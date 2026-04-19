import { Link as WaspRouterLink, routes } from "wasp/client/router";

export function Announcement() {
  return (
    <div className="from-accent to-secondary text-primary-foreground bg-linear-to-r relative flex w-full items-center justify-center gap-3 p-3 text-center text-sm font-semibold">
      <span className="hidden lg:block">
        New: pasted rent roll → structured JSON in 10 seconds.
      </span>
      <div className="bg-primary-foreground/20 hidden w-0.5 self-stretch lg:block" />
      <WaspRouterLink
        to={routes.SignupRoute.to}
        className="bg-background/20 hover:bg-background/30 cursor-pointer rounded-full px-2.5 py-1 text-xs tracking-wider transition-colors"
      >
        Start free — 5 credits →
      </WaspRouterLink>
    </div>
  );
}
