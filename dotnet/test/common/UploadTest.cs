using NUnit.Framework;

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
        [Category("Javascript")]
        [IgnoreBrowser(Browser.WindowsPhone, "Does not yet support file uploads")]
        public void ShouldAllowFileUploading()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                Assert.Ignore("Marionette does not upload with upload element.");
            }

            driver.Url = uploadPage;
            driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
            driver.FindElement(By.Id("go")).Submit();

            driver.SwitchTo().Frame("upload_target");

            IWebElement body = driver.FindElement(By.XPath("//body"));
            Assert.IsTrue(LoremIpsumText == body.Text, "Page source is: " + driver.PageSource);
            driver.Url = "about:blank";
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.WindowsPhone, "Does not yet support file uploads")]
        //[IgnoreBrowser(Browser.IE, "Transparent file upload element not yet handled")]
        public void ShouldAllowFileUploadingUsingTransparentUploadElement()
        {
            if (TestUtilities.IsMarionette(driver))
            {
                Assert.Ignore("Marionette does not upload with tranparent upload element.");
            }

            driver.Url = transparentUploadPage;
            driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
            driver.FindElement(By.Id("go")).Submit();

            driver.SwitchTo().Frame("upload_target");

            IWebElement body = driver.FindElement(By.XPath("//body"));
            Assert.IsTrue(LoremIpsumText == body.Text, "Page source is: " + driver.PageSource);
            driver.Url = "about:blank";
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
