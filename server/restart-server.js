console.log('🔄 Restarting Server to Load New Models');
console.log('=====================================');

// Kill any existing node processes on port 5000
const { exec } = require('child_process');

exec('netstat -ano | findstr :5000', (error, stdout, stderr) => {
  if (stdout) {
    const lines = stdout.split('\n');
    const line5000 = lines.find(line => line.includes(':5000'));
    if (line5000) {
      const match = line5000.match(/\s+(\d+)/);
      if (match && match[1]) {
        const pid = match[1];
        console.log(`🛑 Killing process ${pid} on port 5000`);
        exec(`taskkill /PID ${pid} /F`, (killError) => {
          if (killError) {
            console.log('❌ Error killing process:', killError.message);
          } else {
            console.log('✅ Process killed successfully');
          }
          
          // Start new server
          console.log('🚀 Starting new server...');
          const server = require('child_process').spawn('npm', ['start'], {
            stdio: 'inherit',
            shell: true
          });
          
          server.stdout.on('data', (data) => {
            console.log(data.toString());
          });
          
          server.stderr.on('data', (data) => {
            console.error(data.toString());
          });
          
          server.on('close', (code) => {
            console.log(`Server process exited with code ${code}`);
          });
        });
      }
    }
  } else {
    console.log('No process found on port 5000');
    console.log('🚀 Starting server...');
    const server = require('child_process').spawn('npm', ['start'], {
      stdio: 'inherit',
      shell: true
    });
    
    server.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    server.stderr.on('data', (data) => {
      console.error(data.toString());
    });
  }
});
