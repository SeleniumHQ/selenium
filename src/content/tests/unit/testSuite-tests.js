function setUp() {
}

function testLoad() {
    var testSuite = TestSuite.loadInputStream(FileUtils.openURLInputStream("chrome://selenium-ide/content/tests/unit/testSuite-tests-sampleSuite.html"));
    assertEquals(3, testSuite.tests.length);
    assertEquals("./Test1.html", testSuite.tests[0].filename);
    assertEquals("Test1", testSuite.tests[0].title);
}

function testSave() {
    var testSuite = new TestSuite();
    testSuite.tests.push(new TestSuite.TestCase(testSuite, "Hoge.html", "Hoge"));
    var file = FileUtils.getTempDir().clone();
    file.append("SeleniumIDE-TestSuite-test.html");
    testSuite.file = file;
    testSuite.save();
    assert(/<html>[\s\S]+<tr><td><a href="Hoge.html">Hoge<\/a><\/td><\/tr>\n[\s\S]+<\/html>/.test(FileUtils.readFile(file)));
    file.remove(false);
}

function testGetFile() {
    var testSuite = new TestSuite();
    var file = FileUtils.getFile(FileUtils.getProfileDir().path);
    file.append("DummyTestSuite.html");
    testSuite.file = file;
    var testCase = new TestSuite.TestCase(testSuite, "./TestCase.html", "TestCase");
    assertEquals("TestCase.html", testCase.getFile().leafName);
}

