using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.DevTools
{
    public static class DevToolsExtensionMethods
    {
        public static Network.SetCookieCommandSettings ToDevToolsSetCookieCommandSettings(this Cookie cookie)
        {
            Network.SetCookieCommandSettings commandSettings = new Network.SetCookieCommandSettings();
            commandSettings.Name = cookie.Name;
            commandSettings.Value = cookie.Value;
            commandSettings.Domain = cookie.Domain;
            commandSettings.Path = cookie.Path;
            commandSettings.HttpOnly = cookie.IsHttpOnly;
            commandSettings.Secure = cookie.Secure;
            commandSettings.Expires = cookie.ExpirySeconds;
            return commandSettings;
        }

        public static ReadOnlyCollection<Cookie> ToSeleniumCookies(this Network.Cookie[] cookies)
        {
            List<Cookie> seleniumCookies = new List<Cookie>();
            foreach(var cookie in cookies)
            {
                seleniumCookies.Add(cookie.ToSeleniumCookie());
            }

            return seleniumCookies.AsReadOnly();
        }

        public static Cookie ToSeleniumCookie(this Network.Cookie cookie)
        {
            Dictionary<string, object> cookieValues = new Dictionary<string, object>();
            cookieValues["name"] = cookie.Name;
            cookieValues["value"] = cookie.Value;
            cookieValues["domain"] = cookie.Domain;
            cookieValues["path"] = cookie.Path;
            cookieValues["httpOnly"] = cookie.HttpOnly;
            cookieValues["secure"] = cookie.Secure;
            DateTime ? expires = null;
            if (!cookie.Secure)
            {
                cookieValues["expiry"] = cookie.Expires;
            }

            Cookie seleniumCookie = Cookie.FromDictionary(cookieValues);
            return seleniumCookie;
        }
    }
}
