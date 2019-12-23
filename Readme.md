# @digibear/ws-bridge

A simple library to bridge a connection between a TCP/TLS and a Websocket connection. Built specificially for [RhostMush](www.rhostmush.com) but it should happily sit alongside any TCP/TLS server.

## install

`npm i -g @digibear/ws-bridge`

## Usage

`ws-bridge --websocket 2000 --telnet 2001`

If no ports are supplied then it defaults to `4201` for tcp and `4204` for the Websocket port.
