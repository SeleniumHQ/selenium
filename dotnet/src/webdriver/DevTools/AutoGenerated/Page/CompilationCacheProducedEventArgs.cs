namespace OpenQA.Selenium.DevTools.Page
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued for every compilation cache generated. Is only available
    /// if Page.setGenerateCompilationCache is enabled.
    /// </summary>
    public sealed class CompilationCacheProducedEventArgs : EventArgs
    {
        /// <summary>
        /// Gets or sets the url
        /// </summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Base64-encoded data
        /// </summary>
        [JsonProperty("data")]
        public byte[] Data
        {
            get;
            set;
        }
    }
}