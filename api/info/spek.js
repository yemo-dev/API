import os from 'os';
import { execSync } from 'child_process';

const serverInfo = {
  getCPUInfo: () => {
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;
    const cpuSpeed = cpus[0].speed;

    const cpuUsage = cpus.map(cpu => {
      const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
      const idle = cpu.times.idle;
      const usage = ((total - idle) / total) * 100;
      return usage.toFixed(2);
    });

    const avgUsage = (cpuUsage.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / cpuUsage.length).toFixed(2);

    return {
      model: cpuModel,
      cores: cpuCores,
      threads: cpuCores,
      speed: cpuSpeed + ' MHz',
      usage: {
        perCore: cpuUsage.map((usage, index) => ({
          core: index,
          usage: usage + '%'
        })),
        average: avgUsage + '%'
      }
    };
  },

  getMemoryInfo: () => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

    return {
      total: (totalMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      used: (usedMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      free: (freeMem / 1024 / 1024 / 1024).toFixed(2) + ' GB',
      usagePercent: memUsagePercent + '%',
      raw: {
        total: totalMem,
        used: usedMem,
        free: freeMem
      }
    };
  },

  getSystemInfo: () => {
    return {
      platform: os.platform(),
      architecture: os.arch(),
      hostname: os.hostname(),
      release: os.release(),
      type: os.type(),
      uptime: serverInfo.formatUptime(os.uptime())
    };
  },

  censorIP: (ip) => {
    if (!ip) return 'N/A';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.***.***.***`;
    }
    // For IPv6
    const ipv6Parts = ip.split(':');
    if (ipv6Parts.length > 1) {
      return `${ipv6Parts[0]}:***`;
    }
    return ip;
  },

  getNetworkInfo: () => {
    const interfaces = os.networkInterfaces();
    const networkData = [];

    for (const [name, nets] of Object.entries(interfaces)) {
      for (const net of nets) {
        networkData.push({
          interface: name,
          family: net.family,
          address: serverInfo.censorIP(net.address),
          netmask: net.netmask,
          mac: net.mac,
          internal: net.internal
        });
      }
    }

    return networkData;
  },

  getDiskInfo: () => {
    try {
      if (os.platform() === 'linux' || os.platform() === 'darwin') {
        const df = execSync('df -h /').toString();
        const lines = df.split('\n');
        const data = lines[1].split(/\s+/);
        
        return {
          filesystem: data[0],
          size: data[1],
          used: data[2],
          available: data[3],
          usagePercent: data[4],
          mounted: data[5]
        };
      } else if (os.platform() === 'win32') {
        const wmic = execSync('wmic logicaldisk get size,freespace,caption').toString();
        const lines = wmic.split('\n').filter(line => line.trim());
        const disks = [];
        
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].trim().split(/\s+/);
          if (parts.length >= 3) {
            const total = parseInt(parts[2]);
            const free = parseInt(parts[1]);
            const used = total - free;
            disks.push({
              drive: parts[0],
              total: (total / 1024 / 1024 / 1024).toFixed(2) + ' GB',
              used: (used / 1024 / 1024 / 1024).toFixed(2) + ' GB',
              free: (free / 1024 / 1024 / 1024).toFixed(2) + ' GB',
              usagePercent: ((used / total) * 100).toFixed(2) + '%'
            });
          }
        }
        return disks;
      }
    } catch (error) {
      return { error: 'Unable to retrieve disk information', message: error.message };
    }
  },

  getProcessInfo: () => {
    const processUptime = process.uptime();
    const memUsage = process.memoryUsage();

    return {
      pid: process.pid,
      version: process.version,
      uptime: serverInfo.formatUptime(processUptime),
      memory: {
        rss: (memUsage.rss / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        heapUsed: (memUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        external: (memUsage.external / 1024 / 1024).toFixed(2) + ' MB'
      }
    };
  },

  getLoadAverage: () => {
    const loadAvg = os.loadavg();
    return {
      '1min': loadAvg[0].toFixed(2),
      '5min': loadAvg[1].toFixed(2),
      '15min': loadAvg[2].toFixed(2)
    };
  },

  getCloudflareTrace: async () => {
    try {
      const startTime = Date.now();
      const response = await fetch('https://1.1.1.1/cdn-cgi/trace');
      const endTime = Date.now();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const text = await response.text();
      const latency = endTime - startTime;
      
      // Parse trace output
      const traceData = {};
      text.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          traceData[key.trim()] = value.trim();
        }
      });

      return {
        status: 'success',
        latency: latency + ' ms',
        ip: serverInfo.censorIP(traceData.ip || 'N/A'),
        location: traceData.loc || 'N/A',
        datacenter: traceData.colo || 'N/A',
        timestamp: traceData.ts || 'N/A',
        tlsVersion: traceData.tls || 'N/A',
        httpVersion: traceData.http || 'N/A',
        userAgent: traceData.uag || 'N/A',
        warp: traceData.warp || 'off'
      };
    } catch (error) {
      return {
        status: 'error',
        latency: 'N/A',
        error: error.message,
        ip: 'N/A',
        location: 'N/A',
        datacenter: 'N/A'
      };
    }
  },

  formatUptime: (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return {
      formatted: days + 'd ' + hours + 'h ' + minutes + 'm ' + secs + 's',
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: secs,
      totalSeconds: Math.floor(seconds)
    };
  },

  getAll: async () => {
    return {
      system: serverInfo.getSystemInfo(),
      cpu: serverInfo.getCPUInfo(),
      memory: serverInfo.getMemoryInfo(),
      disk: serverInfo.getDiskInfo(),
      network: serverInfo.getNetworkInfo(),
      loadAverage: serverInfo.getLoadAverage(),
      process: serverInfo.getProcessInfo(),
      connectivity: await serverInfo.getCloudflareTrace()
    };
  }
};

export default {
  name: "Server Specification",
  description: "Menampilkan spesifikasi lengkap server termasuk CPU, RAM, Disk, Network, dan monitoring real-time.",
  category: "Info",
  methods: ["GET"],
  params: [
    {
      name: "section",
      type: "string",
      description: "Bagian spesifik yang ingin ditampilkan",
      required: false,
      default: "all"
    }
  ],
  paramsSchema: {
    section: {
      type: "string",
      enum: ["cpu", "memory", "disk", "network", "system", "process", "connectivity", "all"],
      default: "all"
    }
  },
  async run(req, res) {
    try {
      const section = req.query.section || 'all';
      let data;

      switch (section.toLowerCase()) {
        case 'cpu':
          data = serverInfo.getCPUInfo();
          break;
        case 'memory':
          data = serverInfo.getMemoryInfo();
          break;
        case 'disk':
          data = serverInfo.getDiskInfo();
          break;
        case 'network':
          data = serverInfo.getNetworkInfo();
          break;
        case 'system':
          data = serverInfo.getSystemInfo();
          break;
        case 'process':
          data = serverInfo.getProcessInfo();
          break;
        case 'connectivity':
          data = await serverInfo.getCloudflareTrace();
          break;
        case 'all':
        default:
          data = await serverInfo.getAll();
          break;
      }

      res.status(200).json({
        statusCode: 200,
        success: true,
        creator: "GIMI",
        section: section,
        data: data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        success: false,
        creator: "GIMI",
        error: error.message || "Internal Server Error",
        timestamp: new Date().toISOString()
      });
    }
  }
};