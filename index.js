process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});

// ====== 只修改两个核心变量 UUID/DOMAIN ======
const UUID = (process.env.UUID || "abcd1eb2-1c20-345a-96fa-cdf394612345").trim();
const DOMAIN = (process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || "your-app.railway.app").trim();

// Panel 配置
const NAME = "Railway-VLESS-WS-TLS";
const LISTEN_PORT = Number(process.env.PORT) || 3000;

const BEST_DOMAINS = [
    "www.visa.cn",
    "www.shopify.com",
    "store.ubi.com",
    "www.wto.org",
    "time.is",
    "www.udemy.com",
];

// ============================================================
// =============== 模块加载区 ================================
// ============================================================
const http = require("http");
const net = require("net");
const { WebSocketServer, createWebSocketStream } = require("ws");

// ============================================================
// =============== WebSocket Path ============================
// ============================================================
const WS_PATH = `/${UUID}`;

// ============================================================
// =============== 生成 VLESS 节点链接函数 ====================
// ============================================================
function generateLink(address) {
    return (
        `vless://${UUID}@${address}:443` +
        `?encryption=none&security=tls&sni=${DOMAIN}` +
        `&fp=chrome&type=ws&host=${DOMAIN}` +
        `&path=${encodeURIComponent(WS_PATH)}` +
        `#${NAME}`
    );
}

// ============================================================
// =============== HTTP 服务 ==================================
// ============================================================
const server = http.createServer((req, res) => {
    // Handle WebSocket upgrade
    if (req.headers.upgrade) {
        res.writeHead(426);
        return res.end();
    }

    // Homepage
    if (req.url === "/" || req.url === "/index.html") {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Railway VLESS WS TLS</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        
        .header h1 {
            color: #2d3748;
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .header p {
            color: #4a5568;
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }
        
        .status {
            display: inline-block;
            background: #48bb78;
            color: white;
            padding: 8px 20px;
            border-radius: 50px;
            font-size: 0.9rem;
            margin-top: 15px;
            font-weight: 500;
        }
        
        .nodes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .node-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .node-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            border-color: #667eea;
        }
        
        .node-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .node-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
            font-weight: bold;
        }
        
        .node-title {
            font-size: 1.2rem;
            color: #2d3748;
            font-weight: 600;
        }
        
        .config-box {
            background: #f7fafc;
            border-radius: 10px;
            padding: 15px;
            margin-top: 15px;
            border: 1px solid #e2e8f0;
        }
        
        .config-text {
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.85rem;
            color: #2d3748;
            word-break: break-all;
            line-height: 1.5;
        }
        
        .copy-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            margin-top: 15px;
            width: 100%;
            transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .stats {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            margin-top: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            text-align: center;
        }
        
        .stat-item {
            padding: 20px;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #4a5568;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .nodes-grid {
                grid-template-columns: 1fr;
            }
            
            .node-card {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Railway VLESS WS TLS</h1>
            <p>High-performance proxy service deployed on Railway</p>
            <div class="status">● Online & Running</div>
        </div>
        
        <div class="nodes-grid">
            ${BEST_DOMAINS.map((domain, index) => `
            <div class="node-card">
                <div class="node-header">
                    <div class="node-icon">${index + 1}</div>
                    <div class="node-title">${domain}</div>
                </div>
                <div class="config-box">
                    <div class="config-text">${generateLink(domain)}</div>
                </div>
                <button class="copy-btn" onclick="copyToClipboard('${generateLink(domain).replace(/'/g, "\\'")}')">
                    📋 Copy Config
                </button>
            </div>
            `).join('')}
        </div>
        
        <div class="stats">
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${BEST_DOMAINS.length}</div>
                    <div class="stat-label">Available Nodes</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">24/7</div>
                    <div class="stat-label">Uptime</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">TLS 1.3</div>
                    <div class="stat-label">Security</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">WS</div>
                    <div class="stat-label">Protocol</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Powered by Railway • Auto-generated configs • Updated: ${new Date().toLocaleDateString()}</p>
            <p style="margin-top: 10px; font-size: 0.8rem;">
                Use <a href="${WS_PATH}" style="color: #fff; text-decoration: underline;">${WS_PATH}</a> for raw configs
            </p>
        </div>
    </div>
    
    <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = event.target;
                const original = btn.innerHTML;
                btn.innerHTML = '✅ Copied!';
                btn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }, 2000);
            }).catch(err => {
                alert('Failed to copy: ' + err);
            });
        }
        
        // Auto-refresh page every 5 minutes
        setTimeout(() => {
            window.location.reload();
        }, 300000);
    </script>
</body>
</html>
        `;
        
        res.writeHead(200, { 
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        });
        return res.end(html);
    }

    // Raw config endpoint
    if (req.url === WS_PATH) {
        let txt = "═══════════════════════════════════════════════\n";
        txt += `    Railway VLESS WS TLS Configuration\n`;
        txt += `    Generated: ${new Date().toISOString()}\n`;
        txt += "═══════════════════════════════════════════════\n\n";
        
        for (const [index, d] of BEST_DOMAINS.entries()) {
            txt += `【节点 ${index + 1}】${d}\n`;
            txt += generateLink(d) + "\n";
            txt += "─".repeat(50) + "\n\n";
        }
        
        txt += "📝 Usage Instructions:\n";
        txt += "1. Copy any config above\n";
        txt += "2. Import to your client (V2RayN, Clash, etc.)\n";
        txt += "3. Enable TLS and WebSocket\n";
        txt += "4. Enjoy!\n\n";
        txt += "🔗 Share URL: https://${DOMAIN}${WS_PATH}\n";
        txt += "═══════════════════════════════════════════════\n";

        res.writeHead(200, { 
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Node-Count": BEST_DOMAINS.length.toString(),
            "X-Service-Name": NAME
        });
        return res.end(txt);
    }

    // Health check endpoint
    if (req.url === "/health") {
        res.writeHead(200, { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        });
        return res.end(JSON.stringify({
            status: "healthy",
            service: NAME,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            nodes: BEST_DOMAINS.length,
            protocol: "VLESS+WS+TLS"
        }));
    }

    // Metrics endpoint
    if (req.url === "/metrics") {
        res.writeHead(200, { 
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache"
        });
        const metrics = `
# HELP node_service_info Information about the VLESS service
# TYPE node_service_info gauge
node_service_info{name="${NAME}",protocol="vless_ws_tls"} 1

# HELP node_config_count Total number of available configurations
# TYPE node_config_count gauge
node_config_count ${BEST_DOMAINS.length}

# HELP node_uptime_seconds Service uptime in seconds
# TYPE node_uptime_seconds gauge
node_uptime_seconds ${process.uptime()}
        `.trim();
        return res.end(metrics);
    }

    // 404 handler
    res.writeHead(404, { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
    });
    res.end(JSON.stringify({
        error: "Not Found",
        message: "The requested resource was not found",
        available_endpoints: ["/", WS_PATH, "/health", "/metrics"]
    }));
});

// ============================================================
// =============== WebSocket 后端 ============================
// ============================================================
const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 256 * 1024,
    clientTracking: true,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    }
});

const uuidClean = UUID.replace(/-/g, "");

server.on("upgrade", (req, socket, head) => {
    // Log WebSocket connection attempts
    console.log(`WebSocket upgrade attempt: ${req.url} from ${req.socket.remoteAddress}`);
    
    if (req.url !== WS_PATH) {
        console.log(`Rejected WebSocket: invalid path ${req.url}`);
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
    });
});

wss.on("connection", (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`WebSocket connected: ${clientIP}`);
    
    let tcp = null;
    let connected = false;

    ws.once("message", (msg) => {
        if (!Buffer.isBuffer(msg) || msg.length < 18) {
            console.log(`Invalid message from ${clientIP}`);
            ws.close();
            return;
        }

        const version = msg[0];
        const id = msg.slice(1, 17);

        // Validate UUID
        let valid = true;
        for (let i = 0; i < 16; i++) {
            if (id[i] !== parseInt(uuidClean.substr(i * 2, 2), 16)) {
                valid = false;
                break;
            }
        }

        if (!valid) {
            console.log(`Invalid UUID from ${clientIP}`);
            ws.close();
            return;
        }

        let p = msg[17] + 19;
        const port = msg.readUInt16BE(p); p += 2;
        const atyp = msg[p++];

        let host = "";

        if (atyp === 1) {
            host = Array.from(msg.slice(p, p + 4)).join(".");
            p += 4;
        } else if (atyp === 2) {
            const len = msg[p];
            host = msg.slice(p + 1, p + 1 + len).toString();
            p += 1 + len;
        } else if (atyp === 3) {
            const raw = msg.slice(p, p + 16);
            const parts = [];
            for (let i = 0; i < 16; i += 2) {
                parts.push(raw.readUInt16BE(i).toString(16));
            }
            host = parts.join(":");
            p += 16;
        } else {
            console.log(`Invalid address type ${atyp} from ${clientIP}`);
            ws.close();
            return;
        }

        console.log(`Connecting to ${host}:${port} for client ${clientIP}`);
        
        // Send response
        ws.send(Buffer.from([version, 0]));

        // Create TCP connection
        tcp = net.connect({ 
            host, 
            port,
            timeout: 10000
        }, () => {
            connected = true;
            console.log(`TCP connected to ${host}:${port} for ${clientIP}`);
            tcp.setNoDelay(true);
            tcp.setKeepAlive(true, 5000);
            tcp.write(msg.slice(p));
            
            // Create duplex stream
            const duplex = createWebSocketStream(ws, {
                encoding: 'binary',
                decodeStrings: false
            });
            
            // Pipe streams
            duplex.pipe(tcp).pipe(duplex);
        });

        tcp.on("error", (err) => {
            console.log(`TCP error for ${clientIP}: ${err.message}`);
            try { ws.close(); } catch {}
        });

        tcp.on("timeout", () => {
            console.log(`TCP timeout for ${clientIP}`);
            try { tcp.destroy(); } catch {}
        });

        tcp.on("close", () => {
            console.log(`TCP closed for ${clientIP}`);
            try { ws.close(); } catch {}
        });
    });

    ws.on("close", () => {
        console.log(`WebSocket closed: ${clientIP}`);
        try { 
            if (tcp && !tcp.destroyed) {
                tcp.destroy(); 
            }
        } catch {}
    });

    ws.on("error", (err) => {
        console.log(`WebSocket error for ${clientIP}: ${err.message}`);
    });

    // Set timeout for connection establishment
    setTimeout(() => {
        if (!connected) {
            console.log(`Connection timeout for ${clientIP}`);
            try { ws.close(); } catch {}
        }
    }, 5000);
});

// WebSocket server statistics
setInterval(() => {
    console.log(`WebSocket connections: ${wss.clients.size}`);
}, 60000);

// ============================================================
// =============== 启动 =======================================
// ============================================================
server.listen(LISTEN_PORT, "0.0.0.0", () => {
    console.log("═══════════════════════════════════════════════");
    console.log(`🚀 Railway VLESS WS TLS Server Started`);
    console.log(`📡 Port: ${LISTEN_PORT}`);
    console.log(`🔗 UUID: ${UUID}`);
    console.log(`🌐 Domain: ${DOMAIN}`);
    console.log(`🔄 WS Path: ${WS_PATH}`);
    console.log(`🎯 Nodes: ${BEST_DOMAINS.length}`);
    console.log(`📊 Health: http://0.0.0.0:${LISTEN_PORT}/health`);
    console.log(`📈 Metrics: http://0.0.0.0:${LISTEN_PORT}/metrics`);
    console.log("═══════════════════════════════════════════════");
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    
    // Close WebSocket connections
    wss.clients.forEach(client => {
        client.close();
    });
    
    // Close HTTP server
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
        console.log('Forcing shutdown...');
        process.exit(1);
    }, 10000);
});
