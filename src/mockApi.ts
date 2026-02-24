import { ITreeNode } from './types/tree';

const INITIAL_DATA: ITreeNode[] = [
    { id: '1', name: 'Software Projects', parentId: null, hasChildren: true },
    { id: '2', name: 'Media Gallery', parentId: null, hasChildren: true },
    { id: '3', name: 'Personal Stuff', parentId: null, hasChildren: true },
];

const CHILD_DATA: Record<string, ITreeNode[]> = {
    '1': [
        { id: '1-1', name: 'Frontend', parentId: '1', hasChildren: true },
        { id: '1-2', name: 'Backend', parentId: '1', hasChildren: true },
        { id: '1-3', name: 'DevOps', parentId: '1', hasChildren: false },
    ],
    '2': [
        { id: '2-1', name: 'Vacation 2024', parentId: '2', hasChildren: true },
        { id: '2-2', name: 'Wedding Photos', parentId: '2', hasChildren: false },
        { id: '2-3', name: 'Profile.png', parentId: '2', hasChildren: false },
    ],
    '3': [
        { id: '3-1', name: 'Passports', parentId: '3', hasChildren: false },
        { id: '3-2', name: 'Taxes', parentId: '3', hasChildren: false },
        { id: '3-3', name: 'Secrets', parentId: '3', hasChildren: true },
    ],
    '1-1': [
        { id: '1-1-1', name: 'React App', parentId: '1-1', hasChildren: false },
        { id: '1-1-2', name: 'Vite Config', parentId: '1-1', hasChildren: false },
    ],
    '1-2': [
        { id: '1-2-1', name: 'Node.js API', parentId: '1-2', hasChildren: false },
        { id: '1-2-2', name: 'PostgreSQL Schema', parentId: '1-2', hasChildren: false },
    ],
    '2-1': [
        { id: '2-1-1', name: 'Paris.jpg', parentId: '2-1', hasChildren: false },
        { id: '2-1-2', name: 'London.mpg', parentId: '2-1', hasChildren: false },
    ],
    '3-3': [
        { id: '3-3-1', name: 'Do NOT open.txt', parentId: '3-3', hasChildren: false },
    ]
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
    async getRootNodes(): Promise<ITreeNode[]> {
        await delay(5000);
        return [...INITIAL_DATA];
    },

    async getChildren(_parentId: string): Promise<ITreeNode[]> {
        await delay(5000);
        return [...(CHILD_DATA[_parentId] || [])];
    },

    async addNode(parentId: string | null, name: string, hasChildren: boolean = false): Promise<ITreeNode> {
        await delay(100);
        return {
            id: crypto.randomUUID(),
            name,
            parentId,
            hasChildren,
        };
    },

    async updateNode(_id: string, _name: string): Promise<void> {
        await delay(100);
        return;
    },

    async deleteNode(_id: string): Promise<void> {
        await delay(100);
        return;
    },
};