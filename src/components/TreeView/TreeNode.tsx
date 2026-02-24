import React, { useState } from 'react';
import { ITreeNode } from '../../types/tree';
import {
    ChevronRight,
    Folder,
    File,
    Plus,
    FolderPlus,
    Edit2,
    Trash2,
    Check,
    X
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TreeNodeProps {
    node: ITreeNode;
    onToggle: (id: string) => void;
    onAdd: (parentId: string, name: string, isFolder: boolean) => void;
    onUpdate: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    activeAction: { id: string, type: 'edit' | 'add-file' | 'add-folder' } | null;
    setActiveAction: (action: { id: string, type: 'edit' | 'add-file' | 'add-folder' } | null) => void;
    level?: number;
}

export const TreeNode: React.FC<TreeNodeProps> = React.memo(({
    node,
    onToggle,
    onAdd,
    onUpdate,
    onDelete,
    activeAction,
    setActiveAction,
    level = 0
}) => {
    const isEditing = activeAction?.id === node.id && activeAction?.type === 'edit';
    const isAddingFile = activeAction?.id === node.id && activeAction?.type === 'add-file';
    const isAddingFolder = activeAction?.id === node.id && activeAction?.type === 'add-folder';
    const isAdding = isAddingFile || isAddingFolder;

    const [editValue, setEditValue] = useState(node.name);
    const [newValue, setNewValue] = useState('');

    React.useEffect(() => {
        if (!isEditing) setEditValue(node.name);
    }, [node.name, isEditing]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: node.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${level * 4}px`,
    };

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle(node.id);
    };

    const handleUpdate = () => {
        if (editValue.trim()) {
            onUpdate(node.id, editValue);
        } else {
            setActiveAction(null);
        }
    };

    const handleAdd = () => {
        if (newValue.trim()) {
            onAdd(node.id, newValue, isAddingFolder);
            setNewValue('');
        } else {
            setActiveAction(null);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Delete "${node.name}"?`)) {
            onDelete(node.id);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`tree-node ${isDragging ? 'dragging' : ''}`}
            {...attributes}
        >
            <div
                className={`node-content ${isDragging ? 'dragging' : ''} ${node.isExpanded ? 'expanded' : ''}`}
                onDoubleClick={() => setActiveAction({ id: node.id, type: 'edit' })}
            >
                {node.hasChildren ? (
                    <ChevronRight
                        className={`chevron ${node.isExpanded ? 'expanded' : ''}`}
                        onClick={handleToggle}
                    />
                ) : (
                    <div style={{ width: 18 }} />
                )}

                <div className="drag-handle" {...listeners}>
                    {node.hasChildren ? (
                        <Folder className="node-icon" />
                    ) : (
                        <File className="node-icon" />
                    )}
                </div>

                {isEditing ? (
                    <div className="inline-edit" onClick={e => e.stopPropagation()}>
                        <input
                            autoFocus
                            className="inline-input"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate();
                                if (e.key === 'Escape') setActiveAction(null);
                            }}
                        />
                        <button className="action-btn" onClick={handleUpdate}><Check size={14} /></button>
                        <button className="action-btn" onClick={() => setActiveAction(null)}><X size={14} /></button>
                    </div>
                ) : (
                    <span className="node-name">{node.name}</span>
                )}

                {node.isExpanded && node.hasChildren && !node.children && (
                    <div className="circular-loader" style={{ marginLeft: '4px' }} />
                )}

                <div className="node-actions" onClick={e => e.stopPropagation()}>
                    <button className="action-btn" title="Add File" onClick={() => setActiveAction({ id: node.id, type: 'add-file' })}>
                        <Plus size={14} />
                    </button>
                    <button className="action-btn" title="Add Folder" onClick={() => setActiveAction({ id: node.id, type: 'add-folder' })}>
                        <FolderPlus size={14} />
                    </button>
                    <button className="action-btn" title="Rename" onClick={() => setActiveAction({ id: node.id, type: 'edit' })}>
                        <Edit2 size={14} />
                    </button>
                    <button className="action-btn delete" title="Delete" onClick={handleDelete}>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="children-container expanded" style={{ marginLeft: 24 }}>
                    <div className="children-wrapper">
                        <div className="node-content">
                            <div style={{ width: 18 }} />
                            {isAddingFolder ? <Folder className="node-icon" /> : <File className="node-icon" />}
                            <input
                                autoFocus
                                className="inline-input"
                                placeholder={isAddingFolder ? "New folder name..." : "New file name..."}
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAdd();
                                    if (e.key === 'Escape') setActiveAction(null);
                                }}
                            />
                            <button className="action-btn" onClick={handleAdd}><Check size={14} /></button>
                            <button className="action-btn" onClick={() => setActiveAction(null)}><X size={14} /></button>
                        </div>
                    </div>
                </div>
            )}

            {node.hasChildren && (
                <div className={`children-container ${node.isExpanded ? 'expanded' : ''}`}>
                    <div className="children-wrapper">
                        {node.isExpanded && !node.children && (
                            <div className="loading-placeholder">
                                <div className="circular-loader" />
                                <span className="loading-text">Fetching contents...</span>
                            </div>
                        )}
                        {node.children && node.children.map((child: ITreeNode) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                onToggle={onToggle}
                                onAdd={onAdd}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                                activeAction={activeAction}
                                setActiveAction={setActiveAction}
                                level={level + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});
