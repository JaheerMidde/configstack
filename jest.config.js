/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
    moduleNameMapper: {
        '^@configstack/shared-type$':
            '<rootDir>/packages/shared-types/src/index.ts'
    }
}