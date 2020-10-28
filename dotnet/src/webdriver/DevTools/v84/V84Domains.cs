using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium.DevTools.V84
{
    public class V84Domains : IDomains
    {
        private DevToolsSessionDomains domains;

        public V84Domains(DevToolsSession session)
        {
            this.domains = new DevToolsSessionDomains(session);
        }

        public static int DevToolsVersion = 84;

        public DevTools.DevToolsSessionDomains VersionSpecificDomains => this.domains;

        public INetwork Network => new V84Network(domains.Network, domains.Fetch);

        public IJavaScript JavaScript => new V84JavaScript(domains.Runtime, domains.Page);

        public ITarget Target => new V84Target(domains.Target);

        public ILog Log => new V84Log(domains.Log);
    }
}
