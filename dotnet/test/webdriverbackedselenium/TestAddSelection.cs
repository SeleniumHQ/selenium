using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestAddSelection : SeleniumTestCaseBase
    {
        [Test]
        public void AddingToSelectionWhenSelectHasEmptyMultipleAttribute()
        {
            selenium.Open("../tests/html/test_multiple_select.html");

            selenium.AddSelection("sel", "select_2");
            selenium.AddSelection("sel", "select_3");

            string[] found = selenium.GetSelectedIds("name=sel");

            Assert.AreEqual(2, found.Length);
            Assert.AreEqual("select_2", found[0]);
            Assert.AreEqual("select_3", found[1]);
        }
    }
}
