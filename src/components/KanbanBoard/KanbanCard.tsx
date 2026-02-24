
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
        opacity: isDragging ? 0.5 : 1,
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`kanban-card ${isDragging ? 'dragging' : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className="card-accent" />
            <div className="card-content">
                {isEditing ? (
                    <div className="card-edit-mode">
                        <textarea
                            ref={editInputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="card-edit-input"
                            rows={2}
                        />
                        <div className="card-edit-actions">
                            <button onClick={handleSave} className="icon-btn save-btn">
                                <Check size={14} />
                            </button>
                            <button onClick={handleCancel} className="icon-btn cancel-btn">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card-view-mode">
                        <p className="card-title">{card.title}</p>
                        <div className="card-actions">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                                className="icon-btn edit-btn"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(card.id);
                                }}
                                className="icon-btn delete-btn"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="card-footer">
                <div className="card-tag"></div>
            </div>
        </div>
    );
};
