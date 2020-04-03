namespace OpenQA.Selenium.DevTools.Debugger
{
    using Newtonsoft.Json;

    /// <summary>
    /// JavaScript call frame. Array of call frames form the call stack.
    /// </summary>
    public sealed class CallFrame
    {
        /// <summary>
        /// Call frame identifier. This identifier is only valid while the virtual machine is paused.
        ///</summary>
        [JsonProperty("callFrameId")]
        public string CallFrameId
        {
            get;
            set;
        }
        /// <summary>
        /// Name of the JavaScript function called on this call frame.
        ///</summary>
        [JsonProperty("functionName")]
        public string FunctionName
        {
            get;
            set;
        }
        /// <summary>
        /// Location in the source code.
        ///</summary>
        [JsonProperty("functionLocation", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Location FunctionLocation
        {
            get;
            set;
        }
        /// <summary>
        /// Location in the source code.
        ///</summary>
        [JsonProperty("location")]
        public Location Location
        {
            get;
            set;
        }
        /// <summary>
        /// JavaScript script name or url.
        ///</summary>
        [JsonProperty("url")]
        public string Url
        {
            get;
            set;
        }
        /// <summary>
        /// Scope chain for this call frame.
        ///</summary>
        [JsonProperty("scopeChain")]
        public Scope[] ScopeChain
        {
            get;
            set;
        }
        /// <summary>
        /// `this` object for this call frame.
        ///</summary>
        [JsonProperty("this")]
        public Runtime.RemoteObject This
        {
            get;
            set;
        }
        /// <summary>
        /// The value being returned, if the function is at return point.
        ///</summary>
        [JsonProperty("returnValue", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.RemoteObject ReturnValue
        {
            get;
            set;
        }
    }
}