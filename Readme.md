# @digibear/socket-bridge

A simple library to bridge a connection between a TCP/TLS and a Websocket connection. Built specificially for [RhostMush](http://www.rhostmush.com) but it should happily sit alongside any TCP/TLS server.

## install

`npm i -g @digibear/socket-bridge`

## Usage

`wsb --connect --websocket 2000 --telnet 2001`

If no ports are supplied then it defaults to `4201` for tcp and `4204` for the Websocket port. For a full list of flags and toggles use. `wsb --help` or just `wsb`
