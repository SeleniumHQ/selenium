// <copyright file="IntExtensions.cs" company="WebDriver Committers">
// Copyright 2007-2012 WebDriver committers
// Copyright 2007-2012 Google Inc.
// Portions copyright 2012 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using System;

namespace OpenQA.Selenium.Safari.Internal
{
    /// <summary>
    /// Provides extension methods for converting integers.
    /// </summary>
    internal static class IntExtensions
    {
        /// <summary>
        /// Converts a <see cref="System.UInt16"/> to a big-endian byte array.
        /// </summary>
        /// <param name="source">The value to convert.</param>
        /// <returns>A byte array containing a big-endian representation of the value.</returns>
        public static byte[] ToBigEndianByteArray(this ushort source)
        {
            byte[] bytes;
            bytes = BitConverter.GetBytes(source);
            if (BitConverter.IsLittleEndian)
            {
                Array.Reverse(bytes);
            }

            return bytes;
        }

        /// <summary>
        /// Converts a <see cref="System.UInt64"/> to a big-endian byte array.
        /// </summary>
        /// <param name="source">The value to convert.</param>
        /// <returns>A byte array containing a big-endian representation of the value.</returns>
        public static byte[] ToBigEndianByteArray(this ulong source)
        {
            byte[] bytes;
            bytes = BitConverter.GetBytes(source);
            if (BitConverter.IsLittleEndian)
            {
                Array.Reverse(bytes);
            }

            return bytes;
        }

        /// <summary>
        /// Converts a byte array to a little-endian value.
        /// </summary>
        /// <param name="source">The byte array to convert.</param>
        /// <returns>The little-endian representation of the array as a <see cref="System.Int32"/>.</returns>
        public static int ToLittleEndianInt32(this byte[] source)
        {
            if (BitConverter.IsLittleEndian)
            {
                Array.Reverse(source);
            }

            if (source.Length == 2)
            {
                return BitConverter.ToUInt16(source, 0);
            }

            if (source.Length == 8)
            {
                return (int)BitConverter.ToUInt64(source, 0);
            }

            throw new ArgumentException("Unsupported Size");
        }
    }
}
