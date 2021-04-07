using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ProxyTest
    {
        [Test]
        public void NotInitializedProxy()
        {
            Proxy proxy = new Proxy();

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.Unspecified));
            Assert.That(proxy.FtpProxy, Is.Null);
            Assert.That(proxy.HttpProxy, Is.Null);
            Assert.That(proxy.SslProxy, Is.Null);
            Assert.That(proxy.SocksProxy, Is.Null);
            Assert.That(proxy.SocksVersion, Is.Null);
            Assert.That(proxy.SocksUserName, Is.Null);
            Assert.That(proxy.SocksPassword, Is.Null);
            Assert.That(proxy.ProxyAutoConfigUrl, Is.Null);
            Assert.That(proxy.BypassProxyAddresses, Is.Null);
            Assert.That(proxy.IsAutoDetect, Is.False);
        }

        [Test]
        public void CanNotChangeAlreadyInitializedProxyType()
        {
            Proxy proxy = new Proxy();
            proxy.Kind = ProxyKind.Direct;

            Assert.That(() => proxy.IsAutoDetect = true, Throws.InvalidOperationException);
            Assert.That(() => proxy.SocksPassword = "", Throws.InvalidOperationException);
            Assert.That(() => proxy.SocksUserName = "", Throws.InvalidOperationException);
            Assert.That(() => proxy.SocksProxy = "", Throws.InvalidOperationException);
            Assert.That(() => proxy.SocksVersion = 5, Throws.InvalidOperationException);
            Assert.That(() => proxy.FtpProxy = "", Throws.InvalidOperationException);
            Assert.That(() => proxy.HttpProxy = "", Throws.InvalidOperationException);
            Assert.That(() => proxy.SslProxy = "", Throws.InvalidOperationException);
            Assert.That(() => proxy.ProxyAutoConfigUrl = "", Throws.InvalidOperationException);
            Assert.That(() => proxy.AddBypassAddress("localhost"), Throws.InvalidOperationException);
            Assert.That(() => proxy.AddBypassAddresses("", ""), Throws.InvalidOperationException);
            Assert.That(() => proxy.Kind = ProxyKind.System, Throws.InvalidOperationException);

            Proxy proxy2 = new Proxy();
            proxy2.Kind = ProxyKind.AutoDetect;
            Assert.That(() => proxy2.Kind = ProxyKind.System, Throws.InvalidOperationException);
        }

        [Test]
        public void ManualProxy()
        {
            Proxy proxy = new Proxy();

            proxy.HttpProxy = "http.proxy:1234";
            proxy.FtpProxy = "ftp.proxy";
            proxy.SslProxy = "ssl.proxy";
            proxy.AddBypassAddresses("localhost", "127.0.0.*");
            proxy.SocksProxy = "socks.proxy:65555";
            proxy.SocksVersion = 5;
            proxy.SocksUserName = "test1";
            proxy.SocksPassword = "test2";

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.Manual));
            Assert.That(proxy.FtpProxy, Is.EqualTo("ftp.proxy"));
            Assert.That(proxy.HttpProxy, Is.EqualTo("http.proxy:1234"));
            Assert.That(proxy.SslProxy, Is.EqualTo("ssl.proxy"));
            Assert.That(proxy.SocksProxy, Is.EqualTo("socks.proxy:65555"));
            Assert.That(proxy.SocksVersion, Is.EqualTo(5));
            Assert.That(proxy.SocksUserName, Is.EqualTo("test1"));
            Assert.That(proxy.SocksPassword, Is.EqualTo("test2"));
            Assert.That(proxy.BypassProxyAddresses, Is.EquivalentTo(new List<string>() { "localhost", "127.0.0.*" }));

            Assert.That(proxy.ProxyAutoConfigUrl, Is.Null);
            Assert.That(proxy.IsAutoDetect, Is.False);
        }

        [Test]
        public void PACProxy()
        {
            Proxy proxy = new Proxy();
            proxy.ProxyAutoConfigUrl = "http://aaa/bbb.pac";

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.ProxyAutoConfigure));
            Assert.That(proxy.ProxyAutoConfigUrl, Is.EqualTo("http://aaa/bbb.pac"));

            Assert.That(proxy.FtpProxy, Is.Null);
            Assert.That(proxy.HttpProxy, Is.Null);
            Assert.That(proxy.SslProxy, Is.Null);
            Assert.That(proxy.SocksProxy, Is.Null);
            Assert.That(proxy.SocksVersion, Is.Null);
            Assert.That(proxy.SocksUserName, Is.Null);
            Assert.That(proxy.SocksPassword, Is.Null);
            Assert.That(proxy.BypassProxyAddresses, Is.Null);
            Assert.That(proxy.IsAutoDetect, Is.False);
        }

        [Test]
        public void AutoDetectProxy()
        {
            Proxy proxy = new Proxy();
            proxy.IsAutoDetect = true;

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.AutoDetect));
            Assert.That(proxy.IsAutoDetect, Is.True);

            Assert.That(proxy.FtpProxy, Is.Null);
            Assert.That(proxy.HttpProxy, Is.Null);
            Assert.That(proxy.SslProxy, Is.Null);
            Assert.That(proxy.SocksProxy, Is.Null);
            Assert.That(proxy.SocksVersion, Is.Null);
            Assert.That(proxy.SocksUserName, Is.Null);
            Assert.That(proxy.SocksPassword, Is.Null);
            Assert.That(proxy.BypassProxyAddresses, Is.Null);
            Assert.That(proxy.ProxyAutoConfigUrl, Is.Null);
        }


        [Test]
        public void ManualProxyFromDictionary()
        {
            Dictionary<string, object> proxyData = new Dictionary<string, object>();
            proxyData.Add("proxyType", "manual");
            proxyData.Add("httpProxy", "http.proxy:1234");
            proxyData.Add("ftpProxy", "ftp.proxy");
            proxyData.Add("sslProxy", "ssl.proxy");
            proxyData.Add("noProxy", "localhost;127.0.0.*");
            proxyData.Add("socksProxy", "socks.proxy:65555");
            proxyData.Add("socksVersion", 5);
            proxyData.Add("socksUsername", "test1");
            proxyData.Add("socksPassword", "test2");

            Proxy proxy = new Proxy(proxyData);

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.Manual));
            Assert.That(proxy.FtpProxy, Is.EqualTo("ftp.proxy"));
            Assert.That(proxy.HttpProxy, Is.EqualTo("http.proxy:1234"));
            Assert.That(proxy.SslProxy, Is.EqualTo("ssl.proxy"));
            Assert.That(proxy.SocksProxy, Is.EqualTo("socks.proxy:65555"));
            Assert.That(proxy.SocksVersion, Is.EqualTo(5));
            Assert.That(proxy.SocksUserName, Is.EqualTo("test1"));
            Assert.That(proxy.SocksPassword, Is.EqualTo("test2"));
            Assert.That(proxy.BypassProxyAddresses, Is.EquivalentTo(new List<string>() { "localhost", "127.0.0.*" }));

            Assert.That(proxy.ProxyAutoConfigUrl, Is.Null);
            Assert.That(proxy.IsAutoDetect, Is.False);
        }

        [Test]
        public void LongSocksVersionFromDictionary()
        {
            Dictionary<string, object> proxyData = new Dictionary<string, object>();
            long longValue = 5;
            proxyData.Add("proxyType", "manual");
            proxyData.Add("httpProxy", "http.proxy:1234");
            proxyData.Add("ftpProxy", "ftp.proxy");
            proxyData.Add("sslProxy", "ssl.proxy");
            proxyData.Add("noProxy", "localhost,127.0.0.*");
            proxyData.Add("socksProxy", "socks.proxy:65555");
            proxyData.Add("socksVersion", longValue);
            proxyData.Add("socksUsername", "test1");
            proxyData.Add("socksPassword", "test2");

            Proxy proxy = new Proxy(proxyData);

            int intValue = 5;
            Assert.That(proxy.SocksVersion, Is.EqualTo(intValue));
        }

        [Test]
        public void ManualProxyToJson()
        {
            Proxy proxy = new Proxy();
            proxy.Kind = ProxyKind.Manual;
            proxy.HttpProxy = "http.proxy:1234";
            proxy.FtpProxy = "ftp.proxy";
            proxy.SslProxy = "ssl.proxy";
            proxy.AddBypassAddresses("localhost", "127.0.0.*");
            proxy.SocksProxy = "socks.proxy:65555";
            proxy.SocksVersion = 5;
            proxy.SocksUserName = "test1";
            proxy.SocksPassword = "test2";

            string jsonValue = JsonConvert.SerializeObject(proxy);
            JObject json = JObject.Parse(jsonValue);

            Assert.That(json.ContainsKey("proxyType"), Is.True, "proxyType not set - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Type, Is.EqualTo(JTokenType.String));
            Assert.That(json["proxyType"].Value<string>(), Is.EqualTo("manual"));

            Assert.That(json.ContainsKey("ftpProxy"), Is.True);
            Assert.That(json["ftpProxy"].Type, Is.EqualTo(JTokenType.String));
            Assert.That(json["ftpProxy"].Value<string>(), Is.EqualTo("ftp.proxy"));

            Assert.That(json.ContainsKey("httpProxy"), Is.True);
            Assert.That(json["httpProxy"].Type, Is.EqualTo(JTokenType.String));
            Assert.That(json["httpProxy"].Value<string>(), Is.EqualTo("http.proxy:1234"));

            Assert.That(json.ContainsKey("sslProxy"), Is.True);
            Assert.That(json["sslProxy"].Type, Is.EqualTo(JTokenType.String));
            Assert.That(json["sslProxy"].Value<string>(), Is.EqualTo("ssl.proxy"));

            Assert.That(json.ContainsKey("socksProxy"), Is.True);
            Assert.That(json["socksProxy"].Type, Is.EqualTo(JTokenType.String));
            Assert.That(json["socksProxy"].Value<string>(), Is.EqualTo("socks.proxy:65555"));

            Assert.That(json.ContainsKey("socksVersion"), Is.True);
            Assert.That(json["socksVersion"].Type, Is.EqualTo(JTokenType.Integer));
            Assert.That(json["socksVersion"].Value<int>(), Is.EqualTo(5));

            Assert.That(json.ContainsKey("socksUsername"), Is.True);
            Assert.That(json["socksUsername"].Type, Is.EqualTo(JTokenType.String));
            Assert.That(json["socksUsername"].Value<string>(), Is.EqualTo("test1"));

            Assert.That(json.ContainsKey("socksPassword"), Is.True);
            Assert.That(json["socksPassword"].Type, Is.EqualTo(JTokenType.String));
            Assert.That(json["socksPassword"].Value<string>(), Is.EqualTo("test2"));

            Assert.That(json.ContainsKey("noProxy"), Is.True);
            Assert.That(json["noProxy"].Type, Is.EqualTo(JTokenType.Array));
            Assert.That(json["noProxy"].ToObject<string[]>(), Is.EqualTo(new string[] { "localhost", "127.0.0.*" }));

            Assert.That(json.Count, Is.EqualTo(9));
        }

        [Test]
        public void PacProxyFromDictionary()
        {
            Dictionary<string, object> proxyData = new Dictionary<string, object>();
            proxyData.Add("proxyType", "pac");
            proxyData.Add("proxyAutoconfigUrl", "http://aaa/bbb.pac");

            Proxy proxy = new Proxy(proxyData);

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.ProxyAutoConfigure));
            Assert.That(proxy.ProxyAutoConfigUrl, Is.EqualTo("http://aaa/bbb.pac"));

            Assert.That(proxy.FtpProxy, Is.Null);
            Assert.That(proxy.HttpProxy, Is.Null);
            Assert.That(proxy.SslProxy, Is.Null);
            Assert.That(proxy.SocksProxy, Is.Null);
            Assert.That(proxy.SocksVersion, Is.Null);
            Assert.That(proxy.SocksUserName, Is.Null);
            Assert.That(proxy.SocksPassword, Is.Null);
            Assert.That(proxy.BypassProxyAddresses, Is.Null);
            Assert.That(proxy.IsAutoDetect, Is.False);
        }

        [Test]
        public void PacProxyToJson()
        {
            Proxy proxy = new Proxy();
            proxy.Kind = ProxyKind.ProxyAutoConfigure;
            proxy.ProxyAutoConfigUrl = "http://aaa/bbb.pac";

            string jsonValue = JsonConvert.SerializeObject(proxy);
            JObject json = JObject.Parse(jsonValue);


            Assert.That(json.ContainsKey("proxyType"), Is.True, "proxyType not set - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Type, Is.EqualTo(JTokenType.String), "proxyType is not a string - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Value<string>(), Is.EqualTo("pac"), "proxyType not 'pac' - JSON = {0}", jsonValue);

            Assert.That(json.ContainsKey("proxyAutoconfigUrl"), Is.True);
            Assert.That(json["proxyAutoconfigUrl"].Type, Is.EqualTo(JTokenType.String));
            Assert.That(json["proxyAutoconfigUrl"].Value<string>(), Is.EqualTo("http://aaa/bbb.pac"));
            Assert.That(json.Count, Is.EqualTo(2));
        }

        [Test]
        public void AutoDetectProxyFromDictionary()
        {
            Dictionary<string, object> proxyData = new Dictionary<string, object>();
            proxyData.Add("proxyType", "autodetect");
            proxyData.Add("autodetect", true);

            Proxy proxy = new Proxy(proxyData);

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.AutoDetect));
            Assert.That(proxy.IsAutoDetect, Is.True);

            Assert.That(proxy.FtpProxy, Is.Null);
            Assert.That(proxy.HttpProxy, Is.Null);
            Assert.That(proxy.SslProxy, Is.Null);
            Assert.That(proxy.SocksProxy, Is.Null);
            Assert.That(proxy.SocksVersion, Is.Null);
            Assert.That(proxy.SocksUserName, Is.Null);
            Assert.That(proxy.SocksPassword, Is.Null);
            Assert.That(proxy.BypassProxyAddresses, Is.Null);
            Assert.That(proxy.ProxyAutoConfigUrl, Is.Null);
        }

        [Test]
        public void AutoDetectProxyToJson()
        {
            Proxy proxy = new Proxy();
            proxy.Kind = ProxyKind.AutoDetect;
            proxy.IsAutoDetect = true;

            JsonSerializerSettings settings = new JsonSerializerSettings();

            string jsonValue = JsonConvert.SerializeObject(proxy);
            JObject json = JObject.Parse(jsonValue);

            Assert.That(json.ContainsKey("proxyType"), Is.True, "proxyType not set - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Type, Is.EqualTo(JTokenType.String), "proxyType is not a string - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Value<string>(), Is.EqualTo("autodetect"), "proxyType not 'autodetect' - JSON = {0}", jsonValue);
            Assert.That(json.Count, Is.EqualTo(1), "more than one object in serialization - JSON = {0}", jsonValue);
        }

        [Test]
        public void SystemProxyFromDictionary()
        {
            Dictionary<string, object> proxyData = new Dictionary<string, object>();
            proxyData.Add("proxyType", "SYSTEM");

            Proxy proxy = new Proxy(proxyData);

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.System));

            Assert.That(proxy.FtpProxy, Is.Null);
            Assert.That(proxy.HttpProxy, Is.Null);
            Assert.That(proxy.SslProxy, Is.Null);
            Assert.That(proxy.SocksProxy, Is.Null);
            Assert.That(proxy.SocksVersion, Is.Null);
            Assert.That(proxy.SocksUserName, Is.Null);
            Assert.That(proxy.SocksPassword, Is.Null);
            Assert.That(proxy.BypassProxyAddresses, Is.Null);
            Assert.That(proxy.IsAutoDetect, Is.False);
            Assert.That(proxy.ProxyAutoConfigUrl, Is.Null);
        }

        [Test]
        public void SystemProxyToJson()
        {
            Proxy proxy = new Proxy();
            proxy.Kind = ProxyKind.System;

            string jsonValue = JsonConvert.SerializeObject(proxy);
            JObject json = JObject.Parse(jsonValue);

            Assert.That(json.ContainsKey("proxyType"), Is.True, "proxyType not set - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Type, Is.EqualTo(JTokenType.String), "proxyType is not a string - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Value<string>(), Is.EqualTo("system"), "proxyType not 'system' - JSON = {0}", jsonValue);
            Assert.That(json.Count, Is.EqualTo(1), "more than one object in serialization - JSON = {0}", jsonValue);
        }

        [Test]
        public void DirectProxyFromDictionary()
        {
            Dictionary<string, object> proxyData = new Dictionary<string, object>();
            proxyData.Add("proxyType", "direct");

            Proxy proxy = new Proxy(proxyData);

            Assert.That(proxy.Kind, Is.EqualTo(ProxyKind.Direct));

            Assert.That(proxy.FtpProxy, Is.Null);
            Assert.That(proxy.HttpProxy, Is.Null);
            Assert.That(proxy.SslProxy, Is.Null);
            Assert.That(proxy.SocksProxy, Is.Null);
            Assert.That(proxy.SocksVersion, Is.Null);
            Assert.That(proxy.SocksUserName, Is.Null);
            Assert.That(proxy.SocksPassword, Is.Null);
            Assert.That(proxy.BypassProxyAddresses, Is.Null);
            Assert.That(proxy.IsAutoDetect, Is.False);
            Assert.That(proxy.ProxyAutoConfigUrl, Is.Null);
        }

        [Test]
        public void DirectProxyToJson()
        {
            Proxy proxy = new Proxy();
            proxy.Kind = ProxyKind.Direct;

            string jsonValue = JsonConvert.SerializeObject(proxy);
            JObject json = JObject.Parse(jsonValue);

            Assert.That(json.ContainsKey("proxyType"), Is.True, "proxyType not set - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Type, Is.EqualTo(JTokenType.String), "proxyType is not a string - JSON = {0}", jsonValue);
            Assert.That(json["proxyType"].Value<string>(), Is.EqualTo("direct"), "proxyType not 'direct' - JSON = {0}", jsonValue);
            Assert.That(json.Count, Is.EqualTo(1), "more than one object in serialization - JSON = {0}", jsonValue);
        }

        [Test]
        public void ConstructingWithNullKeysWorksAsExpected()
        {
            Dictionary<string, object> rawProxy = new Dictionary<string, object>();
            rawProxy.Add("ftpProxy", null);
            rawProxy.Add("httpProxy", "http://www.example.com");
            rawProxy.Add("autodetect", null);

            Proxy proxy = new Proxy(rawProxy);

            Assert.That(proxy.FtpProxy, Is.Null);
            Assert.That(proxy.IsAutoDetect, Is.False);
            Assert.That(proxy.HttpProxy, Is.EqualTo("http://www.example.com"));
        }
    }
}
