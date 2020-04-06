namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when `Element`'s attribute is removed.
    /// </summary>
    public sealed class AttributeRemovedEventArgs : EventArgs
    {
        /// <summary>
        /// Id of the node that has changed.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
        /// <summary>
        /// A ttribute name.
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
    }
}