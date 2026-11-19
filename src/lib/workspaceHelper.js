export function getInitialWorkspace(studentName, branchShort) {
  return JSON.stringify({
    fileSystem: [
      {
        id: 'folder-src',
        name: `${branchShort || 'Code'} Workspace`,
        type: 'folder',
        isOpen: true,
        children: [
          {
            id: 'file-main-py',
            name: 'main.py',
            type: 'file',
            language: 'python',
            code: '',
            lastOutput: '',
            lastStdin: '',
          },
          {
            id: 'file-solution-c',
            name: 'solution.c',
            type: 'file',
            language: 'c',
            code: '',
            lastOutput: '',
            lastStdin: '',
          },
        ],
      },
    ],
    activeFileId: 'file-main-py',
  });
}
