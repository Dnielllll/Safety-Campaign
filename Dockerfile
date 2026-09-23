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
echo "APP_ENV=${APP_ENV:-production}" > .env\n\
echo "APP_DEBUG=${APP_DEBUG:-false}" >> .env\n\
echo "APP_URL=${APP_URL:-http://localhost}" >> .env\n\
echo "APP_KEY=${APP_KEY}" >> .env\n\
echo "APP_LOCALE=${APP_LOCALE:-en}" >> .env\n\
echo "APP_FALLBACK_LOCALE=${APP_FALLBACK_LOCALE:-en}" >> .env\n\
echo "APP_FAKER_LOCALE=en_US" >> .env\n\
echo "APP_MAINTENANCE_DRIVER=file" >> .env\n\
echo "BCRYPT_ROUNDS=12" >> .env\n\
echo "LOG_CHANNEL=${LOG_CHANNEL:-stack}" >> .env\n\
echo "LOG_STACK=${LOG_STACK:-single}" >> .env\n\
echo "LOG_DEPRECATIONS_CHANNEL=null" >> .env\n\
echo "LOG_LEVEL=${LOG_LEVEL:-debug}" >> .env\n\
echo "DB_CONNECTION=${DB_CONNECTION:-pgsql}" >> .env\n\
echo "DB_HOST=${DB_HOST}" >> .env\n\
echo "DB_PORT=${DB_PORT:-5432}" >> .env\n\
echo "DB_DATABASE=${DB_DATABASE:-postgres}" >> .env\n\
echo "DB_USERNAME=${DB_USERNAME}" >> .env\n\
echo "DB_PASSWORD=${DB_PASSWORD}" >> .env\n\
echo "DB_SSLMODE=${DB_SSLMODE:-require}" >> .env\n\
echo "SESSION_DRIVER=${SESSION_DRIVER:-cookie}" >> .env\n\
echo "SESSION_LIFETIME=120" >> .env\n\
echo "SESSION_ENCRYPT=false" >> .env\n\
echo "SESSION_PATH=/" >> .env\n\
echo "SESSION_DOMAIN=" >> .env\n\
echo "BROADCAST_CONNECTION=log" >> .env\n\
echo "FILESYSTEM_DISK=local" >> .env\n\
echo "QUEUE_CONNECTION=${QUEUE_CONNECTION:-sync}" >> .env\n\
echo "CACHE_DRIVER=${CACHE_DRIVER:-file}" >> .env\n\
echo "MEMCACHED_HOST=127.0.0.1" >> .env\n\
echo "REDIS_CLIENT=phpredis" >> .env\n\
echo "REDIS_HOST=127.0.0.1" >> .env\n\
echo "REDIS_PASSWORD=null" >> .env\n\
echo "REDIS_PORT=6379" >> .env\n\
echo "MAIL_MAILER=log" >> .env\n\
echo "MAIL_SCHEME=null" >> .env\n\
echo "MAIL_HOST=127.0.0.1" >> .env\n\
echo "MAIL_PORT=2525" >> .env\n\
echo "MAIL_USERNAME=null" >> .env\n\
echo "MAIL_PASSWORD=null" >> .env\n\
echo "MAIL_FROM_ADDRESS=hello@example.com" >> .env\n\
echo "MAIL_FROM_NAME=Barangay 178 SSMS" >> .env\n\
echo "AWS_ACCESS_KEY_ID=" >> .env\n\
echo "AWS_SECRET_ACCESS_KEY=" >> .env\n\
echo "AWS_DEFAULT_REGION=us-east-1" >> .env\n\
echo "AWS_BUCKET=" >> .env\n\
echo "AWS_USE_PATH_STYLE_ENDPOINT=false" >> .env\n\
echo "VITE_APP_NAME=Barangay 178 SSMS" >> .env\n\
echo "FRONTEND_URL=${FRONTEND_URL}" >> .env\n\
echo "SANCTUM_STATEFUL_DOMAINS=${SANCTUM_STATEFUL_DOMAINS}" >> .env\n\
echo "SEMAPHORE_API_KEY=" >> .env\n\
echo "GOOGLE_CLOUD_API_KEY=" >> .env\n\
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