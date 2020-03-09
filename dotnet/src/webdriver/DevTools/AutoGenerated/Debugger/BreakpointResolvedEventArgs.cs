namespace OpenQA.Selenium.DevTools.Debugger
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when breakpoint is resolved to an actual script and location.
    /// </summary>
    public sealed class BreakpointResolvedEventArgs : EventArgs
    {
        /// <summary>
        /// Breakpoint unique identifier.
        /// </summary>
        [JsonProperty("breakpointId")]
        public string BreakpointId
        {
            get;
            set;
        }
        /// <summary>
        /// Actual breakpoint location.
        /// </summary>
        [JsonProperty("location")]
        public Location Location
        {
            get;
            set;
        }
    }
}