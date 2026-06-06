#!/bin/sh
set -e

mkdir -p \
  /app/data/listings \
  /app/data/car-media \
  /app/data/trade-in \
  /app/data/admin/sessions \
  /app/public/uploads/listings \
  /app/public/uploads/trade-in \
  /app/public/hero \
  /app/public/logo \
  /app/public/cars/uploads

chown -R nextjs:nodejs \
  /app/data \
  /app/public/uploads \
  /app/public/hero \
  /app/public/logo \
  /app/public/cars/uploads \
  2>/dev/null || true

exec gosu nextjs "$@"
