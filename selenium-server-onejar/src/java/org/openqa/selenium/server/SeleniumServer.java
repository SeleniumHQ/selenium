/*
 * Copyright 2008 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package org.openqa.selenium.server;

import java.lang.reflect.Method;

public class SeleniumServer {

	public static void main(String[] args) throws Throwable {
		Class boot = Class.forName("com.simontuffs.onejar.Boot");
		Method main = boot.getDeclaredMethod("main", new Class[] { String[].class });
		main.invoke(null, (Object) args);
	}
	
}