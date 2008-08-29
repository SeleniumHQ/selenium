function SampleTest(name) {
    TestCase.call(this,name);
}

SampleTest.prototype = new TestCase();
SampleTest.prototype.setUp = function() {
}

SampleTest.prototype.testSample = function() {
    this.assertTrue(true);
}
