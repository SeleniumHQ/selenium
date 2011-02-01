// ========================================================================
// $Id: Loader.java,v 1.4 2004/11/05 07:09:33 gregwilkins Exp $
// Copyright 1999-2004 Mort Bay Consulting Pty. Ltd.
// ------------------------------------------------------------------------
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at 
// http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ========================================================================

package org.openqa.jetty.util;

/* ------------------------------------------------------------ */
/** ClassLoader Helper.
 * This helper class allows classes to be loaded either from the
 * Thread's ContextClassLoader, the classloader of the derived class
 * or the system ClassLoader.
 *
 * <B>Usage:</B><PRE>
 * public class MyClass {
 *     void myMethod() {
 *          ...
 *          Class c=Loader.loadClass(this.getClass(),classname);
 *          ...
 *     }
 * </PRE>          
 * @version $Id: Loader.java,v 1.4 2004/11/05 07:09:33 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class Loader
{
    /* ------------------------------------------------------------ */
    public static Class loadClass(Class loadClass,String name)
        throws ClassNotFoundException
    {
        ClassNotFoundException cnfe=null;
        ClassLoader loader=Thread.currentThread().getContextClassLoader();
        if (loader!=null)
        {
            try
            {
               return loader.loadClass(name);
            }
            catch (ClassNotFoundException e)
            {
               cnfe=e;
            }
        }

        loader=loadClass.getClassLoader();
        if (loader!=null)
        {
            try
            {
               return loader.loadClass(name);
            }
            catch (ClassNotFoundException e)
            {
               if(cnfe==null)cnfe=e;
            }
        }


       try
       {
            return Class.forName(name);
       }
       catch (ClassNotFoundException e)
       {
            if(cnfe==null)cnfe=e;
	    throw cnfe;
       }

    }
}

