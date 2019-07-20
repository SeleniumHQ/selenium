namespace OpenQA.Selenium.DevTools.Network
{
    using Newtonsoft.Json;

    /// <summary>
    /// Timing information for the request.
    /// </summary>
    public sealed class ResourceTiming
    {
        /// <summary>
        /// Timing's requestTime is a baseline in seconds, while the other numbers are ticks in
        /// milliseconds relatively to this requestTime.
        ///</summary>
        [JsonProperty("requestTime")]
        public double RequestTime
        {
            get;
            set;
        }
        /// <summary>
        /// Started resolving proxy.
        ///</summary>
        [JsonProperty("proxyStart")]
        public double ProxyStart
        {
            get;
            set;
        }
        /// <summary>
        /// Finished resolving proxy.
        ///</summary>
        [JsonProperty("proxyEnd")]
        public double ProxyEnd
        {
            get;
            set;
        }
        /// <summary>
        /// Started DNS address resolve.
        ///</summary>
        [JsonProperty("dnsStart")]
        public double DnsStart
        {
            get;
            set;
        }
        /// <summary>
        /// Finished DNS address resolve.
        ///</summary>
        [JsonProperty("dnsEnd")]
        public double DnsEnd
        {
            get;
            set;
        }
        /// <summary>
        /// Started connecting to the remote host.
        ///</summary>
        [JsonProperty("connectStart")]
        public double ConnectStart
        {
            get;
            set;
        }
        /// <summary>
        /// Connected to the remote host.
        ///</summary>
        [JsonProperty("connectEnd")]
        public double ConnectEnd
        {
            get;
            set;
        }
        /// <summary>
        /// Started SSL handshake.
        ///</summary>
        [JsonProperty("sslStart")]
        public double SslStart
        {
            get;
            set;
        }
        /// <summary>
        /// Finished SSL handshake.
        ///</summary>
        [JsonProperty("sslEnd")]
        public double SslEnd
        {
            get;
            set;
        }
        /// <summary>
        /// Started running ServiceWorker.
        ///</summary>
        [JsonProperty("workerStart")]
        public double WorkerStart
        {
            get;
            set;
        }
        /// <summary>
        /// Finished Starting ServiceWorker.
        ///</summary>
        [JsonProperty("workerReady")]
        public double WorkerReady
        {
            get;
            set;
        }
        /// <summary>
        /// Started sending request.
        ///</summary>
        [JsonProperty("sendStart")]
        public double SendStart
        {
            get;
            set;
        }
        /// <summary>
        /// Finished sending request.
        ///</summary>
        [JsonProperty("sendEnd")]
        public double SendEnd
        {
            get;
            set;
        }
        /// <summary>
        /// Time the server started pushing request.
        ///</summary>
        [JsonProperty("pushStart")]
        public double PushStart
        {
            get;
            set;
        }
        /// <summary>
        /// Time the server finished pushing request.
        ///</summary>
        [JsonProperty("pushEnd")]
        public double PushEnd
        {
            get;
            set;
        }
        /// <summary>
        /// Finished receiving response headers.
        ///</summary>
        [JsonProperty("receiveHeadersEnd")]
        public double ReceiveHeadersEnd
        {
            get;
            set;
        }
    }
}