
import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTreeData } from '../../hooks/useTreeData';
import { TreeNode } from './TreeNode';

export const TreeView: React.FC = () => {
    const {
        nodes,
        loading,
        toggleExpand,
        addNode,
        updateNode,
        deleteNode,
        moveNode,
        activeAction,
        setActiveAction
    } = useTreeData();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            moveNode(active.id as string, over.id as string);
        }
    };

    const allIds = React.useMemo(() => {
        const getAllIds = (nodeList: any[]): string[] => {
            let ids: string[] = [];
            nodeList.forEach(node => {
                ids.push(node.id);
                if (node.isExpanded && node.children) {
                    ids = [...ids, ...getAllIds(node.children)];
                }
            });
            return ids;
        };
        return getAllIds(nodes);
    }, [nodes]);

    const containerClasses = "bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 shadow-2xl min-w-[400px] text-left mx-auto my-8 max-w-[900px]";
    const titleClasses = "text-[2.5rem] leading-[1.1] font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 tracking-[-0.025em]";

    if (loading) {
        return (
            <div className={containerClasses}>
                <h1 className={titleClasses}>Infinite Explorer</h1>
                <div className="relative flex flex-col gap-4 p-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 h-[44px] bg-white/[0.02] rounded-xl px-4 border border-white/5" style={{ opacity: 1 - i * 0.2 }}>
                            <div className="w-5 h-5 bg-white/5 rounded" />
                            <div className="w-36 h-3 bg-white/5 rounded" />
                        </div>
                    ))}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-2xl">
                        <div className="w-10 h-10 border-[3px] border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <span className="mt-4 text-slate-400 font-medium tracking-wide text-sm italic">Initializing File System...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <h1 className={titleClasses}>Infinite Explorer</h1>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={allIds}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col">
                        {nodes.map((node) => (
                            <TreeNode
                                key={node.id}
                                node={node}
                                onToggle={toggleExpand}
                                onAdd={addNode}
                                onUpdate={updateNode}
                                onDelete={deleteNode}
                                activeAction={activeAction}
                                setActiveAction={setActiveAction}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};
