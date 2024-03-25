#!/bin/bash

# Step 1: Identify the Docker container running on port 5432
CONTAINER_ID=$(docker ps --filter "publish=5432" --format "{{.ID}}")

if [ -z "$CONTAINER_ID" ]; then
    echo "No container found running on port 5432."
    exit 1
fi

# Step 2: Extract the database connection details
# Assuming the standard Postgres environment variables are used within the Docker container
DB_NAME=$(docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' $CONTAINER_ID | grep POSTGRES_DB= | cut -d'=' -f2)

# Construct the Postgres URL. We assume the host is localhost since it's a local Docker environment
# and the default Postgres port is 5432. Adjust if necessary.
DATABASE_URL="postgresql://postgresWaspDevUser:postgresWaspDevPass@localhost:5432/${DB_NAME}"

echo "Constructed DATABASE_URL: $DATABASE_URL"

# Step 3: Write or append DATABASE_URL in .env file
# Check if .env exists
if [ ! -f ".env" ]; then
    echo "DATABASE_URL=$DATABASE_URL" > .env
    echo ".env file created with DATABASE_URL."
else
    # Avoid duplicating the line if DATABASE_URL already exists in .env
    if grep -q 'DATABASE_URL=' .env; then
        # Use sed to replace the existing DATABASE_URL line, with macOS compatibility
        # sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env 
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" .env
        echo "DATABASE_URL updated in .env file."
    else
        # Append DATABASE_URL to .env
        echo "DATABASE_URL=$DATABASE_URL" >> .env
        echo "DATABASE_URL added to .env file."
    fi
fi
