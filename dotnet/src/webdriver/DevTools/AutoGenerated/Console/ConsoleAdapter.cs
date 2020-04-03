namespace OpenQA.Selenium.DevTools.Console
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Console domain to simplify the command interface.
    /// </summary>
    public class ConsoleAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Console";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public ConsoleAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["messageAdded"] = new DevToolsEventData(typeof(MessageAddedEventArgs), OnMessageAdded);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// Issued when new console message is added.
        /// </summary>
        public event EventHandler<MessageAddedEventArgs> MessageAdded;

        /// <summary>
        /// Does nothing.
        /// </summary>
        public async Task<ClearMessagesCommandResponse> ClearMessages(ClearMessagesCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearMessagesCommandSettings, ClearMessagesCommandResponse>(command ?? new ClearMessagesCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Disables console domain, prevents further console messages from being reported to the client.
        /// </summary>
        public async Task<DisableCommandResponse> Disable(DisableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisableCommandSettings, DisableCommandResponse>(command ?? new DisableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables console domain, sends the messages collected so far to the client by means of the
        /// `messageAdded` notification.
        /// </summary>
        public async Task<EnableCommandResponse> Enable(EnableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EnableCommandSettings, EnableCommandResponse>(command ?? new EnableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }

        private void OnDevToolsEventReceived(object sender, DevToolsEventReceivedEventArgs e)
        {
            if (e.DomainName == m_domainName)
            {
                if (m_eventMap.ContainsKey(e.EventName))
                {
                    var eventData = m_eventMap[e.EventName];
                    var eventArgs = e.EventData.ToObject(eventData.EventArgsType);
                    eventData.EventInvoker(eventArgs);
                }
            }
        }

        private void OnMessageAdded(object rawEventArgs)
        {
            MessageAddedEventArgs e = rawEventArgs as MessageAddedEventArgs;
            if (e != null && MessageAdded != null)
            {
                MessageAdded(this, e);
            }
        }
    }
}