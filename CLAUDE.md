# OOVERT — working notes for Claude

## Deployment (owner's standing instruction, 2026-07-26)
- The live site is **https://oovert.com** on Hostinger (LiteSpeed), nothing else.
- Deploys happen automatically: `.github/workflows/deploy-hostinger.yml` builds
  Eleventy and uploads `_site/` over FTPS on every push to `main`. To ship,
  merge to `main` and verify against oovert.com.
- **Do not deploy to or verify via Vercel.** The old oovert-agency.vercel.app
  project is deprecated; `vercel.json` sets `git.deploymentEnabled: false` so
  pushes no longer trigger Vercel builds.

## Verification habits this repo expects
- Check horizontal overflow at 1920/1440/1366/768/390 before shipping.
- Confirm no JS errors through a full homepage scroll.
- Reduced-motion and no-JS must always get a complete, static, readable page.
- Verify with rendered pixels (Playwright screenshots), not computed styles
  alone.

## Copy rules
- No em-dashes anywhere in rendered copy. No "world-class".
- Truth-pass discipline: never invent clients, metrics, or team claims.
