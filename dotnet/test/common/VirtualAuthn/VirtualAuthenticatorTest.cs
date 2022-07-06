using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using OpenQA.Selenium.Environment;
using NUnit.Framework;
using Microsoft.IdentityModel.Tokens;

using static OpenQA.Selenium.VirtualAuth.VirtualAuthenticatorOptions;

namespace OpenQA.Selenium.VirtualAuth
{
    [TestFixture]
    public class VirtualAuthenticatorTest : DriverTestFixture
    {
        private IJavaScriptExecutor jsDriver;
        private WebDriver webDriver;
        private string base64EncodedPK;

        [SetUp]
        public void Setup()
        {
            //A pkcs#8 encoded encrypted RSA private key as a base64 string.
            string base64EncodedRSAPK =
                   "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDbBOu5Lhs4vpowbCnmCyLUpIE7JM9sm9QXzye2G+jr+Kr"
                 + "MsinWohEce47BFPJlTaDzHSvOW2eeunBO89ZcvvVc8RLz4qyQ8rO98xS1jtgqi1NcBPETDrtzthODu/gd0sjB2Tk3TLuB"
                 + "GVoPXt54a+Oo4JbBJ6h3s0+5eAfGplCbSNq6hN3Jh9YOTw5ZA6GCEy5l8zBaOgjXytd2v2OdSVoEDNiNQRkjJd2rmS2oi"
                 + "9AyQFR3B7BrPSiDlCcITZFOWgLF5C31Wp/PSHwQhlnh7/6YhnE2y9tzsUvzx0wJXrBADW13+oMxrneDK3WGbxTNYgIi1P"
                 + "vSqXlqGjHtCK+R2QkXAgMBAAECggEAVc6bu7VAnP6v0gDOeX4razv4FX/adCao9ZsHZ+WPX8PQxtmWYqykH5CY4TSfsui"
                 + "zAgyPuQ0+j4Vjssr9VODLqFoanspT6YXsvaKanncUYbasNgUJnfnLnw3an2XpU2XdmXTNYckCPRX9nsAAURWT3/n9ljc/"
                 + "XYY22ecYxM8sDWnHu2uKZ1B7M3X60bQYL5T/lVXkKdD6xgSNLeP4AkRx0H4egaop68hoW8FIwmDPVWYVAvo8etzWCtib"
                 + "RXz5FcNld9MgD/Ai7ycKy4Q1KhX5GBFI79MVVaHkSQfxPHpr7/XcmpQOEAr+BMPon4s4vnKqAGdGB3j/E3d/+4F2swyko"
                 + "QKBgQD8hCsp6FIQ5umJlk9/j/nGsMl85LgLaNVYpWlPRKPc54YNumtvj5vx1BG+zMbT7qIE3nmUPTCHP7qb5ERZG4CdMC"
                 + "S6S64/qzZEqijLCqepwj6j4fV5SyPWEcpxf6ehNdmcfgzVB3Wolfwh1ydhx/96L1jHJcTKchdJJzlfTvq8wwKBgQDeCnK"
                 + "ws1t5GapfE1rmC/h4olL2qZTth9oQmbrXYohVnoqNFslDa43ePZwL9Jmd9kYb0axOTNMmyrP0NTj41uCfgDS0cJnNTc63"
                 + "ojKjegxHIyYDKRZNVUR/dxAYB/vPfBYZUS7M89pO6LLsHhzS3qpu3/hppo/Uc/AM /r8PSflNHQKBgDnWgBh6OQncChPUl"
                 + "OLv9FMZPR1ZOfqLCYrjYEqiuzGm6iKM13zXFO4AGAxu1P/IAd5BovFcTpg79Z8tWqZaUUwvscnl+cRlj+mMXAmdqCeO8V"
                 + "ASOmqM1ml667axeZDIR867ZG8K5V029Wg+4qtX5uFypNAAi6GfHkxIKrD04yOHAoGACdh4wXESi0oiDdkz3KOHPwIjn6B"
                 + "hZC7z8mx+pnJODU3cYukxv3WTctlUhAsyjJiQ/0bK1yX87ulqFVgO0Knmh+wNajrb9wiONAJTMICG7tiWJOm7fW5cfTJw"
                 + "WkBwYADmkfTRmHDvqzQSSvoC2S7aa9QulbC3C/qgGFNrcWgcT9kCgYAZTa1P9bFCDU7hJc2mHwJwAW7/FQKEJg8SL33KI"
                 + "NpLwcR8fqaYOdAHWWz636osVEqosRrHzJOGpf9x2RSWzQJ+dq8+6fACgfFZOVpN644+sAHfNPAI/gnNKU5OfUv+eav8fB"
                 + "nzlf1A3y3GIkyMyzFN3DE7e0n/lyqxE4HBYGpI8g==";

            byte[] bytes = System.Convert.FromBase64String(base64EncodedRSAPK);
            base64EncodedPK = Base64UrlEncoder.Encode(bytes);

            jsDriver = (IJavaScriptExecutor)driver;
            webDriver = (WebDriver)driver;

            webDriver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("virtual-authenticator.html");
        }

        [TearDown]
        public void Teardown()
        {
            if (webDriver.AuthenticatorId != null)
            {
                webDriver.RemoveVirtualAuthenticator(webDriver.AuthenticatorId);
            }
        }

        private void CreateRKEnabledU2FAuthenticator()
        {
            VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions()
              .SetProtocol(Protocol.U2F)
              .SetHasResidentKey(true);

            webDriver.AddVirtualAuthenticator(options);
        }

        private void CreateRKDisabledU2FAuthenticator()
        {
            VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions()
              .SetProtocol(Protocol.U2F)
              .SetHasResidentKey(false);

            webDriver.AddVirtualAuthenticator(options);
        }

        private void CreateRKEnabledCTAP2Authenticator()
        {
            VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions()
              .SetProtocol(Protocol.CTAP2)
              .SetHasResidentKey(true)
              .SetHasUserVerification(true)
              .SetIsUserVerified(true);

            webDriver.AddVirtualAuthenticator(options);
        }

        private void CreateRKDisabledCTAP2Authenticator()
        {
            VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions()
              .SetProtocol(Protocol.CTAP2)
              .SetHasResidentKey(false)
              .SetHasUserVerification(true)
              .SetIsUserVerified(true);

            webDriver.AddVirtualAuthenticator(options);
        }

        private List<long> ExtractRawIdFrom(object response)
        {
            Dictionary<string, object> responseJson = (Dictionary<string, object>)response;
            Dictionary<string, object> credentialJson = (Dictionary<string, object>)responseJson["credential"];
            ReadOnlyCollection<object> readOnlyCollection = (ReadOnlyCollection<object>)credentialJson["rawId"];
            List<long> rawIdList = new List<long>();
            foreach (object id in readOnlyCollection)
            {
                rawIdList.Add((long)id);
            }
            return rawIdList;
        }

        private string ExtractIdFrom(object response)
        {
            Dictionary<string, object> responseJson = (Dictionary<string, object>)response;
            Dictionary<string, object> credentialJson = (Dictionary<string, object>)responseJson["credential"];
            return (string)credentialJson["id"];
        }

        private object GetAssertionFor(object credentialId)
        {
            return jsDriver.ExecuteAsyncScript(
              "getCredential([{"
              + "  \"type\": \"public-key\","
              + "  \"id\": Int8Array.from(arguments[0]),"
              + "}]).then(arguments[arguments.length - 1]);", credentialId);
        }

        private byte[] ConvertListIntoArrayOfBytes(List<long> list)
        {
            byte[] ret = new byte[list.Count];
            for (int i = 0; i < list.Count; i++)
            {
                ret[i] = ((byte)list[i]);
            }

            return ret;
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldCreateAuthenticator()
        {
            // Register a credential on the Virtual Authenticator.
            CreateRKDisabledU2FAuthenticator();
            object response = jsDriver.ExecuteAsyncScript(
              "registerCredential().then(arguments[arguments.length - 1]);");

            Assert.AreEqual("OK", ((Dictionary<string, object>)response)["status"]);

            object assertionResponse = GetAssertionFor(ExtractRawIdFrom(response));

            // Attempt to use the credential to get an assertion.
            Assert.AreEqual("OK", ((Dictionary<string, object>)assertionResponse)["status"]);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldRemoveAuthenticator()
        {
            VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions();
            string authenticatorId = webDriver.AddVirtualAuthenticator(options);
            webDriver.RemoveVirtualAuthenticator(authenticatorId);

            Assert.IsNull(webDriver.AuthenticatorId);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldAddNonResidentCredential()
        {
            CreateRKDisabledCTAP2Authenticator();
            byte[] credentialId = { 1, 2, 3, 4 };
            Credential credential = Credential.CreateNonResidentCredential(
              credentialId, "localhost", base64EncodedPK, /*signCount=*/0);

            webDriver.AddCredential(credential);

            List<int> id = new List<int>();
            id.Add(1);
            id.Add(2);
            id.Add(3);
            id.Add(4);

            // Attempt to use the credential to generate an assertion.
            object response = GetAssertionFor(id);
            Assert.AreEqual("OK", ((Dictionary<string, object>)response)["status"]);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldAddNonResidentCredentialWhenAuthenticatorUsesU2FProtocol()
        {
            CreateRKDisabledU2FAuthenticator();

            /**
             * A pkcs#8 encoded unencrypted EC256 private key as a base64url string.
             */
            string base64EncodedEC256PK =
              "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"
              + "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"
              + "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB";

            byte[] credentialId = { 1, 2, 3, 4 };
            Credential credential = Credential.CreateNonResidentCredential(
              credentialId, "localhost", base64EncodedEC256PK, /*signCount=*/0);
            webDriver.AddCredential(credential);

            List<int> id = new List<int>();
            id.Add(1);
            id.Add(2);
            id.Add(3);
            id.Add(4);

            // Attempt to use the credential to generate an assertion.
            object response = GetAssertionFor(id);
            Assert.AreEqual("OK", ((Dictionary<string, object>)response)["status"]);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldAddResidentCredential()
        {
            // Add a resident credential using the testing API.
            CreateRKEnabledCTAP2Authenticator();
            byte[] credentialId = { 1, 2, 3, 4 };
            byte[] userHandle = { 1 };

            Credential credential = Credential.CreateResidentCredential(
              credentialId, "localhost", base64EncodedPK, userHandle, /*signCount=*/0);

            webDriver.AddCredential(credential);

            // Attempt to use the credential to generate an assertion. Notice we use an
            // empty allowCredentials array.
            object response = jsDriver.ExecuteAsyncScript(
              "getCredential([]).then(arguments[arguments.length - 1]);");
            Assert.AreEqual("OK", ((Dictionary<string, object>)response)["status"]);

            Dictionary<string, object> attestation = (Dictionary<string, object>)((Dictionary<string, object>)response)["attestation"];

            ReadOnlyCollection<object> returnedUserHandle = (ReadOnlyCollection<object>)attestation["userHandle"];

            Assert.AreEqual(1, returnedUserHandle.Count);
            Assert.AreEqual(0, returnedUserHandle.IndexOf(1L));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void AddResidentCredentialNotSupportedWhenAuthenticatorUsesU2FProtocol()
        {
            // Add a resident credential using the testing API.
            CreateRKEnabledU2FAuthenticator();

            /**
             * A pkcs#8 encoded unencrypted EC256 private key as a base64url string.
             */
            string base64EncodedEC256PK =
              "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8_zMDQDYAxlU-Q"
              + "hk1Dwkf0v18GZca1DMF3SaJ9HPdmShRANCAASNYX5lyVCOZLzFZzrIKmeZ2jwU"
              + "RmgsJYxGP__fWN_S-j5sN4tT15XEpN_7QZnt14YvI6uvAgO0uJEboFaZlOEB";

            byte[] credentialId = { 1, 2, 3, 4 };
            byte[] userHandle = { 1 };
            Credential credential = Credential.CreateResidentCredential(
              credentialId, "localhost", base64EncodedEC256PK, userHandle, /*signCount=*/0);
            Assert.Throws<WebDriverArgumentException>(() => webDriver.AddCredential(credential));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldGetCredential()
        {
            CreateRKEnabledCTAP2Authenticator();
            // Create an authenticator and add two credentials.

            // Register a resident credential.
            object response1 = jsDriver.ExecuteAsyncScript(
              "registerCredential({authenticatorSelection: {requireResidentKey: true}})"
              + " .then(arguments[arguments.length - 1]);");
            Assert.AreEqual("OK", ((Dictionary<string, object>)response1)["status"]);

            // Register a non resident credential.
            object response2 = jsDriver.ExecuteAsyncScript(
              "registerCredential().then(arguments[arguments.length - 1]);");
            Assert.AreEqual("OK", ((Dictionary<string, object>)response2)["status"]);

            byte[] credential1Id = ConvertListIntoArrayOfBytes(ExtractRawIdFrom(response1));
            byte[] credential2Id = ConvertListIntoArrayOfBytes(ExtractRawIdFrom(response2));

            Assert.AreNotEqual(credential1Id, credential2Id);

            // Retrieve the two credentials.
            List<Credential> credentials = webDriver.GetCredentials();
            Assert.AreEqual(2, credentials.Count);

            Credential credential1 = null;
            Credential credential2 = null;
            foreach (Credential credential in credentials)
            {
                if (Enumerable.SequenceEqual(credential.Id, credential1Id))
                {
                    credential1 = credential;
                }
                else if (Enumerable.SequenceEqual(credential.Id, credential2Id))
                {
                    credential2 = credential;
                }
                else
                {
                    Assert.Fail("Unrecognized credential id");
                }
            }

            Assert.True(credential1.IsResidentCredential);
            Assert.NotNull(credential1.PrivateKey);
            Assert.AreEqual("localhost", credential1.RpId);
            Assert.AreEqual(new byte[] { 1 }, credential1.UserHandle);
            Assert.AreEqual(1, credential1.SignCount);

            Assert.False(credential2.IsResidentCredential);
            Assert.NotNull(credential2.PrivateKey);
            Assert.IsNull(credential2.RpId);
            Assert.IsNull(credential2.UserHandle);
            Assert.AreEqual(1, credential2.SignCount);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldRemoveCredentialByRawId()
        {
            CreateRKDisabledU2FAuthenticator();

            // Register credential.
            object response = jsDriver.ExecuteAsyncScript(
              "registerCredential().then(arguments[arguments.length - 1]);");

            Assert.AreEqual("OK", ((Dictionary<string, object>)response)["status"]);

            // Remove a credential by its ID as an array of bytes.
            List<long> rawId = ExtractRawIdFrom(response);
            byte[] rawCredentialId = ConvertListIntoArrayOfBytes(rawId);
            webDriver.RemoveCredential(rawCredentialId);

            // Trying to get an assertion should fail.
            object assertionResponse = GetAssertionFor(rawId);
            string error = (string)((Dictionary<string, object>)assertionResponse)["status"];

            Assert.True(error.StartsWith("NotAllowedError"));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldRemoveCredentialByBase64UrlId()
        {
            CreateRKDisabledU2FAuthenticator();

            // Register credential.
            object response = jsDriver.ExecuteAsyncScript(
              "registerCredential().then(arguments[arguments.length - 1]);");

            Assert.AreEqual("OK", ((Dictionary<string, object>)response)["status"]);

            // Remove a credential by its base64url ID.
            String credentialId = ExtractIdFrom(response);
            webDriver.RemoveCredential(credentialId);

            // Trying to get an assertion should fail.
            object assertionResponse = GetAssertionFor(credentialId);
            string error = (string)((Dictionary<string, object>)assertionResponse)["status"];

            Assert.True(error.StartsWith("NotAllowedError"));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void ShouldRemoveAllCredentials()
        {
            CreateRKDisabledU2FAuthenticator();

            // Register two credentials.
            object response1 = jsDriver.ExecuteAsyncScript(
              "registerCredential().then(arguments[arguments.length - 1]);");
            Assert.AreEqual("OK", ((Dictionary<string, object>)response1)["status"]);
            List<long> rawId1 = ExtractRawIdFrom(response1);

            object response2 = jsDriver.ExecuteAsyncScript(
              "registerCredential().then(arguments[arguments.length - 1]);");
            Assert.AreEqual("OK", ((Dictionary<string, object>)response2)["status"]);
            List<long> rawId2 = ExtractRawIdFrom(response1);

            // Remove all credentials.
            webDriver.RemoveAllCredentials();

            // Trying to get an assertion allowing for any of both should fail.
            object response = jsDriver.ExecuteAsyncScript(
              "getCredential([{"
              + "  \"type\": \"public-key\","
              + "  \"id\": Int8Array.from(arguments[0]),"
              + "}, {"
              + "  \"type\": \"public-key\","
              + "  \"id\": Int8Array.from(arguments[1]),"
              + "}]).then(arguments[arguments.length - 1]);",
              rawId1, rawId2);

            string error = (string)((Dictionary<string, object>)response)["status"];

            Assert.True(error.StartsWith("NotAllowedError"));
        }

        [Test]
        [NeedsFreshDriver(IsCreatedAfterTest = true)]
        [IgnoreBrowser(Selenium.Browser.IE, "IE does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Firefox, "Firefox does not support Virtual Authenticator")]
        [IgnoreBrowser(Selenium.Browser.Safari, "Safari does not support Virtual Authenticator")]
        public void testSetUserVerified()
        {
            CreateRKEnabledCTAP2Authenticator();

            // Register a credential requiring UV.
            Object response = jsDriver.ExecuteAsyncScript(
              "registerCredential({authenticatorSelection: {userVerification: 'required'}})"
              + "  .then(arguments[arguments.length - 1]);");
            Assert.AreEqual("OK", ((Dictionary<string, object>)response)["status"]);
            List<long> rawId = ExtractRawIdFrom(response);

            // Getting an assertion requiring user verification should succeed.
            response = jsDriver.ExecuteAsyncScript(
              "getCredential([{"
              + "  \"type\": \"public-key\","
              + "  \"id\": Int8Array.from(arguments[0]),"
              + "}], {userVerification: 'required'}).then(arguments[arguments.length - 1]);",
              rawId);
            Assert.AreEqual("OK", ((Dictionary<string, object>)response)["status"]);

            // Disable user verification.
            webDriver.SetUserVerified(false);

            // Getting an assertion requiring user verification should fail.
            response = jsDriver.ExecuteAsyncScript(
              "getCredential([{"
              + "  \"type\": \"public-key\","
              + "  \"id\": Int8Array.from(arguments[0]),"
              + "}], {userVerification: 'required'}).then(arguments[arguments.length - 1]);",
              rawId);

            string error = (string)((Dictionary<string, object>)response)["status"];

            Assert.True(error.StartsWith("NotAllowedError"));
        }
    }
}