using System;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.DevTools.V113.Target;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.DevTools
{
    [TestFixture]
    public class DevToolsTargetTest : DevToolsTestFixture
    {
        private int id = 123;

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task GetTargetActivateAndAttach()
        {
            var domains = session.GetVersionSpecificDomains<V113.DevToolsSessionDomains>();
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
            var response = await domains.Target.GetTargets(new GetTargetsCommandSettings());
            V113.Target.TargetInfo[] allTargets = response.TargetInfos;
            foreach (V113.Target.TargetInfo targetInfo in allTargets)
            {
                ValidateTarget(targetInfo);
                await domains.Target.ActivateTarget(new V113.Target.ActivateTargetCommandSettings()
                {
                    TargetId = targetInfo.TargetId
                });
                var attachResponse = await domains.Target.AttachToTarget(new V113.Target.AttachToTargetCommandSettings()
                {
                    TargetId = targetInfo.TargetId,
                    Flatten = true
                });
                ValidateSession(attachResponse.SessionId);
                var getInfoResponse = await domains.Target.GetTargetInfo(new V113.Target.GetTargetInfoCommandSettings()
                {
                    TargetId = targetInfo.TargetId
                });
                ValidateTargetInfo(getInfoResponse.TargetInfo);
            }
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task GetTargetAndSendMessageToTarget()
        {
            var domains = session.GetVersionSpecificDomains<V113.DevToolsSessionDomains>();
            V113.Target.TargetInfo[] allTargets = null;
            string sessionId = null;
            V113.Target.TargetInfo targetInfo = null;
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
            ManualResetEventSlim sync = new ManualResetEventSlim(false);
            domains.Target.ReceivedMessageFromTarget += (sender, e) =>
            {
                ValidateMessage(e);
                sync.Set();
            };
            var targetsResponse = await domains.Target.GetTargets(new GetTargetsCommandSettings());
            allTargets = targetsResponse.TargetInfos;
            ValidateTargetsInfos(allTargets);
            ValidateTarget(allTargets[0]);
            targetInfo = allTargets[0];
            await domains.Target.ActivateTarget(new V113.Target.ActivateTargetCommandSettings()
            {
                TargetId = targetInfo.TargetId
            });

            var attachResponse = await domains.Target.AttachToTarget(new V113.Target.AttachToTargetCommandSettings()
            {
                TargetId = targetInfo.TargetId,
                Flatten = false
            });
            sessionId = attachResponse.SessionId;
            ValidateSession(sessionId);
            await domains.Target.SendMessageToTarget(new V113.Target.SendMessageToTargetCommandSettings()
            {
                Message = "{\"id\":" + id + ",\"method\":\"Page.bringToFront\"}",
                SessionId = sessionId,
                TargetId = targetInfo.TargetId
            });
            sync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task CreateAndContentLifeCycle()
        {
            var domains = session.GetVersionSpecificDomains<V113.DevToolsSessionDomains>();
            EventHandler<V113.Target.TargetCreatedEventArgs> targetCreatedHandler = (sender, e) =>
            {
                ValidateTargetInfo(e.TargetInfo);
            };
            domains.Target.TargetCreated += targetCreatedHandler;

            EventHandler<V113.Target.TargetCrashedEventArgs> targetCrashedHandler = (sender, e) =>
            {
                ValidateTargetCrashed(e);
            };
            domains.Target.TargetCrashed += targetCrashedHandler;

            EventHandler<V113.Target.TargetDestroyedEventArgs> targetDestroyedHandler = (sender, e) =>
            {
                ValidateTargetId(e.TargetId);
            };
            domains.Target.TargetDestroyed += targetDestroyedHandler;

            EventHandler<V113.Target.TargetInfoChangedEventArgs> targetInfoChangedHandler = (sender, e) =>
            {
                ValidateTargetInfo(e.TargetInfo);
            };
            domains.Target.TargetInfoChanged += targetInfoChangedHandler;

            var response = await domains.Target.CreateTarget(new V113.Target.CreateTargetCommandSettings()
            {
                Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html"),
                NewWindow = true,
                Background = false
            });

            ValidateTargetId(response.TargetId);
            await domains.Target.SetDiscoverTargets(new V113.Target.SetDiscoverTargetsCommandSettings()
            {
                Discover = true
            });

            var closeResponse = await domains.Target.CloseTarget(new V113.Target.CloseTargetCommandSettings()
            {
                TargetId = response.TargetId
            });

            Assert.That(closeResponse, Is.Not.Null);
            Assert.That(closeResponse.Success, Is.True);
        }

        private void ValidateTargetCrashed(V113.Target.TargetCrashedEventArgs targetCrashed)
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

        private void ValidateMessage(V113.Target.ReceivedMessageFromTargetEventArgs messageFromTarget)
        {
            Assert.That(messageFromTarget, Is.Not.Null);
            Assert.That(messageFromTarget.Message, Is.Not.Null);
            Assert.That(messageFromTarget.SessionId, Is.Not.Null);
            Assert.That(messageFromTarget.Message, Is.EqualTo("{\"id\":" + id + ",\"result\":{}}"));
        }

        private void ValidateTargetInfo(V113.Target.TargetInfo targetInfo)
        {
            Assert.That(targetInfo, Is.Not.Null);
            Assert.That(targetInfo.TargetId, Is.Not.Null);
            Assert.That(targetInfo.Title, Is.Not.Null);
            Assert.That(targetInfo.Type, Is.Not.Null);
            Assert.That(targetInfo.Url, Is.Not.Null);
        }

        private void ValidateTargetsInfos(V113.Target.TargetInfo[] targets)
        {
            Assert.That(targets, Is.Not.Null);
            Assert.That(targets.Length, Is.GreaterThan(0));
        }

        private void ValidateTarget(V113.Target.TargetInfo targetInfo)
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
