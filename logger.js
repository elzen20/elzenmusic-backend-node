const logger = {
  debug: function (message) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEBUG] ${message}`);
    }
  },
  info: function (message) {
    console.log(`[INFO] ${message}`);
  },
  warn: function (message) {
    console.warn(`[WARN] ${message}`);
  },
  error: function (message) {
    console.error(`[ERROR] ${message}`);
  },
};

// Hacer el logger disponible globalmente
global.logger = logger;
