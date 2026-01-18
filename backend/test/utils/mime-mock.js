// Mock for mime@4.x that provides a CommonJS-compatible interface
// This is used in tests to avoid ESM import issues

const mimeTypes = {
  'html': 'text/html',
  'htm': 'text/html',
  'shtml': 'text/html',
  'css': 'text/css',
  'xml': 'text/xml',
  'gif': 'image/gif',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'js': 'application/javascript',
  'json': 'application/json',
  'png': 'image/png',
  'pdf': 'application/pdf',
  'svg': 'image/svg+xml',
  'txt': 'text/plain',
  'ico': 'image/x-icon',
  'mp3': 'audio/mpeg',
  'mp4': 'video/mp4',
  'zip': 'application/zip',
};

const extensionTypes = Object.entries(mimeTypes).reduce((acc, [ext, type]) => {
  if (!acc[type]) acc[type] = [];
  acc[type].push(ext);
  return acc;
}, {});

function getType(pathOrExt) {
  if (!pathOrExt || typeof pathOrExt !== 'string') {
    return null;
  }
  const ext = pathOrExt.split('.').pop().toLowerCase();
  return mimeTypes[ext] || null;
}

function getExtension(mimeType) {
  if (!mimeType || typeof mimeType !== 'string') {
    return null;
  }
  const type = mimeType.split(';')[0].trim();
  const exts = extensionTypes[type];
  return exts ? exts[0] : null;
}

function define(typeMap, force) {
  // Mock implementation - just store the mappings
  if (!typeMap || typeof typeMap !== 'object') return;
  for (const [mimeType, extensions] of Object.entries(typeMap)) {
    if (Array.isArray(extensions)) {
      extensions.forEach(ext => {
        const cleanExt = ext.replace(/^\*/, '');
        if (force || !mimeTypes[cleanExt]) {
          mimeTypes[cleanExt] = mimeType;
        }
      });
      if (!extensionTypes[mimeType]) {
        extensionTypes[mimeType] = [];
      }
      extensionTypes[mimeType].push(...extensions.map(e => e.replace(/^\*/, '')));
    }
  }
}

// Provide both old and new API for compatibility
module.exports = {
  getType,
  getExtension,
  define,
  // Legacy API (mime@1.x, mime@2.x)
  lookup: getType,
  extension: getExtension,
  // Legacy charset API (removed in mime@2.x but still expected by some packages)
  charsets: {
    lookup: function(mimeType) {
      if (!mimeType) return null;
      const type = mimeType.split('/')[0];
      if (type === 'text' || mimeType === 'application/javascript' || mimeType === 'application/json') {
        return 'UTF-8';
      }
      return null;
    }
  }
};
