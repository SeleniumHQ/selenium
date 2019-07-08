namespace OpenQA.Selenium.DevTools.Emulation
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Emulation domain to simplify the command interface.
    /// </summary>
    public class EmulationAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Emulation";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public EmulationAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["virtualTimeBudgetExpired"] = new DevToolsEventData(typeof(VirtualTimeBudgetExpiredEventArgs), OnVirtualTimeBudgetExpired);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// Notification sent after the virtual time budget for the current VirtualTimePolicy has run out.
        /// </summary>
        public event EventHandler<VirtualTimeBudgetExpiredEventArgs> VirtualTimeBudgetExpired;

        /// <summary>
        /// Tells whether emulation is supported.
        /// </summary>
        public async Task<CanEmulateCommandResponse> CanEmulate(CanEmulateCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CanEmulateCommandSettings, CanEmulateCommandResponse>(command ?? new CanEmulateCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Clears the overriden device metrics.
        /// </summary>
        public async Task<ClearDeviceMetricsOverrideCommandResponse> ClearDeviceMetricsOverride(ClearDeviceMetricsOverrideCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearDeviceMetricsOverrideCommandSettings, ClearDeviceMetricsOverrideCommandResponse>(command ?? new ClearDeviceMetricsOverrideCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Clears the overriden Geolocation Position and Error.
        /// </summary>
        public async Task<ClearGeolocationOverrideCommandResponse> ClearGeolocationOverride(ClearGeolocationOverrideCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ClearGeolocationOverrideCommandSettings, ClearGeolocationOverrideCommandResponse>(command ?? new ClearGeolocationOverrideCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Requests that page scale factor is reset to initial values.
        /// </summary>
        public async Task<ResetPageScaleFactorCommandResponse> ResetPageScaleFactor(ResetPageScaleFactorCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ResetPageScaleFactorCommandSettings, ResetPageScaleFactorCommandResponse>(command ?? new ResetPageScaleFactorCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables or disables simulating a focused and active page.
        /// </summary>
        public async Task<SetFocusEmulationEnabledCommandResponse> SetFocusEmulationEnabled(SetFocusEmulationEnabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetFocusEmulationEnabledCommandSettings, SetFocusEmulationEnabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables CPU throttling to emulate slow CPUs.
        /// </summary>
        public async Task<SetCPUThrottlingRateCommandResponse> SetCPUThrottlingRate(SetCPUThrottlingRateCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetCPUThrottlingRateCommandSettings, SetCPUThrottlingRateCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets or clears an override of the default background color of the frame. This override is used
        /// if the content does not specify one.
        /// </summary>
        public async Task<SetDefaultBackgroundColorOverrideCommandResponse> SetDefaultBackgroundColorOverride(SetDefaultBackgroundColorOverrideCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDefaultBackgroundColorOverrideCommandSettings, SetDefaultBackgroundColorOverrideCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Overrides the values of device screen dimensions (window.screen.width, window.screen.height,
        /// window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media
        /// query results).
        /// </summary>
        public async Task<SetDeviceMetricsOverrideCommandResponse> SetDeviceMetricsOverride(SetDeviceMetricsOverrideCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDeviceMetricsOverrideCommandSettings, SetDeviceMetricsOverrideCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// setScrollbarsHidden
        /// </summary>
        public async Task<SetScrollbarsHiddenCommandResponse> SetScrollbarsHidden(SetScrollbarsHiddenCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetScrollbarsHiddenCommandSettings, SetScrollbarsHiddenCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// setDocumentCookieDisabled
        /// </summary>
        public async Task<SetDocumentCookieDisabledCommandResponse> SetDocumentCookieDisabled(SetDocumentCookieDisabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDocumentCookieDisabledCommandSettings, SetDocumentCookieDisabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// setEmitTouchEventsForMouse
        /// </summary>
        public async Task<SetEmitTouchEventsForMouseCommandResponse> SetEmitTouchEventsForMouse(SetEmitTouchEventsForMouseCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetEmitTouchEventsForMouseCommandSettings, SetEmitTouchEventsForMouseCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Emulates the given media for CSS media queries.
        /// </summary>
        public async Task<SetEmulatedMediaCommandResponse> SetEmulatedMedia(SetEmulatedMediaCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetEmulatedMediaCommandSettings, SetEmulatedMediaCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position
        /// unavailable.
        /// </summary>
        public async Task<SetGeolocationOverrideCommandResponse> SetGeolocationOverride(SetGeolocationOverrideCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetGeolocationOverrideCommandSettings, SetGeolocationOverrideCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Overrides value returned by the javascript navigator object.
        /// </summary>
        public async Task<SetNavigatorOverridesCommandResponse> SetNavigatorOverrides(SetNavigatorOverridesCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetNavigatorOverridesCommandSettings, SetNavigatorOverridesCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Sets a specified page scale factor.
        /// </summary>
        public async Task<SetPageScaleFactorCommandResponse> SetPageScaleFactor(SetPageScaleFactorCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetPageScaleFactorCommandSettings, SetPageScaleFactorCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Switches script execution in the page.
        /// </summary>
        public async Task<SetScriptExecutionDisabledCommandResponse> SetScriptExecutionDisabled(SetScriptExecutionDisabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetScriptExecutionDisabledCommandSettings, SetScriptExecutionDisabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables touch on platforms which do not support them.
        /// </summary>
        public async Task<SetTouchEmulationEnabledCommandResponse> SetTouchEmulationEnabled(SetTouchEmulationEnabledCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetTouchEmulationEnabledCommandSettings, SetTouchEmulationEnabledCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Turns on virtual time for all frames (replacing real-time with a synthetic time source) and sets
        /// the current virtual time policy.  Note this supersedes any previous time budget.
        /// </summary>
        public async Task<SetVirtualTimePolicyCommandResponse> SetVirtualTimePolicy(SetVirtualTimePolicyCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetVirtualTimePolicyCommandSettings, SetVirtualTimePolicyCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Resizes the frame/viewport of the page. Note that this does not affect the frame's container
        /// (e.g. browser window). Can be used to produce screenshots of the specified size. Not supported
        /// on Android.
        /// </summary>
        public async Task<SetVisibleSizeCommandResponse> SetVisibleSize(SetVisibleSizeCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetVisibleSizeCommandSettings, SetVisibleSizeCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Allows overriding user agent with the given string.
        /// </summary>
        public async Task<SetUserAgentOverrideCommandResponse> SetUserAgentOverride(SetUserAgentOverrideCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetUserAgentOverrideCommandSettings, SetUserAgentOverrideCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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

        private void OnVirtualTimeBudgetExpired(object rawEventArgs)
        {
            VirtualTimeBudgetExpiredEventArgs e = rawEventArgs as VirtualTimeBudgetExpiredEventArgs;
            if (e != null && VirtualTimeBudgetExpired != null)
            {
                VirtualTimeBudgetExpired(this, e);
            }
        }
    }
}