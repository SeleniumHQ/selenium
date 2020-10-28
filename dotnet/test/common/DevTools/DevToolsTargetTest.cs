using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.DevTools
{
    [TestFixture]
    public class DevToolsTargetTest : DevToolsTestFixture
    {
        private int id = 123;

        [Test]
        [IgnoreBrowser(Selenium.Browser.EdgeLegacy, "Legacy Edge does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task GetTargetActivateAndAttach()
        {
            var domains = session.GetVersionSpecificDomains<V86.DevToolsSessionDomains>();
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
            var response = await domains.Target.GetTargets();
            V86.Target.TargetInfo[] allTargets = response.TargetInfos;
            foreach (V86.Target.TargetInfo targetInfo in allTargets)
            {
                ValidateTarget(targetInfo);
                await domains.Target.ActivateTarget(new V86.Target.ActivateTargetCommandSettings()
                {
                    TargetId = targetInfo.TargetId
                });
                var attachResponse = await domains.Target.AttachToTarget(new V86.Target.AttachToTargetCommandSettings()
                {
                    TargetId = targetInfo.TargetId,
                    Flatten = true
                });
                ValidateSession(attachResponse.SessionId);
                var getInfoResponse = await domains.Target.GetTargetInfo(new V86.Target.GetTargetInfoCommandSettings()
                {
                    TargetId = targetInfo.TargetId
                });
                ValidateTargetInfo(getInfoResponse.TargetInfo);
            }
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.EdgeLegacy, "Legacy Edge does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task GetTargetAndSendMessageToTarget()
        {
            var domains = session.GetVersionSpecificDomains<V86.DevToolsSessionDomains>();
            V86.Target.TargetInfo[] allTargets = null;
            string sessionId = null;
            V86.Target.TargetInfo targetInfo = null;
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
            ManualResetEventSlim sync = new ManualResetEventSlim(false);
            domains.Target.ReceivedMessageFromTarget += (sender, e) =>
            {
                ValidateMessage(e);
                sync.Set();
            };
            var targetsResponse = await domains.Target.GetTargets();
            allTargets = targetsResponse.TargetInfos;
            ValidateTargetsInfos(allTargets);
            ValidateTarget(allTargets[0]);
            targetInfo = allTargets[0];
            await domains.Target.ActivateTarget(new V86.Target.ActivateTargetCommandSettings()
            {
                TargetId = targetInfo.TargetId
            });

            var attachResponse = await domains.Target.AttachToTarget(new V86.Target.AttachToTargetCommandSettings()
            {
                TargetId = targetInfo.TargetId,
                Flatten = false
            });
            sessionId = attachResponse.SessionId;
            ValidateSession(sessionId);
            await domains.Target.SendMessageToTarget(new V86.Target.SendMessageToTargetCommandSettings()
            {
                Message = "{\"id\":" + id + ",\"method\":\"Page.bringToFront\"}",
                SessionId = sessionId,
                TargetId = targetInfo.TargetId
            });
            sync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.EdgeLegacy, "Legacy Edge does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task CreateAndContentLifeCycle()
        {
            var domains = session.GetVersionSpecificDomains<V86.DevToolsSessionDomains>();
            EventHandler<V86.Target.TargetCreatedEventArgs> targetCreatedHandler = (sender, e) =>
            {
                ValidateTargetInfo(e.TargetInfo);
            };
            domains.Target.TargetCreated += targetCreatedHandler;

            EventHandler<V86.Target.TargetCrashedEventArgs> targetCrashedHandler = (sender, e) =>
            {
                ValidateTargetCrashed(e);
            };
            domains.Target.TargetCrashed += targetCrashedHandler;

            EventHandler<V86.Target.TargetDestroyedEventArgs> targetDestroyedHandler = (sender, e) =>
            {
                ValidateTargetId(e.TargetId);
            };
            domains.Target.TargetDestroyed += targetDestroyedHandler;

            EventHandler<V86.Target.TargetInfoChangedEventArgs> targetInfoChangedHandler = (sender, e) =>
            {
                ValidateTargetInfo(e.TargetInfo);
            };
            domains.Target.TargetInfoChanged += targetInfoChangedHandler;

            var response = await domains.Target.CreateTarget(new V86.Target.CreateTargetCommandSettings()
            {
                Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html"),
                NewWindow = true,
                Background = false
            });

            ValidateTargetId(response.TargetId);
            await domains.Target.SetDiscoverTargets(new V86.Target.SetDiscoverTargetsCommandSettings()
            {
                Discover = true
            });

            var closeResponse = await domains.Target.CloseTarget(new V86.Target.CloseTargetCommandSettings()
            {
                TargetId = response.TargetId
            });

            Assert.That(closeResponse, Is.Not.Null);
            Assert.That(closeResponse.Success, Is.True);
        }

        private void ValidateTargetCrashed(V86.Target.TargetCrashedEventArgs targetCrashed)
        {
            Assert.That(targetCrashed, Is.Not.Null);
            Assert.That(targetCrashed.ErrorCode, Is.Not.Null);
            Assert.That(targetCrashed.Status, Is.Not.Null);
            Assert.That(targetCrashed.TargetId, Is.Not.Null);
        }

        private void ValidateTargetId(string targetId)
        {
            Assert.That(targetId, Is.Not.Null);
        }

        private void ValidateMessage(V86.Target.ReceivedMessageFromTargetEventArgs messageFromTarget)
        {
            Assert.That(messageFromTarget, Is.Not.Null);
            Assert.That(messageFromTarget.Message, Is.Not.Null);
            Assert.That(messageFromTarget.SessionId, Is.Not.Null);
            Assert.That(messageFromTarget.Message, Is.EqualTo("{\"id\":" + id + ",\"result\":{}}"));
        }

        private void ValidateTargetInfo(V86.Target.TargetInfo targetInfo)
        {
            Assert.That(targetInfo, Is.Not.Null);
            Assert.That(targetInfo.TargetId, Is.Not.Null);
            Assert.That(targetInfo.Title, Is.Not.Null);
            Assert.That(targetInfo.Type, Is.Not.Null);
            Assert.That(targetInfo.Url, Is.Not.Null);
        }

        private void ValidateTargetsInfos(V86.Target.TargetInfo[] targets)
        {
            Assert.That(targets, Is.Not.Null);
            Assert.That(targets.Length, Is.GreaterThan(0));
        }

        private void ValidateTarget(V86.Target.TargetInfo targetInfo)
        {
            Assert.That(targetInfo, Is.Not.Null);
            Assert.That(targetInfo.TargetId, Is.Not.Null);
            Assert.That(targetInfo.Title, Is.Not.Null);
            Assert.That(targetInfo.Type, Is.Not.Null);
            Assert.That(targetInfo.Url, Is.Not.Null);
        }

        private void ValidateSession(string sessionId)
        {
            Assert.That(sessionId, Is.Not.Null);
        }
    }
}
