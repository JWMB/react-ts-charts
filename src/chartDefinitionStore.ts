export class ChartDefinitionStore {
    static tocKey = 'chartDefinitionKeys';
    static get keys(): string[] {
        const keys = JSON.parse(localStorage.getItem(ChartDefinitionStore.tocKey) || '[]');
        return keys;
    }
    static get(key: string) {
        return localStorage.getItem(ChartDefinitionStore.tocKey + '.' + key);
    }
    static set(key: string, value: string) {
        const keys = ChartDefinitionStore.keys;
        if (keys.indexOf(key) >= 0) {
            keys.splice(keys.indexOf(key), 1);
        }
        keys.splice(0, 0, key);
        localStorage.setItem(ChartDefinitionStore.tocKey, JSON.stringify(keys));
        localStorage.setItem(ChartDefinitionStore.tocKey + '.' + key, value);
    }
}