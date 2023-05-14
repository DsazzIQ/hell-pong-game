enum MusicKey {
  MainTheme = 'MainTheme',
  BattleTheme = 'BattleTheme',
  SecondaryTheme = 'SecondaryTheme',
  SplashLogo = 'SplashLogo'
}
export function isMusicKey(key: string): boolean {
  return Object.values(MusicKey).includes(key as MusicKey);
}
export default MusicKey;
