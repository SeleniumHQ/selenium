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
#if !NETSTANDARD1_3
            return Environment.UserName;
#else
            return Environment.GetEnvironmentVariable("USERNAME");
#endif
        }

        public static IPAddress GetIPAddess()
        {
            IPAddress endPointAddress = IPAddress.Parse("127.0.0.1");

#if !NETSTANDARD1_3
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
#if NETSTANDARD1_3
            return Environment.ExpandEnvironmentVariables("%APPDATA%");
#else
            return Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
#endif
        }

        public static string GetProgramFilesFolder()
        {
#if NETSTANDARD1_3
            return Environment.ExpandEnvironmentVariables("%ProgramFiles%");
#else
            return Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
#endif
        }

        public static OperatingSystemFamily GetOperatingSystemFamily()
        {
#if NETSTANDARD1_3
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

                case PlatformID.Unix:
                case (PlatformID)PlatformMonoUnixValue:
                    return OperatingSystemFamily.Linux;

                case PlatformID.MacOSX:
                    return OperatingSystemFamily.OSX;

                case PlatformID.Xbox:
                default:
                    return OperatingSystemFamily.Other;
            }
#endif
        }

        public static Version GetOSVersion()
        {
            Version ret;

#if NETSTANDARD1_3
            var match = System.Text.RegularExpressions.Regex.Match(
                RuntimeInformation.OSDescription,
                "^\\D*(?<Major>\\d{1,2})\\.(?<Minor>\\d)(?:\\.(?<Build>\\d+))?(?:\\.(?<Revision>\\d+))?\\D*$"
                );

            if (!match.Success)
            {
                throw new FormatException(
                    $"The value of {nameof(RuntimeInformation.OSDescription)} ({RuntimeInformation.OSDescription}) has an unexpected format");
            }

            int major, minor, build, revision;
            if (match.Groups["Revision"].Success)
            {
                major = Convert.ToInt32(match.Groups["Major"].Value);
                minor = Convert.ToInt32(match.Groups["Minor"].Value);
                build = Convert.ToInt32(match.Groups["Build"].Value);
                revision = Convert.ToInt32(match.Groups["Revision"].Value);
                ret = new Version(major, minor, build, revision);
            }
            else if (match.Groups["Build"].Success)
            {
                major = Convert.ToInt32(match.Groups["Major"].Value);
                minor = Convert.ToInt32(match.Groups["Minor"].Value);
                build = Convert.ToInt32(match.Groups["Build"].Value);
                ret = new Version(major, minor, build);
            }
            else
            {
                major = Convert.ToInt32(match.Groups["Major"].Value);
                minor = Convert.ToInt32(match.Groups["Minor"].Value);
                ret = new Version(major, minor);
            }
#else
            ret = Environment.OSVersion.Version;
#endif
            return ret;
        }
    }
}
