namespace OpenQA.Selenium.DevTools.DOMDebugger
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the DOMDebugger domain to simplify the command interface.
    /// </summary>
    public class DOMDebuggerAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "DOMDebugger";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public DOMDebuggerAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }


        /// <summary>
        /// Returns event listeners of the given object.
        /// </summary>
        public async Task<GetEventListenersCommandResponse> GetEventListeners(GetEventListenersCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetEventListenersCommandSettings, GetEventListenersCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Removes DOM breakpoint that was set using `setDOMBreakpoint`.
        /// </summary>
        public async Task<RemoveDOMBreakpointCommandResponse> RemoveDOMBreakpoint(RemoveDOMBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveDOMBreakpointCommandSettings, RemoveDOMBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Removes breakpoint on particular DOM event.
        /// </summary>
        public async Task<RemoveEventListenerBreakpointCommandResponse> RemoveEventListenerBreakpoint(RemoveEventListenerBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveEventListenerBreakpointCommandSettings, RemoveEventListenerBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Removes breakpoint on particular native event.
        /// </summary>
        public async Task<RemoveInstrumentationBreakpointCommandResponse> RemoveInstrumentationBreakpoint(RemoveInstrumentationBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveInstrumentationBreakpointCommandSettings, RemoveInstrumentationBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Removes breakpoint from XMLHttpRequest.
        /// </summary>
        public async Task<RemoveXHRBreakpointCommandResponse> RemoveXHRBreakpoint(RemoveXHRBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<RemoveXHRBreakpointCommandSettings, RemoveXHRBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets breakpoint on particular operation with DOM.
        /// </summary>
        public async Task<SetDOMBreakpointCommandResponse> SetDOMBreakpoint(SetDOMBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDOMBreakpointCommandSettings, SetDOMBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets breakpoint on particular DOM event.
        /// </summary>
        public async Task<SetEventListenerBreakpointCommandResponse> SetEventListenerBreakpoint(SetEventListenerBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetEventListenerBreakpointCommandSettings, SetEventListenerBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets breakpoint on particular native event.
        /// </summary>
        public async Task<SetInstrumentationBreakpointCommandResponse> SetInstrumentationBreakpoint(SetInstrumentationBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetInstrumentationBreakpointCommandSettings, SetInstrumentationBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets breakpoint on XMLHttpRequest.
        /// </summary>
        public async Task<SetXHRBreakpointCommandResponse> SetXHRBreakpoint(SetXHRBreakpointCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetXHRBreakpointCommandSettings, SetXHRBreakpointCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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

    }
}