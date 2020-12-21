module.exports = {
  roots: [
    "<rootDir>/../../../../src"
  ],
  testMatch: [
    "<rootDir>/../../../../src/tests/**/*.test.tsx"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  setupFilesAfterEnv: ["<rootDir>/../../../../src/setupTests.tsx"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    ".+\\.(svg|png|jpg|css)$": "identity-obj-proxy"
  }
}
