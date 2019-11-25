using NUnit.Framework;

namespace Selenium.Tests
{
    [TestFixture]
    public class TestType : SeleniumTestCaseBase
    {
        [Test]
        public void ShouldTestTyping()
        {
            selenium.Open("/html/test_type_page1.html");
            Assert.AreEqual(string.Empty, selenium.GetValue("username"));
            selenium.ShiftKeyDown();
            selenium.Type("username", "x");
            Assert.AreEqual("X", selenium.GetValue("username"));
            selenium.ShiftKeyUp();
            selenium.Type("username", "TestUserWithLongName");
            Assert.AreEqual("TestUserWi", selenium.GetValue("username"));
            selenium.Type("username", "TestUser");
            Assert.AreEqual("TestUser", selenium.GetValue("username"));
            Assert.AreEqual(string.Empty, selenium.GetValue("password"));
            selenium.Type("password", "testUserPasswordIsVeryLong");
            Assert.AreEqual("testUserPasswordIsVe", selenium.GetValue("password"));
            selenium.Type("password", "testUserPassword");
            Assert.AreEqual("testUserPassword", selenium.GetValue("password"));
            selenium.Click("submitButton");
            selenium.WaitForPageToLoad("30000");
            Assert.IsTrue(selenium.IsTextPresent("Welcome, TestUser!"));
        }
    }
}
