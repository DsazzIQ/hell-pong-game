enum MusicKey {
  MainTheme = 'MainTheme',
  SecondaryTheme = 'SecondaryTheme',
  SplashLogo = 'SplashLogo'
}
export function isMusicKey(key: string): boolean {
  return Object.values(MusicKey).includes(key);
}
export default MusicKey;
