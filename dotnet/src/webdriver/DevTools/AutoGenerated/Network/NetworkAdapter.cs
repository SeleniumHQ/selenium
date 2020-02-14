namespace OpenQA.Selenium.DevTools.Network
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Network domain to simplify the command interface.
    /// </summary>
    public class NetworkAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Network";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public NetworkAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["dataReceived"] = new DevToolsEventData(typeof(DataReceivedEventArgs), OnDataReceived);
            m_eventMap["eventSourceMessageReceived"] = new DevToolsEventData(typeof(EventSourceMessageReceivedEventArgs), OnEventSourceMessageReceived);
            m_eventMap["loadingFailed"] = new DevToolsEventData(typeof(LoadingFailedEventArgs), OnLoadingFailed);
            m_eventMap["loadingFinished"] = new DevToolsEventData(typeof(LoadingFinishedEventArgs), OnLoadingFinished);
            m_eventMap["requestIntercepted"] = new DevToolsEventData(typeof(RequestInterceptedEventArgs), OnRequestIntercepted);
            m_eventMap["requestServedFromCache"] = new DevToolsEventData(typeof(RequestServedFromCacheEventArgs), OnRequestServedFromCache);
            m_eventMap["requestWillBeSent"] = new DevToolsEventData(typeof(RequestWillBeSentEventArgs), OnRequestWillBeSent);
            m_eventMap["resourceChangedPriority"] = new DevToolsEventData(typeof(ResourceChangedPriorityEventArgs), OnResourceChangedPriority);
            m_eventMap["signedExchangeReceived"] = new DevToolsEventData(typeof(SignedExchangeReceivedEventArgs), OnSignedExchangeReceived);
            m_eventMap["responseReceived"] = new DevToolsEventData(typeof(ResponseReceivedEventArgs), OnResponseReceived);
            m_eventMap["webSocketClosed"] = new DevToolsEventData(typeof(WebSocketClosedEventArgs), OnWebSocketClosed);
            m_eventMap["webSocketCreated"] = new DevToolsEventData(typeof(WebSocketCreatedEventArgs), OnWebSocketCreated);
            m_eventMap["webSocketFrameError"] = new DevToolsEventData(typeof(WebSocketFrameErrorEventArgs), OnWebSocketFrameError);
            m_eventMap["webSocketFrameReceived"] = new DevToolsEventData(typeof(WebSocketFrameReceivedEventArgs), OnWebSocketFrameReceived);
            m_eventMap["webSocketFrameSent"] = new DevToolsEventData(typeof(WebSocketFrameSentEventArgs), OnWebSocketFrameSent);
            m_eventMap["webSocketHandshakeResponseReceived"] = new DevToolsEventData(typeof(WebSocketHandshakeResponseReceivedEventArgs), OnWebSocketHandshakeResponseReceived);
            m_eventMap["webSocketWillSendHandshakeRequest"] = new DevToolsEventData(typeof(WebSocketWillSendHandshakeRequestEventArgs), OnWebSocketWillSendHandshakeRequest);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// Fired when data chunk was received over the network.
        /// </summary>
        public event EventHandler<DataReceivedEventArgs> DataReceived;
        /// <summary>
        /// Fired when EventSource message is received.
        /// </summary>
        public event EventHandler<EventSourceMessageReceivedEventArgs> EventSourceMessageReceived;
        /// <summary>
        /// Fired when HTTP request has failed to load.
        /// </summary>
        public event EventHandler<LoadingFailedEventArgs> LoadingFailed;
        /// <summary>
        /// Fired when HTTP request has finished loading.
        /// </summary>
        public event EventHandler<LoadingFinishedEventArgs> LoadingFinished;
        /// <summary>
        /// Details of an intercepted HTTP request, which must be either allowed, blocked, modified or
        /// mocked.
        /// </summary>
        public event EventHandler<RequestInterceptedEventArgs> RequestIntercepted;
        /// <summary>
        /// Fired if request ended up loading from cache.
        /// </summary>
        public event EventHandler<RequestServedFromCacheEventArgs> RequestServedFromCache;
        /// <summary>
        /// Fired when page is about to send HTTP request.
        /// </summary>
        public event EventHandler<RequestWillBeSentEventArgs> RequestWillBeSent;
        /// <summary>
        /// Fired when resource loading priority is changed
        /// </summary>
        public event EventHandler<ResourceChangedPriorityEventArgs> ResourceChangedPriority;
        /// <summary>
        /// Fired when a signed exchange was received over the network
        /// </summary>
        public event EventHandler<SignedExchangeReceivedEventArgs> SignedExchangeReceived;
        /// <summary>
        /// Fired when HTTP response is available.
        /// </summary>
        public event EventHandler<ResponseReceivedEventArgs> ResponseReceived;
        /// <summary>
        /// Fired when WebSocket is closed.
        /// </summary>
        public event EventHandler<WebSocketClosedEventArgs> WebSocketClosed;
        /// <summary>
        /// Fired upon WebSocket creation.
        /// </summary>
        public event EventHandler<WebSocketCreatedEventArgs> WebSocketCreated;
        /// <summary>
        /// Fired when WebSocket message error occurs.
        /// </summary>
        public event EventHandler<WebSocketFrameErrorEventArgs> WebSocketFrameError;
        /// <summary>
        /// Fired when WebSocket message is received.
        /// </summary>
        public event EventHandler<WebSocketFrameReceivedEventArgs> WebSocketFrameReceived;
        /// <summary>
        /// Fired when WebSocket message is sent.
        /// </summary>
        public event EventHandler<WebSocketFrameSentEventArgs> WebSocketFrameSent;
        /// <summary>
        /// Fired when WebSocket handshake response becomes available.
        /// </summary>
        public event EventHandler<WebSocketHandshakeResponseReceivedEventArgs> WebSocketHandshakeResponseReceived;
        /// <summary>
        /// Fired when WebSocket is about to initiate handshake.
        /// </summary>
        public event EventHandler<WebSocketWillSendHandshakeRequestEventArgs> WebSocketWillSendHandshakeRequest;

        /// <summary>
        /// Tells whether clearing browser cache is supported.
        /// </summary>
        public async Task<CanClearBrowserCacheCommandResponse> CanClearBrowserCache(CanClearBrowserCacheCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CanClearBrowserCacheCommandSettings, CanClearBrowserCacheCommandResponse>(command ?? new CanClearBrowserCacheCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Tells whether clearing browser cookies is supported.
        /// </summary>
        public async Task<CanClearBrowserCookiesCommandResponse> CanClearBrowserCookies(CanClearBrowserCookiesCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CanClearBrowserCookiesCommandSettings, CanClearBrowserCookiesCommandResponse>(command ?? new CanClearBrowserCookiesCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Tells whether emulation of network conditions is supported.
        /// </summary>
        public async Task<CanEmulateNetworkConditionsCommandResponse> CanEmulateNetworkConditions(CanEmulateNetworkConditionsCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CanEmulateNetworkConditionsCommandSettings, CanEmulateNetworkConditionsCommandResponse>(command ?? new CanEmulateNetworkConditionsCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Clears browser cache.
        /// </summary>
        public async Task<ClearBrowserCacheCommandResponse> ClearBrowserCache(ClearBrowserCacheCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearBrowserCacheCommandSettings, ClearBrowserCacheCommandResponse>(command ?? new ClearBrowserCacheCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Clears browser cookies.
        /// </summary>
        public async Task<ClearBrowserCookiesCommandResponse> ClearBrowserCookies(ClearBrowserCookiesCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearBrowserCookiesCommandSettings, ClearBrowserCookiesCommandResponse>(command ?? new ClearBrowserCookiesCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Response to Network.requestIntercepted which either modifies the request to continue with any
        /// modifications, or blocks it, or completes it with the provided response bytes. If a network
        /// fetch occurs as a result which encounters a redirect an additional Network.requestIntercepted
        /// event will be sent with the same InterceptionId.
        /// </summary>
        public async Task<ContinueInterceptedRequestCommandResponse> ContinueInterceptedRequest(ContinueInterceptedRequestCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ContinueInterceptedRequestCommandSettings, ContinueInterceptedRequestCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Deletes browser cookies with matching name and url or domain/path pair.
        /// </summary>
        public async Task<DeleteCookiesCommandResponse> DeleteCookies(DeleteCookiesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DeleteCookiesCommandSettings, DeleteCookiesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Disables network tracking, prevents network events from being sent to the client.
        /// </summary>
        public async Task<DisableCommandResponse> Disable(DisableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisableCommandSettings, DisableCommandResponse>(command ?? new DisableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Activates emulation of network conditions.
        /// </summary>
        public async Task<EmulateNetworkConditionsCommandResponse> EmulateNetworkConditions(EmulateNetworkConditionsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EmulateNetworkConditionsCommandSettings, EmulateNetworkConditionsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables network tracking, network events will now be delivered to the client.
        /// </summary>
        public async Task<EnableCommandResponse> Enable(EnableCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EnableCommandSettings, EnableCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns all browser cookies. Depending on the backend support, will return detailed cookie
        /// information in the `cookies` field.
        /// </summary>
        public async Task<GetAllCookiesCommandResponse> GetAllCookies(GetAllCookiesCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetAllCookiesCommandSettings, GetAllCookiesCommandResponse>(command ?? new GetAllCookiesCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns the DER-encoded certificate.
        /// </summary>
        public async Task<GetCertificateCommandResponse> GetCertificate(GetCertificateCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetCertificateCommandSettings, GetCertificateCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns all browser cookies for the current URL. Depending on the backend support, will return
        /// detailed cookie information in the `cookies` field.
        /// </summary>
        public async Task<GetCookiesCommandResponse> GetCookies(GetCookiesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetCookiesCommandSettings, GetCookiesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns content served for the given request.
        /// </summary>
        public async Task<GetResponseBodyCommandResponse> GetResponseBody(GetResponseBodyCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetResponseBodyCommandSettings, GetResponseBodyCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns post data sent with the request. Returns an error when no data was sent with the request.
        /// </summary>
        public async Task<GetRequestPostDataCommandResponse> GetRequestPostData(GetRequestPostDataCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetRequestPostDataCommandSettings, GetRequestPostDataCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns content served for the given currently intercepted request.
        /// </summary>
        public async Task<GetResponseBodyForInterceptionCommandResponse> GetResponseBodyForInterception(GetResponseBodyForInterceptionCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetResponseBodyForInterceptionCommandSettings, GetResponseBodyForInterceptionCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns a handle to the stream representing the response body. Note that after this command,
        /// the intercepted request can't be continued as is -- you either need to cancel it or to provide
        /// the response body. The stream only supports sequential read, IO.read will fail if the position
        /// is specified.
        /// </summary>
        public async Task<TakeResponseBodyForInterceptionAsStreamCommandResponse> TakeResponseBodyForInterceptionAsStream(TakeResponseBodyForInterceptionAsStreamCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<TakeResponseBodyForInterceptionAsStreamCommandSettings, TakeResponseBodyForInterceptionAsStreamCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// This method sends a new XMLHttpRequest which is identical to the original one. The following
        /// parameters should be identical: method, url, async, request body, extra headers, withCredentials
        /// attribute, user, password.
        /// </summary>
        public async Task<ReplayXHRCommandResponse> ReplayXHR(ReplayXHRCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ReplayXHRCommandSettings, ReplayXHRCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Searches for given string in response content.
        /// </summary>
        public async Task<SearchInResponseBodyCommandResponse> SearchInResponseBody(SearchInResponseBodyCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SearchInResponseBodyCommandSettings, SearchInResponseBodyCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Blocks URLs from loading.
        /// </summary>
        public async Task<SetBlockedURLsCommandResponse> SetBlockedURLs(SetBlockedURLsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBlockedURLsCommandSettings, SetBlockedURLsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Toggles ignoring of service worker for each request.
        /// </summary>
        public async Task<SetBypassServiceWorkerCommandResponse> SetBypassServiceWorker(SetBypassServiceWorkerCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetBypassServiceWorkerCommandSettings, SetBypassServiceWorkerCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Toggles ignoring cache for each request. If `true`, cache will not be used.
        /// </summary>
        public async Task<SetCacheDisabledCommandResponse> SetCacheDisabled(SetCacheDisabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetCacheDisabledCommandSettings, SetCacheDisabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets a cookie with the given cookie data; may overwrite equivalent cookies if they exist.
        /// </summary>
        public async Task<SetCookieCommandResponse> SetCookie(SetCookieCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetCookieCommandSettings, SetCookieCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets given cookies.
        /// </summary>
        public async Task<SetCookiesCommandResponse> SetCookies(SetCookiesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetCookiesCommandSettings, SetCookiesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// For testing.
        /// </summary>
        public async Task<SetDataSizeLimitsForTestCommandResponse> SetDataSizeLimitsForTest(SetDataSizeLimitsForTestCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDataSizeLimitsForTestCommandSettings, SetDataSizeLimitsForTestCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Specifies whether to always send extra HTTP headers with the requests from this page.
        /// </summary>
        public async Task<SetExtraHTTPHeadersCommandResponse> SetExtraHTTPHeaders(SetExtraHTTPHeadersCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetExtraHTTPHeadersCommandSettings, SetExtraHTTPHeadersCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets the requests to intercept that match the provided patterns and optionally resource types.
        /// </summary>
        public async Task<SetRequestInterceptionCommandResponse> SetRequestInterception(SetRequestInterceptionCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetRequestInterceptionCommandSettings, SetRequestInterceptionCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Allows overriding user agent with the given string.
        /// </summary>
        public async Task<SetUserAgentOverrideCommandResponse> SetUserAgentOverride(SetUserAgentOverrideCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetUserAgentOverrideCommandSettings, SetUserAgentOverrideCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }

        private void OnDevToolsEventReceived(object sender, DevToolsEventReceivedEventArgs e)
        {
            if (e.DomainName == m_domainName)
            {
                if (m_eventMap.ContainsKey(e.EventName))
                {
                    var eventData = m_eventMap[e.EventName];
                    var eventArgs = e.EventData.ToObject(eventData.EventArgsType);
                    eventData.EventInvoker(eventArgs);
                }
            }
        }

        private void OnDataReceived(object rawEventArgs)
        {
            DataReceivedEventArgs e = rawEventArgs as DataReceivedEventArgs;
            if (e != null && DataReceived != null)
            {
                DataReceived(this, e);
            }
        }
        private void OnEventSourceMessageReceived(object rawEventArgs)
        {
            EventSourceMessageReceivedEventArgs e = rawEventArgs as EventSourceMessageReceivedEventArgs;
            if (e != null && EventSourceMessageReceived != null)
            {
                EventSourceMessageReceived(this, e);
            }
        }
        private void OnLoadingFailed(object rawEventArgs)
        {
            LoadingFailedEventArgs e = rawEventArgs as LoadingFailedEventArgs;
            if (e != null && LoadingFailed != null)
            {
                LoadingFailed(this, e);
            }
        }
        private void OnLoadingFinished(object rawEventArgs)
        {
            LoadingFinishedEventArgs e = rawEventArgs as LoadingFinishedEventArgs;
            if (e != null && LoadingFinished != null)
            {
                LoadingFinished(this, e);
            }
        }
        private void OnRequestIntercepted(object rawEventArgs)
        {
            RequestInterceptedEventArgs e = rawEventArgs as RequestInterceptedEventArgs;
            if (e != null && RequestIntercepted != null)
            {
                RequestIntercepted(this, e);
            }
        }
        private void OnRequestServedFromCache(object rawEventArgs)
        {
            RequestServedFromCacheEventArgs e = rawEventArgs as RequestServedFromCacheEventArgs;
            if (e != null && RequestServedFromCache != null)
            {
                RequestServedFromCache(this, e);
            }
        }
        private void OnRequestWillBeSent(object rawEventArgs)
        {
            RequestWillBeSentEventArgs e = rawEventArgs as RequestWillBeSentEventArgs;
            if (e != null && RequestWillBeSent != null)
            {
                RequestWillBeSent(this, e);
            }
        }
        private void OnResourceChangedPriority(object rawEventArgs)
        {
            ResourceChangedPriorityEventArgs e = rawEventArgs as ResourceChangedPriorityEventArgs;
            if (e != null && ResourceChangedPriority != null)
            {
                ResourceChangedPriority(this, e);
            }
        }
        private void OnSignedExchangeReceived(object rawEventArgs)
        {
            SignedExchangeReceivedEventArgs e = rawEventArgs as SignedExchangeReceivedEventArgs;
            if (e != null && SignedExchangeReceived != null)
            {
                SignedExchangeReceived(this, e);
            }
        }
        private void OnResponseReceived(object rawEventArgs)
        {
            ResponseReceivedEventArgs e = rawEventArgs as ResponseReceivedEventArgs;
            if (e != null && ResponseReceived != null)
            {
                ResponseReceived(this, e);
            }
        }
        private void OnWebSocketClosed(object rawEventArgs)
        {
            WebSocketClosedEventArgs e = rawEventArgs as WebSocketClosedEventArgs;
            if (e != null && WebSocketClosed != null)
            {
                WebSocketClosed(this, e);
            }
        }
        private void OnWebSocketCreated(object rawEventArgs)
        {
            WebSocketCreatedEventArgs e = rawEventArgs as WebSocketCreatedEventArgs;
            if (e != null && WebSocketCreated != null)
            {
                WebSocketCreated(this, e);
            }
        }
        private void OnWebSocketFrameError(object rawEventArgs)
        {
            WebSocketFrameErrorEventArgs e = rawEventArgs as WebSocketFrameErrorEventArgs;
            if (e != null && WebSocketFrameError != null)
            {
                WebSocketFrameError(this, e);
            }
        }
        private void OnWebSocketFrameReceived(object rawEventArgs)
        {
            WebSocketFrameReceivedEventArgs e = rawEventArgs as WebSocketFrameReceivedEventArgs;
            if (e != null && WebSocketFrameReceived != null)
            {
                WebSocketFrameReceived(this, e);
            }
        }
        private void OnWebSocketFrameSent(object rawEventArgs)
        {
            WebSocketFrameSentEventArgs e = rawEventArgs as WebSocketFrameSentEventArgs;
            if (e != null && WebSocketFrameSent != null)
            {
                WebSocketFrameSent(this, e);
            }
        }
        private void OnWebSocketHandshakeResponseReceived(object rawEventArgs)
        {
            WebSocketHandshakeResponseReceivedEventArgs e = rawEventArgs as WebSocketHandshakeResponseReceivedEventArgs;
            if (e != null && WebSocketHandshakeResponseReceived != null)
            {
                WebSocketHandshakeResponseReceived(this, e);
            }
        }
        private void OnWebSocketWillSendHandshakeRequest(object rawEventArgs)
        {
            WebSocketWillSendHandshakeRequestEventArgs e = rawEventArgs as WebSocketWillSendHandshakeRequestEventArgs;
            if (e != null && WebSocketWillSendHandshakeRequest != null)
            {
                WebSocketWillSendHandshakeRequest(this, e);
            }
        }
    }
}