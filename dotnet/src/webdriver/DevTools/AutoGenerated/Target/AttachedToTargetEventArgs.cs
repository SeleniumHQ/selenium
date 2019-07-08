namespace OpenQA.Selenium.DevTools.Target
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// Issued when attached to target because of auto-attach or `attachToTarget` command.
    /// </summary>
    public sealed class AttachedToTargetEventArgs : EventArgs
    {
        /// <summary>
        /// Identifier assigned to the session used to send/receive messages.
        /// </summary>
        [JsonProperty("sessionId")]
        public string SessionId
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the targetInfo
        /// </summary>
        [JsonProperty("targetInfo")]
        public TargetInfo TargetInfo
        {
            get;
            set;
        }
        /// <summary>
        /// Gets or sets the waitingForDebugger
        /// </summary>
        [JsonProperty("waitingForDebugger")]
        public bool WaitingForDebugger
        {
            get;
            set;
        }
    }
}