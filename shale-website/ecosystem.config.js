module.exports = {
  apps: [
    {
      name: 'ShaleNuxt',
      exec_mode: 'cluster',
      instances: '1',
      script: '.output/server/index.mjs',
      args: '',
      watch: true,
      ignore_watch: ['node_modules', 'public', 'logs'],
      // exec_mode: 'fork',
      // instances: '2',
      autorestart: true,
      max_memory_restart: '1G',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      min_uptime: '60s',
      max_restarts: 30,
      restart_delay: 60,
      env: {
        NODE_ENV: 'development',
        PORT: '3000',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      env_test: {
        NODE_ENV: 'test',
      },
    },
  ],
}
