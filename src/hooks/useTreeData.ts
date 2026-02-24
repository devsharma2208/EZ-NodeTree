import { useState, useEffect, useCallback, useRef } from 'react';
import { ITreeNode } from '../types/tree';
import { mockApi } from '../mockApi';

export type TreeActionType = { id: string, type: 'edit' | 'add-file' | 'add-folder' } | null;

export const useTreeData = () => {
    const [nodes, setNodes] = useState<ITreeNode[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeAction, setActiveAction] = useState<TreeActionType>(null);

    // Stable ref to always have the latest nodes in callbacks without re-renders
    const nodesRef = useRef<ITreeNode[]>([]);
    useEffect(() => {
        nodesRef.current = nodes;
    }, [nodes]);

    // Initial load
    const fetchRoot = async () => {
        try {
            const rootNodes = await mockApi.getRootNodes();
            setNodes(rootNodes);
        } catch (err) {
            console.error('Failed to fetch root nodes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoot();
    }, []);

    // Helper to find a node in the tree
    const findNodeById = (list: ITreeNode[], id: string): ITreeNode | undefined => {
        for (const node of list) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return undefined;
    };

    const toggleExpand = useCallback(async (nodeId: string) => {
        // Close any active actions when expanding/collapsing to refocus the tree interaction
        setActiveAction(null);

        let shouldFetch = false;

        // Use the ref for the latest state to check if we need to fetch
        const targetNode = findNodeById(nodesRef.current, nodeId);
        if (targetNode && targetNode.hasChildren && !targetNode.children) {
            shouldFetch = true;
        }

        setNodes((prevNodes) => {
            const updateNodeInList = (list: ITreeNode[]): ITreeNode[] => {
                return list.map((node) => {
                    if (node.id === nodeId) {
                        return { ...node, isExpanded: !node.isExpanded };
                    }
                    if (node.children) {
                        return { ...node, children: updateNodeInList(node.children) };
                    }
                    return node;
                });
            };
            return updateNodeInList(prevNodes);
        });

        if (shouldFetch) {
            try {
                const children = await mockApi.getChildren(nodeId);
                setNodes((prevNodes) => {
                    const addChildrenToList = (list: ITreeNode[]): ITreeNode[] => {
                        return list.map((node) => {
                            if (node.id === nodeId) {
                                return { ...node, children, isExpanded: true };
                            }
                            if (node.children) {
                                return { ...node, children: addChildrenToList(node.children) };
                            }
                            return node;
                        });
                    };
                    return addChildrenToList(prevNodes);
                });
            } catch (err) {
                console.error('Failed to load children:', err);
            }
        }
    }, []);

    const addNode = useCallback(async (parentId: string | null, name: string, isFolder: boolean = false) => {
        setActiveAction(null); // Close input after submission

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticNode: ITreeNode = {
            id: tempId,
            name,
            parentId,
            hasChildren: isFolder,
        };

        setNodes((prevNodes) => {
            if (parentId === null) {
                return [...prevNodes, optimisticNode];
            }
            const addToList = (list: ITreeNode[]): ITreeNode[] => {
                return list.map((node) => {
                    if (node.id === parentId) {
                        return {
                            ...node,
                            hasChildren: true,
                            isExpanded: true,
                            children: [...(node.children || []), optimisticNode],
                        };
                    }
                    if (node.children) {
                        return { ...node, children: addToList(node.children) };
                    }
                    return node;
                });
            };
            return addToList(prevNodes);
        });

        try {
            const newNode = await mockApi.addNode(parentId, name, isFolder);
            setNodes((prevNodes) => {
                const replaceInList = (list: ITreeNode[]): ITreeNode[] => {
                    return list.map((node) => {
                        if (node.id === tempId) return newNode;
                        if (node.children) return { ...node, children: replaceInList(node.children) };
                        return node;
                    });
                };
                return replaceInList(prevNodes);
            });
        } catch (err) {
            console.error('Failed to add node:', err);
            setNodes((prevNodes) => {
                const removeFromList = (list: ITreeNode[]): ITreeNode[] => {
                    return list.filter(n => n.id !== tempId)
                        .map(n => n.children ? { ...n, children: removeFromList(n.children) } : n);
                };
                return removeFromList(prevNodes);
            });
        }
    }, []);

    const updateNode = useCallback(async (id: string, name: string) => {
        setActiveAction(null); // Close input
        let originalName = '';

        setNodes((prevNodes) => {
            const updateInList = (list: ITreeNode[]): ITreeNode[] => {
                return list.map((node) => {
                    if (node.id === id) {
                        originalName = node.name;
                        return { ...node, name };
                    }
                    if (node.children) return { ...node, children: updateInList(node.children) };
                    return node;
                });
            };
            return updateInList(prevNodes);
        });

        try {
            await mockApi.updateNode(id, name);
        } catch (err) {
            console.error('Failed to update node:', err);
            setNodes((prevNodes) => {
                const rollback = (list: ITreeNode[]): ITreeNode[] => {
                    return list.map(n => n.id === id ? { ...n, name: originalName } :
                        (n.children ? { ...n, children: rollback(n.children) } : n));
                };
                return rollback(prevNodes);
            });
        }
    }, []);

    const deleteNode = useCallback(async (id: string) => {
        setActiveAction(null);
        let deletedNode: ITreeNode | null = null;

        // Populate deletedNode from Ref before state update
        deletedNode = findNodeById(nodesRef.current, id) || null;

        setNodes((prevNodes) => {
            const deleteFromList = (list: ITreeNode[]): ITreeNode[] => {
                return list.filter(node => node.id !== id).map(node => {
                    if (node.children) return { ...node, children: deleteFromList(node.children) };
                    return node;
                });
            };
            return deleteFromList(prevNodes);
        });

        try {
            await mockApi.deleteNode(id);
        } catch (err) {
            console.error('Failed to delete node:', err);
            if (deletedNode) fetchRoot(); // Re-fetch as a simple rollback for complex removals
        }
    }, []);

    const moveNode = useCallback((activeId: string, overId: string) => {
        setNodes((prevNodes) => {
            let movedNode: ITreeNode | null = null;
            const removeFromList = (list: ITreeNode[]): ITreeNode[] => {
                const newList: ITreeNode[] = [];
                for (const node of list) {
                    if (node.id === activeId) { movedNode = { ...node }; continue; }
                    newList.push(node.children ? { ...node, children: removeFromList(node.children) } : node);
                }
                return newList;
            };
            const intermediateNodes = removeFromList(prevNodes);
            if (!movedNode) return prevNodes;

            const insertInList = (list: ITreeNode[]): ITreeNode[] => {
                const overIndex = list.findIndex(n => n.id === overId);
                if (overIndex !== -1) {
                    const newList = [...list];
                    newList.splice(overIndex, 0, movedNode!);
                    return newList;
                }
                return list.map(node => node.id === overId ?
                    { ...node, hasChildren: true, isExpanded: true, children: [...(node.children || []), movedNode!] } :
                    (node.children ? { ...node, children: insertInList(node.children) } : node));
            };
            return insertInList(intermediateNodes);
        });
    }, []);

    return {
        nodes,
        loading,
        toggleExpand,
        addNode,
        updateNode,
        deleteNode,
        moveNode,
        activeAction,
        setActiveAction,
    };
};
