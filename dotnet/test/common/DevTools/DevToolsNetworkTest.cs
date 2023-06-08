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
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public void GetSetDeleteAndClearAllCookies()
        {
            //var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            //await domains.Network.Enable(new V114.Network.EnableCommandSettings());

            //var allCookieResponse = await domains.Network.GetAllCookies();
            //ReadOnlyCollection<Cookie> seleniumCookies = allCookieResponse.Cookies.ToSeleniumCookies();
            //Assert.That(seleniumCookies.Count == 0);

            //Cookie cookie = new ReturnedCookie("name", "value", EnvironmentManager.Instance.UrlBuilder.HostName, "/devtools/test", null, false, true);
            //var setCookieResponse = await domains.Network.SetCookie(cookie.ToDevToolsSetCookieCommandSettings());

            //Assert.That(setCookieResponse.Success);

            //allCookieResponse = await domains.Network.GetAllCookies();
            //seleniumCookies = allCookieResponse.Cookies.ToSeleniumCookies();
            //Assert.That(seleniumCookies.Count == 1);

            //var cookieResponse = await domains.Network.GetCookies(new V114.Network.GetCookiesCommandSettings());
            //seleniumCookies = cookieResponse.Cookies.ToSeleniumCookies();
            //Assert.That(seleniumCookies.Count == 0);

            //await domains.Network.DeleteCookies(new V114.Network.DeleteCookiesCommandSettings()
            //{
            //    Name = "name",
            //    Domain = EnvironmentManager.Instance.UrlBuilder.HostName,
            //    Path = "/devtools/test"
            //});

            //await domains.Network.ClearBrowserCookies();

            //allCookieResponse = await domains.Network.GetAllCookies();
            //seleniumCookies = allCookieResponse.Cookies.ToSeleniumCookies();
            //Assert.That(seleniumCookies.Count == 0);

            //setCookieResponse = await domains.Network.SetCookie(cookie.ToDevToolsSetCookieCommandSettings());
            //Assert.That(setCookieResponse.Success);

            //allCookieResponse = await domains.Network.GetAllCookies();
            //seleniumCookies = allCookieResponse.Cookies.ToSeleniumCookies();
            //Assert.That(seleniumCookies.Count == 1);
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task SendRequestWithUrlFiltersAndExtraHeadersAndVerifyRequests()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());
            await domains.Network.SetBlockedURLs(new V114.Network.SetBlockedURLsCommandSettings()
            {
                Urls = new string[] { "*://*/*.css" }
            });

            var additionalHeaders = new V114.Network.Headers();
            additionalHeaders.Add("headerName", "headerValue");
            await domains.Network.SetExtraHTTPHeaders(new V114.Network.SetExtraHTTPHeadersCommandSettings()
            {
                Headers = additionalHeaders
            });

            ManualResetEventSlim loadingFailedSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.LoadingFailedEventArgs> loadingFailedHandler = (sender, e) =>
            {
                if (e.Type == V114.Network.ResourceType.Stylesheet)
                {
                    Assert.That(e.BlockedReason == V114.Network.BlockedReason.Inspector);
                }

                loadingFailedSync.Set();
            };
            domains.Network.LoadingFailed += loadingFailedHandler;

            ManualResetEventSlim requestSentSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.RequestWillBeSentEventArgs> requestWillBeSentHandler = (sender, e) =>
            {
                Assert.That(e.Request.Headers.ContainsKey("headerName"));
                Assert.That(e.Request.Headers["headerName"] == "headerValue");
                requestSentSync.Set();
            };
            domains.Network.RequestWillBeSent += requestWillBeSentHandler;

            ManualResetEventSlim dataSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.DataReceivedEventArgs> dataReceivedHandler = (sender, e) =>
            {
                Assert.That(e.RequestId, Is.Not.Null);
                dataSync.Set();
            };
            domains.Network.DataReceived += dataReceivedHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("js/skins/lightgray/content.min.css");
            loadingFailedSync.Wait(TimeSpan.FromSeconds(5));
            requestSentSync.Wait(TimeSpan.FromSeconds(5));
            dataSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task EmulateNetworkConditionOffline()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings()
            {
                MaxTotalBufferSize = 100000000
            });

            await domains.Network.EmulateNetworkConditions(new V114.Network.EmulateNetworkConditionsCommandSettings()
            {
                Offline = true,
                Latency = 100,
                DownloadThroughput = 1000,
                UploadThroughput = 2000,
                ConnectionType = V114.Network.ConnectionType.Cellular3g
            });

            ManualResetEventSlim loadingFailedSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.LoadingFailedEventArgs> loadingFailedHandler = (sender, e) =>
            {
                Assert.That(e.ErrorText, Is.EqualTo("net::ERR_INTERNET_DISCONNECTED"));
                loadingFailedSync.Set();
            };
            domains.Network.LoadingFailed += loadingFailedHandler;

            try
            {
                driver.Url = simpleTestPage;
            }
            catch (WebDriverException e)
            {
                Assert.That(e.Message.Contains("net::ERR_INTERNET_DISCONNECTED"));
            }

            loadingFailedSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        [Ignore("The request ID is not getting added to cache")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyRequestReceivedFromCacheAndResponseBody()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            string[] requestIdFromCache = new string[1];

            await domains.Network.Enable(new V114.Network.EnableCommandSettings()
            {
                MaxResourceBufferSize = 100000000
            });

            ManualResetEventSlim servedFromCacheSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.RequestServedFromCacheEventArgs> requestServedFromCacheHandler = (sender, e) =>
            {
                Assert.That(e.RequestId, Is.Not.Null);
                requestIdFromCache[0] = e.RequestId;
                servedFromCacheSync.Set();
            };
            domains.Network.RequestServedFromCache += requestServedFromCacheHandler;

            ManualResetEventSlim loadingFinishedSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.LoadingFinishedEventArgs> loadingFinishedHandler = (sender, e) =>
            {
                Assert.That(e.RequestId, Is.Not.Null);
                loadingFinishedSync.Set();
            };
            domains.Network.LoadingFinished += loadingFinishedHandler;

            driver.Url = simpleTestPage;
            driver.Url = simpleTestPage;
            loadingFinishedSync.Wait(TimeSpan.FromSeconds(5));
            servedFromCacheSync.Wait(TimeSpan.FromSeconds(5));

            var responseBody = await domains.Network.GetResponseBody(new V114.Network.GetResponseBodyCommandSettings()
            {
                RequestId = requestIdFromCache[0]
            });

            Assert.That(responseBody.Body, Is.Not.Null);
        }

        [Test]
        [IgnorePlatform("Windows", "Not working properly")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifySearchInResponseBody()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            string[] requestIds = new string[1];

            await domains.Network.Enable(new V114.Network.EnableCommandSettings()
            {
                MaxResourceBufferSize = 100000000
            });

            ManualResetEventSlim responseSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.ResponseReceivedEventArgs> responseReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                requestIds[0] = e.RequestId;
                responseSync.Set();
            };
            domains.Network.ResponseReceived += responseReceivedHandler;

            driver.Url = simpleTestPage;
            responseSync.Wait(TimeSpan.FromSeconds(5));

            var searchResponse = await domains.Network.SearchInResponseBody(new V114.Network.SearchInResponseBodyCommandSettings()
            {
                RequestId = requestIds[0],
                Query = "/",
            });

            Assert.That(searchResponse.Result.Length > 0);
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyCacheDisabledAndClearCache()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings()
            {
                MaxPostDataSize = 100000000
            });

            ManualResetEventSlim responseSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.ResponseReceivedEventArgs> responseReceivedHandler = (sender, e) =>
            {
                Assert.That(e.Response.FromDiskCache, Is.False);
                responseSync.Set();
            };
            domains.Network.ResponseReceived += responseReceivedHandler;

            driver.Url = simpleTestPage;
            responseSync.Wait(TimeSpan.FromSeconds(5));

            await domains.Network.SetCacheDisabled(new V114.Network.SetCacheDisabledCommandSettings()
            {
                CacheDisabled = true
            });

            driver.Url = simpleTestPage;
            await domains.Network.ClearBrowserCache();
        }

        [Test]
        [Ignore("Unable to open secure url")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyCertificatesAndOverrideUserAgent()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());

            await domains.Network.SetUserAgentOverride(new V114.Network.SetUserAgentOverrideCommandSettings()
            {
                UserAgent = "userAgent"
            });

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.RequestWillBeSentEventArgs> requestWillBeSentHandler = (sender, e) =>
            {
                Assert.That(e.Request.Headers["User-Agent"], Is.EqualTo("userAgent"));
                requestSync.Set();
            };
            domains.Network.RequestWillBeSent += requestWillBeSentHandler;

            string origin = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("simpleTest.html");
            driver.Url = origin;
            requestSync.Wait(TimeSpan.FromSeconds(5));

            var result = await domains.Network.GetCertificate(new V114.Network.GetCertificateCommandSettings()
            {
                Origin = origin
            });

            Assert.That(result.TableNames.Length, Is.GreaterThan(0));
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyResponseReceivedEventAndNetworkDisable()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());
            ManualResetEventSlim responseSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.ResponseReceivedEventArgs> responseReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                responseSync.Set();
            };
            domains.Network.ResponseReceived += responseReceivedHandler;

            driver.Url = simpleTestPage;
            responseSync.Wait(TimeSpan.FromSeconds(5));
            await domains.Network.Disable();
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyWebSocketOperations()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());

            EventHandler<V114.Network.WebSocketCreatedEventArgs> webSocketCreatedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            domains.Network.WebSocketCreated += webSocketCreatedHandler;

            EventHandler<V114.Network.WebSocketFrameReceivedEventArgs> webSocketFrameReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            domains.Network.WebSocketFrameReceived += webSocketFrameReceivedHandler;

            EventHandler<V114.Network.WebSocketFrameErrorEventArgs>webSocketFrameErrorHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            domains.Network.WebSocketFrameError += webSocketFrameErrorHandler;

            EventHandler<V114.Network.WebSocketFrameSentEventArgs> webSocketFrameSentHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            domains.Network.WebSocketFrameSent += webSocketFrameSentHandler;

            EventHandler<V114.Network.WebSocketClosedEventArgs> webSocketClosedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
            };
            domains.Network.WebSocketClosed += webSocketClosedHandler;

            driver.Url = simpleTestPage;
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyRequestPostData()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());

            string[] requestIds = new string[1];

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.RequestWillBeSentEventArgs> requestWillBeSentHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                if (string.Compare(e.Request.Method, "post", StringComparison.OrdinalIgnoreCase) == 0)
                {
                    requestIds[0] = e.RequestId;
                }
                requestSync.Set();
            };
            domains.Network.RequestWillBeSent += requestWillBeSentHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("postForm.html");
            driver.FindElement(By.XPath("//form/input")).Click();
            requestSync.Wait(TimeSpan.FromSeconds(5));

            var response = await domains.Network.GetRequestPostData(new V114.Network.GetRequestPostDataCommandSettings()
            {
                RequestId = requestIds[0]
            });

            Assert.That(response.PostData, Is.Not.Null);
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task ByPassServiceWorker()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());
            await domains.Network.SetBypassServiceWorker(new V114.Network.SetBypassServiceWorkerCommandSettings()
            {
                Bypass = true
            });
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyEventSourceMessage()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.EventSourceMessageReceivedEventArgs> eventSourceMessageReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                requestSync.Set();
            };
            domains.Network.EventSourceMessageReceived += eventSourceMessageReceivedHandler;

            driver.Url = simpleTestPage;
            requestSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        [Ignore("Unable to open secure url")]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifySignedExchangeReceived()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.SignedExchangeReceivedEventArgs> signedExchangeReceivedHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                requestSync.Set();
            };
            domains.Network.SignedExchangeReceived += signedExchangeReceivedHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIsSecure("simpleTest.html");
            requestSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task VerifyResourceChangedPriority()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.ResourceChangedPriorityEventArgs> resourceChangedPriorityHandler = (sender, e) =>
            {
                Assert.That(e, Is.Not.Null);
                requestSync.Set();
            };
            domains.Network.ResourceChangedPriority += resourceChangedPriorityHandler;

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("simpleTest.html");
            requestSync.Wait(TimeSpan.FromSeconds(5));
        }

        [Test]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Chrome DevTools Protocol")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Chrome DevTools Protocol")]
        public async Task InterceptRequestAndContinue()
        {
            var domains = session.GetVersionSpecificDomains<V114.DevToolsSessionDomains>();
            await domains.Network.Enable(new V114.Network.EnableCommandSettings());

            ManualResetEventSlim requestSync = new ManualResetEventSlim(false);
            EventHandler<V114.Network.RequestInterceptedEventArgs> requestInterceptedHandler = (async (sender, e) =>
            {
                await domains.Network.ContinueInterceptedRequest(new V114.Network.ContinueInterceptedRequestCommandSettings()
                {
                    InterceptionId = e.InterceptionId
                });
                requestSync.Set();
            });
            domains.Network.RequestIntercepted += requestInterceptedHandler;

            var pattern = new V114.Network.RequestPattern()
            {
                UrlPattern = "*.css",
                ResourceType = V114.Network.ResourceType.Stylesheet,
                InterceptionStage = V114.Network.InterceptionStage.HeadersReceived
            };

            await domains.Network.SetRequestInterception(new V114.Network.SetRequestInterceptionCommandSettings()
            {
                Patterns = new V114.Network.RequestPattern[] { pattern }
            });

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("js/skins/lightgray/content.min.css");
            requestSync.Wait(TimeSpan.FromSeconds(5));
        }
    }
}
