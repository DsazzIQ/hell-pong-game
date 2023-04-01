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

export default class LobbyScene extends Scene {
  private socket!: Socket;
  private background: LavaBackground;
  private roomsContainer!: GameObjects.Container;

  constructor() {
    super(SceneKey.Lobby);
  }

  public init(): void {
    this.socket = this.registry.get<Socket>(RegistryKey.Socket);
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

  private initIdNameTitle() {
    const title = this.add
      .bitmapText(ROW_OFFSET.x, ROW_OFFSET.y, FontFamily.Retro, `YOUR ID`, FontSize.Text)
      .setOrigin(0, 1);

    const ID_OFFSET = { x: 10, y: -5 };
    const id = this.add
      .text(title.x + title.width + ID_OFFSET.x, title.y + ID_OFFSET.y, this.socket.id, {
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

    return createRoomButton.container;
  }

  updateRoomList(rooms: IRoomInfo[]) {
    this.roomsContainer.removeAll(true);

    rooms.forEach((room: IRoomInfo, index: number) => {
      const roomInfo = this.add.text(
        0,
        index * 50,
        `Room ID: ${room.id.slice(0, 15)}\n  Players: ${room.players
          .map((player) => player.id.slice(0, 10))
          .join(' \n')}`,
        { fontSize: '20px', color: '#FFF' }
      );
      this.roomsContainer.add(roomInfo);

      const joinBtn = this.add.text(roomInfo.width + 20, index * 50, 'Join', {
        fontSize: '20px',
        color: '#0F0'
      });
      joinBtn.setInteractive();
      joinBtn.on('pointerdown', () => {
        this.joinRoom(room.id);
      });
      this.roomsContainer.add(joinBtn);
    });
  }

  private joinRoom(roomId: string) {
    this.socket.emit('joinRoom', { roomId });

    // Listen for the 'joinedRoom' event
    this.socket.once('joinedRoom', (room) => {
      console.log('Joined room:', room);
    });

    // Listen for the 'joinFailed' event
    this.socket.once('joinFailed', (data) => {
      console.log(`Failed to join room ${data.roomId}: ${data.message}`);

      // Display an error message to the user or perform other actions
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
