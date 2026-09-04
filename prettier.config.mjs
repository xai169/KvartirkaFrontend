/** @type {import('prettier').Config} */
const config = {
  // Ограничение длины сохраняет читаемость кода на обычном экране.
  printWidth: 100,
  singleQuote: true,
  semi: false,
  trailingComma: 'all',
  // Единый LF исключает лишний diff между Windows и CI/Linux.
  endOfLine: 'lf',
}

export default config
