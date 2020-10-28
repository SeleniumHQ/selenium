using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools.V85
{
    public class V85Domains : IDomains
    {
        private DevToolsSessionDomains domains;

        public V85Domains(DevToolsSession session)
        {
            this.domains = new DevToolsSessionDomains(session);
        }

        public static int DevToolsVersion = 85;

        public DevTools.DevToolsSessionDomains VersionSpecificDomains => this.domains;

        public INetwork Network => new V85Network(domains.Network, domains.Fetch);

        public IJavaScript JavaScript => new V85JavaScript(domains.Runtime, domains.Page);

        public ITarget Target => new V85Target(domains.Target);

        public ILog Log => new V85Log(domains.Log);
    }
}
