# Laravel Dockerfile for Render (Root level wrapper)
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libicu-dev \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure pgsql --with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip intl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy Laravel files from backend folder
COPY backend/ .

# Install PHP dependencies
RUN composer install --optimize-autoloader --no-dev --no-interaction

# Configure environment - create startup script to build .env from Render env vars
RUN echo '#!/bin/bash\n\
# Create .env from environment variables at runtime\n\
cat > .env << EOF\n\
APP_ENV=${APP_ENV:-production}\n\
APP_DEBUG=${APP_DEBUG:-false}\n\
APP_URL=${APP_URL:-http://localhost}\n\
APP_KEY=${APP_KEY}\n\
APP_LOCALE=${APP_LOCALE:-en}\n\
APP_FALLBACK_LOCALE=${APP_FALLBACK_LOCALE:-en}\n\
APP_FAKER_LOCALE=en_US\n\
APP_MAINTENANCE_DRIVER=file\n\
BCRYPT_ROUNDS=12\n\
LOG_CHANNEL=${LOG_CHANNEL:-stack}\n\
LOG_STACK=${LOG_STACK:-single}\n\
LOG_DEPRECATIONS_CHANNEL=null\n\
LOG_LEVEL=${LOG_LEVEL:-debug}\n\
DB_CONNECTION=${DB_CONNECTION:-pgsql}\n\
DB_HOST=${DB_HOST}\n\
DB_PORT=${DB_PORT:-5432}\n\
DB_DATABASE=${DB_DATABASE:-postgres}\n\
DB_USERNAME=${DB_USERNAME}\n\
DB_PASSWORD=${DB_PASSWORD}\n\
DB_SSLMODE=${DB_SSLMODE:-require}\n\
SESSION_DRIVER=${SESSION_DRIVER:-cookie}\n\
SESSION_LIFETIME=120\n\
SESSION_ENCRYPT=false\n\
SESSION_PATH=/\n\
SESSION_DOMAIN=\n\
BROADCAST_CONNECTION=log\n\
FILESYSTEM_DISK=local\n\
QUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}\n\
CACHE_DRIVER=${CACHE_DRIVER:-file}\n\
MEMCACHED_HOST=127.0.0.1\n\
REDIS_CLIENT=phpredis\n\
REDIS_HOST=127.0.0.1\n\
REDIS_PASSWORD=null\n\
REDIS_PORT=6379\n\
MAIL_MAILER=log\n\
MAIL_SCHEME=null\n\
MAIL_HOST=127.0.0.1\n\
MAIL_PORT=2525\n\
MAIL_USERNAME=null\n\
MAIL_PASSWORD=null\n\
MAIL_FROM_ADDRESS=hello@example.com\n\
MAIL_FROM_NAME="Barangay 178 SSMS"\n\
AWS_ACCESS_KEY_ID=\n\
AWS_SECRET_ACCESS_KEY=\n\
AWS_DEFAULT_REGION=us-east-1\n\
AWS_BUCKET=\n\
AWS_USE_PATH_STYLE_ENDPOINT=false\n\
VITE_APP_NAME="Barangay 178 SSMS"\n\
FRONTEND_URL=${FRONTEND_URL}\n\
SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS}\n\
SUPABASE_URL=${SUPABASE_URL}\n\
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}\n\
SEMAPHORE_API_KEY=\n\
GOOGLE_CLOUD_API_KEY=\n\
EOF\n\
\n\
# Start Apache\n\
apache2-foreground' > /start.sh && chmod +x /start.sh

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/www/html/public

# Configure Apache to serve from public folder
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf \
    && sed -i 's|<Directory /var/www/html>|<Directory /var/www/html/public>|g' /etc/apache2/sites-available/000-default.conf \
    && sed -i 's|AllowOverride None|AllowOverride All|g' /etc/apache2/sites-available/000-default.conf

# Expose port 80 for Apache
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start Apache in foreground using the startup script
CMD ["/start.sh"]