module.exports = {
  apps: [{
    name: 'chefbounty-dashboard',
    script: './dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    // Restart delay
    restart_delay: 4000,
    // Crash handling
    min_uptime: '10s',
    max_restarts: 10,
    // Memory optimization
    node_args: '--max-old-space-size=1024'
  }]
};