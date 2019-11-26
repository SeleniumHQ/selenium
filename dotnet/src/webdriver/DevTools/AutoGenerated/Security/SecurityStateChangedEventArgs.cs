namespace OpenQA.Selenium.DevTools.Security
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// The security state of the page changed.
    /// </summary>
    public sealed class SecurityStateChangedEventArgs : EventArgs
    {
        /// <summary>
        /// Security state.
        /// </summary>
        [JsonProperty("securityState")]
        public SecurityState SecurityState
        {
            get;
            set;
        }
        /// <summary>
        /// True if the page was loaded over cryptographic transport such as HTTPS.
        /// </summary>
        [JsonProperty("schemeIsCryptographic")]
        public bool SchemeIsCryptographic
        {
            get;
            set;
        }
        /// <summary>
        /// List of explanations for the security state. If the overall security state is `insecure` or
        /// `warning`, at least one corresponding explanation should be included.
        /// </summary>
        [JsonProperty("explanations")]
        public SecurityStateExplanation[] Explanations
        {
            get;
            set;
        }
        /// <summary>
        /// Information about insecure content on the page.
        /// </summary>
        [JsonProperty("insecureContentStatus")]
        public InsecureContentStatus InsecureContentStatus
        {
            get;
            set;
        }
        /// <summary>
        /// Overrides user-visible description of the state.
        /// </summary>
        [JsonProperty("summary", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Summary
        {
            get;
            set;
        }
    }
}