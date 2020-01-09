namespace OpenQA.Selenium.DevTools.Target
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when a target is destroyed.
    /// </summary>
    public sealed class TargetDestroyedEventArgs : EventArgs
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
    }
}