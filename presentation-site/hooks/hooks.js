const fs = require('fs');
export default (/* nuxtConfig */) => ({
    ready: () => {
      const pidFilePath = 'nuxt.pid'; // Define the path for the PID file
      const pid = process.pid; // Get the current process ID
      console.log('nuxt pid',pid);
      fs.writeFileSync(pidFilePath, pid.toString());

      process.on('exit', () => {
        console.error('Shutdown');
        try {
          fs.unlink(pidFilePath);
        } catch(e) {
          console.error(`Could not remove pid file: ${pidFilePath}, ${e}`);
        }
      });
    }
});
