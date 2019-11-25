using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestElementIndex : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldDetectElementIndex()
        {
            selenium.Open("/html/test_element_order.html");
            Assert.AreEqual(1, selenium.GetElementIndex("d2"));
            Assert.AreEqual(0, selenium.GetElementIndex("d1.1.1"));
            Assert.AreEqual(1, selenium.GetElementIndex("d2"));
            Assert.AreEqual(5, selenium.GetElementIndex("d1.2"));
            Assert.AreNotEqual(2, selenium.GetElementIndex("d2"));
        }
    }
}
