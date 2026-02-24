
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
            className={`flex flex-col my-1 rounded-lg transition-all ${isDragging ? 'opacity-50' : ''}`}
            {...attributes}
        >
            <div
                className={`flex items-center p-[10px_16px] rounded-xl cursor-pointer gap-3 select-none bg-white/[0.02] border border-white/5 transition-all duration-200 hover:bg-blue-500/10 hover:border-blue-500/30 group ${node.isExpanded ? 'bg-blue-500/5 border-blue-500/20' : ''}`}
                onDoubleClick={() => setActiveAction({ id: node.id, type: 'edit' })}
            >
                {node.hasChildren ? (
                    <ChevronRight
                        className={`w-[18px] h-[18px] text-slate-500 transition-transform duration-200 ${node.isExpanded ? 'rotate-90' : ''}`}
                        onClick={handleToggle}
                    />
                ) : (
                    <div className="w-[18px]" />
                )}

                <div className="flex items-center justify-center p-1 rounded hover:bg-white/10 cursor-grab active:cursor-grabbing" {...listeners}>
                    {node.hasChildren ? (
                        <Folder className="w-5 h-5 text-blue-400" />
                    ) : (
                        <File className="w-5 h-5 text-blue-400" />
                    )}
                </div>

                {isEditing ? (
                    <div className="flex-1 flex gap-2" onClick={e => e.stopPropagation()}>
                        <input
                            autoFocus
                            className="bg-black/20 border border-blue-500 rounded px-2 py-1 text-sm text-white outline-none w-full"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate();
                                if (e.key === 'Escape') setActiveAction(null);
                            }}
                        />
                        <div className="flex gap-1">
                            <button className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white" onClick={handleUpdate}><Check size={14} /></button>
                            <button className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white" onClick={() => setActiveAction(null)}><X size={14} /></button>
                        </div>
                    </div>
                ) : (
                    <span className="flex-1 text-[0.95rem] font-medium text-slate-200">{node.name}</span>
                )}

                {node.isExpanded && node.hasChildren && !node.children && (
                    <div className="w-4 h-4 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin ml-1" />
                )}

                <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button className="p-1 rounded text-slate-400 hover:bg-white/10 hover:text-blue-400 transition-all" title="Add File" onClick={() => setActiveAction({ id: node.id, type: 'add-file' })}>
                        <Plus size={14} />
                    </button>
                    <button className="p-1 rounded text-slate-400 hover:bg-white/10 hover:text-blue-400 transition-all" title="Add Folder" onClick={() => setActiveAction({ id: node.id, type: 'add-folder' })}>
                        <FolderPlus size={14} />
                    </button>
                    <button className="p-1 rounded text-slate-400 hover:bg-white/10 hover:text-blue-400 transition-all" title="Rename" onClick={() => setActiveAction({ id: node.id, type: 'edit' })}>
                        <Edit2 size={14} />
                    </button>
                    <button className="p-1 rounded text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all" title="Delete" onClick={handleDelete}>
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {(isAdding || (node.hasChildren && node.isExpanded)) && (
                <div className="ml-3 pl-5 border-l-2 border-white/5 flex flex-col mt-1">
                    {isAdding && (
                        <div className="flex items-center p-[10px_16px] rounded-xl bg-white/[0.02] border border-white/5 gap-3 mt-1">
                            <div className="w-[18px]" />
                            {isAddingFolder ? <Folder className="w-5 h-5 text-blue-400" /> : <File className="w-5 h-5 text-blue-400" />}
                            <input
                                autoFocus
                                className="bg-black/20 border border-blue-500 rounded px-2 py-1 text-sm text-white outline-none flex-1"
                                placeholder={isAddingFolder ? "New folder name..." : "New file name..."}
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAdd();
                                    if (e.key === 'Escape') setActiveAction(null);
                                }}
                            />
                            <button className="p-1 rounded text-slate-400 hover:bg-white/10 hover:text-white" onClick={handleAdd}><Check size={14} /></button>
                            <button className="p-1 rounded text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => setActiveAction(null)}><X size={14} /></button>
                        </div>
                    )}

                    {node.isExpanded && !node.children && (
                        <div className="flex items-center gap-3 p-3 text-slate-500 text-sm italic">
                            <div className="w-4 h-4 border-2 border-slate-500/20 border-t-slate-500 rounded-full animate-spin" />
                            <span>Fetching contents...</span>
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
            )}
        </div>
    );
});
