namespace OpenQA.Selenium.DevTools.Target
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Notifies about a new protocol message received from the session (as reported in
    /// `attachedToTarget` event).
    /// </summary>
    public sealed class ReceivedMessageFromTargetEventArgs : EventArgs
    {
        /// <summary>
        /// Identifier of a session which sends a message.
        /// </summary>
        [JsonProperty("sessionId")]
        public string SessionId
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the message
        /// </summary>
        [JsonProperty("message")]
        public string Message
        {
            get;
            set;
        }
        /// <summary>
        /// Deprecated.
        /// </summary>
        [JsonProperty("targetId", DefaultValueHandling = DefaultValueHandling.Ignore)]
        public string TargetId
        {
            get;
            set;
        }
    }
}