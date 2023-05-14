enum Color {
  White = 0xffffff,
  Black = 0x000000,
  Green = 0x00ff00,
  Orange = 0xff6d0a,
  Red = 0xff0000,
  Gray300 = 0xe5e7eb,
  Gray400 = 0x9ca3af,
  Gray500 = 0x6b7280,
  Gray600 = 0x4b5563,
  Gray700 = 0x384152,
  Gray800 = 0x1f2938,
  Amber500 = 0xf59e0b,
  Amber600 = 0xd97706
}

export function colorToHex(color: Color): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}
export default Color;
