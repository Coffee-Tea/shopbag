export interface IItem {
  id: string;
  listId: string;
  name: string;
  amount: string;
  bought: boolean;
  createdAt: string;
  order: number;
}

export interface IHistoryEntry {
  name: string;
  displayName: string;
  count: number;
  lastAmount: string;
  lastUsedAt: string;
}

export interface IDictionaryItem {
  name: string;
}
