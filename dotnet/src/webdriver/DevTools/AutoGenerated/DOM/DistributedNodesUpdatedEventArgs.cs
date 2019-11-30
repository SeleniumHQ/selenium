namespace OpenQA.Selenium.DevTools.DOM
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Called when distrubution is changed.
    /// </summary>
    public sealed class DistributedNodesUpdatedEventArgs : EventArgs
    {
        /// <summary>
        /// Insertion point where distrubuted nodes were updated.
        /// </summary>
        [JsonProperty("insertionPointId")]
        public long InsertionPointId
        {
            get;
            set;
        }
        /// <summary>
        /// Distributed nodes for given insertion point.
        /// </summary>
        [JsonProperty("distributedNodes")]
        public BackendNode[] DistributedNodes
        {
            get;
            set;
        }
    }
}