/*
 * Copyright 2007 ThoughtWorks, Inc
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

package com.thoughtworks.webdriver.ie;

import java.util.Iterator;

import com.jacob.com.Dispatch;
import com.jacob.com.Variant;

public class JacobIListWrapper {
	private final Dispatch toWrap;

	public JacobIListWrapper(Variant toWrap) {
		this.toWrap = toWrap.toDispatch();
	}

	public Iterator iterator() {
		return new IListIterator(toWrap);
	}
}
