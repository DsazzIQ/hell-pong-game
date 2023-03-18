interface IPlayerInfo {
  id: string;
}

export default interface IRoomInfo {
  id: string;
  players: Array<IPlayerInfo>;
}
