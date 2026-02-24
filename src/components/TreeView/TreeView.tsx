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
import { Loader2 } from 'lucide-react';

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

    if (loading) {
        return (
            <div className="tree-container flex items-center justify-center min-h-[200px]">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="tree-container">
            <h1>Infinite Explorer</h1>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={allIds}
                    strategy={verticalListSortingStrategy}
                >
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
                </SortableContext>
            </DndContext>
        </div>
    );
};
