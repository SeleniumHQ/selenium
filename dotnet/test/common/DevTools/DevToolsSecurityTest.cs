using System;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.DevTools
{
    using CurrentCdpVersion = V116;

    [TestFixture]
    public class DevToolsSecurityTest : DevToolsTestFixture
    {
        //[Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task LoadInsecureWebsite()
        {
            var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
            await domains.Security.Enable();

            await domains.Security.SetIgnoreCertificateErrors(new CurrentCdpVersion.Security.SetIgnoreCertificateErrorsCommandSettings()
            {
                Ignore = false
            });

            string summary = null;
            ManualResetEventSlim sync = new ManualResetEventSlim(false);
            EventHandler<CurrentCdpVersion.Security.SecurityStateChangedEventArgs> securityStateChangedHandler = (sender, e) =>
            {
                summary = e.Summary;
                sync.Set();
            };
            domains.Security.SecurityStateChanged += securityStateChangedHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsSecurityTest");
            sync.Wait(TimeSpan.FromSeconds(5));

            await domains.Security.Disable();

            Assert.That(driver.PageSource, Contains.Substring("Security Test"));
            Assert.That(summary, Contains.Substring("This page has a non-HTTPS secure origin"));
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task LoadSecureWebsite()
        {
            var domains = session.GetVersionSpecificDomains<CurrentCdpVersion.DevToolsSessionDomains>();
            await domains.Security.Enable();

            await domains.Security.SetIgnoreCertificateErrors(new CurrentCdpVersion.Security.SetIgnoreCertificateErrorsCommandSettings()
            {
                Ignore = true
            });

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsSecurityTest");
            Assert.That(driver.PageSource, Contains.Substring("Security Test"));
        }
    }
}
