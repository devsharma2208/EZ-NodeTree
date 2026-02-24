
import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Card } from './types';

interface KanbanCardProps {
    card: Card;
    onDelete: (id: string) => void;
    onUpdate: (id: string, text: string) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ card, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(card.title);
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: {
            type: 'Card',
            card,
        },
        disabled: isEditing,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (editText.trim()) {
            onUpdate(card.id, editText.trim());
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditText(card.title);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const getAccentColor = (id: string) => {
        switch (id) {
            case 'todo': return 'bg-todo';
            case 'in-progress': return 'bg-in-progress';
            case 'done': return 'bg-done';
            default: return 'bg-slate-200';
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] relative transition-all hover:shadow-lg group ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
            {...attributes}
            {...listeners}
        >
            <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-lg ${getAccentColor(card.columnId)}`} />
            <div className="pl-2 flex flex-col">
                {isEditing ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            ref={editInputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full border border-blue-500 rounded-md p-2 text-sm outline-none resize-none font-sans"
                            rows={2}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={handleSave} className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                                <Check size={14} />
                            </button>
                            <button onClick={handleCancel} className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-start">
                        <p className="text-[0.9375rem] font-medium text-[#1e293b] leading-relaxed flex-1">{card.title}</p>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="p-1.5 rounded-md text-[#64748b] hover:bg-slate-100 transition-colors"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(card.id);
                                }}
                                className="p-1.5 rounded-md text-[#64748b] hover:bg-red-50 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-2 flex items-center pl-2">
                <div className="w-6 h-2 bg-[#e2e8f0] rounded"></div>
            </div>
        </div>
    );
};
