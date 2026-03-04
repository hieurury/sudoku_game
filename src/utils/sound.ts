const sounds: Record<string, HTMLAudioElement> = {};

export function loadSound(name: string, src: string) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  sounds[name] = audio;
}

export function playSound(name: string) {
  if (localStorage.getItem('sudoku_sound_enabled') === 'false') return;
  const audio = sounds[name];
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}