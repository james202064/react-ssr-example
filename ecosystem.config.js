module.exports = {
  apps: [
    {
      name: "ssr",
      script: "./server/index.js",
      env: {
        // ON_PM2_RUNTIME: true,
        NODE_ENV: "production",
        REACT_APP_MEDIA_BASE: "https://media.getter-sg.tk",
        REACT_APP_API_URL: "https://api-gnews-dev.gettr-qa.com",
      },
      // error_file: "/ssr/log/error.log",
      // out_file: "/ssr/log/out.log",
      // log_file: "/dev/null",
      watch: false,
      args: "--env=sg",
      exec_mode: "cluster",
      instances: 4,
    },
  ],
};
