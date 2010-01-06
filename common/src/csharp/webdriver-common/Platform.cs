using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    public enum PlatformType
    {
        Any,
        Windows,
        XP,
        Vista,
        MacOSX,
        Unix,
        Linux
    }

    public class Platform
    {
        private PlatformType platformTypeValue;
        private int major;
        private int minor;
        private static Platform current;

        private Platform()
        {
            major = Environment.OSVersion.Version.Major;
            minor = Environment.OSVersion.Version.Minor;

            switch (Environment.OSVersion.Platform)
            {
                case PlatformID.Win32NT:
                    if (major == 5)
                        platformTypeValue = PlatformType.XP;
                    else if (major == 6)
                        platformTypeValue = PlatformType.Vista;
                    break;
                case PlatformID.MacOSX:
                    platformTypeValue = PlatformType.MacOSX;
                    break;
                case PlatformID.Unix:
                    platformTypeValue = PlatformType.Unix;
                    break;
            }
        }

        public Platform(PlatformType typeValue)
        {
            platformTypeValue = typeValue;
        }

        public static Platform CurrentPlatform
        {
            get 
            {
                if (current == null)
                {
                    current = new Platform();
                }
                return current;
            }
        }

        public int MajorVersion
        {
            get { return major; }
        }

        public int MinorVersion
        {
            get { return minor; }
        }

        public PlatformType Type
        {
            get { return platformTypeValue; }
        }

        public bool IsPlatformType(PlatformType compareTo)
        {
            bool platformIsType = false;
            switch (compareTo)
            {
                case PlatformType.Any:
                    platformIsType = true;
                    break;

                case PlatformType.Windows:
                    platformIsType = platformTypeValue == PlatformType.Windows || platformTypeValue == PlatformType.XP || platformTypeValue == PlatformType.Vista;
                    break;

                case PlatformType.Vista:
                    platformIsType = platformTypeValue == PlatformType.Windows || platformTypeValue == PlatformType.Vista;
                    break;

                case PlatformType.XP:
                    platformIsType = platformTypeValue == PlatformType.Windows || platformTypeValue == PlatformType.XP;
                    break;

                case PlatformType.Linux:
                    platformIsType = platformTypeValue == PlatformType.Linux || platformTypeValue == PlatformType.Unix;
                    break;

                default:
                    platformIsType = platformTypeValue == compareTo;
                    break;
            }
            return platformIsType;
        }
    }
}
