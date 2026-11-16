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
            code: `# Personal Codespace for ${studentName} (${branchShort || 'Engineering'})\nprint("Welcome to your personal Codespace!")\n`,
            lastOutput: '',
            lastStdin: '',
          },
          {
            id: 'file-solution-c',
            name: 'solution.c',
            type: 'file',
            language: 'c',
            code: `#include <stdio.h>\n\nint main() {\n    printf("Codex Environment initialized.\\n");\n    return 0;\n}\n`,
            lastOutput: '',
            lastStdin: '',
          },
        ],
      },
    ],
    activeFileId: 'file-main-py',
  });
}
