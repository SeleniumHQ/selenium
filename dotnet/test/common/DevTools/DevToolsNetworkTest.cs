using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.DevTools
{
    [TestFixture]
    public class DevToolsNetworkTest : DevToolsTestFixture
    {
        [Test]
        public async Task GetSetDeleteAndClearAllCookies()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            var allCookieResponse = await session.Network.GetAllCookies();
            ReadOnlyCollection<Cookie> seleniumCookies = allCookieResponse.Cookies.ToSeleniumCookies();
            Assert.That(seleniumCookies.Count == 0);

            Cookie cookie = new ReturnedCookie("name", "value", EnvironmentManager.Instance.UrlBuilder.HostName, "/devtools/test", null, false, true);
            var setCookieResponse = await session.Network.SetCookie(cookie.ToDevToolsSetCookieCommandSettings());

            Assert.That(setCookieResponse.Success);

            allCookieResponse = await session.Network.GetAllCookies();
            seleniumCookies = allCookieResponse.Cookies.ToSeleniumCookies();
            Assert.That(seleniumCookies.Count == 1);

            var cookieResponse = await session.Network.GetCookies(new Network.GetCookiesCommandSettings());
            seleniumCookies = cookieResponse.Cookies.ToSeleniumCookies();
            Assert.That(seleniumCookies.Count == 0);

            await session.Network.DeleteCookies(new Network.DeleteCookiesCommandSettings()
            {
                Name = "name",
                Domain = EnvironmentManager.Instance.UrlBuilder.HostName,
                Path = "/devtools/test"
            });

            await session.Network.ClearBrowserCookies();

            allCookieResponse = await session.Network.GetAllCookies();
            seleniumCookies = allCookieResponse.Cookies.ToSeleniumCookies();
            Assert.That(seleniumCookies.Count == 0);

            setCookieResponse = await session.Network.SetCookie(cookie.ToDevToolsSetCookieCommandSettings());
            Assert.That(setCookieResponse.Success);

            allCookieResponse = await session.Network.GetAllCookies();
            seleniumCookies = allCookieResponse.Cookies.ToSeleniumCookies();
            Assert.That(seleniumCookies.Count == 1);
        }

        [Test]
        public async Task SendRequestWithUrlFiltersAndExtraHeadersAndVerifyRequests()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());
            await session.Network.SetBlockedURLs(new Network.SetBlockedURLsCommandSettings()
            {
                Urls = new string[] { "*://*/*.css" }
            });

            var additionalHeaders = new Network.Headers();
            additionalHeaders.Add("headerName", "headerValue");
            await session.Network.SetExtraHTTPHeaders(new Network.SetExtraHTTPHeadersCommandSettings()
            {
                Headers = additionalHeaders
            });

            ManualResetEventSlim loadingFailedSync = new ManualResetEventSlim(false);
            EventHandler<Network.LoadingFailedEventArgs> loadingFailedHandler = (sender, e) =>
            {
                if (e.Type == Network.ResourceType.Stylesheet)
                {
                    Assert.That(e.BlockedReason == Network.BlockedReason.Inspector);
                }

                loadingFailedSync.Set();
            };
            session.Network.LoadingFailed += loadingFailedHandler;

            ManualResetEventSlim requestSentSync = new ManualResetEventSlim(false);
            EventHandler<Network.RequestWillBeSentEventArgs> requestWillBeSentHandler = (sender, e) =>
            {
                Assert.That(e.Request.Headers.ContainsKey("headerName"));
                Assert.That(e.Request.Headers["headerName"] == "headerValue");
                requestSentSync.Set();
            };
            session.Network.RequestWillBeSent += requestWillBeSentHandler;

            ManualResetEventSlim dataSync = new ManualResetEventSlim(false);
            EventHandler<Network.DataReceivedEventArgs> dataReceivedHandler = (sender, e) =>
            {
                Assert.That(e.RequestId, Is.Not.Null);
                dataSync.Set();
            };
            session.Network.DataReceived += dataReceivedHandler; 

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("js/skins/lightgray/content.min.css");
            loadingFailedSync.Wait(TimeSpan.FromSeconds(5));
            requestSentSync.Wait(TimeSpan.FromSeconds(5));
            dataSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        public async Task EmulateNetworkConditionOffline()
        {
            await session.Network.Enable(new Network.EnableCommandSettings()
            {
                MaxTotalBufferSize = 100000000
            });

            await session.Network.EmulateNetworkConditions(new Network.EmulateNetworkConditionsCommandSettings()
            {
                Offline = true,
                Latency = 100,
                DownloadThroughput = 1000,
                UploadThroughput = 2000,
                ConnectionType = Network.ConnectionType.Cellular3g
            });

            ManualResetEventSlim loadingFailedSync = new ManualResetEventSlim(false);
            EventHandler<Network.LoadingFailedEventArgs> loadingFailedHandler = (sender, e) =>
            {
                Assert.That(e.ErrorText, Is.EqualTo("net::ERR_INTERNET_DISCONNECTED"));
                loadingFailedSync.Set();
            };
            session.Network.LoadingFailed += loadingFailedHandler;

            driver.Url = simpleTestPage;
            loadingFailedSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        public async Task VerifyRequestReceivedFromCacheAndResponseBody()
        {
            string[] requestIdFromCache = new string[1];

            await session.Network.Enable(new Network.EnableCommandSettings()
            {
                MaxResourceBufferSize = 100000000
            });

            ManualResetEventSlim servedFromCacheSync = new ManualResetEventSlim(false);
            EventHandler<Network.RequestServedFromCacheEventArgs> requestServedFromCacheHandler = (sender, e) =>
            {
                Assert.That(e.RequestId, Is.Not.Null);
                requestIdFromCache[0] = e.RequestId;
                servedFromCacheSync.Set();
            };
            session.Network.RequestServedFromCache += requestServedFromCacheHandler;

            ManualResetEventSlim loadingFinishedSync = new ManualResetEventSlim(false);
            EventHandler<Network.LoadingFinishedEventArgs> loadingFinishedHandler = (sender, e) =>
            {
                Assert.That(e.RequestId, Is.Not.Null);
                loadingFinishedSync.Set();
            };
            session.Network.LoadingFinished += loadingFinishedHandler;

            driver.Url = simpleTestPage;
            driver.Url = simpleTestPage;
            loadingFinishedSync.Wait(TimeSpan.FromSeconds(5));
            servedFromCacheSync.Wait(TimeSpan.FromSeconds(5));

            var responseBody = await session.Network.GetResponseBody(new Network.GetResponseBodyCommandSettings()
            {
                RequestId = requestIdFromCache[0]
            });

            Assert.That(responseBody.Body, Is.Not.Null);
        }

        [Test]
        public async Task VerifySearchInResponseBody()
        {
            string[] requestIds = new string[1];

            await session.Network.Enable(new Network.EnableCommandSettings()
            {
                MaxResourceBufferSize = 100000000
            });

            ManualResetEventSlim responseSync = new ManualResetEventSlim(false);
            EventHandler<Network.ResponseReceivedEventArgs> responseReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                requestIds[0] = e.RequestId;
                responseSync.Set();
            };
            session.Network.ResponseReceived += responseReceivedHandler;

            driver.Url = simpleTestPage;
            responseSync.Wait(TimeSpan.FromSeconds(5));

            var searchResponse = await session.Network.SearchInResponseBody(new Network.SearchInResponseBodyCommandSettings()
            {
                RequestId = requestIds[0],
                Query = "/",
            });

            Assert.That(searchResponse.Result.Length > 0);
        }

        [Test]
        public async Task VerifyCacheDisabledAndClearCache()
        {

            await session.Network.Enable(new Network.EnableCommandSettings()
            {
                MaxPostDataSize = 100000000
            });

            ManualResetEventSlim responseSync = new ManualResetEventSlim(false);
            EventHandler<Network.ResponseReceivedEventArgs> responseReceivedHandler = (sender, e) =>
            {
                Assert.That(e.Response.FromDiskCache, Is.False);
                responseSync.Set();
            };
            session.Network.ResponseReceived += responseReceivedHandler;

            driver.Url = simpleTestPage;
            responseSync.Wait(TimeSpan.FromSeconds(5));

            await session.Network.SetCacheDisabled(new Network.SetCacheDisabledCommandSettings()
            {
                CacheDisabled = true
            });

            driver.Url = simpleTestPage;
            await session.Network.ClearBrowserCache();
        }

        [Test]
        public async Task VerifyCertificatesAndOverrideUserAgent()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            await session.Network.SetUserAgentOverride(new Network.SetUserAgentOverrideCommandSettings()
            {
                UserAgent = "userAgent"
            });

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<Network.RequestWillBeSentEventArgs> requestWillBeSentHandler = (sender, e) =>
            {
                Assert.That(e.Request.Headers["User-Agent"], Is.EqualTo("userAgent"));
                requestSync.Set();
            };
            session.Network.RequestWillBeSent += requestWillBeSentHandler;

            string origin = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("simpleTest.html");
            driver.Url = origin;
            requestSync.Wait(TimeSpan.FromSeconds(5));

            var result = await session.Network.GetCertificate(new Network.GetCertificateCommandSettings()
            {
                Origin = origin
            });

            Assert.That(result.TableNames.Length, Is.GreaterThan(0));
        }

        [Test]
        public async Task VerifyResponseReceivedEventAndNetworkDisable()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());
            ManualResetEventSlim responseSync = new ManualResetEventSlim(false);
            EventHandler<Network.ResponseReceivedEventArgs> responseReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                responseSync.Set();
            };
            session.Network.ResponseReceived += responseReceivedHandler;

            driver.Url = simpleTestPage;
            responseSync.Wait(TimeSpan.FromSeconds(5));
            await session.Network.Disable();
        }

        [Test]
        public async Task VerifyWebSocketOperations()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            EventHandler<Network.WebSocketCreatedEventArgs> webSocketCreatedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            session.Network.WebSocketCreated += webSocketCreatedHandler;

            EventHandler<Network.WebSocketFrameReceivedEventArgs> webSocketFrameReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            session.Network.WebSocketFrameReceived += webSocketFrameReceivedHandler;

            EventHandler<Network.WebSocketFrameErrorEventArgs>webSocketFrameErrorHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            session.Network.WebSocketFrameError += webSocketFrameErrorHandler;

            EventHandler<Network.WebSocketFrameSentEventArgs> webSocketFrameSentHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            session.Network.WebSocketFrameSent += webSocketFrameSentHandler;

            EventHandler<Network.WebSocketClosedEventArgs> webSocketClosedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            session.Network.WebSocketClosed += webSocketClosedHandler;

            driver.Url = simpleTestPage;
        }

        [Test]
        public async Task VerifyRequestPostData()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            string[] requestIds = new string[1];

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<Network.RequestWillBeSentEventArgs> requestWillBeSentHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                if (string.Compare(e.Request.Method, "post", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    requestIds[0] = e.RequestId;
                }
                requestSync.Set();
            };
            session.Network.RequestWillBeSent += requestWillBeSentHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("postForm.html");
            driver.FindElement(By.XPath("//form/input")).Click();
            requestSync.Wait(TimeSpan.FromSeconds(5));

            var response = await session.Network.GetRequestPostData(new Network.GetRequestPostDataCommandSettings()
            {
                RequestId = requestIds[0]
            });

            Assert.That(response.PostData, Is.Not.Null);
        }

        [Test]
        public async Task ByPassServiceWorker()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());
            await session.Network.SetBypassServiceWorker(new Network.SetBypassServiceWorkerCommandSettings()
            {
                Bypass = true
            });
        }

        [Test]
        public async Task DataSizeLimitsForTest()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            await session.Network.SetDataSizeLimitsForTest(new Network.SetDataSizeLimitsForTestCommandSettings()
            {
                MaxResourceSize = 10000,
                MaxTotalSize = 100000
            });
        }

        [Test]
        public async Task VerifyEventSourceMessage()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<Network.EventSourceMessageReceivedEventArgs> eventSourceMessageReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                requestSync.Set();
            };
            session.Network.EventSourceMessageReceived += eventSourceMessageReceivedHandler;

            driver.Url = simpleTestPage;
            requestSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        public async Task VerifySignedExchangeReceived()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<Network.SignedExchangeReceivedEventArgs> signedExchangeReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                requestSync.Set();
            };
            session.Network.SignedExchangeReceived += signedExchangeReceivedHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("simpleTest.html");
            requestSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        public async Task VerifyResourceChangedPriority()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<Network.ResourceChangedPriorityEventArgs> resourceChangedPriorityHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                requestSync.Set();
            };
            session.Network.ResourceChangedPriority += resourceChangedPriorityHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("simpleTest.html");
            requestSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        public async Task InterceptRequestAndContinue()
        {
            await session.Network.Enable(new Network.EnableCommandSettings());

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<Network.RequestInterceptedEventArgs> requestInterceptedHandler = (async (sender, e) =>
            {
                await session.Network.ContinueInterceptedRequest(new Network.ContinueInterceptedRequestCommandSettings()
                {
                    InterceptionId = e.InterceptionId
                });
                requestSync.Set();
            });
            session.Network.RequestIntercepted += requestInterceptedHandler;

            Network.RequestPattern pattern = new Network.RequestPattern()
            {
                UrlPattern = "*.css",
                ResourceType = Network.ResourceType.Stylesheet,
                InterceptionStage = Network.InterceptionStage.HeadersReceived
            };

            await session.Network.SetRequestInterception(new Network.SetRequestInterceptionCommandSettings()
            {
                Patterns = new Network.RequestPattern[] { pattern }
            });

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("js/skins/lightgray/content.min.css");
            requestSync.Wait(TimeSpan.FromSeconds(5));
        }
    }
}
