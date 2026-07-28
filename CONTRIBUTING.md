# Contributing

## Development workflow

1. Create a focused branch.
2. Install dependencies with `npm ci`.
3. Keep domain calculations in `lib/domain` and infrastructure concerns in `lib/server`.
4. Add or update tests for changed leak or risk behaviour.
5. Run the complete quality gate:

   ```bash
   npm run check
   npm run build
   ```

6. Open a pull request that explains the behaviour change and testing performed.

## Code principles

- Prefer explicit, typed contracts over unstructured objects.
- Do not describe deterministic heuristics as artificial intelligence.
- Do not return success for data that was not persisted.
- Label simulated data clearly.
- Never commit credentials, connection strings, or `firmware/config.h`.
