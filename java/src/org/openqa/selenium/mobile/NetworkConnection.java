// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.mobile;


/**
 * Control a device's network connection <p> Example usage:
 *
 * <pre>
 * NetworkConnection mobileDriver = (NetworkConnection) driver;
 * if (mobileDriver.getNetworkConnection() != ConnectionType.AIRPLANE_MODE) {
 *   // enabling Airplane mode
 *   mobileDriver.setNetworkConnection(ConnectionType.AIRPLANE_MODE);
 * }
 * </pre>
 */
public interface NetworkConnection {

  /**
   * ConnectionType is a bitmask to represent a device's network connection
   * <pre>
   * Data  | WIFI | Airplane
   * 0       0      1         == 1
   * 1       1      0         == 6
   * 1       0      0         == 4
   * 0       1      0         == 2
   * 0       0      0         == 0
   * </pre>
   *
   * <p>Giving "Data" the first bit positions in order to give room for the future of enabling
   * specific types of data (Edge / 2G, 3G, 4G, LTE, etc) if the device allows it.
   */
  class ConnectionType {

    public static final ConnectionType WIFI = new ConnectionType(2);
    public static final ConnectionType DATA = new ConnectionType(4);
    public static final ConnectionType AIRPLANE_MODE = new ConnectionType(1);
    public static final ConnectionType ALL = new ConnectionType(6);
    public static final ConnectionType NONE = new ConnectionType(0);

    /*
    Future for Network Data types. With a new constructor accepting this enum.
    public enum DataType {
      _2G, _3G, _4G, LTE
    }
    */

    private int mask = 0;

    public ConnectionType(Boolean wifi, Boolean data, Boolean airplaneMode) {
      if (wifi) {
        mask += WIFI.mask;
      }
      if (data) {
        mask += DATA.mask;
      }
      if (airplaneMode) {
        mask += AIRPLANE_MODE.mask;
      }
    }

    public ConnectionType(int mask) {
      // must be a positive number
      this.mask = Math.max(mask, 0);
    }

    public Boolean isAirplaneMode() {
      return mask % 2 == 1;
    }

    public Boolean isWifiEnabled() {
      // shift right 1 bit, check last bit
      return (mask / 2) % 2 == 1;
    }

    public Boolean isDataEnabled() {
      // shift right 2 bits, check if any bits set
      return (mask / 4) > 0;
    }

    @Override
    public boolean equals(Object type) {
      return type instanceof ConnectionType && this.mask == ((ConnectionType) type).mask;
    }

    @Override
    public int hashCode() {
      return mask;
    }

    @Override
    public String toString() {
      return Integer.toString(mask);
    }

    public Integer toJson() {
      return mask;
    }
  }

  /**
   * Query the driver for the Airplane Mode setting state
   *
   * @return {@link org.openqa.selenium.mobile.NetworkConnection.ConnectionType} indicating if the
   * device is in Airplane Mode
   */
  ConnectionType getNetworkConnection();

  /**
   * Set the Connection type Not all connection type combinations are valid for an individual type
   * of device and the remote endpoint will make a best effort to set the type as requested
   *
   * @param type ConnectionType of what the network connection should be
   * @return {@link org.openqa.selenium.mobile.NetworkConnection.ConnectionType} of what the
   * device's network connection is
   */
  ConnectionType setNetworkConnection(ConnectionType type);

}
