import { IGameState, IRoomInfo } from '@hell-pong/shared/gameData/GameState';
import { GameObjects, Scene } from 'phaser';
import { Socket } from 'socket.io-client';

import BackButton from '../components/BackButton';
import BitmapTextButton from '../components/BitmapTextButton';
import GUIContainer, { ROW_OFFSET } from '../components/GUIContainer';
import LavaBackground from '../components/LavaBackground';
import TitleText from '../components/TitleText';
import FontFamily from '../constants/FontFamily';
import FontSize from '../constants/FontSize';
import MusicKey from '../constants/MusicKey';
import RegistryKey from '../constants/RegistryKey';
import SceneKey from '../constants/SceneKey';
import TextureKey from '../constants/TextureKey';
import Game from '../Game';
import Player from '@hell-pong/shared/gameData/Player';
import { IPosition } from '@hell-pong/shared/entities/component/Position';

enum RowPriority {
  HIGH = 100,
  MIDDLE = 50,
  LOW = 0
}

export default class LobbyScene extends Scene {
  private socket!: Socket;
  private background!: LavaBackground;
  private roomsContainer!: GameObjects.Container;

  constructor() {
    super(SceneKey.Lobby);
  }

  public init(): void {
    this.socket = this.registry.get(RegistryKey.Socket) as Socket;
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

    this.roomsContainer = this.add.container(100, 200);
    this.socket.on('roomListUpdate', (rooms: IRoomInfo[]) => this.updateRoomList(rooms));
    this.socket.emit('getRooms');
    this.socket.on('startGame', (state: IGameState) => {
      startTransition(this, SceneKey.Game, state);
    });
  }

  private initGUI() {
    const gui = new GUIContainer(this);
    gui.addToContainer(this.initIdNameTitle());
    gui.addToContainer([this.initCreateRoomButton()]);
  }

  private myId(): string {
    return this.socket.id;
  }

  private initIdNameTitle() {
    const title = this.add
      .bitmapText(ROW_OFFSET.x, ROW_OFFSET.y, FontFamily.Retro, `YOUR ID`, FontSize.Text)
      .setOrigin(0, 1);

    const ID_OFFSET = { x: 10, y: -5 };
    const id = this.add
      .text(title.x + title.width + ID_OFFSET.x, title.y + ID_OFFSET.y, this.myId(), {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText
      })
      .setOrigin(0, 1);

    return [title, id];
  }

  private initCreateRoomButton() {
    const BUTTON_OFFSET = { y: 30 };
    const createRoomButton = new BitmapTextButton(
      this,
      { x: ROW_OFFSET.x, y: ROW_OFFSET.y + BUTTON_OFFSET.y },
      TextureKey.Gui.Frames.Button.Main,
      {
        text: 'Create Room',
        fontSize: FontSize.ExtraSmallText
      },
      1.2,
      () => {
        this.socket.emit('createRoom');
      }
    );
    createRoomButton.setOrigin(0, 1).setTextOrigin(-0.2, 1.75);

    return createRoomButton;
  }

  private hasRoomPlayer(room: IRoomInfo, playerId: string): boolean {
    return room.players.some((player) => player.id === playerId);
  }

  private findRoomPlayer(room: IRoomInfo, playerId: string): Player | undefined {
    const playerData = room.players.find((player) => player.id === playerId);
    if (!playerData) return undefined;
    return Player.fromJson(playerData);
  }

  private findMyRoom(rooms: IRoomInfo[]): IRoomInfo | undefined {
    const myId = this.myId();
    for (const room of rooms.values()) {
      if (this.hasRoomPlayer(room, myId)) {
        return room;
      }
    }
    return undefined;
  }

  updateRoomList(rooms: IRoomInfo[]) {
    this.roomsContainer.removeAll(true);

    const TABLE_OFFSET = { x: 40, y: 20 };
    const tablePos: IPosition = { x: ROW_OFFSET.x - TABLE_OFFSET.x, y: ROW_OFFSET.y - TABLE_OFFSET.y };
    const colWidth = 320;
    const rowHeight = 40;

    const myRoom = this.findMyRoom(rooms);
    let me: Player | undefined;
    const rows: Array<{ priority: number; row: GameObjects.Container }> = [];

    let index = 0;
    if (myRoom) {
      me = this.findRoomPlayer(myRoom, this.myId());
      const readVisible = me !== undefined && me.isNotReady();

      rows.push({
        priority: RowPriority.HIGH,
        row: this.createRoomRow(myRoom, index, tablePos, colWidth, rowHeight, false, readVisible, true)
      });
      index++;
    }

    rooms.forEach((room: IRoomInfo) => {
      if (room.id === myRoom?.id) return;
      const isJoinable = me === undefined;
      const priority = room.players.length === 1 ? RowPriority.MIDDLE : RowPriority.LOW;
      rows.push({
        priority,
        row: this.createRoomRow(room, index, tablePos, colWidth, rowHeight, isJoinable)
      });
      index++;
    });

    // Sort the rows by priority in descending order
    rows.sort((a, b) => b.priority - a.priority);

    this.createTableHeader(tablePos, colWidth, rowHeight);
    // Add the rows to the container in order
    rows.forEach((r) => this.roomsContainer.add(r.row));
  }

  private createTableHeader(tablePos: IPosition, colWidth, rowHeight) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(tablePos.x, tablePos.y, colWidth, rowHeight);
    graphics.fillRect(tablePos.x + colWidth, tablePos.y, colWidth, rowHeight);

    const headerTextX = tablePos.x + 10;
    const headerTextY = tablePos.y + 20;
    const headerRoomId = this.add
      .text(headerTextX, headerTextY, 'Room ID', {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.Text,
        color: '#FFF'
      })
      .setOrigin(0, 0.5);
    const headerPlayers = this.add
      .text(headerTextX + colWidth, headerTextY, 'Players', {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.Text,
        color: '#FFF'
      })
      .setOrigin(0, 0.5);

    this.roomsContainer.add([graphics, headerRoomId, headerPlayers]);
  }

  private createRoomRow(
    room: IRoomInfo,
    index: number,
    tablePos: IPosition,
    colWidth: number,
    rowHeight: number,
    isJoinable = false,
    readyVisible = false,
    isMy = false
  ): GameObjects.Container {
    const COL_OFFSET = 15;

    const rowY = tablePos.y + (index + 1) * rowHeight;
    const rowColor = [0x202020, 0x303030];
    const myColor = 0x644700;

    const graphics = this.add.graphics();
    graphics.fillStyle(isMy ? myColor : rowColor[index % 2], 0.7);
    graphics.fillRect(tablePos.x, rowY, colWidth, rowHeight);
    graphics.fillRect(tablePos.x + colWidth, rowY, colWidth, rowHeight);

    const roomIdText = this.add
      .text(tablePos.x + COL_OFFSET, rowY + rowHeight / 2, `${room.id.slice(0, 15)}`, {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText,
        color: '#FFF'
      })
      .setOrigin(0, 0.5);

    const playersText = this.add
      .text(tablePos.x + colWidth + COL_OFFSET, rowY + rowHeight / 2, `${room.players.length}`, {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText,
        color: '#FFF'
      })
      .setOrigin(0, 0.5);

    const joinButton = this.add
      .text(tablePos.x + 2 * colWidth - 70, rowY + rowHeight / 2, 'Join', {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText,
        color: '#0F0'
      })
      .setOrigin(0, 0.5)
      .setVisible(isJoinable)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.joinRoom(room.id);
        joinButton.setVisible(false);
      });

    const readyButton = this.add
      .text(tablePos.x + 2 * colWidth - 70, rowY + rowHeight / 2, 'Ready', {
        fontFamily: FontFamily.Text,
        fontSize: FontSize.SmallText,
        color: '#0F0'
      })
      .setOrigin(0, 0.5)
      .setVisible(readyVisible)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.readyForGameRoom(room.id);
        readyButton.setVisible(false);
      });

    return this.add.container().add([graphics, roomIdText, playersText, joinButton, readyButton]);
  }

  private joinRoom(roomId: string) {
    this.socket.emit('joinRoom', { roomId });

    // Listen for the 'joinFailed' event
    this.socket.once('joinFailed', (data) => {
      console.log(`Failed to join room ${data.roomId}: ${data.message}`);

      // Display an error message to the user or perform other actions.
      // For example, you could show a popup or update the UI with the error message
      this.showJoinFailedMessage(data.message);
    });
  }

  private readyForGameRoom(roomId: string) {
    this.socket.emit('playerReady', { roomId });

    // Listen for the 'joinFailed' event
    this.socket.once('playerReadyFailed', (data) => {
      console.log(`Failed to set ready status in room ${data.roomId}: ${data.message}`);

      // Display an error message to the user or perform other actions.
      // For example, you could show a popup or update the UI with the error message
      this.showJoinFailedMessage(data.message);
    });
  }

  // Function to display an error message when joining a room fails
  private showJoinFailedMessage(message: string) {
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
  }
}
