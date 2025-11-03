# Prevent downloading dev dependencies
export NODE_ENV="production"

export SITE_URL="https://r-entries.com"
export BASE_PATH="/"
export TRAILING_SLASH="never"
export PORT="45399"

git pull
rm -r dist
npm ci
npm run build
npm run preview -- --allowed-hosts=r-entries.com
