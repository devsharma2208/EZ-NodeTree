
import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Card, KanbanData } from './types';

const initialData: KanbanData = {
    cards: {
        'card-1': { id: 'card-1', title: 'Create initial project plan', columnId: 'todo' },
        'card-2': { id: 'card-2', title: 'Design landing page', columnId: 'todo' },
        'card-3': { id: 'card-3', title: 'Review codebase structure', columnId: 'todo' },
        'card-4': { id: 'card-4', title: 'Implement authentication', columnId: 'in-progress' },
        'card-5': { id: 'card-5', title: 'Set up database schema', columnId: 'in-progress' },
        'card-6': { id: 'card-6', title: 'Fix navbar bugs', columnId: 'in-progress' },
        'card-7': { id: 'card-7', title: 'Organize project repository', columnId: 'done' },
        'card-8': { id: 'card-8', title: 'Write API documentation', columnId: 'done' },
    },
    columns: {
        'todo': {
            id: 'todo',
            title: 'Todo',
            cardIds: ['card-1', 'card-2', 'card-3'],
        },
        'in-progress': {
            id: 'in-progress',
            title: 'In Progress',
            cardIds: ['card-4', 'card-5', 'card-6'],
        },
        'done': {
            id: 'done',
            title: 'Done',
            cardIds: ['card-7', 'card-8'],
        },
    },
    columnOrder: ['todo', 'in-progress', 'done'],
};

export const KanbanBoard: React.FC = () => {
    const [data, setData] = useState<KanbanData>(initialData);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveCardId(active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeCard = data.cards[activeId];
        const overCard = data.cards[overId];
        const overColumn = data.columns[overId];

        const activeColumnId = activeCard.columnId;
        let overColumnId = overColumn ? overColumn.id : overCard?.columnId;

        if (!overColumnId || activeColumnId === overColumnId) return;

        setData((prev) => {
            const activeCardIds = [...prev.columns[activeColumnId].cardIds];
            const overCardIds = [...prev.columns[overColumnId].cardIds];

            const activeIndex = activeCardIds.indexOf(activeId);
            activeCardIds.splice(activeIndex, 1);

            const overIndex = overCardIds.indexOf(overId);
            const newIndex = overIndex >= 0 ? overIndex : overCardIds.length;
            overCardIds.splice(newIndex, 0, activeId);

            return {
                ...prev,
                cards: {
                    ...prev.cards,
                    [activeId]: { ...prev.cards[activeId], columnId: overColumnId },
                },
                columns: {
                    ...prev.columns,
                    [activeColumnId]: { ...prev.columns[activeColumnId], cardIds: activeCardIds },
                    [overColumnId]: { ...prev.columns[overColumnId], cardIds: overCardIds },
                },
            };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCardId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeCard = data.cards[activeId];
        const overCard = data.cards[overId];

        if (!activeCard || !overCard || activeCard.columnId !== overCard.columnId) return;

        const columnId = activeCard.columnId;
        const cardIds = data.columns[columnId].cardIds;
        const oldIndex = cardIds.indexOf(activeId);
        const newIndex = cardIds.indexOf(overId);

        if (oldIndex !== newIndex) {
            setData((prev) => ({
                ...prev,
                columns: {
                    ...prev.columns,
                    [columnId]: {
                        ...prev.columns[columnId],
                        cardIds: arrayMove(cardIds, oldIndex, newIndex),
                    },
                },
            }));
        }
    };

    const handleAddCard = (columnId: string) => {
        const newId = `card-${Date.now()}`;
        const newCard: Card = {
            id: newId,
            title: 'New Task',
            columnId,
        };

        setData((prev) => ({
            ...prev,
            cards: { ...prev.cards, [newId]: newCard },
            columns: {
                ...prev.columns,
                [columnId]: {
                    ...prev.columns[columnId],
                    cardIds: [newId, ...prev.columns[columnId].cardIds],
                },
            },
        }));
    };

    const handleDeleteCard = (id: string) => {
        setData((prev) => {
            const card = prev.cards[id];
            const columnId = card.columnId;
            const newCardIds = prev.columns[columnId].cardIds.filter((cid) => cid !== id);
            const { [id]: _, ...remainingCards } = prev.cards;

            return {
                ...prev,
                cards: remainingCards,
                columns: {
                    ...prev.columns,
                    [columnId]: { ...prev.columns[columnId], cardIds: newCardIds },
                },
            };
        });
    };

    const handleUpdateCard = (id: string, title: string) => {
        setData((prev) => ({
            ...prev,
            cards: {
                ...prev.cards,
                [id]: { ...prev.cards[id], title },
            },
        }));
    };

    return (
        <div className="p-6 w-full min-h-[calc(100vh-100px)] flex justify-center">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex flex-col md:flex-row gap-5 items-start w-full max-w-[1400px]">
                    {data.columnOrder.map((columnId) => {
                        const column = data.columns[columnId];
                        const cards = column.cardIds.map((id) => data.cards[id]);
                        return (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                cards={cards}
                                onAddCard={handleAddCard}
                                onDeleteCard={handleDeleteCard}
                                onUpdateCard={handleUpdateCard}
                            />
                        );
                    })}
                </div>
                <DragOverlay>
                    {activeCardId ? (
                        <KanbanCard
                            card={data.cards[activeCardId]}
                            onDelete={() => { }}
                            onUpdate={() => { }}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};
