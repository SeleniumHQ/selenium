using NUnit.Framework;
using System.Collections.Generic;

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
