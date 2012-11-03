// <copyright file="Proxy.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Describes the kind of proxy.
    /// </summary>
    /// <remarks>
    /// Keep these in sync with the Firefox preferences numbers:
    /// http://kb.mozillazine.org/Network.proxy.type
    /// </remarks>
    public enum ProxyKind
    {
        /// <summary>
        ///  Direct connection, no proxy (default on Windows).
        /// </summary>
        Direct = 0,

        /// <summary>
        /// Manual proxy settings (e.g., for httpProxy).
        /// </summary>
        Manual,

        /// <summary>
        /// Proxy automatic configuration from URL.
        /// </summary>
        ProxyAutoConfigure,

        /// <summary>
        /// Use proxy automatic detection.
        /// </summary>
        AutoDetect = 4,

        /// <summary>
        /// Use the system values for proxy settings (default on Linux).
        /// </summary>
        System,

        /// <summary>
        /// No proxy type is specified.
        /// </summary>
        Unspecified
    }
    
    /// <summary>
    /// Describes proxy settings to be used with a driver instance.
    /// </summary>
    public class Proxy
    {
        private ProxyKind proxyType = ProxyKind.Unspecified;
        private bool autoDetect;
        private string ftpProxy;
        private string httpProxy;
        private string noProxy;
        private string proxyAutoConfigUrl;
        private string sslProxy;

        /// <summary>
        /// Initializes a new instance of the <see cref="Proxy"/> class.
        /// </summary>
        public Proxy()
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="Proxy"/> class with the given proxy settings.
        /// </summary>
        /// <param name="settings">A dictionary of settings to use with the proxy.</param>
        public Proxy(Dictionary<string, object> settings)
        {
            if (settings == null)
            {
                throw new ArgumentNullException("settings", "settings dictionary cannot be null");
            }

            if (settings.ContainsKey("proxyType"))
            {
                ProxyKind rawType = (ProxyKind)Enum.Parse(typeof(ProxyKind), settings["proxyType"].ToString(), true);
                this.Kind = rawType;
            }

            if (settings.ContainsKey("ftpProxy"))
            {
                this.FtpProxy = settings["ftpProxy"].ToString();
            }
            
            if (settings.ContainsKey("httpProxy"))
            {
                this.HttpProxy = settings["httpProxy"].ToString();
            }
            
            if (settings.ContainsKey("noProxy"))
            {
                this.NoProxy = settings["noProxy"].ToString();
            }
            
            if (settings.ContainsKey("proxyAutoconfigUrl"))
            {
                this.ProxyAutoConfigUrl = settings["proxyAutoconfigUrl"].ToString();
            }
            
            if (settings.ContainsKey("sslProxy"))
            {
                this.SslProxy = settings["sslProxy"].ToString();
            }
            
            if (settings.ContainsKey("autodetect"))
            {
                this.IsAutoDetect = (bool)settings["autodetect"];
            }
        }

        /// <summary>
        /// Gets or sets the type of proxy.
        /// </summary>
        public ProxyKind Kind
        {
            get 
            {
                return this.proxyType; 
            }

            set
            {
                this.VerifyProxyTypeCompatilibily(ProxyKind.AutoDetect);
                this.proxyType = value;
            }
        }

        /// <summary>
        /// Gets or sets a value indicating whether the proxy uses automatic detection.
        /// </summary>
        public bool IsAutoDetect
        {
            get
            {
                return this.autoDetect;
            }

            set
            {
                if (this.autoDetect == value)
                {
                    return;
                }

                this.VerifyProxyTypeCompatilibily(ProxyKind.AutoDetect);
                this.proxyType = ProxyKind.AutoDetect;
                this.autoDetect = value;
            }
        }

        /// <summary>
        /// Gets or sets the value of the proxy for the FTP protocol.
        /// </summary>
        public string FtpProxy
        {
            get
            {
                return this.ftpProxy;
            }

            set
            {
                this.VerifyProxyTypeCompatilibily(ProxyKind.Manual);
                this.proxyType = ProxyKind.Manual;
                this.ftpProxy = value;
            }
        }

        /// <summary>
        /// Gets or sets the value of the proxy for the HTTP protocol.
        /// </summary>
        public string HttpProxy
        {
            get
            {
                return this.httpProxy;
            }

            set
            {
                this.VerifyProxyTypeCompatilibily(ProxyKind.Manual);
                this.proxyType = ProxyKind.Manual;
                this.httpProxy = value;
            }
        }

        /// <summary>
        /// Gets or sets the value for when no proxy is specified.
        /// </summary>
        public string NoProxy
        {
            get
            {
                return this.noProxy;
            }

            set
            {
                this.VerifyProxyTypeCompatilibily(ProxyKind.Manual);
                this.proxyType = ProxyKind.Manual;
                this.noProxy = value;
            }
        }

        /// <summary>
        /// Gets or sets the URL used for proxy automatic configuration.
        /// </summary>
        public string ProxyAutoConfigUrl
        {
            get
            {
                return this.proxyAutoConfigUrl;
            }

            set
            {
                this.VerifyProxyTypeCompatilibily(ProxyKind.ProxyAutoConfigure);
                this.proxyType = ProxyKind.ProxyAutoConfigure;
                this.proxyAutoConfigUrl = value;
            }
        }

        /// <summary>
        /// Gets or sets the value of the proxy for the SSL protocol.
        /// </summary>
        public string SslProxy
        {
            get
            {
                return this.sslProxy;
            }

            set
            {
                this.VerifyProxyTypeCompatilibily(ProxyKind.Manual);
                this.proxyType = ProxyKind.Manual;
                this.sslProxy = value;
            }
        }

        private void VerifyProxyTypeCompatilibily(ProxyKind compatibleProxy)
        {
            if (this.proxyType != ProxyKind.Unspecified && this.proxyType != compatibleProxy)
            {
                throw new InvalidOperationException("Proxy autodetect is incompatible with manual settings");
            }
        }
    }
}
