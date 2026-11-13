// Display-name hook that works in both the browser (Data Dragon loaded) and Node scripts (raw ids).
let resolver: (id: string) => string = (id) => (id === "MonkeyKing" ? "Wukong" : id);
export const setChampNameResolver = (fn: (id: string) => string) => (resolver = fn);
export const champName = (id: string) => resolver(id);
