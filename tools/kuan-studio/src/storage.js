import { publicTask } from './library.js';

function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('kuanapi-image-workbench-v2', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('tasks', {keyPath: ['userId', 'id']}).createIndex('userId', 'userId');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction(mode, operation) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('tasks', mode);
      const request = operation(tx.objectStore('tasks'));
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () => reject(tx.error || request.error || new Error('无法保存图片记录'));
    });
  } finally {db.close();}
}

export const saveTask = task => transaction('readwrite', store => store.put(publicTask(task)));
export const deleteTask = (userId, id) => transaction('readwrite', store => store.delete([String(userId), id]));
export const listTasks = userId => transaction('readonly', store => store.index('userId').getAll(String(userId)))
  .then(rows => rows.sort((a, b) => b.createdAt - a.createdAt));

export function readSetting(userId, name, fallback) {
  try {return JSON.parse(localStorage.getItem(`kuanapi_image_workbench:${userId}:${name}`)) ?? fallback;}
  catch {return fallback;}
}

export function writeSetting(userId, name, value) {
  localStorage.setItem(`kuanapi_image_workbench:${userId}:${name}`, JSON.stringify(value));
}
