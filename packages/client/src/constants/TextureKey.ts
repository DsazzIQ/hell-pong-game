const TextureKey = Object.freeze({
  Background: {
    Key: 'background',
    TextureUrl: 'textures/background.png',
    AtlasUrl: 'textures/background.json',
    Frames: {
      Menu: {
        First: 'menu/0000',
        Config: {
          prefix: 'menu/',
          zeroPad: 4,
          start: 0,
          end: 7
        }
      },
      Text: {
        MainTitle: 'text/main-title'
      },
      Logo: 'logo',
      Main: 'main',
      Dialog: 'dialog',
      Toast: {
        Info: 'toast/info',
        Error: 'toast/error'
      }
    }
  },
  Gui: {
    Key: 'gui',
    TextureUrl: 'textures/gui.png',
    AtlasUrl: 'textures/gui.json',
    Frames: {
      Backstage: {
        Bottom: 'backstage/bottom',
        BottomLeft: 'backstage/bottom-left',
        BottomRight: 'backstage/bottom-right',
        Center: 'backstage/center',
        Left: 'backstage/left',
        Right: 'backstage/right',
        Top: 'backstage/top',
        TopLeft: 'backstage/top-left',
        TopRight: 'backstage/top-right'
      },
      Button: {
        Back: 'button/back',
        Square: 'button/square',
        Ok: 'button/ok',
        Cancel: 'button/cancel',
        LeaveRoom: 'button/leave-room',
        EnterRoom: 'button/enter-room',
        Main: 'button/main',
        Checked: 'button/checked',
        UnChecked: 'button/unchecked'
      },
      Icon: {
        Accept: 'icon/accept',
        Decline: 'icon/decline',
        Empty: 'icon/empty',
        Music: 'icon/music',
        Sound: 'icon/sound',
        Return: 'icon/return',
        Setting: 'icon/setting',
        Team: 'icon/team',
        Wait: 'icon/wait',
        Locked: 'icon/locked',
        Unlocked: 'icon/unlocked',
        Error: 'icon/error',
        Info: 'icon/info'
      },
      Gameplay: {
        Ball: 'gameplay/ball',
        Paddle: 'gameplay/paddle'
      },
      Slider: {
        ArrowLeftIn: 'slider/arrow-left-in',
        ArrowLeftOut: 'slider/arrow-left-out',
        ArrowRightIn: 'slider/arrow-right-in',
        ArrowRightOut: 'slider/arrow-right-out',
        TrackLeft: 'slider/track-left',
        TrackCenter: 'slider/track-center',
        TrackRight: 'slider/track-right',
        ThumbIn: 'slider/thumb-in',
        ThumbOut: 'slider/thumb-out'
      }
    }
  }
});
export default TextureKey;
