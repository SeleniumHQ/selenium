namespace OpenQA.Selenium.DevTools.Profiler
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Profiler domain to simplify the command interface.
    /// </summary>
    public class ProfilerAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Profiler";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public ProfilerAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["consoleProfileFinished"] = new DevToolsEventData(typeof(ConsoleProfileFinishedEventArgs), OnConsoleProfileFinished);
            m_eventMap["consoleProfileStarted"] = new DevToolsEventData(typeof(ConsoleProfileStartedEventArgs), OnConsoleProfileStarted);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// consoleProfileFinished
        /// </summary>
        public event EventHandler<ConsoleProfileFinishedEventArgs> ConsoleProfileFinished;
        /// <summary>
        /// Sent when new profile recording is started using console.profile() call.
        /// </summary>
        public event EventHandler<ConsoleProfileStartedEventArgs> ConsoleProfileStarted;

        /// <summary>
        /// disable
        /// </summary>
        public async Task<DisableCommandResponse> Disable(DisableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisableCommandSettings, DisableCommandResponse>(command ?? new DisableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// enable
        /// </summary>
        public async Task<EnableCommandResponse> Enable(EnableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EnableCommandSettings, EnableCommandResponse>(command ?? new EnableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Collect coverage data for the current isolate. The coverage data may be incomplete due to
        /// garbage collection.
        /// </summary>
        public async Task<GetBestEffortCoverageCommandResponse> GetBestEffortCoverage(GetBestEffortCoverageCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<GetBestEffortCoverageCommandSettings, GetBestEffortCoverageCommandResponse>(command ?? new GetBestEffortCoverageCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Changes CPU profiler sampling interval. Must be called before CPU profiles recording started.
        /// </summary>
        public async Task<SetSamplingIntervalCommandResponse> SetSamplingInterval(SetSamplingIntervalCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetSamplingIntervalCommandSettings, SetSamplingIntervalCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// start
        /// </summary>
        public async Task<StartCommandResponse> Start(StartCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StartCommandSettings, StartCommandResponse>(command ?? new StartCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enable precise code coverage. Coverage data for JavaScript executed before enabling precise code
        /// coverage may be incomplete. Enabling prevents running optimized code and resets execution
        /// counters.
        /// </summary>
        public async Task<StartPreciseCoverageCommandResponse> StartPreciseCoverage(StartPreciseCoverageCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StartPreciseCoverageCommandSettings, StartPreciseCoverageCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enable type profile.
        /// </summary>
        public async Task<StartTypeProfileCommandResponse> StartTypeProfile(StartTypeProfileCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StartTypeProfileCommandSettings, StartTypeProfileCommandResponse>(command ?? new StartTypeProfileCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// stop
        /// </summary>
        public async Task<StopCommandResponse> Stop(StopCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StopCommandSettings, StopCommandResponse>(command ?? new StopCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Disable precise code coverage. Disabling releases unnecessary execution count records and allows
        /// executing optimized code.
        /// </summary>
        public async Task<StopPreciseCoverageCommandResponse> StopPreciseCoverage(StopPreciseCoverageCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StopPreciseCoverageCommandSettings, StopPreciseCoverageCommandResponse>(command ?? new StopPreciseCoverageCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Disable type profile. Disabling releases type profile data collected so far.
        /// </summary>
        public async Task<StopTypeProfileCommandResponse> StopTypeProfile(StopTypeProfileCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<StopTypeProfileCommandSettings, StopTypeProfileCommandResponse>(command ?? new StopTypeProfileCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Collect coverage data for the current isolate, and resets execution counters. Precise code
        /// coverage needs to have started.
        /// </summary>
        public async Task<TakePreciseCoverageCommandResponse> TakePreciseCoverage(TakePreciseCoverageCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<TakePreciseCoverageCommandSettings, TakePreciseCoverageCommandResponse>(command ?? new TakePreciseCoverageCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Collect type profile.
        /// </summary>
        public async Task<TakeTypeProfileCommandResponse> TakeTypeProfile(TakeTypeProfileCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<TakeTypeProfileCommandSettings, TakeTypeProfileCommandResponse>(command ?? new TakeTypeProfileCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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

        private void OnConsoleProfileFinished(object rawEventArgs)
        {
            ConsoleProfileFinishedEventArgs e = rawEventArgs as ConsoleProfileFinishedEventArgs;
            if (e != null && ConsoleProfileFinished != null)
            {
                ConsoleProfileFinished(this, e);
            }
        }
        private void OnConsoleProfileStarted(object rawEventArgs)
        {
            ConsoleProfileStartedEventArgs e = rawEventArgs as ConsoleProfileStartedEventArgs;
            if (e != null && ConsoleProfileStarted != null)
            {
                ConsoleProfileStarted(this, e);
            }
        }
    }
}