namespace OpenQA.Selenium.DevTools.Target
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when some information about a target has changed. This only happens between
    /// `targetCreated` and `targetDestroyed`.
    /// </summary>
    public sealed class TargetInfoChangedEventArgs : EventArgs
    {
        /// <summary>
        /// Gets or sets the targetInfo
        /// </summary>
        [JsonProperty("targetInfo")]
        public TargetInfo TargetInfo
        {
            get;
            set;
        }
    }
}