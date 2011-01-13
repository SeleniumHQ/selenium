// ========================================================================
// $Id: ByteArrayPool.java,v 1.9 2004/05/09 20:32:49 gregwilkins Exp $
// Copyright 2002-2004 Mort Bay Consulting Pty. Ltd.
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
/** Byte Array Pool
 * Simple pool for recycling byte arrays of a fixed size.
 *
 * @version $Id: ByteArrayPool.java,v 1.9 2004/05/09 20:32:49 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class ByteArrayPool
{
    public static final int __POOL_SIZE=
        Integer.getInteger("org.openqa.jetty.util.ByteArrayPool.pool_size",8).intValue();
    
    public static final ThreadLocal __pools=new BAThreadLocal();
    public static int __slot;
    
    /* ------------------------------------------------------------ */
    /** Get a byte array from the pool of known size.
     * @param size Size of the byte array.
     * @return Byte array of known size.
     */
    public static byte[] getByteArray(int size)
    {
        byte[][] pool = (byte[][])__pools.get();
        boolean full=true;
        for (int i=pool.length;i-->0;)
        {
            if (pool[i]!=null && pool[i].length==size)
            {
                byte[]b = pool[i];
                pool[i]=null;
                return b;
            }
            else
                full=false;
        }

        if (full)
            for (int i=pool.length;i-->0;)
                pool[i]=null;
        
        return new byte[size];
    }

    /* ------------------------------------------------------------ */
    public static byte[] getByteArrayAtLeast(int minSize)
    {
        byte[][] pool = (byte[][])__pools.get();
        for (int i=pool.length;i-->0;)
        {
            if (pool[i]!=null && pool[i].length>=minSize)
            {
                byte[]b = pool[i];
                pool[i]=null;
                return b;
            }
        }
        
        return new byte[minSize];
    }


    /* ------------------------------------------------------------ */
    public static void returnByteArray(final byte[] b)
    {
        if (b==null)
            return;
        
        byte[][] pool = (byte[][])__pools.get();
        for (int i=pool.length;i-->0;)
        {
            if (pool[i]==null)
            {
                pool[i]=b;
                return;
            }
        }

        // slot.
        int s = __slot++;
        if (s<0)s=-s;
        pool[s%pool.length]=b;
    }

    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static final class BAThreadLocal extends ThreadLocal
    {
        protected Object initialValue()
            {
                return new byte[__POOL_SIZE][];
            }
    }
}
