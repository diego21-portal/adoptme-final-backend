#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
case "$(node --version)" in
  v24.*) ;;
  *) echo "Node.js 24 LTS is required" >&2; exit 1 ;;
esac
npm install --package-lock-only --ignore-scripts
npm ci
npm run check
echo "Repository prepared. Commit package-lock.json before publishing."
