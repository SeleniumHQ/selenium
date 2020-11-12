export default {
  roots: [
    "<rootDir>/src"
  ],
  testMatch: [
    "<rootDir>/src/tests/*.test.tsx"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  testEnvironment: "node",
  moduleNameMapper: {
    ".+\\.(svg|png|jpg)$": "identity-obj-proxy"
  }
}
