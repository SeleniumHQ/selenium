namespace OpenQA.Selenium.DevTools.Runtime
{
    using Newtonsoft.Json;

    /// <summary>
    /// Call frames for assertions or error messages.
    /// </summary>
    public sealed class StackTrace
    {
        /// <summary>
        /// String label of this stack trace. For async traces this may be a name of the function that
        /// initiated the async call.
        ///</summary>
        [JsonProperty("description", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Description
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript function name.
        ///</summary>
        [JsonProperty("callFrames")]
        public CallFrame[] CallFrames
        {
            get;
            set;
        }
        /// <summary>
        /// Asynchronous JavaScript stack trace that preceded this stack, if available.
        ///</summary>
        [JsonProperty("parent", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public StackTrace Parent
        {
            get;
            set;
        }
        /// <summary>
        /// Asynchronous JavaScript stack trace that preceded this stack, if available.
        ///</summary>
        [JsonProperty("parentId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public StackTraceId ParentId
        {
            get;
            set;
        }
    }
}