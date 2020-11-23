module.exports = {
  roots: [
    "<rootDir>/javascript/grid-ui/src"
  ],
  testMatch: [
    "<rootDir>/javascript/grid-ui/src/tests/**/*.test.tsx"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    ".+\\.(svg|png|jpg|css)$": "identity-obj-proxy",
    "selenium/javascript/grid-ui/(.*)": "<rootDir>/$1"
  }
}
