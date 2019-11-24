namespace OpenQA.Selenium.DevTools.Target
{
    using Newtonsoft.Json;

    /// <summary>
    /// RemoteLocation
    /// </summary>
    public sealed class RemoteLocation
    {
        /// <summary>
        /// host
        ///</summary>
        [JsonProperty("host")]
        public string Host
        {
            get;
            set;
        }
        /// <summary>
        /// port
        ///</summary>
        [JsonProperty("port")]
        public long Port
        {
            get;
            set;
        }
    }
}