# Smart Assist backend production image
# Node runs the Express API; LibreOffice converts DOCX/PPTX into temporary PDFs.
FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    fontconfig \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-noto-core \
    fonts-sil-padauk \
    libreoffice \
    tini \
  && fc-cache -f -v >/dev/null \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Use the lock file when it matches package.json. Older Smart Assist ZIPs had
# a lock file from before the R2 SDK, so the fallback repairs that situation.
COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev || (rm -rf node_modules && npm install --omit=dev); \
    else \
      npm install --omit=dev; \
    fi \
  && npm cache clean --force

COPY . .

# previews is intentionally ephemeral. Uploaded materials live in R2.
# avatars remain local in this version and are writable by the non-root user.
RUN mkdir -p \
      /app/previews \
      /app/uploads/avatars \
      /app/uploads/materials \
      /tmp/smart-assist \
      /tmp/runtime-node \
  && chown -R node:node \
      /app \
      /home/node \
      /tmp/smart-assist \
      /tmp/runtime-node

ENV NODE_ENV=production \
    PORT=5000 \
    LIBREOFFICE_PATH=/usr/bin/soffice \
    HOME=/home/node \
    TMPDIR=/tmp/smart-assist \
    XDG_RUNTIME_DIR=/tmp/runtime-node

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["node", "scripts/dockerHealthcheck.js"]

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["npm", "start"]
