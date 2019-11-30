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
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
            var response = await session.Target.GetTargets();
            Target.TargetInfo[] allTargets = response.TargetInfos;
            foreach (Target.TargetInfo targetInfo in allTargets)
            {
                ValidateTarget(targetInfo);
                await session.Target.ActivateTarget(new Target.ActivateTargetCommandSettings()
                {
                    TargetId = targetInfo.TargetId
                });
                var attachResponse = await session.Target.AttachToTarget(new Target.AttachToTargetCommandSettings()
                {
                    TargetId = targetInfo.TargetId,
                    Flatten = true
                });
                ValidateSession(attachResponse.SessionId);
                var getInfoResponse = await session.Target.GetTargetInfo(new Target.GetTargetInfoCommandSettings()
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
            Target.TargetInfo[] allTargets = null;
            string sessionId = null;
            Target.TargetInfo targetInfo = null;
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html");
            ManualResetEventSlim sync = new ManualResetEventSlim(false);
            session.Target.ReceivedMessageFromTarget += (sender, e) =>
            {
                ValidateMessage(e);
                sync.Set();
            };
            var targetsResponse = await session.Target.GetTargets();
            allTargets = targetsResponse.TargetInfos;
            ValidateTargetsInfos(allTargets);
            ValidateTarget(allTargets[0]);
            targetInfo = allTargets[0];
            await session.Target.ActivateTarget(new Target.ActivateTargetCommandSettings()
            {
                TargetId = targetInfo.TargetId
            });

            var attachResponse = await session.Target.AttachToTarget(new Target.AttachToTargetCommandSettings()
            {
                TargetId = targetInfo.TargetId,
                Flatten = false
            });
            sessionId = attachResponse.SessionId;
            ValidateSession(sessionId);
            await session.Target.SendMessageToTarget(new Target.SendMessageToTargetCommandSettings()
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
            EventHandler<Target.TargetCreatedEventArgs> targetCreatedHandler = (sender, e) =>
            {
                ValidateTargetInfo(e.TargetInfo);
            };
            session.Target.TargetCreated += targetCreatedHandler;

            EventHandler<Target.TargetCrashedEventArgs> targetCrashedHandler = (sender, e) =>
            {
                ValidateTargetCrashed(e);
            };
            session.Target.TargetCrashed += targetCrashedHandler;

            EventHandler<Target.TargetDestroyedEventArgs> targetDestroyedHandler = (sender, e) =>
            {
                ValidateTargetId(e.TargetId);
            };
            session.Target.TargetDestroyed += targetDestroyedHandler;

            EventHandler<Target.TargetInfoChangedEventArgs> targetInfoChangedHandler = (sender, e) =>
            {
                ValidateTargetInfo(e.TargetInfo);
            };
            session.Target.TargetInfoChanged += targetInfoChangedHandler;

            var response = await session.Target.CreateTarget(new Target.CreateTargetCommandSettings()
            {
                Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("devToolsConsoleTest.html"),
                NewWindow = true,
                Background = false
            });

            ValidateTargetId(response.TargetId);
            await session.Target.SetDiscoverTargets(new Target.SetDiscoverTargetsCommandSettings()
            {
                Discover = true
            });

            var closeResponse = await session.Target.CloseTarget(new Target.CloseTargetCommandSettings()
            {
                TargetId = response.TargetId
            });

            Assert.That(closeResponse, Is.Not.Null);
            Assert.That(closeResponse.Success, Is.True);
        }

        private void ValidateTargetCrashed(Target.TargetCrashedEventArgs targetCrashed)
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

        private void ValidateMessage(Target.ReceivedMessageFromTargetEventArgs messageFromTarget)
        {
            Assert.That(messageFromTarget, Is.Not.Null);
            Assert.That(messageFromTarget.Message, Is.Not.Null);
            Assert.That(messageFromTarget.SessionId, Is.Not.Null);
            Assert.That(messageFromTarget.Message, Is.EqualTo("{\"id\":" + id + ",\"result\":{}}"));
        }

        private void ValidateTargetInfo(Target.TargetInfo targetInfo)
        {
            Assert.That(targetInfo, Is.Not.Null);
            Assert.That(targetInfo.TargetId, Is.Not.Null);
            Assert.That(targetInfo.Title, Is.Not.Null);
            Assert.That(targetInfo.Type, Is.Not.Null);
            Assert.That(targetInfo.Url, Is.Not.Null);
        }

        private void ValidateTargetsInfos(Target.TargetInfo[] targets)
        {
            Assert.That(targets, Is.Not.Null);
            Assert.That(targets.Length, Is.GreaterThan(0));
        }

        private void ValidateTarget(Target.TargetInfo targetInfo)
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
