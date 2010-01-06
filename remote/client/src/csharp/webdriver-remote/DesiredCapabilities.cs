using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;
using Newtonsoft.Json;

namespace OpenQA.Selenium.Remote
{
    public class DesiredCapabilities : ICapabilities
    {
        private string name;
        private string browserVersion;
        private Platform osPlatform;
        private bool javascriptEnabled;

        public DesiredCapabilities(string browser, string version, Platform platform)
        {
            name = browser;
            browserVersion = version;
            osPlatform = platform;
        }

        public DesiredCapabilities()
        {
        }

        public DesiredCapabilities(Dictionary<string, object> rawMap)
        {
            name = (string)rawMap["browserName"];
            browserVersion = (string)rawMap["version"];
            javascriptEnabled = (bool)rawMap["javascriptEnabled"];
            if (rawMap.ContainsKey("operatingSystem"))
            {
                object os = rawMap["operatingSystem"];
                string osAsString = os as string;
                Platform osAsPlatform = os as Platform;
                if (osAsString != null)
                {
                    PlatformType platformInfo = (PlatformType)Enum.Parse(typeof(PlatformType), osAsString, true);
                    osPlatform = new Platform(platformInfo);
                }
                else if (osAsPlatform != null)
                {
                    osPlatform = osAsPlatform;
                }
            }
            if (rawMap.ContainsKey("platform"))
            {
                object raw = rawMap["platform"];
                string rawAsString = raw as string;
                Platform rawAsPlatform = raw as Platform;
                if (rawAsString != null)
                {
                    PlatformType platformInfo = (PlatformType)Enum.Parse(typeof(PlatformType), rawAsString, true);
                    osPlatform = new Platform(platformInfo);
                }
                else if (rawAsPlatform != null)
                {
                    osPlatform = rawAsPlatform;
                }
            }
        }

        #region ICapabilities Members
        [JsonProperty("browserName")]
        public string BrowserName
        {
            get { return name; }
        }

        [JsonProperty("platform")]
        public Platform Platform
        {
            get { return osPlatform; }
        }

        [JsonProperty("version")]
        public string Version
        {
            get { return browserVersion; }
        }

        [JsonProperty("javascriptEnabled")]
        public bool IsJavaScriptEnabled
        {
            get { return javascriptEnabled; }
            set { javascriptEnabled = value; }
        }

        #endregion

        public static DesiredCapabilities Firefox()
        {
            return new DesiredCapabilities("firefox", "", new Platform(PlatformType.Any));
        }

        public static DesiredCapabilities InternetExplorer()
        {
            return new DesiredCapabilities("internet explorer", "", new Platform(PlatformType.Windows));
        }

        public static DesiredCapabilities HtmlUnit()
        {
            return new DesiredCapabilities("htmlunit", "", new Platform(PlatformType.Any));
        }

        public static DesiredCapabilities IPhone()
        {
            return new DesiredCapabilities("iphone", "", new Platform(PlatformType.MacOSX));
        }

        public static DesiredCapabilities Chrome()
        {
            //This is strangely inconsistent.
            DesiredCapabilities dc = new DesiredCapabilities("chrome", "", new Platform(PlatformType.Windows));
            dc.IsJavaScriptEnabled = true;
            return dc;
        }

        public override int GetHashCode()
        {
            int result;
            result = (name != null ? name.GetHashCode() : 0);
            result = 31 * result + (browserVersion != null ? browserVersion.GetHashCode() : 0);
            result = 31 * result + (osPlatform != null ? osPlatform.GetHashCode() : 0);
            result = 31 * result + (javascriptEnabled ? 1 : 0);
            return result;
        }

        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture,
                "Capabilities [BrowserName={0}, IsJavaScriptEnabled={1}, Platform={2}, Version={3}]",
                name, javascriptEnabled, osPlatform.Type.ToString(), browserVersion);
        }

        public override bool Equals(object obj)
        {
            if (this == obj)
            {
                return true;
            }

            DesiredCapabilities other = obj as DesiredCapabilities;
            if (other == null)
            {
                return false;
            }

            if (javascriptEnabled != other.javascriptEnabled)
            {
                return false;
            }

            if (name != null ? name != other.name : other.name != null)
            {
                return false;
            }

            if (!osPlatform.IsPlatformType(other.Platform.Type))
            {
                return false;
            }

            if (browserVersion != null ? browserVersion != other.browserVersion : other.browserVersion != null)
            {
                return false;
            }

            return true;
        }
    }
}
