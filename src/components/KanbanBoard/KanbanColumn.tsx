
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import { Card, Column } from './types';

interface KanbanColumnProps {
    column: Column;
    cards: Card[];
    onAddCard: (columnId: string) => void;
    onDeleteCard: (id: string) => void;
    onUpdateCard: (id: string, text: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    column,
    cards,
    onAddCard,
    onDeleteCard,
    onUpdateCard,
}) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });

    return (
        <div className="kanban-column" ref={setNodeRef}>
            <div className={`column-header color-${column.id}`}>
                <div className="column-title-wrapper">
                    <h2 className="column-title">{column.title}</h2>
                    <span className="column-count">{cards.length}</span>
                </div>
                <div className="column-header-actions">
                    <button className="icon-btn add-btn-header" onClick={() => onAddCard(column.id)}>
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <button className="add-card-full-btn" onClick={() => onAddCard(column.id)}>
                <Plus size={16} /> Add Card
            </button>

            <div className="column-content">
                <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <KanbanCard
                            key={card.id}
                            card={card}
                            onDelete={onDeleteCard}
                            onUpdate={onUpdateCard}
                        />
                    ))}
                </SortableContext>
                {cards.length === 0 && (
                    <div className="empty-column-placeholder">
                        No cards yet
                    </div>
                )}
            </div>
        </div>
    );
};
