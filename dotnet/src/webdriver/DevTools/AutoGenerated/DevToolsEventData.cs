namespace OpenQA.Selenium.DevTools
{
    using System;

    /// <summary>
    /// Class containing the data used for an event raised by the DevTools session.
    /// </summary>
    public class DevToolsEventData
    {
        /// <summary>
        /// Initializes a new instance of the DevToolsEventData class.
        /// </summary>
        /// <param name="eventArgsType">The type of the event args for the event to be raised.</param>
        /// <param name="invoker">The method that will be used to invoke the event.</param>
        public DevToolsEventData(Type eventArgsType, Action<object> invoker)
        {
            EventArgsType = eventArgsType;
            EventInvoker = invoker;
        }

        /// <summary>
        /// Gets the type of the event args object for the event.
        /// </summary>
        public Type EventArgsType { get; }

        /// <summary>
        /// The method to called to raise the event.
        /// </summary>
        public Action<object> EventInvoker { get; }
    }
}
