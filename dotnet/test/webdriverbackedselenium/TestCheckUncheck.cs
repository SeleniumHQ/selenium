using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestCheckUncheck : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldBeAbleToCheckAndUncheck()
        {
            selenium.Open("/html/test_check_uncheck.html");
            Assert.IsTrue(selenium.IsChecked("base-spud"));
            Assert.IsFalse(selenium.IsChecked("base-rice"));
            Assert.IsTrue(selenium.IsChecked("option-cheese"));
            Assert.IsFalse(selenium.IsChecked("option-onions"));
            selenium.Check("base-rice");
            Assert.IsFalse(selenium.IsChecked("base-spud"));
            Assert.IsTrue(selenium.IsChecked("base-rice"));
            selenium.Uncheck("option-cheese");
            Assert.IsFalse(selenium.IsChecked("option-cheese"));
            selenium.Check("option-onions");
            Assert.IsTrue(selenium.IsChecked("option-onions"));
            Assert.IsFalse(selenium.IsChecked("option-chilli"));
            selenium.Check("option chilli");
            Assert.IsTrue(selenium.IsChecked("option-chilli"));
            selenium.Uncheck("option index=3");
            Assert.IsFalse(selenium.IsChecked("option-chilli"));
        }
    }
}
