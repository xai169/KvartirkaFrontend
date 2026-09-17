/** @type {import('prettier').Config} */
const config = {
  // Ограничение длины сохраняет читаемость кода на обычном экране.
  printWidth: 120,
  singleAttributePerLine: true,
  trailingComma: "all",
  // Единый LF исключает лишний diff между Windows и CI/Linux.
  endOfLine: "lf",
  useTabs: false,
};

export default config;
