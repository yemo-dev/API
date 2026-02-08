import { execSync } from 'child_process';
import { platform } from 'os';

const port = 3000;

const killPort = () => {
    const os = platform();

    try {
        if (os === 'win32') {
            const cmd = `powershell -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }"`;
            execSync(cmd, { stdio: 'ignore' });
        } else {
            const commands = [
                `lsof -t -i:${port} | xargs kill -9`,
                `fuser -k ${port}/tcp`,
                `pkill -f "node.*:${port}"`,
                `ss -lptn 'sport = :${port}' | grep -Po '(?<=pid=)\\d+' | xargs kill -9`
            ];

            for (const cmd of commands) {
                try {
                    execSync(cmd, { stdio: 'ignore' });
                } catch (e) { }
            }
        }
    } catch (error) { }
};

killPort();
