export function languageMap(language) {
  const LANGUAGE_MAP = {
    py: "python",
    python: "python",
    js: "javascript",
    javascript: "javascript",
    jsx: "jsx",
    react: "jsx",
    ts: "typescript",
    tsx: "tsx",
    cpp: "c++",
    cxx: "c++",
    c: "c",
    java: "java",
    go: "go",
    rb: "ruby",
    php: "php",
    rs: "rust",
    swift: "swift",
    kotlin: "kotlin",
    bash: "bash",
    sh: "bash",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
  };
  return LANGUAGE_MAP[language] || "text";
}
