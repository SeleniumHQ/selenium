/*
Copyright (c) 2003 ThoughtWorks, Inc. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

   1. Redistributions of source code must retain the above copyright notice,
      this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above copyright notice,
      this list of conditions and the following disclaimer in the documentation
      and/or other materials provided with the distribution.

   3. The end-user documentation included with the redistribution, if any, must
      include the following acknowledgment:

          This product includes software developed by ThoughtWorks, Inc.
          (http://www.thoughtworks.com/).

      Alternately, this acknowledgment may appear in the software itself, if and
      wherever such third-party acknowledgments normally appear.

   4. The names "CruiseControl", "CruiseControl.NET", "CCNET", and
      "ThoughtWorks, Inc." must not be used to endorse or promote products derived
      from this software without prior written permission. For written permission,
      please contact opensource@thoughtworks.com.

   5. Products derived from this software may not be called "Selenium" or
      "ThoughtWorks", nor may "Selenium" or "ThoughtWorks" appear in their name,
      without prior written permission of ThoughtWorks, Inc.


THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THOUGHTWORKS
INC OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
*/
package com.thoughtworks.selenium;

import edu.emory.mathcs.util.concurrent.Exchanger;
import edu.emory.mathcs.util.concurrent.Executors;
import org.jmock.MockObjectTestCase;

/**
 * @author Aslak Helles&oslash;y
 * @version $Revision: 1.3 $
 */
public class RemoteInterfaceTest extends MockObjectTestCase {
    public void testShouldGetCommandFromExchanger() throws InterruptedException {
        final Exchanger commandExchanger = new Exchanger();
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    commandExchanger.exchange("foo");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        assertEquals("foo", new WikiTableRows(commandExchanger, null).getRow());
    }

    public void testShouldPutExceptionOnExchanger() throws InterruptedException {
        final Exchanger resultExchanger = new Exchanger();
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    new WikiTableRows(null, resultExchanger).setException("KO");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        SeleniumException e = (SeleniumException) resultExchanger.exchange(null);
        assertEquals("KO", e.getMessage());
    }

    public void testShouldPutResultOnExchanger() throws InterruptedException {
        final Exchanger resultExchanger = new Exchanger();
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            public void run() {
                try {
                    new WikiTableRows(null, resultExchanger).setResult("OK");
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
        assertEquals("OK", resultExchanger.exchange(null));
    }
}
