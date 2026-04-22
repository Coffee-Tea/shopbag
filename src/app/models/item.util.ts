import { IItem } from './item.model';

export const byOrder = (a: IItem, b: IItem): number => a.order - b.order;
