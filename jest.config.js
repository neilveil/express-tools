module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['dist', 'tmp'],
  coverageReporters: ['text', 'json-summary']
}
