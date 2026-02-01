const sounds: Record<string, HTMLAudioElement> = {};

export function loadSound(name: string, src: string) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  sounds[name] = audio;
}

export function playSound(name: string) {
  const audio = sounds[name];
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}