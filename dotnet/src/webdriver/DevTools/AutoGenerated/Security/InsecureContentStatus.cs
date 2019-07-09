namespace OpenQA.Selenium.DevTools.Security
{
    using Newtonsoft.Json;

    /// <summary>
    /// Information about insecure content on the page.
    /// </summary>
    public sealed class InsecureContentStatus
    {
        /// <summary>
        /// Always false.
        ///</summary>
        [JsonProperty("ranMixedContent")]
        public bool RanMixedContent
        {
            get;
            set;
        }
        /// <summary>
        /// Always false.
        ///</summary>
        [JsonProperty("displayedMixedContent")]
        public bool DisplayedMixedContent
        {
            get;
            set;
        }
        /// <summary>
        /// Always false.
        ///</summary>
        [JsonProperty("containedMixedForm")]
        public bool ContainedMixedForm
        {
            get;
            set;
        }
        /// <summary>
        /// Always false.
        ///</summary>
        [JsonProperty("ranContentWithCertErrors")]
        public bool RanContentWithCertErrors
        {
            get;
            set;
        }
        /// <summary>
        /// Always false.
        ///</summary>
        [JsonProperty("displayedContentWithCertErrors")]
        public bool DisplayedContentWithCertErrors
        {
            get;
            set;
        }
        /// <summary>
        /// Always set to unknown.
        ///</summary>
        [JsonProperty("ranInsecureContentStyle")]
        public SecurityState RanInsecureContentStyle
        {
            get;
            set;
        }
        /// <summary>
        /// Always set to unknown.
        ///</summary>
        [JsonProperty("displayedInsecureContentStyle")]
        public SecurityState DisplayedInsecureContentStyle
        {
            get;
            set;
        }
    }
}