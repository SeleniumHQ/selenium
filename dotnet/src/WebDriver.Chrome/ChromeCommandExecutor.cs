using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using OpenQA.Selenium.Remote;

namespace OpenQA.Selenium.Chrome
{
    /// <summary>
    /// Provides a mechanism to execute commands on the browser
    /// </summary>
    public class ChromeCommandExecutor : HttpCommandExecutor
    {
        private ChromeDriverService service;

        public ChromeCommandExecutor(ChromeDriverService driverService)
            : base(driverService.ServiceUrl)
        {
            this.service = driverService;
        }

        public void Start()
        {
            service.Start();
        }

        public void Stop()
        {
            service.Stop();
        }
    }
}
