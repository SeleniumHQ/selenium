using System.Text.Json.Serialization;
using System;

namespace OpenQA.Selenium.DevToolsGenerator.ProtocolDefinition
{
    /// <summary>
    /// Indicates the version of the Protocol Definition.
    /// </summary>
    public sealed class Version : IComparable<Version>
    {
        [JsonPropertyName("major")]
        public string? Major { get; set; }

        [JsonPropertyName("minor")]
        public string? Minor { get; set; }

        public int CompareTo(Version? other)
        {
            if (other == null)
            {
                return -1;
            }

            return ToString().CompareTo(other.ToString());
        }

        public override bool Equals(object? obj)
        {
            if (obj is not Version other)
            {
                return false;
            }

            return ToString().Equals(other.ToString());
        }

        public override int GetHashCode()
        {
            return ToString().GetHashCode();
        }

        public override string ToString()
        {
            return $"{Major}.{Minor}";
        }
    }
}
