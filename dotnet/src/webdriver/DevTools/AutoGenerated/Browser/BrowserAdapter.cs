namespace OpenQA.Selenium.DevTools.Browser
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Browser domain to simplify the command interface.
    /// </summary>
    public class BrowserAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Browser";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public BrowserAdapter(DevToolsSession session)
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
        /// Grant specific permissions to the given origin and reject all others.
        /// </summary>
        public async Task<GrantPermissionsCommandResponse> GrantPermissions(GrantPermissionsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GrantPermissionsCommandSettings, GrantPermissionsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Reset all permission management for all origins.
        /// </summary>
        public async Task<ResetPermissionsCommandResponse> ResetPermissions(ResetPermissionsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<ResetPermissionsCommandSettings, ResetPermissionsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Close browser gracefully.
        /// </summary>
        public async Task<CloseCommandResponse> Close(CloseCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CloseCommandSettings, CloseCommandResponse>(command ?? new CloseCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Crashes browser on the main thread.
        /// </summary>
        public async Task<CrashCommandResponse> Crash(CrashCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CrashCommandSettings, CrashCommandResponse>(command ?? new CrashCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Crashes GPU process.
        /// </summary>
        public async Task<CrashGpuProcessCommandResponse> CrashGpuProcess(CrashGpuProcessCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<CrashGpuProcessCommandSettings, CrashGpuProcessCommandResponse>(command ?? new CrashGpuProcessCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns version information.
        /// </summary>
        public async Task<GetVersionCommandResponse> GetVersion(GetVersionCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetVersionCommandSettings, GetVersionCommandResponse>(command ?? new GetVersionCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Returns the command line switches for the browser process if, and only if
        /// --enable-automation is on the commandline.
        /// </summary>
        public async Task<GetBrowserCommandLineCommandResponse> GetBrowserCommandLine(GetBrowserCommandLineCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetBrowserCommandLineCommandSettings, GetBrowserCommandLineCommandResponse>(command ?? new GetBrowserCommandLineCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Get Chrome histograms.
        /// </summary>
        public async Task<GetHistogramsCommandResponse> GetHistograms(GetHistogramsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetHistogramsCommandSettings, GetHistogramsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Get a Chrome histogram by name.
        /// </summary>
        public async Task<GetHistogramCommandResponse> GetHistogram(GetHistogramCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetHistogramCommandSettings, GetHistogramCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Get position and size of the browser window.
        /// </summary>
        public async Task<GetWindowBoundsCommandResponse> GetWindowBounds(GetWindowBoundsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetWindowBoundsCommandSettings, GetWindowBoundsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Get the browser window that contains the devtools target.
        /// </summary>
        public async Task<GetWindowForTargetCommandResponse> GetWindowForTarget(GetWindowForTargetCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetWindowForTargetCommandSettings, GetWindowForTargetCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Set position and/or size of the browser window.
        /// </summary>
        public async Task<SetWindowBoundsCommandResponse> SetWindowBounds(SetWindowBoundsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetWindowBoundsCommandSettings, SetWindowBoundsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Set dock tile details, platform-specific.
        /// </summary>
        public async Task<SetDockTileCommandResponse> SetDockTile(SetDockTileCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetDockTileCommandSettings, SetDockTileCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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