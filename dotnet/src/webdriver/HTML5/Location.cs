// <copyright file="Location.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
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

using System.Globalization;

namespace OpenQA.Selenium.Html5
{
    /// <summary>
    /// Represents the physical location of the browser.
    /// </summary>
    public class Location
    {
        private readonly double latitude;
        private readonly double longitude;
        private readonly double altitude;

        /// <summary>
        /// Initializes a new instance of the <see cref="Location"/> class.
        /// </summary>
        /// <param name="latitude">latitude for current location</param>
        /// <param name="longitude">longitude for current location</param>
        /// <param name="altitude">altitude for current location</param>
        public Location(double latitude, double longitude, double altitude)
        {
            this.latitude = latitude;
            this.longitude = longitude;
            this.altitude = altitude;
        }

        /// <summary>
        /// Gets the latitude of the current location.
        /// </summary>
        public double Latitude
        {
            get { return this.latitude; }
        }

        /// <summary>
        /// Gets the longitude of the current location.
        /// </summary>
        public double Longitude
        {
            get { return this.longitude; }
        }

        /// <summary>
        /// Gets the altitude of the current location.
        /// </summary>
        public double Altitude
        {
            get { return this.altitude; }
        }

        /// <summary>
        /// Retuns string represenation for current location.
        /// </summary>
        /// <returns>Returns <see cref="string">string</see> reprsentation for current location.</returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.InvariantCulture, "Latitude: {0}, Longitude: {1}, Altitude: {2}", this.latitude, this.longitude, this.altitude);
        }
    }
}
