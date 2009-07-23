<!--
JsUnit - a JUnit port for JavaScript
Copyright (C) 1999,2000,2001,2002,2003,2006 Joerg Schaible

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<!-- include other JavaScript pages here -->
<%
function main()
{
    var runner = new TextTestRunner( new CtxWriter());
    var suite = new TestSuite( "AllTests" );
    suite.addTest( new ArrayTestSuite());
    suite.addTest( new MoneyTestSuite());
    suite.addTest( new SimpleTestSuite());
    return runner.doRun( suite );
}

main();
%>

