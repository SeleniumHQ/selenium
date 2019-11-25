using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestElementOrder : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldDetectElementOrder()
        {
            selenium.Open("../tests/html/test_element_order.html");
            Assert.IsTrue(selenium.IsOrdered("s1.1", "d1.1"));
            Assert.IsFalse(selenium.IsOrdered("s1.1", "s1.1"));
            Assert.IsTrue(selenium.IsOrdered("s1.1", "d1.1"));
            Assert.IsFalse(selenium.IsOrdered("d1.1", "s1.1"));
            Assert.IsFalse(selenium.IsOrdered("s1.1", "d2"));
        }
    }
}
