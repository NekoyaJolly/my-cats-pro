#!/bin/sh
set -e

if [ -n "$INSTANCE_CONNECTION_NAME" ] && ! echo "$DATABASE_URL" | grep -q "cloudsql"; then
	echo "Configuring Cloud SQL socket connection..."
	NEW_DATABASE_URL="$(node <<'EOF'
const urlInput = process.env.DATABASE_URL;
const instance = process.env.INSTANCE_CONNECTION_NAME;
if (!urlInput || !instance) {
	console.log(urlInput ?? '');
	process.exit(0);
}

try {
	const url = new URL(urlInput);
	url.hostname = 'localhost';
	if (!url.port) {
		url.port = '5432';
	}

	const params = url.searchParams;
		for (const key of Array.from(params.keys())) {
			if (key.toLowerCase() === 'host') {
				params.delete(key);
			}
			if (key.toLowerCase() === 'sslmode') {
				params.delete(key);
			}
		}

		params.set('host', `/cloudsql/${instance}`);
		params.set('sslmode', 'disable');

		console.log(url.toString());
} catch (err) {
	console.error('Failed to rewrite DATABASE_URL for Cloud SQL connection:', err);
	process.exit(1);
}
EOF
		)"
		export DATABASE_URL="$NEW_DATABASE_URL"
			if [ -z "$PGSSLMODE" ]; then
				export PGSSLMODE=disable
			fi
fi

echo "Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Seeding database..."
node dist/prisma/seed.js

echo "Starting application..."
exec node dist/src/main.js
