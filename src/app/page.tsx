import { TreeView } from '@/features/tree/components/TreeView';
import { TreeProvider } from '@/features/tree/context/TreeProvider';
import { treeRepository } from '@/features/tree/data/tree.repository';

export default async function Page() {
  const initialTree = await treeRepository.load();

  return (
    <main>
      <TreeProvider initialTree={initialTree}>
        <TreeView />
      </TreeProvider>
    </main>
  );
}
