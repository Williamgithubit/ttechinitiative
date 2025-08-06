#!/usr/bin/env bash
# Render.com build script for T-Tech Initiative

set -o errexit

# Install dependencies
npm ci

# Build the application
npm run build
