// import Phaser from 'phaser';
// import * as io from 'socket.io-client';
// import {BaseScene} from "./BaseScene";
//
// const SOCKET_URL = 'http://localhost:3000';
//
// export default class LobbyScene2 extends BaseScene {
//     private socket!: io.Socket;
//     private roomList: Phaser.GameObjects.Text[] = [];
//     private roomListContainer!: Phaser.GameObjects.Container;
//     private background!: Phaser.GameObjects.TileSprite;
//     private backButton!: Phaser.GameObjects.Sprite;
//
//     constructor() {
//         super('Lobby');
//     }
//
//     public init(): void {
//         super.init();
//         this.socket = io.connect(SOCKET_URL);
//
//         // Listen for the list of available rooms from the server
//         this.socket.on('room-list', (rooms: string[]) => {
//             this.updateRoomList(rooms);
//         });
//         this.createRoom = this.createRoom.bind(this); // Bind this value for createRoom
//     }
//
//     public create(): void {
//         this.background = this.add.tileSprite(0, 0,
//           this.game.canvas.width * 2, this.game.canvas.height * 2,
//           "textures", "background/background-1"
//         ).setDepth(-1);
//
//         this.createTitle();
//         this.initBackButton();
//
//         const createRoomText = this.add.text(this.centerX, this.centerY * 0.4, 'Create a new room', {
//             fontFamily: 'arcade-zig',
//             color: '#ffffff',
//             fontSize: '24px',
//             // backgroundColor: 'rgba(0,0,0,0.5)',
//             shadow: {
//                 offsetX: 3,
//                 offsetY: 3,
//                 color: '#000000',
//                 blur: 2,
//                 fill: true
//             }
//         })
//           .setOrigin(0.5);
//         this.addClickAnimation(createRoomText, this.createRoom)
//
//         this.roomListContainer = this.add.container(0, 200);
//         this.roomList = [];
//
//         // Get the list of available rooms from the server
//         this.socket.emit('get-room-list');
//     }
//
//     private initBackButton() {
//         this.backButton = this.add.sprite(
//           0,
//           0,
//           "textures",
//           "button/back"
//         );
//         const backButtonScale = this.scaleFactor * 0.5;
//         this.backButton.setScale(backButtonScale);
//         this.backButton.setX(this.backButton.width * 0.5 * this.scaleFactor);
//         this.backButton.setY(this.backButton.height * 0.5 * this.scaleFactor);
//
//         this.addClickAnimation(this.backButton, () => {
//             this.startTransition("Main");
//         }, backButtonScale-0.1);
//     }
//
//     private createTitle() {
//         const title = this.add.text(0, 0, 'Lobby', {
//             fontFamily: 'arcade-zig',
//             color: '#ffffff',
//             fontSize: '48px',
//             shadow: {
//                 offsetX: 3,
//                 offsetY: 3,
//                 color: '#000000',
//                 blur: 2,
//                 fill: true
//             }
//         })
//           .setOrigin(0.5);
//
//         // Create a container group to hold the text and the background shape
//         const titleContainer = this.add.group();
//         titleContainer.add(title);
//
//         // Create a rounded rectangle graphics object
//         const textBg = this.add.graphics();
//         textBg.fillStyle(0x000000, 0.5);
//         textBg.fillRoundedRect(
//           -title.width*0.5 - 16,
//           -title.height*0.5 - 16,
//           title.width + 32,
//           title.height + 32,
//           16
//         ).setDepth(title.depth-1);
//         titleContainer.add(textBg);
//
//         titleContainer.setXY(this.centerX, this.centerY * 0.2)
//         this.add.existing(titleContainer);
//     }
//
//     update() {
//         this.background.tilePositionX++;
//         this.background.tilePositionY--;
//     }
//
//     private updateRoomList(rooms: string[]): void {
//         // Remove the old room list
//         this.roomList.forEach(room => {
//             room.destroy();
//         });
//
//         // Create new room list
//         rooms.forEach((room, index) => {
//             const roomText = this.add.text(0, index * 30, room, { color: '#ffffff', fontSize: '24px' });
//             roomText.setInteractive({ useHandCursor: true });
//             roomText.on('pointerdown', () => {
//                 this.joinRoom(room);
//             });
//             this.roomListContainer.add(roomText);
//             this.roomList.push(roomText);
//         });
//     }
//
//     private createRoom(): void {
//         const roomId = Math.random().toString(36).substr(2, 5);
//         this.socket.emit('create-room', roomId);
//         this.joinRoom(roomId);
//         this.startTransition("Game");
//     }
//
//     private joinRoom(roomId: string): void {
//         this.socket.emit('join-room', roomId);
//
//         this.scene.start('Game', {
//             roomId: roomId,
//             socket: this.socket
//         });
//     }
// }
