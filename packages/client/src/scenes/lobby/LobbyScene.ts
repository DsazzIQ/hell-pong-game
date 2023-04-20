import { IGameError, IGameState } from '@hell-pong/shared/gameData/GameState';
import { Scene } from 'phaser';
import { Socket } from 'socket.io-client';

import BackButton from '../../components/BackButton';
import BitmapTextButton from '../../components/BitmapTextButton';
import GUIContainer, { ROW_OFFSET } from '../../components/GUIContainer';
import LavaBackground from '../../components/LavaBackground';
import TitleText from '../../components/TitleText';
import FontFamily from '../../constants/FontFamily';
import FontSize from '../../constants/FontSize';
import MusicKey from '../../constants/MusicKey';
import RegistryKey from '../../constants/RegistryKey';
import SceneKey from '../../constants/SceneKey';
import TextureKey from '../../constants/TextureKey';
import Game from '../../Game';
import { SocketEvents } from '@hell-pong/shared/constants/socket';
import { ClientToServerEvents, ServerToClientEvents } from '@hell-pong/shared/types/socket.io';
import logger from '../../logger';
import BitmapFamily from '../../constants/BitmapFamily';
import BitmapSize from '../../constants/BitmapSize';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import Table from '../../components/Table/Table';
import TableTextCell from '../../components/Table/TableTextCell';
import { RowPriority, TableRow } from '../../components/Table/TableRow';
import { TableCell } from '../../components/Table/TableCell';
import TableImageCell from '../../components/Table/TableImageCell';
import { IRoomInfo, RoomInfo } from '@hell-pong/shared/gameData/RoomInfo';
import Player from '@hell-pong/shared/gameData/Player';
import TableButtonCell from '../../components/Table/TableButtonCell';
import SmallButton from '../../components/SmallButton';
import Color from '@hell-pong/shared/constants/color';

export default class LobbyScene extends Scene {
  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;
  private background!: LavaBackground;
  private roomsTable!: Table;
  private myRoom: RoomInfo | undefined;
  private createRoomButton!: BitmapTextButton;
  private gui!: GUIContainer;

  constructor() {
    super(SceneKey.Lobby);
  }

  public init(): void {
    this.socket = this.registry.get(RegistryKey.Socket) as Socket<ServerToClientEvents, ClientToServerEvents>;
  }

  playTheme() {
    this.sound.get(MusicKey.SecondaryTheme).play({ loop: true });
  }

  stopTheme() {
    this.sound.get(MusicKey.SecondaryTheme).stop();
  }

  create() {
    const { startTransition } = this.game as Game;
    this.playTheme();

    new BackButton(this, () => {
      this.stopTheme();
      startTransition(this, SceneKey.Main);
    });
    new TitleText(this, 'lobby');

    this.background = new LavaBackground(this);
    this.initGUI();

    const tablePosition: IPosition = { x: 80, y: 170 };
    const headerCells = [
      new TableTextCell(this, 'Room ID', 220, { x: 20, y: 0 }),
      new TableImageCell(this, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon.Team, 30, { x: 30, y: 0 }),
      new TableTextCell(this, 'Status', 120),
      new TableTextCell(this, 'Actions', 130, { x: 20, y: 0 })
    ];
    this.roomsTable = new Table(this, tablePosition, headerCells);

    // new MyDialog(this);
    this.initEvents();
  }

  private createReadyButton(roomId: string): SmallButton {
    const button = new SmallButton(
      this,
      TextureKey.Gui.Frames.Button.Ok,
      () => {
        this.socket.emit(SocketEvents.Room.PlayerReady, roomId);
        button.destroy(true);
      },
      Color.Green
    );

    return button;
  }

  private createLeaveRoomButton(roomId: string): SmallButton {
    const button = new SmallButton(this, TextureKey.Gui.Frames.Button.LeaveRoom, () => {
      this.socket.emit(SocketEvents.Room.PlayerLeave, roomId);
      button.destroy(true);
    });

    return button;
  }

  private createEnterRoomButton(roomId: string): SmallButton {
    const button = new SmallButton(this, TextureKey.Gui.Frames.Button.EnterRoom, () => {
      this.socket.emit(SocketEvents.Room.Join, roomId);
      button.destroy(true);
    });

    return button;
  }
  updateRoomList(rawRooms: IRoomInfo[]) {
    const rooms = RoomInfo.fromJsonList(rawRooms);

    const rowHeight = this.roomsTable.config.rowHeight!;
    const cellsWidth = this.roomsTable.headerCellsWidth;

    const myId = this.myId();
    this.myRoom = rooms.find((room) => room.hasPlayer(myId));

    this.roomsTable.setSelectedRowId(this.myRoom?.id);

    let me: Player | null = null;
    let index = 0;

    const rows: TableRow[] = [];
    if (this.myRoom) {
      me = this.myRoom.findPlayer(this.myId());
      const notReadyStatus = me !== null && me.isNotReady();

      const statusCell: TableCell = notReadyStatus
        ? new TableTextCell(this, 'Ready ?', cellsWidth[2])
        : new TableImageCell(this, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon.Wait, cellsWidth[2], { x: 20, y: 3 });

      const actionCells: TableCell[] = notReadyStatus
        ? [
            new TableButtonCell(this, this.createReadyButton(this.myRoom.id), cellsWidth[3], { x: 30, y: 2 }),
            new TableButtonCell(this, this.createLeaveRoomButton(this.myRoom.id), cellsWidth[3] * 0.5, { x: 10, y: 2 })
          ]
        : [new TableButtonCell(this, this.createLeaveRoomButton(this.myRoom.id), cellsWidth[3], { x: 50, y: 2 })];

      const cells: TableCell[] = [
        new TableTextCell(this, this.myRoom.shortId, cellsWidth[0], { x: 20, y: 0 }),
        new TableTextCell(this, this.myRoom.playersLength.toString(), cellsWidth[1], { x: 37, y: 0 }),
        statusCell,
        ...actionCells
      ];

      const row = new TableRow(this, this.myRoom.id, index, cells, rowHeight);
      rows.push(row.pin());

      index++;
    }

    for (const room of rooms) {
      if (room.isEqual(this.myRoom?.id)) continue;
      const isOpenRoom = !room.isFull();
      const isJoinable = !me && isOpenRoom;

      const statusCell: TableCell = isOpenRoom
        ? new TableTextCell(this, 'Open', cellsWidth[2])
        : new TableImageCell(this, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon.Locked, cellsWidth[2], {
            x: 20,
            y: 3
          });

      const actionCells: TableCell[] = isJoinable
        ? [new TableButtonCell(this, this.createEnterRoomButton(room.id), cellsWidth[3], { x: 50, y: 2 })]
        : [new TableTextCell(this, '---', cellsWidth[3], { x: 20, y: 0 })];

      const cells: TableCell[] = [
        new TableTextCell(this, room.id.slice(0, 15), cellsWidth[0], { x: 20, y: 0 }),
        new TableTextCell(this, room.playersLength.toString(), cellsWidth[1], { x: 37, y: 0 }),
        statusCell,
        ...actionCells
      ];

      const priority = room.isFull() ? RowPriority.LOW : RowPriority.MIDDLE;
      const row = new TableRow(this, room.id, index, cells, rowHeight);
      rows.push(row.setPriority(priority));
    }

    this.roomsTable.rerenderRows(rows);
  }

  private initEvents() {
    const { startTransition } = this.game as Game;

    this.socket.on(SocketEvents.Room.UpdateList, (rooms: IRoomInfo[]) => this.updateRoomList(rooms));
    this.socket.emit(SocketEvents.Room.List);

    this.socket.on(SocketEvents.Game.Start, (state: IGameState) => {
      startTransition(this, SceneKey.Game, state);
    });

    this.socket.on(SocketEvents.Game.Error, (error: IGameError) => {
      logger.error('socket:error', error);
      this.showErrorMessage(error.message);
    });
  }

  private initGUI() {
    this.gui = new GUIContainer(this);
    this.gui.addToContainer(this.initIdNameTitle());
    this.gui.addToContainer([this.initCreateRoomButton()]);
  }

  private myId(): string {
    return this.socket.id;
  }

  private initIdNameTitle() {
    const title = this.add
      .bitmapText(ROW_OFFSET.x, ROW_OFFSET.y, BitmapFamily.Retro, `YOUR ID:`, BitmapSize.Small)
      .setOrigin(0, 1.25);

    const ID_OFFSET = { x: 10 };
    const id = this.add
      .text(title.x + title.width + ID_OFFSET.x, title.y, this.myId(), {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText
      })
      .setOrigin(0, 1.65);

    return [title, id];
  }

  private initCreateRoomButton(): BitmapTextButton {
    const BUTTON_OFFSET = { x: 220 };
    this.createRoomButton = new BitmapTextButton(
      this,
      { x: this.gui.getWidth() - BUTTON_OFFSET.x, y: ROW_OFFSET.y },
      TextureKey.Gui.Frames.Button.Main,
      {
        text: 'Create Room',
        fontSize: BitmapSize.ExtraSmall
      },
      1.2,
      () => {
        this.socket.emit(SocketEvents.Room.Create);
        this.createRoomButton.setVisible(false);
      }
    );
    this.createRoomButton.setOrigin(0, 1).setTextOrigin(-0.2, 1.75);

    return this.createRoomButton;
  }

  // Function to display an error message
  private showErrorMessage(message: string) {
    // Create and display a text element or a popup with the error message
    // You can customize this according to your game's UI and design
    const errorMessage = this.add.text(50, 300, message, {
      color: '#ff0000',
      fontSize: '32px'
    });

    // Remove the error message after a few seconds
    setTimeout(() => {
      errorMessage.destroy();
    }, 3000);
  }

  update() {
    this.background.move();
    this.createRoomButton.setVisible(this.myRoom === undefined);
  }
}
