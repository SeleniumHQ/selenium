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

namespace OpenQA.Selenium.HTML5
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
        /// Initializes Location object to given coordinates.
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
        /// Return latitude for current location.
        /// </summary>
        /// <returns>Returns latitude of current location as <see cref="double">double.</see></returns>
        public double GetLatitude()
        {
            return latitude;
        }

        /// <summary>
        /// Return longitude for current location.
        /// </summary>
        /// <returns>Returns longitude of current location as <see cref="double">double.</see></returns>
        public double GetLongitude()
        {
            return longitude;
        }

        /// <summary>
        /// Return altitude for current location.
        /// </summary>
        /// <returns>Returns altitude of current location as <see cref="double">double.</see></returns>
        public double GetAltitude()
        {
            return altitude;
        }
        
        /// <summary>
        /// Retuns string represenation for current location.
        /// </summary>
        /// <returns>Returns <see cref="string">string</see> reprsentation for current location.</returns>
        public override string ToString()
        {
            return string.Format("Latitude: {0}, Longitude: {1}, Altitude: {2}", latitude, longitude, altitude);
        }
    }
}
