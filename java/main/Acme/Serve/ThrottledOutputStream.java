// ThrottledOutputStream - output stream with throttling
//
// Copyright (C)1996,1998 by Jef Poskanzer <jef@acme.com>. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
// OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
// OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
// SUCH DAMAGE.
//
// Visit the ACME Labs Java page for up-to-date versions of this and other

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
package Acme.Serve;

import java.io.*;
import java.util.*;

public class ThrottledOutputStream extends FilterOutputStream
    {

    /// Parses a standard throttle file.
    // <P>
    // A throttle file lets you set maximum byte rates on filename patterns.
    // The format of the throttle file is very simple.  A # starts a
    // comment, and the rest of the line is ignored.  Blank lines are ignored.
    // The rest of the lines should consist of a pattern, whitespace, and a
    // number.  The pattern is a simple shell-style filename pattern, using
    // ? and *, or multiple such patterns separated by |.
    // <P>
    // The numbers in the file are byte rates, specified in units of bytes
    // per second.  For comparison, a v.32b/v.42b modem gives about
    // 1500/2000 B/s depending on compression, a double-B-channel ISDN line
    // about 12800 B/s, and a T1 line is about 150000 B/s.
    // <P>
    // Example:
    // <BLOCKQUOTE><PRE>
    // # throttle file for www.acme.com
    // *               100000  # limit total web usage to 2/3 of our T1
    // *.jpg|*.gif     50000   # limit images to 1/3 of our T1
    // *.mpg           20000   # and movies to even less
    // jef/*           20000   # jef's pages are too popular
    // </PRE></BLOCKQUOTE>
    // <P>
    // The routine returns a WildcardDictionary.  Do a lookup in this
    // dictionary using a filename, and you'll get back a ThrottleItem
    // containing the corresponding byte rate.
	public static Acme.WildcardDictionary parseThrottleFile( String filename ) throws IOException { 
		Acme.WildcardDictionary wcd = new Acme.WildcardDictionary();
		File thFile = new File(filename);
		if (thFile.isAbsolute() == false)
			thFile = new File(System.getProperty("user.dir", "."), thFile.getName());
		BufferedReader br = new BufferedReader( new FileReader( thFile ) );
		while ( true ) { 
			String line = br.readLine();
			if ( line == null )
				break;
			int i = line.indexOf( '#' );
			if ( i != -1 )
				line = line.substring( 0, i );
			line = line.trim();
			if ( line.length() == 0 )
				continue;
			String[] words = Acme.Utils.splitStr( line );
			if ( words.length != 2 )
				throw new IOException( "malformed throttle line: " + line );
			try { 
				wcd.put(
						words[0], new ThrottleItem( Long.parseLong( words[1] ) ) );
			}
			catch ( NumberFormatException e ) { 
				throw new IOException(
					"malformed number in throttle line: " + line );
			}
		}
		br.close();
		return wcd;
	}


    private long maxBps;
    private long bytes;
    private long start;

    /// Constructor.
	public ThrottledOutputStream( OutputStream out, long maxBps ) { 
		super( out );
		this.maxBps = maxBps;
		bytes = 0;
		start = System.currentTimeMillis();
	}

    private byte[] oneByte = new byte[1];

    /// Writes a byte.  This method will block until the byte is actually
    // written.
    // @param b the byte to be written
    // @exception IOException if an I/O error has occurred
	public void write( int b ) throws IOException { 
		oneByte[0] = (byte) b;
		write( oneByte, 0, 1 );
	}

    /// Writes a subarray of bytes.
    // @param b	the data to be written
    // @param off the start offset in the data
    // @param len the number of bytes that are written
    // @exception IOException if an I/O error has occurred
	public void write( byte b[], int off, int len ) throws IOException { 
		// Check the throttle.
		bytes += len;
		long elapsed = Math.max(System.currentTimeMillis() - start, 1);
		
		long bps = bytes * 1000L / elapsed;
		if ( bps > maxBps ) { 
			// Oops, sending too fast.
			long wakeElapsed = bytes * 1000L / maxBps;
			try { 
				Thread.sleep( wakeElapsed - elapsed );
			}
			catch ( InterruptedException ignore ) {}
		}

		// Write the bytes.
		out.write( b, off, len );
	}

}
