
import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Card, Column } from './types';

const KanbanCard = React.lazy(() => import('./KanbanCard').then(m => ({ default: m.KanbanCard })));

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

    const getBorderColor = (id: string) => {
        switch (id) {
            case 'todo': return 'border-todo';
            case 'in-progress': return 'border-in-progress';
            case 'done': return 'border-done';
            default: return 'border-transparent';
        }
    }

    return (
        <div className="bg-[#f8fafc] rounded-xl flex-1 min-w-[280px] w-full max-h-[85vh] flex flex-col p-4 shadow-sm border border-[#e2e8f0] transition-all overflow-hidden" ref={setNodeRef}>
            <div className={`flex justify-between items-center mb-4 p-2 border-b-2 ${getBorderColor(column.id)}`}>
                <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-[#1e293b] uppercase tracking-wider">{column.title}</h2>
                    <span className="bg-[#e2e8f0] text-[#64748b] text-xs font-semibold px-2 py-0.5 rounded-full">{cards.length}</span>
                </div>
                <button className="p-1.5 rounded-md hover:bg-slate-100 text-[#64748b] transition-colors" onClick={() => onAddCard(column.id)}>
                    <Plus size={18} />
                </button>
            </div>

            <button className="w-full p-3 mb-4 bg-white border border-dashed border-[#e2e8f0] rounded-lg text-[#64748b] text-sm flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium" onClick={() => onAddCard(column.id)}>
                <Plus size={16} /> Add Card
            </button>

            <div className="flex-grow overflow-y-auto flex flex-col gap-3 p-1 min-h-[100px]">
                <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
                    <React.Suspense fallback={<div className="h-[100px] bg-white animate-pulse rounded-xl" />}>
                        {cards.map((card) => (
                            <KanbanCard
                                key={card.id}
                                card={card}
                                onDelete={onDeleteCard}
                                onUpdate={onUpdateCard}
                            />
                        ))}
                    </React.Suspense>
                </SortableContext>
                {cards.length === 0 && (
                    <div className="h-[100px] flex items-center justify-center text-[#64748b] text-sm italic bg-black/5 rounded-lg border border-dashed border-[#cbd5e1]">
                        No cards yet
                    </div>
                )}
            </div>
        </div>
    );
};
