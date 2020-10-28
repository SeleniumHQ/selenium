using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools.V86
{
    public class V86Domains : IDomains
    {
        private DevToolsSessionDomains domains;

        public V86Domains(DevToolsSession session)
        {
            this.domains = new DevToolsSessionDomains(session);
        }

        public static int DevToolsVersion = 86;

        public DevTools.DevToolsSessionDomains VersionSpecificDomains => this.domains;

        public INetwork Network => new V86Network(domains.Network, domains.Fetch);

        public IJavaScript JavaScript => new V86JavaScript(domains.Runtime, domains.Page);

        public ITarget Target => new V86Target(domains.Target);

        public ILog Log => new V86Log(domains.Log);
    }
}
