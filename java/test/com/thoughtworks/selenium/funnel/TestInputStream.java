/*
 * Copyright 2004 ThoughtWorks, Inc.
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
package com.thoughtworks.selenium.funnel;

import java.io.ByteArrayInputStream;
import java.io.IOException;

/**
 * Stream used in unit tests. This is not a mock (no verification).
 * It only provides an extra method so we can test whether it has been
 * closed.
 *
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.1 $
 */
public class TestInputStream extends ByteArrayInputStream {
    private boolean isClosed = false;

    public TestInputStream(String s) {
        super(s.getBytes());
    }

    public void close() throws IOException {
        super.close();
        isClosed = true;
    }

    public boolean isClosed() {
        return isClosed;
    }
}
