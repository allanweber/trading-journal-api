/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["!**/__tests__/**/*.suite.ts", "**/__tests__/**/*.test.ts"],
};
