#!/usr/bin/env node

const WebSocket = require("ws");
const argv = require("minimist")(process.argv.split(2));
const tcp = require("net");
const tls = require("tls");

const listen = (wsport, tcpport, { verbose = false, secure = false }) => {
  const wss = new WebSocket.server({ port: wsport }, () => {
    console.log(`WebSocket port listening: ${wsport}`);
    if (verbose) console.log("Verbose mode activated.");
    if (secure) console.log("Secure mode activated.");
  });

  // handle a new WS connection
  let tcpSocket;
  wss.on("connection", ws => {
    if (secure) {
      try {
        tcpSocket = tls.connect({ port: tcpport }, () => {
          if (verbose) {
            console.log(`New TLS connection established..`);
          }
        });
      } catch (error) {
        console.log("TLS failed to establish.  Falling back to TCP.");
        tcpSocket = tcp.connect({ port: tcpport }, () => {
          if (verbose) console.log("TCP connection established.");
        });
      }
    } else {
      tcpSocket = tcp.connect({ port: tcpport }, () => {
        if (verbose) console.log("TCP connection established.");
      });
    }

    // Bridge commucation
    tcpSocket.on("data", data => ws.send(data.toString()));
    ws.on("message", mess => tcpSocket.write(mess + "\r\n"));

    // Handle closing
    ws.on("close", () => tcpSocket.end());
    tcpSocket.on("close", () => ws.close());

    // Handle errors
    tcpSocket.on("error", error => console.error(error));
    ws.on("error", error => console.error(error));
  });
};

wsp = argv.websocket ?? 4203;
tel = argv.telnet ?? 4201;

// Start the server!
listen(wsp, tel, { verbose: argv.v, secure: argv.tls });
