export interface ITreeNode {
    id: string;
    name: string;
    parentId: string | null;
    hasChildren: boolean;
    children?: ITreeNode[];
    isExpanded?: boolean;
}

export interface TreeData {
    [id: string]: ITreeNode;
}
