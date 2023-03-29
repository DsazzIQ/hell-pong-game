import { IGameState, IRoomInfo } from '@hell-pong/shared/gameData/GameState';
import Phaser from 'phaser';
import { Socket } from 'socket.io-client';

import BackButton from '../components/BackButton';
import AudioKey from '../constants/AudioKey';
import SceneKey from '../constants/SceneKey';
import Game from '../Game';
import GameScene from './GameScene';

export default class LobbyScene extends Phaser.Scene {
  private socket!: Socket;
  private roomsContainer!: Phaser.GameObjects.Container;

  constructor() {
    super(SceneKey.Lobby);
  }

  public init(): void {
    this.socket = this.registry.get('socket') as Socket;

    this.sound.add(AudioKey.SecondaryTheme);
  }

  playTheme() {
    this.sound.get(AudioKey.SecondaryTheme).play({ loop: true, volume: 0.1 });
  }

  stopTheme() {
    this.sound.get(AudioKey.SecondaryTheme).stop();
  }

  create() {
    this.playTheme();

    new BackButton(this, () => {
      this.stopTheme();
      (this.game as Game).startTransition(this, SceneKey.Main);
    });

    this.add.text(80, 50, `YOUR ID: ${this.socket.id}`, {
      fontSize: '25px',
      color: '#FFF'
    });

    const createRoomBtn = this.add.text(100, 100, 'Create Room', {
      fontSize: '32px',
      color: '#FFF'
    });
    createRoomBtn.setInteractive();
    createRoomBtn.on('pointerdown', () => {
      this.socket.emit('createRoom');
    });

    this.roomsContainer = this.add.container(100, 200);
    this.socket.on('roomListUpdate', (rooms: IRoomInfo[]) => this.updateRoomList(rooms));
    this.socket.emit('getRooms');
    this.socket.on('startGame', (state: IGameState) => {
      // Perform actions after joining the room, such as transitioning to another scene
      this.scene.start<GameScene>(SceneKey.Game, state);
      // this.startTransition("Game");
    });
  }

  updateRoomList(rooms: IRoomInfo[]) {
    this.roomsContainer.removeAll();

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
}
