// <copyright file="LocationContext.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Globalization;

namespace OpenQA.Selenium.Html5
{
    /// <summary>
    /// Defines the interface through which the user can manipulate browser location.
    /// </summary>
    public class LocationContext : ILocationContext
    {
        private WebDriver driver;

        /// <summary>
        /// Initializes a new instance of the <see cref="LocationContext"/> class.
        /// </summary>
        /// <param name="driver">The <see cref="WebDriver"/> for which the application cache will be managed.</param>
        public LocationContext(WebDriver driver)
        {
            this.driver = driver;
        }

        /// <summary>
        /// Gets or sets a value indicating the physical location of the browser.
        /// </summary>
        public Location PhysicalLocation
        {
            get
            {
                Response commandResponse = this.driver.InternalExecute(DriverCommand.GetLocation, null);
                Dictionary<string, object> location = commandResponse.Value as Dictionary<string, object>;
                if (location != null)
                {
                    return new Location(double.Parse(location["latitude"].ToString(), CultureInfo.InvariantCulture), double.Parse(location["longitude"].ToString(), CultureInfo.InvariantCulture), double.Parse(location["altitude"].ToString(), CultureInfo.InvariantCulture));
                }

                return null;
            }

            set
            {
                if (value == null)
                {
                    throw new ArgumentNullException("value", "value cannot be null");
                }

                Dictionary<string, object> loc = new Dictionary<string, object>();
                loc.Add("latitude", value.Latitude);
                loc.Add("longitude", value.Longitude);
                loc.Add("altitude", value.Altitude);

                Dictionary<string, object> parameters = new Dictionary<string, object>();
                parameters.Add("location", loc);
                this.driver.InternalExecute(DriverCommand.SetLocation, parameters);
            }
        }
    }
}
