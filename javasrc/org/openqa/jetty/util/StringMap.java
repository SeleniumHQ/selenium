// ========================================================================
// $Id: StringMap.java,v 1.13 2004/10/23 09:03:22 gregwilkins Exp $
// Copyright 1997-2004 Mort Bay Consulting Pty. Ltd.
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

import java.io.Externalizable;
import java.util.AbstractMap;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/* ------------------------------------------------------------ */
/** Map like class of Strings to Objects.
 * This String Map has been optimized for mapping small sets of
 * Strings where the most frequently accessed Strings have been put to
 * the map first.
 *
 * It also has the benefit that it can look up entries by substring or
 * sections of char and byte arrays.  This can prevent many String
 * objects from being created just to look up in the map.
 *
 * This map is NOT synchronized.
 *
 * @version $Id: StringMap.java,v 1.13 2004/10/23 09:03:22 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class StringMap extends AbstractMap implements Externalizable
{
    private static final int __HASH_WIDTH=9;
    
    /* ------------------------------------------------------------ */
    protected int _width=__HASH_WIDTH;
    protected Node _root=new Node();
    protected boolean _ignoreCase=false;
    protected NullEntry _nullEntry=null;
    protected Object _nullValue=null;
	protected HashSet _entrySet=new HashSet(3);
	protected Set _umEntrySet=Collections.unmodifiableSet(_entrySet);
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     */
    public StringMap()
    {}
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param ignoreCase 
     */
    public StringMap(boolean ignoreCase)
    {
        _ignoreCase=ignoreCase;
    }
    
    /* ------------------------------------------------------------ */
    /** Constructor. 
     * @param ignoreCase 
     * @param width Width of hash tables, larger values are faster but
     * use more memory.
     */
    public StringMap(boolean ignoreCase,int width)
    {
        _ignoreCase=ignoreCase;
        _width=width;
    }
    
    /* ------------------------------------------------------------ */
    /** Set the ignoreCase attribute.
     * @param ic If true, the map is case insensitive for keys.
     */
    public void setIgnoreCase(boolean ic)
    {
        if (_root._children!=null)
            throw new IllegalStateException("Must be set before first put");
        _ignoreCase=ic;
    }

    /* ------------------------------------------------------------ */
    public boolean isIgnoreCase()
    {
        return _ignoreCase;
    }

    /* ------------------------------------------------------------ */
    /** Set the hash width.
     * @param width Width of hash tables, larger values are faster but
     * use more memory.
     */
    public void setWidth(int width)
    {
        _width=width;
    }

    /* ------------------------------------------------------------ */
    public int getWidth()
    {
        return _width;
    }
    
    /* ------------------------------------------------------------ */
    public Object put(Object key, Object value)
    {
        if (key==null)
            return put(null,value);
        return put(key.toString(),value);
    }
        
    /* ------------------------------------------------------------ */
    public Object put(String key, Object value)
    {
        if (key==null)
        {
            Object oldValue=_nullValue;
            _nullValue=value;
            if (_nullEntry==null)
            {   
                _nullEntry=new NullEntry();
                _entrySet.add(_nullEntry);
            }
            return oldValue;
        }
        
        Node node = _root;
        int ni=-1;
        Node prev = null;
        Node parent = null;

        // look for best match
    charLoop:
        for (int i=0;i<key.length();i++)
        {
            char c=key.charAt(i);
            
            // Advance node
            if (ni==-1)
            {
                parent=node;
                prev=null;
                ni=0;
                node=(node._children==null)?null:node._children[c%_width];
            }
            
            // Loop through a node chain at the same level
            while (node!=null) 
            {
                // If it is a matching node, goto next char
                if (node._char[ni]==c || _ignoreCase&&node._ochar[ni]==c)
                {
                    prev=null;
                    ni++;
                    if (ni==node._char.length)
                        ni=-1;
                    continue charLoop;
                }

                // no char match
                // if the first char,
                if (ni==0)
                {
                    // look along the chain for a char match
                    prev=node;
                    node=node._next;
                }
                else
                {
                    // Split the current node!
                    node.split(this,ni);
                    i--;
                    ni=-1;
                    continue charLoop;
                }
            }

            // We have run out of nodes, so as this is a put, make one
            node = new Node(_ignoreCase,key,i);

            if (prev!=null) // add to end of chain
                prev._next=node;
            else if (parent!=null) // add new child
            {
                if (parent._children==null)
                    parent._children=new Node[_width];
                parent._children[c%_width]=node;
                int oi=node._ochar[0]%_width;
                if (node._ochar!=null && node._char[0]%_width!=oi)
                {
                    if (parent._children[oi]==null)
                        parent._children[oi]=node;
                    else
                    {
                        Node n=parent._children[oi];
                        while(n._next!=null)
                            n=n._next;
                        n._next=node;
                    }
                }
            }
            else // this is the root.
                _root=node;
            break;
        }
        
        // Do we have a node
        if (node!=null)
        {
            // Split it if we are in the middle
            if(ni>0)
                node.split(this,ni);
        
            Object old = node._value;
            node._key=key;
            node._value=value;
            _entrySet.add(node);
            return old;
        }
        return null;
    }
    
    /* ------------------------------------------------------------ */
    public Object get(Object key)
    {
        if (key==null)
            return _nullValue;
        if (key instanceof String)
            return get((String)key);
        return get(key.toString());
    }
    
    /* ------------------------------------------------------------ */
    public Object get(String key)
    {
        if (key==null)
            return _nullValue;
        
        Map.Entry entry = getEntry(key,0,key.length());
        if (entry==null)
            return null;
        return entry.getValue();
    }
    
    /* ------------------------------------------------------------ */
    /** Get a map entry by substring key.
     * @param key String containing the key
     * @param offset Offset of the key within the String.
     * @param length The length of the key 
     * @return The Map.Entry for the key or null if the key is not in
     * the map.
     */
    public Map.Entry getEntry(String key,int offset, int length)
    {
        if (key==null)
            return _nullEntry;
        
        Node node = _root;
        int ni=-1;

        // look for best match
    charLoop:
        for (int i=0;i<length;i++)
        {
            char c=key.charAt(offset+i);

            // Advance node
            if (ni==-1)
            {
                ni=0;
                node=(node._children==null)?null:node._children[c%_width];
            }
            
            // Look through the node chain
            while (node!=null) 
            {
                // If it is a matching node, goto next char
                if (node._char[ni]==c || _ignoreCase&&node._ochar[ni]==c)
                {
                    ni++;
                    if (ni==node._char.length)
                        ni=-1;
                    continue charLoop;
                }

                // No char match, so if mid node then no match at all.
                if (ni>0) return null;

                // try next in chain
                node=node._next;                
            }
            return null;
        }
        
        if (ni>0) return null;
        if (node!=null && node._key==null)
            return null;
        return node;
    }
    
    /* ------------------------------------------------------------ */
    /** Get a map entry by char array key.
     * @param key char array containing the key
     * @param offset Offset of the key within the array.
     * @param length The length of the key 
     * @return The Map.Entry for the key or null if the key is not in
     * the map.
     */
    public Map.Entry getEntry(char[] key,int offset, int length)
    {
        if (key==null)
            return _nullEntry;
        
        Node node = _root;
        int ni=-1;

        // look for best match
    charLoop:
        for (int i=0;i<length;i++)
        {
            char c=key[offset+i];

            // Advance node
            if (ni==-1)
            {
                ni=0;
                node=(node._children==null)?null:node._children[c%_width];
            }
            
            // While we have a node to try
            while (node!=null) 
            {
                // If it is a matching node, goto next char
                if (node._char[ni]==c || _ignoreCase&&node._ochar[ni]==c)
                {
                    ni++;
                    if (ni==node._char.length)
                        ni=-1;
                    continue charLoop;
                }

                // No char match, so if mid node then no match at all.
                if (ni>0) return null;

                // try next in chain
                node=node._next;                
            }
            return null;
        }
        
        if (ni>0) return null;
        if (node!=null && node._key==null)
            return null;
        return node;
    }
    
    /* ------------------------------------------------------------ */
    /** Get a map entry by byte array key.
     * @param key byte array containing the key. A simple ASCII byte
     * to char mapping is used.
     * @param offset Offset of the key within the array.
     * @param length The length of the key 
     * @return The Map.Entry for the key or null if the key is not in
     * the map.
     */
    public Map.Entry getEntry(byte[] key,int offset, int length)
    {
        if (key==null)
            return _nullEntry;
        
        Node node = _root;
        int ni=-1;

        // look for best match
    charLoop:
        for (int i=0;i<length;i++)
        {
            char c=(char)(key[offset+i]);

            // Advance node
            if (ni==-1)
            {
                ni=0;
                node=(node._children==null)?null:node._children[c%_width];
            }
            
            // While we have a node to try
            while (node!=null) 
            {  
                // If it is a matching node, goto next char
                if (node._char[ni]==c || _ignoreCase&&node._ochar[ni]==c)
                {
                    ni++;
                    if (ni==node._char.length)
                        ni=-1;
                    continue charLoop;
                }

                // No char match, so if mid node then no match at all.
                if (ni>0) return null;

                // try next in chain
                node=node._next;                      
            }
            return null;
        }
        
        if (ni>0) return null;
        if (node!=null && node._key==null)
            return null;
        return node;
    }
    
    /* ------------------------------------------------------------ */
    public Object remove(Object key)
    {
        if (key==null)
            return remove(null);
        return remove(key.toString());
    }
    
    /* ------------------------------------------------------------ */
    public Object remove(String key)
    {
        if (key==null)
        {
            Object oldValue=_nullValue;
            if (_nullEntry!=null)
            {
                _entrySet.remove(_nullEntry);   
                _nullEntry=null;
                _nullValue=null;
            }
            return oldValue;
        }
        
        Node node = _root;
        int ni=-1;

        // look for best match
    charLoop:
        for (int i=0;i<key.length();i++)
        {
            char c=key.charAt(i);

            // Advance node
            if (ni==-1)
            {
                ni=0;
                node=(node._children==null)?null:node._children[c%_width];
            }
            
            // While we have a node to try
            while (node!=null) 
            {
                // If it is a matching node, goto next char
                if (node._char[ni]==c || _ignoreCase&&node._ochar[ni]==c)
                {
                    ni++;
                    if (ni==node._char.length)
                        ni=-1;
                    continue charLoop;
                }

                // No char match, so if mid node then no match at all.
                if (ni>0) return null;

                // try next in chain
                node=node._next;         
            }
            return null;
        }

        if (ni>0) return null;
        if (node==null || node._key==null)
            return null;
        
        Object old = node._value;
        _entrySet.remove(node);
        node._value=null;
        node._key=null;
        
        return old; 
    }

    /* ------------------------------------------------------------ */
    public Set entrySet()
    {
        return _umEntrySet;
    }
    
    /* ------------------------------------------------------------ */
    public int size()
    {
        return _entrySet.size();
    }

    /* ------------------------------------------------------------ */
    public boolean isEmpty()
    {
        return _entrySet.isEmpty();
    }

    /* ------------------------------------------------------------ */
    public boolean containsKey(Object key)
    {
        if (key==null)
            return _nullEntry!=null;
        return
            getEntry(key.toString(),0,key==null?0:key.toString().length())!=null;
    }
    
    /* ------------------------------------------------------------ */
    public void clear()
    {
        _root=new Node();
        _nullEntry=null;
        _nullValue=null;
        _entrySet.clear();
    }

    
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private static class Node implements Map.Entry
    {
        char[] _char;
        char[] _ochar;
        Node _next;
        Node[] _children;
        String _key;
        Object _value;
        
        Node(){}
        
        Node(boolean ignoreCase,String s, int offset)
        {
            int l=s.length()-offset;
            _char=new char[l];
            _ochar=new char[l];
            for (int i=0;i<l;i++)
            {
                char c=s.charAt(offset+i);
                _char[i]=c;
                if (ignoreCase)
                {
                    char o=c;
                    if (Character.isUpperCase(c))
                        o=Character.toLowerCase(c);
                    else if (Character.isLowerCase(c))
                        o=Character.toUpperCase(c);
                    _ochar[i]=o;
                }
            }
        }

        Node split(StringMap map,int offset)
        {
            Node split = new Node();
            int sl=_char.length-offset;
            
            char[] tmp=this._char;
            this._char=new char[offset];
            split._char = new char[sl];
            System.arraycopy(tmp,0,this._char,0,offset);
            System.arraycopy(tmp,offset,split._char,0,sl);

            if (this._ochar!=null)
            {
                tmp=this._ochar;
                this._ochar=new char[offset];
                split._ochar = new char[sl];
                System.arraycopy(tmp,0,this._ochar,0,offset);
                System.arraycopy(tmp,offset,split._ochar,0,sl);
            }
            
            split._key=this._key;
            split._value=this._value;
            this._key=null;
            this._value=null;
            if (map._entrySet.remove(this))
                map._entrySet.add(split);

            split._children=this._children;            
            this._children=new Node[map._width];
            this._children[split._char[0]%map._width]=split;
            if (split._ochar!=null && this._children[split._ochar[0]%map._width]!=split)
                this._children[split._ochar[0]%map._width]=split;

            return split;
        }
        
        public Object getKey(){return _key;}
        public Object getValue(){return _value;}
        public Object setValue(Object o){Object old=_value;_value=o;return old;}
        public String toString()
        {
            StringBuffer buf=new StringBuffer();
            synchronized(buf)
            {
                toString(buf);
            }
            return buf.toString();
        }

        private void toString(StringBuffer buf)
        {
            buf.append("{[");
            if (_char==null)
                buf.append('-');
            else
                for (int i=0;i<_char.length;i++)
                    buf.append(_char[i]);
            buf.append(':');
            buf.append(_key);
            buf.append('=');
            buf.append(_value);
            buf.append(']');
            if (_children!=null)
            {
                for (int i=0;i<_children.length;i++)
                {
                    buf.append('|');
                    if (_children[i]!=null)
                        _children[i].toString(buf);
                    else
                        buf.append("-");
                }
            }
            buf.append('}');
            if (_next!=null)
            {
                buf.append(",\n");
                _next.toString(buf);
            }
        }
    }

    /* ------------------------------------------------------------ */
    /* ------------------------------------------------------------ */
    private class NullEntry implements Map.Entry
    {
        public Object getKey(){return null;}
        public Object getValue(){return _nullValue;}
        public Object setValue(Object o)
            {Object old=_nullValue;_nullValue=o;return old;}
        public String toString(){return "[:null="+_nullValue+"]";}
    }

    /* ------------------------------------------------------------ */
    public void writeExternal(java.io.ObjectOutput out)
        throws java.io.IOException
    {
        HashMap map = new HashMap(this);
        out.writeObject(map);
    }
    
    /* ------------------------------------------------------------ */
    public void readExternal(java.io.ObjectInput in)
        throws java.io.IOException, ClassNotFoundException
    {
        HashMap map = (HashMap)in.readObject();
        this.putAll(map);
    }
}
