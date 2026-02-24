
export interface Card {
    id: string;
    title: string;
    columnId: string;
}

export interface Column {
    id: string;
    title: string;
    cardIds: string[];
}

export interface KanbanData {
    cards: Record<string, Card>;
    columns: Record<string, Column>;
    columnOrder: string[];
}
