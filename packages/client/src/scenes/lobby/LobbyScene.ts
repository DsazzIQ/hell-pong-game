import { IGameError, IGameState } from '@hell-pong/shared/gameData/GameState';
import { Scene } from 'phaser';
import { Socket } from 'socket.io-client';

import BackButton from '../../components/Button/BackButton';
import BitmapTextButton from '../../components/Button/BitmapTextButton';
import GUIContainer, { ROW_OFFSET } from '../../components/GUIContainer';
import LavaBackground from '../../components/LavaBackground';
import TitleText from '../../components/TitleText';
import MusicKey from '../../constants/MusicKey';
import RegistryKey from '../../constants/RegistryKey';
import SceneKey from '../../constants/SceneKey';
import TextureKey from '../../constants/TextureKey';
import Game from '../../Game';
import { SocketEvents } from '@hell-pong/shared/constants/socket';
import { ClientToServerEvents, ServerToClientEvents } from '@hell-pong/shared/types/socket.io';
import logger from '../../logger';
import BitmapSize from '../../constants/BitmapSize';
import { IPosition } from '@hell-pong/shared/entities/component/Position';
import Table from '../../components/Table/Table';
import TableTextCell from '../../components/Table/TableTextCell';
import { TableRow } from '../../components/Table/TableRow';
import TableImageCell from '../../components/Table/TableImageCell';
import { IRoomInfo, RoomInfo } from '@hell-pong/shared/gameData/RoomInfo';
import Player from '@hell-pong/shared/gameData/Player';
import TableButtonCell from '../../components/Table/TableButtonCell';
import SmallButton from '../../components/Button/SmallButton';
import Color from '@hell-pong/shared/constants/color';
import YesNoDialog from '../../components/Dialog/YesNoDialog';
import ToastManager from '../../components/Toast/ToastManager';
import TableBitmapTextCell from '../../components/Table/TableBitmapTextCell';

export default class LobbyScene extends Scene {
  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;
  private background!: LavaBackground;
  private roomsTable!: Table;
  private myRoom: RoomInfo | undefined;
  private createRoomButton!: BitmapTextButton;
  private gui!: GUIContainer;
  private rooms!: RoomInfo[];
  private toastManager!: ToastManager;

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

    this.roomsTable = this.initTable();
    this.toastManager = new ToastManager(this);

    this.initEvents();
  }

  private initTable(): Table {
    const tablePosition: IPosition = { x: 80, y: 170 };
    const headerCells = [
      new TableBitmapTextCell(this, 'Room ID', 220, { x: 20, y: -2 }),
      new TableImageCell(this, TextureKey.Gui.Key, TextureKey.Gui.Frames.Icon.Team, 30, { x: 30, y: 1 }),
      new TableBitmapTextCell(this, 'Status', 120, { x: 0, y: -2 }),
      new TableBitmapTextCell(this, 'Actions', 130, { x: 20, y: -2 })
    ];
    return new Table(this, tablePosition, headerCells);
  }

  private createReadyButton(roomId: string): SmallButton {
    return new SmallButton(
      this,
      TextureKey.Gui.Frames.Button.Ok,
      () => {
        this.socket.emit(SocketEvents.Room.PlayerReady, roomId);
      },
      Color.Green
    );
  }

  private createLeaveRoomButton(roomId: string): SmallButton {
    return new SmallButton(this, TextureKey.Gui.Frames.Button.LeaveRoom, () => {
      new YesNoDialog(this, 'Confirmation', 'Do you want to leave this room ?', () => {
        this.socket.emit(SocketEvents.Room.PlayerLeave, roomId);
      });
    });
  }

  private createEnterRoomButton(roomId: string): SmallButton {
    return new SmallButton(
      this,
      TextureKey.Gui.Frames.Button.EnterRoom,
      () => {
        this.socket.emit(SocketEvents.Room.Join, roomId);
      },
      Color.Green
    );
  }

  private createStatusCell(room, isMyRoom, notReadyStatus) {
    const cellWidth = this.roomsTable.headerCellsWidth[2];
    if (isMyRoom) {
      return notReadyStatus
        ? new TableTextCell(this, 'Ready ?', cellWidth)
        : new TableImageCell(
            this,
            TextureKey.Gui.Key,
            TextureKey.Gui.Frames.Icon.Wait,
            this.roomsTable.headerCellsWidth[2],
            {
              x: 20,
              y: 4
            }
          );
    }

    const isOpenRoom = !room.isFull();
    return new TableImageCell(
      this,
      TextureKey.Gui.Key,
      TextureKey.Gui.Frames.Icon[isOpenRoom ? 'Unlocked' : 'Locked'],
      cellWidth,
      {
        x: 20,
        y: 4
      }
    );
  }

  private createActionCells(room, isMyRoom, notReadyStatus) {
    const cellWidth = this.roomsTable.headerCellsWidth[3];
    if (isMyRoom) {
      if (notReadyStatus) {
        return [
          new TableButtonCell(this, this.createReadyButton(room.id), cellWidth, {
            x: 30,
            y: 2
          }),
          new TableButtonCell(this, this.createLeaveRoomButton(room.id), cellWidth * 0.5, {
            x: 0,
            y: 2
          })
        ];
      }

      return [
        new TableButtonCell(this, this.createLeaveRoomButton(room.id), cellWidth, {
          x: 50,
          y: 2
        })
      ];
    }

    const isJoinable = !this.myRoom && !room.isFull();
    if (isJoinable) {
      return [
        new TableButtonCell(this, this.createEnterRoomButton(room.id), cellWidth, {
          x: 50,
          y: 2
        })
      ];
    }

    return [new TableTextCell(this, '---', cellWidth, { x: 40, y: 2 })];
  }

  private createTableRow(room: RoomInfo, isMyRoom: boolean, isNotReady: boolean, index: number) {
    const roomId = room.shortId;
    const statusCell = this.createStatusCell(room, isMyRoom, isNotReady);
    const actionCells = this.createActionCells(room, isMyRoom, isNotReady);

    const { headerCellsWidth, config } = this.roomsTable;
    const cells = [
      new TableTextCell(this, roomId, headerCellsWidth[0], { x: 20, y: 0 }),
      new TableTextCell(this, room.playersLength.toString(), headerCellsWidth[1], { x: 37, y: 0 }),
      statusCell,
      ...actionCells
    ];

    return new TableRow(this, room.id, index, cells, config.rowHeight!);
  }

  updateRoomList() {
    const rooms = this.rooms.slice(this.roomsTable.startIndex, this.roomsTable.endIndex);

    const myId = this.myId();
    let me: Player | null = null;

    const rows = rooms.map((room, index) => {
      const isMyRoom = this.myRoom ? room.isEqual(this.myRoom.id) : false;
      if (isMyRoom) {
        me = this.myRoom ? this.myRoom.findPlayer(myId) : null;
      }

      const notReadyStatus = isMyRoom && me !== null && me.isNotReady();
      return this.createTableRow(room, isMyRoom, notReadyStatus, index);
    });

    this.roomsTable.renderRows(rows);
    this.roomsTable.renderPaginationButtons(this.rooms.length, () => {
      this.updateRoomList();
    });
  }

  private initEvents() {
    const { startTransition } = this.game as Game;

    this.socket.on(SocketEvents.Room.UpdateList, (rooms: IRoomInfo[]) => {
      this.rooms = RoomInfo.fromJsonList(rooms, this.myId());

      const myId = this.myId();
      this.myRoom = this.rooms.find((room) => room.hasPlayer(myId));
      this.roomsTable.correctCurrentPage(this.rooms.length);
      this.roomsTable.setSelectedRowId(this.myRoom?.id);

      // Sort the rows by priority in descending order
      this.rooms.sort((a, b) => b.priority - a.priority);

      this.updateRoomList();
    });

    this.socket.emit(SocketEvents.Room.List);

    this.socket.on(SocketEvents.Game.Start, (state: IGameState) => {
      this.stopTheme();
      startTransition(this, SceneKey.Game, state);
    });

    this.socket.on(SocketEvents.Game.Error, (error: IGameError) => {
      logger.error('socket:error', error);
      this.toastManager.showToast('Error', `Error\n${error.message}`);
    });
  }

  private initGUI() {
    this.gui = new GUIContainer(this);
    this.gui.addToContainer([this.initCreateRoomButton()]);
  }

  private myId(): string {
    return this.socket.id;
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

  update() {
    this.background.move();
    this.createRoomButton.setVisible(this.myRoom === undefined);
  }
}
