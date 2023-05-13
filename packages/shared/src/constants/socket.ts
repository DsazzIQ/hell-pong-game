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
  PlayerLeave = 'room:player-leave',
  List = 'room:list',
  UpdateList = 'game:update-list'
}

enum GameEvents {
  PlayerMoved = 'game:player-moved',
  StateUpdate = 'game:state-update',
  ScoreUpdate = 'game:score-update',
  Start = 'game:start',
  Stopped = 'game:stopped',
  Error = 'game:error'
}

export const SocketEvents = Object.freeze({
  Base: BaseEvents,
  Room: RoomEvents,
  Game: GameEvents
  // ... other event groups
});
