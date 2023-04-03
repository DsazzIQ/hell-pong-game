enum SoundKey {
  ButtonClick = 'ButtonClick',
  ButtonHover = 'ButtonHover',
  ChangeSelection = 'ChangeSelection',
  Touch = 'Touch',
  Dragging = 'Dragging',
  StartGame = 'StartGame',
  PaddleHit = 'PaddleHit',
  BallHit = 'BallHit'
}
export function isSoundKey(key: string): boolean {
  return Object.values(SoundKey).includes(key as SoundKey);
}

export default SoundKey;
