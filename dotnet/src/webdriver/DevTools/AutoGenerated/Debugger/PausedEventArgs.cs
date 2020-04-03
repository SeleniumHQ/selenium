namespace OpenQA.Selenium.DevTools.Debugger
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when the virtual machine stopped on breakpoint or exception or any other stop criteria.
    /// </summary>
    public sealed class PausedEventArgs : EventArgs
    {
        /// <summary>
        /// Call stack the virtual machine stopped on.
        /// </summary>
        [JsonProperty("callFrames")]
        public CallFrame[] CallFrames
        {
            get;
            set;
        }
        /// <summary>
        /// Pause reason.
        /// </summary>
        [JsonProperty("reason")]
        public string Reason
        {
            get;
            set;
        }
        /// <summary>
        /// Object containing break-specific auxiliary properties.
        /// </summary>
        [JsonProperty("data", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public object Data
        {
            get;
            set;
        }
        /// <summary>
        /// Hit breakpoints IDs
        /// </summary>
        [JsonProperty("hitBreakpoints", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string[] HitBreakpoints
        {
            get;
            set;
        }
        /// <summary>
        /// Async stack trace, if any.
        /// </summary>
        [JsonProperty("asyncStackTrace", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTrace AsyncStackTrace
        {
            get;
            set;
        }
        /// <summary>
        /// Async stack trace, if any.
        /// </summary>
        [JsonProperty("asyncStackTraceId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTraceId AsyncStackTraceId
        {
            get;
            set;
        }
        /// <summary>
        /// Just scheduled async call will have this stack trace as parent stack during async execution.
        /// This field is available only after `Debugger.stepInto` call with `breakOnAsynCall` flag.
        /// </summary>
        [JsonProperty("asyncCallStackTraceId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public Runtime.StackTraceId AsyncCallStackTraceId
        {
            get;
            set;
        }
    }
}