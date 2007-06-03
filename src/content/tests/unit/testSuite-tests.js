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
    var testCaseFile = FileUtils.getTempDir().clone();
    var testCase = {};
    testCaseFile.append("Test.html");
    testCase.file = testCaseFile;
    testCase.getTitle = function() { return "Test Case" };
    testSuite.addTestCaseFromContent(testCase);
    
    var file = FileUtils.getTempDir().clone();
    file.append("SeleniumIDE-TestSuite-test.html");
    testSuite.file = file;

    testSuite.save();
    var content = FileUtils.readFile(file);
    debug("content: " + content);
    assert(/<html>[\s\S]+<tr><td><a href="Test.html">Test Case<\/a><\/td><\/tr>\n[\s\S]+<\/html>/.test(content));

    testCaseFile = FileUtils.getTempDir().clone();
    testCaseFile.append("foo");
    testCaseFile.append("Test.html");
    testCase.file = testCaseFile;

    testSuite.save();
    var content = FileUtils.readFile(file);
    debug("content 2: " + content);
    assert(/<html>[\s\S]+<tr><td><a href="foo\/Test.html">Test Case<\/a><\/td><\/tr>\n[\s\S]+<\/html>/.test(content));
    
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

function testGenerateNewTestCaseTitle() {
    var suite = new TestSuite();
    loadTests([]);
    assertEquals("Untitled", suite.generateNewTestCaseTitle());
    loadTests(["Untitled"]);
    assertEquals("Untitled 2", suite.generateNewTestCaseTitle());
    loadTests(["Untitled", "Untitled 2"]);
    assertEquals("Untitled 3", suite.generateNewTestCaseTitle());
    loadTests(["Untitled 3"]);
    assertEquals("Untitled 4", suite.generateNewTestCaseTitle());

    function loadTests(tests) {
        suite.tests = [];
        tests.forEach(function(name) {
                suite.tests.push(new TestSuite.TestCase(suite, name, name));
            });
    }
}
