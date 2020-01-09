namespace OpenQA.Selenium.DevTools.Target
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when a target has crashed.
    /// </summary>
    public sealed class TargetCrashedEventArgs : EventArgs
    {
        /// <summary>
        /// Gets or sets the targetId
        /// </summary>
        [JsonProperty("targetId")]
        public string TargetId
        {
            get;
            set;
        }
        /// <summary>
        /// Termination status type.
        /// </summary>
        [JsonProperty("status")]
        public string Status
        {
            get;
            set;
        }
        /// <summary>
        /// Termination error code.
        /// </summary>
        [JsonProperty("errorCode")]
        public long ErrorCode
        {
            get;
            set;
        }
    }
}