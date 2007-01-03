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

public class IListIterator implements Iterator {
	private Dispatch toWrap;
	private int count;
	private int index;

	public IListIterator(Dispatch toWrap) {
		this.toWrap = toWrap;
		count = Dispatch.get(toWrap, "Count").getInt();
		index = 0;
	}

	public boolean hasNext() {
		return index < count;
	}

	public Object next() {
		return Dispatch.call(toWrap, "Item", new Integer(index++));
	}

	public void remove() {
		throw new UnsupportedOperationException();
	}
}
