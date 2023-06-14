# EbChat

Simple single page webchat application that I made with [socket.io](https://socket.io/)

The chat room can contain fifteen users at a time. Users will be disconnected for inactivity every fifteen minutes and only users who have joined the chat room can view the messages. Additionally there is a three second timeout after sending a message to prevent users from spamming the chat. I built the frontend using bare html / css with bootstrap styling.

To run the application make sure you have npm and node.js installed on your machine.

You can then install the dependincies using the command

*npm install*

and run the application on localhost at port 3000 using

*node index.js*

![](docs/example.gif)

Possible expansions for this application are adding multiple chat rooms as well implimenting a cache to store recent message history. The cache could be implimented using a redis db where previous messages have a ttl.

In the future I would like to host this application on heroku and impliment a recent message cache.

