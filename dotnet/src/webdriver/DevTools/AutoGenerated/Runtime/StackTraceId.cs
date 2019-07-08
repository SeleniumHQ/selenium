namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// If `debuggerId` is set stack trace comes from another debugger and can be resolved there. This
    /// allows to track cross-debugger calls. See `Runtime.StackTrace` and `Debugger.paused` for usages.
    /// </summary>
    public sealed class StackTraceId
    {
        /// <summary>
        /// id
        ///</summary>
        [JsonProperty("id")]
        public string Id
        {
            get;
            set;
        }
        /// <summary>
        /// debuggerId
        ///</summary>
        [JsonProperty("debuggerId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string DebuggerId
        {
            get;
            set;
        }
    }
}