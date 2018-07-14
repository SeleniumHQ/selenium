using System;
using System.Collections.ObjectModel;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.IE;

namespace OpenQA.Selenium.Remote
{
    [TestFixture]
    public class RemoteWebDriverSpecificTests : DriverTestFixture
    {
        private const string LoremIpsumText = "lorem ipsum dolor sit amet";
        private const string FileHtml = "<div>" + LoremIpsumText + "</div>";
        private System.IO.FileInfo testFile;

        [OneTimeSetUp]
        public void Setup()
        {
            CreateTempFile(FileHtml);
        }

        [OneTimeTearDown]
        public void Teardown()
        {
            if (testFile != null && testFile.Exists)
            {
                testFile.Delete();
            }
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        public void ShouldBeAbleToCreateRemoteWebDriverWithNoSlashAtEndOfUri()
        {
            Environment.EnvironmentManager.Instance.CloseCurrentDriver();
            RemoteWebDriver noSlashDriver = new RemoteWebDriver(new Uri("http://127.0.0.1:6000/wd/hub"), new InternetExplorerOptions());
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
            string testFileName = System.IO.Path.Combine(EnvironmentManager.Instance.CurrentDirectory, "webdriver.tmp");
            testFile = new System.IO.FileInfo(testFileName);
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
