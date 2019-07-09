namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when `Element`'s inline style is modified via a CSS property modification.
    /// </summary>
    public sealed class InlineStyleInvalidatedEventArgs : EventArgs
    {
        /// <summary>
        /// Ids of the nodes for which the inline styles have been invalidated.
        /// </summary>
        [JsonProperty("nodeIds")]
        public long[] NodeIds
        {
            get;
            set;
        }
    }
}