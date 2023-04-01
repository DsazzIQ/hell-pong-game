import { Setting, SettingType } from './Setting';

enum Value {
  Default = 0.5,
  Min = 0,
  Max = 1
}
export class VolumeSetting extends Setting<number> {
  private readonly onUpdateVolume: (volume: number) => void;

  constructor(onUpdateVolume: (volume: number) => void) {
    super(SettingType.Volume, Value.Default);
    this.onUpdateVolume = onUpdateVolume;
    this.apply();
  }

  protected apply(): void {
    this.onUpdateVolume(this.value);
  }

  protected validate(value: number): number {
    return Math.min(Math.max(value, Value.Min), Value.Max);
  }
}
