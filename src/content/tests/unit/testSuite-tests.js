function setUp() {
}

function testLoad() {
    var testSuite = TestSuite.loadInputStream(FileUtils.openURLInputStream("chrome://selenium-ide/content/tests/unit/testSuite-tests-sampleSuite.html"));
    assertEquals(3, testSuite.tests.length);
    assertEquals("./Test1.html", testSuite.tests[0].filename);
    assertEquals("Test1", testSuite.tests[0].title);
}

function testGetFile() {
    var testSuite = new TestSuite();
    var file = FileUtils.getFile(FileUtils.getProfileDir().path);
    file.append("DummyTestSuite.html");
    testSuite.file = file;
    var testCase = new TestSuite.TestCase(testSuite, "./TestCase.html", "TestCase");
    assertEquals("TestCase.html", testCase.getFile().leafName);
}
