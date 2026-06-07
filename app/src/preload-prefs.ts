import { contextBridge, ipcRenderer } from 'electron';
import type { Preferences } from './utils/preferences';

export interface PrefsApi {
  getAll: () => Promise<Preferences>;
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  onChange: (cb: (prefs: Preferences) => void) => () => void;
}

const api: PrefsApi = {
  getAll: () => ipcRenderer.invoke('prefs:get'),
  set: (key, value) => ipcRenderer.send('prefs:set', key, value),
  onChange: (cb) => {
    const listener = (_event: Electron.IpcRendererEvent, prefs: Preferences) => cb(prefs);
    ipcRenderer.on('prefs:changed', listener);
    return () => ipcRenderer.removeListener('prefs:changed', listener);
  },
};

contextBridge.exposeInMainWorld('prefs', api);
