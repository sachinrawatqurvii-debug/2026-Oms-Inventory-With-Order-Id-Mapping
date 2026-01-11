const LOCAL_KEY = "saved-record";

class LocalStorageService {
    constructor() {
        const saved = JSON.parse(localStorage.getItem(LOCAL_KEY));
        this.records = Array.isArray(saved) ? saved : [];
    }

    saveToLocalStorage() {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(this.records));
    }

    getRecords() {
        return this.records;
    }

    addToLocalStorage(payload) {
        if (!payload || !payload.order_id) return;

        const existingIndex = this.records.findIndex(
            (r) => r.order_id === payload.order_id
        );

        if (existingIndex === -1) {
            // Add new record at the top
            this.records.unshift(payload);
        } else {
            // Update existing record (preserve order)
            this.records[existingIndex] = { ...this.records[existingIndex], ...payload };
        }

        this.saveToLocalStorage();
    }

    deleteRecord(order_id) {
        this.records = this.records.filter((r) => r.order_id !== order_id);
        this.saveToLocalStorage();
    }

    clearAll() {
        this.records = [];
        this.saveToLocalStorage();
    }
}

const storage = new LocalStorageService();
export default storage;
