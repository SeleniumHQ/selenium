using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class UploadTest : DriverTestFixture
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
        [IgnoreBrowser(Browser.EdgeLegacy, "Frame switching causes browser hang")]
        public void ShouldAllowFileUploading()
        {
            driver.Url = uploadPage;
            driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
            driver.FindElement(By.Id("go")).Submit();

            driver.SwitchTo().Frame("upload_target");

            IWebElement body = null;
            WaitFor(() => {
                body = driver.FindElement(By.CssSelector("body"));
                return body.Text.Contains(LoremIpsumText);
            }, "Page source is: " + driver.PageSource);
            Assert.That(body.Text, Is.EqualTo(LoremIpsumText), "Page source is: " + driver.PageSource);
        }

        [Test]
        [IgnoreBrowser(Browser.EdgeLegacy, "Driver does not support clearing file upload elements")]
        public void CleanFileInput()
        {
            driver.Url = uploadPage;
            IWebElement element = driver.FindElement(By.Id("upload"));
            element.SendKeys(testFile.FullName);
            element.Clear();
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Chrome driver does not throw exception.")]
        [IgnoreBrowser(Browser.Edge, "Edge driver does not throw exception.")]
        public void ClickFileInput()
        {
            driver.Url = uploadPage;
            IWebElement element = driver.FindElement(By.Id("upload"));
            Assert.That(() => element.Click(), Throws.InstanceOf<WebDriverException>());
        }

        [Test]
        [IgnoreBrowser(Browser.EdgeLegacy, "Frame switching causes browser hang")]
        public void UploadingWithHiddenFileInput()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("upload_invisible.html");
            driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
            driver.FindElement(By.Id("go")).Click();

            // Uploading files across a network may take a while, even if they're really small
            IWebElement label = driver.FindElement(By.Id("upload_label"));
            driver.SwitchTo().Frame("upload_target");

            IWebElement body = null;
            WaitFor(() =>
            {
                body = driver.FindElement(By.XPath("//body"));
                return body.Text.Contains(LoremIpsumText);
            }, "Page source is: " + driver.PageSource);
            Assert.That(body.Text, Is.EqualTo(LoremIpsumText), "Page source is: " + driver.PageSource);

        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        [IgnoreBrowser(Browser.EdgeLegacy, "Frame switching causes browser hang")]
        public void ShouldAllowFileUploadingUsingTransparentUploadElement()
        {
            driver.Url = transparentUploadPage;
            driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
            driver.FindElement(By.Id("go")).Submit();

            driver.SwitchTo().Frame("upload_target");

            IWebElement body = null;
            WaitFor(() => {
                body = driver.FindElement(By.XPath("//body"));
                return body.Text.Contains(LoremIpsumText);
            }, "Page source is: " + driver.PageSource);
            Assert.That(body.Text, Is.EqualTo(LoremIpsumText), "Page source is: " + driver.PageSource);
            driver.Url = "about:blank";
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
