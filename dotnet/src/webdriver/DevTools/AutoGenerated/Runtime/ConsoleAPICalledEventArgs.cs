namespace OpenQA.Selenium.DevTools.Runtime
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when console API was called.
    /// </summary>
    public sealed class ConsoleAPICalledEventArgs : EventArgs
    {
        /// <summary>
        /// Type of the call.
        /// </summary>
        [JsonProperty("type")]
        public string Type
        {
            get;
            set;
        }
        /// <summary>
        /// Call arguments.
        /// </summary>
        [JsonProperty("args")]
        public RemoteObject[] Args
        {
            get;
            set;
        }
        /// <summary>
        /// Identifier of the context where the call was made.
        /// </summary>
        [JsonProperty("executionContextId")]
        public long ExecutionContextId
        {
            get;
            set;
        }
        /// <summary>
        /// Call timestamp.
        /// </summary>
        [JsonProperty("timestamp")]
        public double Timestamp
        {
            get;
            set;
        }
        /// <summary>
        /// Stack trace captured when the call was made. The async stack chain is automatically reported for
        /// the following call types: `assert`, `error`, `trace`, `warning`. For other types the async call
        /// chain can be retrieved using `Debugger.getStackTrace` and `stackTrace.parentId` field.
        /// </summary>
        [JsonProperty("stackTrace", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public StackTrace StackTrace
        {
            get;
            set;
        }
        /// <summary>
        /// Console context descriptor for calls on non-default console context (not console.*):
        /// 'anonymous#unique-logger-id' for call on unnamed context, 'name#unique-logger-id' for call
        /// on named context.
        /// </summary>
        [JsonProperty("context", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string Context
        {
            get;
            set;
        }
    }
}