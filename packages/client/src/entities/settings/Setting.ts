export enum SettingType {
  SoundVolume = 'SoundVolume',
  MusicVolume = 'MusicVolume'
}

export abstract class Setting<T> {
  protected key: string;
  protected value: T;

  protected constructor(key: SettingType, initialValue: T) {
    this.key = key;
    this.value = initialValue;
    this.load();
  }

  get(): T {
    return this.value;
  }

  set(value: T): void {
    this.value = this.validate(value);
    this.save();
    this.apply();
  }

  protected load(): void {
    const storedValue = localStorage.getItem(this.key) as string | null;
    if (storedValue !== null) {
      this.value = JSON.parse(storedValue) as T;
    }
  }

  protected save(): void {
    localStorage.setItem(this.key, JSON.stringify(this.value));
  }

  protected abstract apply(): void;
  protected abstract validate(value: T): T;
}
