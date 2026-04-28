module.exports = {
  apps: [{
    name: "campus-ballot-api",
    script: "./server.js",
    // -------------------------------------------------------------------------
    // Cluster Mode: Bottleneck #9 Fix
    // -------------------------------------------------------------------------
    // "max" uses all available CPU cores. If the server has 4 cores, this starts
    // 4 Node.js instances. This effectively quadruples your request throughput.
    // When one instance is busy with a heavy DB query, others can still
    // handle incoming votes.
    instances: "max",
    exec_mode: "cluster",
    
    // Environment variables
    env: {
      NODE_ENV: "production",
      PORT: 5000,
    },
    
    // Auto-restart if memory exceeds 500MB (prevents memory leak crashes)
    max_memory_restart: "500M",
    
    // Restart delay to prevent thrashing
    exp_backoff_restart_delay: 100,
    
    // Log configuration
    log_date_format: "YYYY-MM-DD HH:mm Z",
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-out.log",
    merge_logs: true,
  }]
};
