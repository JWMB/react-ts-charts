export class ChartDefinitionStore {
    static tocKey = 'chartDefinitionKeys';
    static get keys(): string[] {
        const keys = JSON.parse(localStorage.getItem(ChartDefinitionStore.tocKey) || '[]');
        return keys;
    }
    static get(key: string) {
        return localStorage.getItem(ChartDefinitionStore.tocKey + '.' + key);
    }
    static remove(key: string) {
        this.setOrRemove(key, null);
    }
    static set(key: string, value: string) {
        this.setOrRemove(key, value);
        // const keys = ChartDefinitionStore.keys;
        // if (keys.indexOf(key) >= 0) {
        //     keys.splice(keys.indexOf(key), 1);
        // }
        // keys.splice(0, 0, key);
        // localStorage.setItem(ChartDefinitionStore.tocKey, JSON.stringify(keys));
        // localStorage.setItem(ChartDefinitionStore.tocKey + '.' + key, value);
    }
    private static setOrRemove(key: string, value: string | null) {
        const keys = ChartDefinitionStore.keys;
        if (keys.indexOf(key) >= 0) {
            keys.splice(keys.indexOf(key), 1);
        }
        if (value !== null) {
            keys.splice(0, 0, key);
        }    
        localStorage.setItem(ChartDefinitionStore.tocKey, JSON.stringify(keys));
        if (value !== null) {
            localStorage.setItem(ChartDefinitionStore.tocKey + '.' + key, value);
        } else {
            localStorage.removeItem(ChartDefinitionStore.tocKey + '.' + key);
        }
    }
}