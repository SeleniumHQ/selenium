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

package org.openqa.selenium;

import java.util.Map;
import com.google.common.collect.ImmutableMap;

public class DeviceRotation {
	//Default orientation is portrait
	private int x = 0;
	private int y = 0;
	private int z = 0;

	public DeviceRotation(int x, int y, int z) {
		this.validateParameters(x, y, z);
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	public DeviceRotation(Map<String, Integer> map) {
		if (map == null || !map.containsKey("x") || !map.containsKey("y") || !map.containsKey("z")) {
			throw new IllegalArgumentException("Could not initialize DeviceRotation with map given: " + map.toString());
		}
		this.validateParameters(map.get("x"), map.get("y"), map.get("z"));
		this.x = map.get("x");
		this.y = map.get("y");
		this.z = map.get("z");
	}
	
	private void validateParameters(int x, int y, int z) {
		if (x < 0 || y < 0 || z < 0) {
			throw new IllegalArgumentException("DeviceRotation requires positive axis values: \nx = " + x + "\ny = " + y + "\nz = " + z);
		}
	}
	
	/**
	 * @return the x
	 */
	public int getX() {
		return x;
	}

	/**
	 * @return the y
	 */
	public int getY() {
		return y;
	}

	/**
	 * @return the z
	 */
	public int getZ() {
		return z;
	}

	/**
	 * @return returns all axis mapped to an ImmutableMap
	 */
	public ImmutableMap<String,Integer> parameters() {
		return ImmutableMap.of("x", this.x, "y", this.y, "z", this.z);
	}

	
}
