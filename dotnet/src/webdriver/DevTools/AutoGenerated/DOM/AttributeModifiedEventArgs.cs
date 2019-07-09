namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Fired when `Element`'s attribute is modified.
    /// </summary>
    public sealed class AttributeModifiedEventArgs : EventArgs
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
        /// Attribute name.
        /// </summary>
        [JsonProperty("name")]
        public string Name
        {
            get;
            set;
        }
        /// <summary>
        /// Attribute value.
        /// </summary>
        [JsonProperty("value")]
        public string Value
        {
            get;
            set;
        }
    }
}