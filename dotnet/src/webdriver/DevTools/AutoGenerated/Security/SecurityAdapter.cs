namespace OpenQA.Selenium.DevTools.Security
{
    using System;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Represents an adapter for the Security domain to simplify the command interface.
    /// </summary>
    public class SecurityAdapter
    {
        private readonly DevToolsSession m_session;
        private readonly string m_domainName = "Security";
        private Dictionary<string, DevToolsEventData> m_eventMap = new Dictionary<string, DevToolsEventData>();

        public SecurityAdapter(DevToolsSession session)
        {
            m_session = session ?? throw new ArgumentNullException(nameof(session));
            m_session.DevToolsEventReceived += OnDevToolsEventReceived;
            m_eventMap["certificateError"] = new DevToolsEventData(typeof(CertificateErrorEventArgs), OnCertificateError);
            m_eventMap["securityStateChanged"] = new DevToolsEventData(typeof(SecurityStateChangedEventArgs), OnSecurityStateChanged);
        }

        /// <summary>
        /// Gets the DevToolsSession associated with the adapter.
        /// </summary>
        public DevToolsSession Session
        {
            get { return m_session; }
        }

        /// <summary>
        /// There is a certificate error. If overriding certificate errors is enabled, then it should be
        /// handled with the `handleCertificateError` command. Note: this event does not fire if the
        /// certificate error has been allowed internally. Only one client per target should override
        /// certificate errors at the same time.
        /// </summary>
        public event EventHandler<CertificateErrorEventArgs> CertificateError;
        /// <summary>
        /// The security state of the page changed.
        /// </summary>
        public event EventHandler<SecurityStateChangedEventArgs> SecurityStateChanged;

        /// <summary>
        /// Disables tracking security state changes.
        /// </summary>
        public async Task<DisableCommandResponse> Disable(DisableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<DisableCommandSettings, DisableCommandResponse>(command ?? new DisableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enables tracking security state changes.
        /// </summary>
        public async Task<EnableCommandResponse> Enable(EnableCommandSettings command = null, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<EnableCommandSettings, EnableCommandResponse>(command ?? new EnableCommandSettings(), cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enable/disable whether all certificate errors should be ignored.
        /// </summary>
        public async Task<SetIgnoreCertificateErrorsCommandResponse> SetIgnoreCertificateErrors(SetIgnoreCertificateErrorsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetIgnoreCertificateErrorsCommandSettings, SetIgnoreCertificateErrorsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Handles a certificate error that fired a certificateError event.
        /// </summary>
        public async Task<HandleCertificateErrorCommandResponse> HandleCertificateError(HandleCertificateErrorCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<HandleCertificateErrorCommandSettings, HandleCertificateErrorCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
        }
        /// <summary>
        /// Enable/disable overriding certificate errors. If enabled, all certificate error events need to
        /// be handled by the DevTools client and should be answered with `handleCertificateError` commands.
        /// </summary>
        public async Task<SetOverrideCertificateErrorsCommandResponse> SetOverrideCertificateErrors(SetOverrideCertificateErrorsCommandSettings command, CancellationToken cancellationToken = default(CancellationToken), int? millisecondsTimeout = null, bool throwExceptionIfResponseNotReceived = true)
        {
            return await m_session.SendCommand<SetOverrideCertificateErrorsCommandSettings, SetOverrideCertificateErrorsCommandResponse>(command, cancellationToken, millisecondsTimeout, throwExceptionIfResponseNotReceived);
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

        private void OnCertificateError(object rawEventArgs)
        {
            CertificateErrorEventArgs e = rawEventArgs as CertificateErrorEventArgs;
            if (e != null && CertificateError != null)
            {
                CertificateError(this, e);
            }
        }
        private void OnSecurityStateChanged(object rawEventArgs)
        {
            SecurityStateChangedEventArgs e = rawEventArgs as SecurityStateChangedEventArgs;
            if (e != null && SecurityStateChanged != null)
            {
                SecurityStateChanged(this, e);
            }
        }
    }
}