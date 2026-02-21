module.exports = {
  apps: [{
    name: 'mango-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/home/ninefire/Projects/my-dashboard',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      DASHBOARD_MODE: 'local'
    },
    error_file: '/home/ninefire/.pm2/logs/mango-dashboard-error.log',
    out_file: '/home/ninefire/.pm2/logs/mango-dashboard-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
