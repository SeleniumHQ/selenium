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

        /// <summary>
        /// Initializes a new instance of the <see cref="ChromeCommandExecutor"/> class.
        /// </summary>
        /// <param name="driverService">The <see cref="ChromeDriverService"/> that drives the browser.</param>
        public ChromeCommandExecutor(ChromeDriverService driverService)
            : base(driverService.ServiceUrl)
        {
            this.service = driverService;
        }

        /// <summary>
        /// Starts the <see cref="ChromeCommandExecutor"/>.
        /// </summary>
        public void Start()
        {
            service.Start();
        }

        /// <summary>
        /// Stops the <see cref="ChromeCommandExecutor"/>.
        /// </summary>
        public void Stop()
        {
            service.Stop();
        }
    }
}
