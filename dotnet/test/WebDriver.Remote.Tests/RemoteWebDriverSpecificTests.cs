using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium.Remote
{
    [TestFixture]
    public class RemoteWebDriverSpecificTests : DriverTestFixture
    {
        private const string LoremIpsumText = "lorem ipsum dolor sit amet";
        private const string FileHtml = "<div>" + LoremIpsumText + "</div>";
        private System.IO.FileInfo testFile;

        [TestFixtureSetUp]
        public void Setup()
        {
            CreateTempFile(FileHtml);
        }

        [TestFixtureTearDown]
        public void Teardown()
        {
            if (testFile != null && testFile.Exists)
            {
                testFile.Delete();
            }
        }

        [Test]
        [NeedsFreshDriver(AfterTest = true)]
        public void ShouldBeAbleToCreateRemoteWebDriverWithNoSlashAtEndOfUri()
        {
            Environment.EnvironmentManager.Instance.CloseCurrentDriver();
            RemoteWebDriver noSlashDriver = new RemoteWebDriver(new Uri("http://127.0.0.1:6000/wd/hub"), DesiredCapabilities.InternetExplorer());
            noSlashDriver.Url = javascriptPage;
            noSlashDriver.Quit();
        }

        [Test]
        public void ShouldBeAbleToSendFileToRemoteServer()
        {
            IAllowsFileDetection fileDetectionDriver = driver as IAllowsFileDetection;
            if (fileDetectionDriver == null)
            {
                Assert.Fail("driver does not support file detection. This should not be");
            }

            fileDetectionDriver.FileDetector = new LocalFileDetector();

            driver.Url = uploadPage;
            IWebElement uploadElement = driver.FindElement(By.Id("upload"));
            uploadElement.SendKeys(testFile.FullName);
            driver.FindElement(By.Id("go")).Submit();

            driver.SwitchTo().Frame("upload_target");

            IWebElement body = driver.FindElement(By.XPath("//body"));
            Assert.IsTrue(LoremIpsumText == body.Text, "Page source is: " + driver.PageSource);
            driver.SwitchTo().DefaultContent();
            uploadElement = driver.FindElement(By.Id("upload"));
            Console.WriteLine(uploadElement.Text);
        }

        private void CreateTempFile(string content)
        {
            testFile = new System.IO.FileInfo("webdriver.tmp");
            if (testFile.Exists)
            {
                testFile.Delete();
            }
            System.IO.StreamWriter testFileWriter = testFile.CreateText();
            testFileWriter.WriteLine(content);
            testFileWriter.Close();
        }
    }
}
