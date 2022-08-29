# mongodb-cursor-memory-leak

This repository reproduces a (possible) memory leak when breaking in the middle of an async iterator on mongoose 4.9.0 (latest)

Printing `activeSessions` size from `client.s.activeSessions` reveals that, when breaking in the middle of an async iterator (before the end), the number of sessions increases indefinitely, which does NOT happen if you consume the iterator thought the end (the number stays consistent)

to reproduce this bug, just type `npm start` or `node --expose-gc index.js`. The used data as well as the 'activeSessions' will be printed periodically for one minute
