enum BaseEvents {
  Connect = 'connect',
  Connection = 'connection',
  Disconnect = 'disconnect'
  // ... other built-in Socket.IO events
}

enum RoomEvents {
  Create = 'room:create',
  Join = 'room:join',
  PlayerReady = 'room:player-ready',
  List = 'room:list',
  UpdateList = 'game:update-list'
  // ... other room-related events
}

enum GameEvents {
  PlayerMoved = 'game:player-moved',
  StateUpdate = 'game:state-update',
  Start = 'game:start',
  Stopped = 'game:stopped',
  Error = 'game:error'
  // ... other game-related events
}

export const SocketEvents = Object.freeze({
  Base: BaseEvents,
  Room: RoomEvents,
  Game: GameEvents
  // ... other event groups
});
