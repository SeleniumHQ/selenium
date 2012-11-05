using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class UploadTest : DriverTestFixture
    {
        private const string LoremIpsumText = "lorem ipsum dolor sit amet";
        private const string FileHtml = "<div>" + LoremIpsumText + "</div>";
        private System.IO.FileInfo testFile;

        [SetUp]
        public void Setup()
        {
            CreateTempFile(FileHtml);
        }

        [TearDown]
        public void Teardown()
        {
            if (testFile != null && testFile.Exists)
            {
                testFile.Delete();
            }
        }

        [Test]
        [Category("Javascript")]
        public void ShouldAllowFileUploading()
        {
            driver.Url = uploadPage;
            driver.FindElement(By.Id("upload")).SendKeys(testFile.FullName);
            driver.FindElement(By.Id("go")).Submit();

            driver.SwitchTo().Frame("upload_target");

            IWebElement body = driver.FindElement(By.XPath("//body"));
            Assert.IsTrue(LoremIpsumText == body.Text, "Page source is: " + driver.PageSource);
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
