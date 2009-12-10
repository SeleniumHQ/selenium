using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    public interface IOptions
    {
        Speed Speed { get; set; }
        void AddCookie(Cookie cookie);
        Dictionary<String, Cookie> GetCookies();
        void DeleteCookie(Cookie cookie);
        void DeleteCookieNamed(String name);
        void DeleteAllCookies();
    }
}
