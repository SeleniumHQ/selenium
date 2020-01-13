namespace OpenQA.Selenium.DevTools
{
    using System;
    using Newtonsoft.Json.Linq;

    /// <summary>
    /// Event data used when receiving events from the DevTools session.
    /// </summary>
    internal class DevToolsEventReceivedEventArgs : EventArgs
    {
        /// <summary>
        /// Initializes a new instance of the DevToolsEventReceivedEventArgs class.
        /// </summary>
        /// <param name="domainName">The domain on which the event is to be raised.</param>
        /// <param name="eventName">The name of the event to be raised.</param>
        /// <param name="eventData">The data for the event to be raised.</param>
        public DevToolsEventReceivedEventArgs(string domainName, string eventName, JToken eventData)
        {
            DomainName = domainName;
            EventName = eventName;
            EventData = eventData;
        }

        /// <summary>
        /// Gets the domain on which the event is to be raised.
        /// </summary>
        public string DomainName { get; private set; }

        /// <summary>
        /// Gets the name of the event to be raised.
        /// </summary>
        public string EventName { get; private set; }

        /// <summary>
        /// Gets the data with which the event is to be raised.
        /// </summary>
        public JToken EventData { get; private set; }
    }
}
