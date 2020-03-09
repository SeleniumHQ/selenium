namespace OpenQA.Selenium.DevTools.Input
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Input domain to simplify the command interface.
    /// </summary>
    public class InputAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Input";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public InputAdapter(DevToolsSession session)
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
        /// Dispatches a key event to the page.
        /// </summary>
        public async Task<DispatchKeyEventCommandResponse> DispatchKeyEvent(DispatchKeyEventCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DispatchKeyEventCommandSettings, DispatchKeyEventCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// This method emulates inserting text that doesn't come from a key press,
        /// for example an emoji keyboard or an IME.
        /// </summary>
        public async Task<InsertTextCommandResponse> InsertText(InsertTextCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<InsertTextCommandSettings, InsertTextCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Dispatches a mouse event to the page.
        /// </summary>
        public async Task<DispatchMouseEventCommandResponse> DispatchMouseEvent(DispatchMouseEventCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DispatchMouseEventCommandSettings, DispatchMouseEventCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Dispatches a touch event to the page.
        /// </summary>
        public async Task<DispatchTouchEventCommandResponse> DispatchTouchEvent(DispatchTouchEventCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DispatchTouchEventCommandSettings, DispatchTouchEventCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Emulates touch event from the mouse event parameters.
        /// </summary>
        public async Task<EmulateTouchFromMouseEventCommandResponse> EmulateTouchFromMouseEvent(EmulateTouchFromMouseEventCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EmulateTouchFromMouseEventCommandSettings, EmulateTouchFromMouseEventCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Ignores input events (useful while auditing page).
        /// </summary>
        public async Task<SetIgnoreInputEventsCommandResponse> SetIgnoreInputEvents(SetIgnoreInputEventsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetIgnoreInputEventsCommandSettings, SetIgnoreInputEventsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Synthesizes a pinch gesture over a time period by issuing appropriate touch events.
        /// </summary>
        public async Task<SynthesizePinchGestureCommandResponse> SynthesizePinchGesture(SynthesizePinchGestureCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SynthesizePinchGestureCommandSettings, SynthesizePinchGestureCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Synthesizes a scroll gesture over a time period by issuing appropriate touch events.
        /// </summary>
        public async Task<SynthesizeScrollGestureCommandResponse> SynthesizeScrollGesture(SynthesizeScrollGestureCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SynthesizeScrollGestureCommandSettings, SynthesizeScrollGestureCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Synthesizes a tap gesture over a time period by issuing appropriate touch events.
        /// </summary>
        public async Task<SynthesizeTapGestureCommandResponse> SynthesizeTapGesture(SynthesizeTapGestureCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SynthesizeTapGestureCommandSettings, SynthesizeTapGestureCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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