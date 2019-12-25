#!/usr/bin/env node

const WebSocket = require("ws");
const argv = require("minimist")(process.argv.slice(2));
const tcp = require("net");
const tls = require("tls");
const Anser = require("anser");

const help = `
WebSocket Bridge 

Connects a TCP or TLS port to a Websocket connection. if not telnet port
is supplied the bridge will default to 4201.  If no Websocket port is 
defined it will default to 4203.

usage: wsb  [-c --connect][--help][--telnet <port>][--websocket <port>]
            [-v --verbose][-a --ansi2html][-j --json][-k --keepalive]
            [-t --tls]
                      
2019 Lemuel Canady, Jr
`.trim();

const listen = (
  wsport,
  tcpport,
  {
    verbose = false,
    secure = false,
    keepalive = false,
    html = false,
    json = false
  }
) => {
  const wss = new WebSocket.Server({ port: wsport }, () => {
    console.info(`WebSocket port listening: ${wsport}`);
    if (verbose) console.log("Verbose mode activated.");
    if (verbose && secure) console.log("Secure mode activated.");
    if (verbose && keepalive) console.log("Keepalive mode activated.");
    if (verbose && html) console.log("Converting Ansi to HTML.");
    if (verbose && json) console.log("converting messages to JSON format.");
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
    tcpSocket.on("data", buff => {
      // Filter IAC NOP?
      if (keepalive) buff = buff.filter(byte => byte !== 241 && byte !== 255);
      let output = "";

      // Convert ansi to html?
      if (html) {
        output = Anser.ansiToHtml(Anser.escapeForHtml(buff.toString()));
      } else {
        output = buff.toString();
      }

      // Send as a JSON message?
      if (json) {
        ws.send(
          JSON.stringify({
            message: output
          })
        );
      } else {
        ws.send(buff.toString("utf8"));
      }
    });
    ws.on("message", mess => tcpSocket.write(mess + "\r\n"));

    // Handle closing
    ws.on("close", () => tcpSocket.end());
    tcpSocket.on("close", () => {
      if (verbose) console.log("TCP Connection Closed.");
      ws.close();
    });

    // Handle errors
    tcpSocket.on("error", error => console.error(error));
    ws.on("error", error => console.error(error));
  });
};

wsp = argv.websocket || 4203;
tel = argv.telnet || 4201;

// Start the server!

if (argv.connect || argv.c) {
  listen(wsp, tel, {
    verbose: argv.v || argv.verbose,
    secure: argv.tls || argv.t,
    keepalive: argv.keepalive || argv.k,
    json: argv.j || argv.json,
    html: argv.a || argv.ansi2html
  });
} else {
  console.log(help);
}
