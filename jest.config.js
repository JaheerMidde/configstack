/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/packages/shared-validation/src/__tests__/**/*.test.ts'],
    moduleNameMapper: {
        '^@configstack/shared-types$':
            '<rootDir>/packages/shared-types/src/index.ts'
    }
}