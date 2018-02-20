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
        keys.push(key);
        localStorage.setItem(ChartDefinitionStore.tocKey + '.' + key, value);
        localStorage.setItem(ChartDefinitionStore.tocKey, JSON.stringify(keys));
    }
}