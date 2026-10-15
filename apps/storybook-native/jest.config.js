module.exports = {
  preset: "jest-expo",
  watchman: false,
  // Markdown parsing is shared with Metro and uses standards-based ESM packages.
  transformIgnorePatterns: [],
  testMatch: ["<rootDir>/tests/**/*.test.ts?(x)"],
};
