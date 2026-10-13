import type { TreeNode } from '../model/tree.types';
import { createInitialTree } from './initialTree';

export interface TreeRepository {
  load(): Promise<TreeNode>;
}

export const treeRepository: TreeRepository = {
  load: async () => createInitialTree(),
};
