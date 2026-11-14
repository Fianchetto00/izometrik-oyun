// JSON data loading. All paths are relative to index.html.

export async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} yüklenemedi (${res.status})`);
  return res.json();
}

// Loads { key: path } into { key: data } in parallel.
export async function loadAll(paths) {
  const entries = await Promise.all(
    Object.entries(paths).map(async ([key, path]) => [key, await loadJSON(path)]),
  );
  return Object.fromEntries(entries);
}

export function mapPath(mapId) {
  return `./data/maps/${mapId}.json`;
}
