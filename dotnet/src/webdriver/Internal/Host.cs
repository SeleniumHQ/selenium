using System;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;

namespace WebDriver.Internal
{
    internal static class Host
    {
        const int PlatformMonoUnixValue = 128;

        public static string GetUserName()
        {
#if !NETSTANDARD1_5
            return Environment.UserName;
#else
            return Environment.GetEnvironmentVariable("USERNAME");
#endif
        }

        public static IPAddress GetIPAddess()
        {
            IPAddress endPointAddress = IPAddress.Parse("127.0.0.1");

#if !NETSTANDARD1_5
            IPHostEntry hostEntry = Dns.GetHostEntry("localhost");

            // Use the first IPv4 address that we find
            foreach (IPAddress ip in hostEntry.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    endPointAddress = ip;
                    break;
                }
            }
#endif

            return endPointAddress;
        }

        public static string GetApplicationDataFolder()
        {
#if NETSTANDARD1_5
            return Environment.ExpandEnvironmentVariables("%APPDATA%");
#else
            return Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
#endif
        }
        public static string GetProgramFilesFolder()
        {
#if NETSTANDARD1_5
            return Environment.ExpandEnvironmentVariables("%ProgramFiles%");
#else
            return Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
#endif
        }

        public static OperatingSystemFamily GetOperatingSystemFamily()
        {
#if NETSTANDARD1_5
            if(RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return OperatingSystemFamily.Windows;
            }
            else if(RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                return OperatingSystemFamily.Linux;
            }
            else if(RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                return OperatingSystemFamily.OSX;
            }
            else
            {
                return OperatingSystemFamily.Other;
            }
#else
            switch(Environment.OSVersion.Platform)
            {
                case PlatformID.Win32NT:
                case PlatformID.Win32S:
                case PlatformID.Win32Windows:
                case PlatformID.WinCE:
                    return OperatingSystemFamily.Windows;
                    break;

                case PlatformID.Unix:
                case (PlatformID)PlatformMonoUnixValue:
                    return OperatingSystemFamily.Linux;
                    break;

                case PlatformID.MacOSX:
                    return OperatingSystemFamily.OSX;
                    break;

                case PlatformID.Xbox:
                    return OperatingSystemFamily.Other;
            }
#endif
        }
    }
}
