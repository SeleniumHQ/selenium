using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Support.UI;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class DownLoadsTest : DriverTestFixture
    {
        private IWebDriver localDriver;

        [SetUp]
        public void ResetDriver()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            InitLocalDriver();
        }

        [TearDown]
        public void QuitAdditionalDriver()
        {
            if (localDriver != null)
            {
                localDriver.Quit();
                localDriver = null;
            }

            EnvironmentManager.Instance.CreateFreshDriver();
        }

        [Test]
        [Ignore("Needs to run with Remote WebDriver")]
        public void CanListDownloadableFiles()
        {
            DownloadWithBrowser();

            IReadOnlyList<string> names = ((RemoteWebDriver)driver).GetDownloadableFiles();
            Assert.That(names, Contains.Item("file_1.txt"));
            Assert.That(names, Contains.Item("file_2.jpg"));
        }

        [Test]
        [Ignore("Needs to run with Remote WebDriver")]
        public void CanDownloadFile()
        {
            DownloadWithBrowser();

            IReadOnlyList<string> names = ((RemoteWebDriver)driver).GetDownloadableFiles();
            string fileName = names[0];
            string targetDirectory = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());

            ((RemoteWebDriver)driver).DownloadFile(fileName, targetDirectory);

            string fileContent = File.ReadAllText(Path.Combine(targetDirectory, fileName));
            Assert.AreEqual("Hello, World!", fileContent.Trim());

            Directory.Delete(targetDirectory, recursive: true);
        }

        [Test]
        [Ignore("Needs to run with Remote WebDriver")]
        public void CanDeleteFiles()
        {
            DownloadWithBrowser();

            ((RemoteWebDriver)driver).DeleteDownloadableFiles();

            IReadOnlyList<string> names = ((RemoteWebDriver)driver).GetDownloadableFiles();
            Assert.IsEmpty(names, "The names list should be empty.");
        }

        private void DownloadWithBrowser()
        {
            string downloadPage = EnvironmentManager.Instance.UrlBuilder.WhereIs("downloads/download.html");
            localDriver.Url = downloadPage;
            driver.FindElement(By.Id("file-1")).Click();
            driver.FindElement(By.Id("file-2")).Click();

            WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(3));
            wait.Until(d => ((RemoteWebDriver)d).GetDownloadableFiles().Contains("file_2.jpg"));
        }

        private void InitLocalDriver()
        {
            DownloadableFilesOptions options = new DownloadableFilesOptions();
            options.EnableDownloads = true;

            localDriver = EnvironmentManager.Instance.CreateDriverInstance(options);
        }

        public class DownloadableFilesOptions : DriverOptions
        {
            public override void AddAdditionalOption(string capabilityName, object capabilityValue)
            {
            }

            public override ICapabilities ToCapabilities()
            {
                return null;
            }
        }
    }
}

