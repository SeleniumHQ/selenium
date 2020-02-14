namespace OpenQA.Selenium.DevTools.Security
{
    using System;
    using Newtonsoft.Json;

    /// <summary>
    /// There is a certificate error. If overriding certificate errors is enabled, then it should be
    /// handled with the `handleCertificateError` command. Note: this event does not fire if the
    /// certificate error has been allowed internally. Only one client per target should override
    /// certificate errors at the same time.
    /// </summary>
    public sealed class CertificateErrorEventArgs : EventArgs
    {
        /// <summary>
        /// The ID of the event.
        /// </summary>
        [JsonProperty("eventId")]
        public long EventId
        {
            get;
            set;
        }
        /// <summary>
        /// The type of the error.
        /// </summary>
        [JsonProperty("errorType")]
        public string ErrorType
        {
            get;
            set;
        }
        /// <summary>
        /// The url that was requested.
        /// </summary>
        [JsonProperty("requestURL")]
        public string RequestURL
        {
            get;
            set;
        }
    }
}