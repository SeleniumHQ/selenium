namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Mirrors `DOMNodeRemoved` event.
    /// </summary>
    public sealed class ChildNodeRemovedEventArgs : EventArgs
    {
        /// <summary>
        /// Parent id.
        /// </summary>
        [JsonProperty("parentNodeId")]
        public long ParentNodeId
        {
            get;
            set;
        }
        /// <summary>
        /// Id of the node that has been removed.
        /// </summary>
        [JsonProperty("nodeId")]
        public long NodeId
        {
            get;
            set;
        }
    }
}