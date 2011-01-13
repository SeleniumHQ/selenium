/*
 * @(#)UnixCrypt.java	0.9 96/11/25
 *
 * Copyright (c) 1996 Aki Yoshida. All rights reserved.
 *
 * Permission to use, copy, modify and distribute this software
 * for non-commercial or commercial purposes and without fee is
 * hereby granted provided that this copyright notice appears in
 * all copies.
 */

/**
 * Unix crypt(3C) utility
 *
 * @version 	0.9, 11/25/96
 * @author 	Aki Yoshida
 */

/**
 * modified April 2001
 * by Iris Van den Broeke, Daniel Deville
 */

package org.openqa.jetty.util;

/* ------------------------------------------------------------ */
/** Unix Crypt.
 * Implements the one way cryptography used by Unix systems for
 * simple password protection.
 * @version $Id: UnixCrypt.java,v 1.5 2004/10/11 00:28:41 gregwilkins Exp $
 * @author Greg Wilkins (gregw)
 */
public class UnixCrypt extends Object
{

    /* (mostly) Standard DES Tables from Tom Truscott */
    private static final byte[] IP = {		/* initial permutation */
        58, 50, 42, 34, 26, 18, 10,  2,
        60, 52, 44, 36, 28, 20, 12,  4,
        62, 54, 46, 38, 30, 22, 14,  6,
        64, 56, 48, 40, 32, 24, 16,  8,
        57, 49, 41, 33, 25, 17,  9,  1,
        59, 51, 43, 35, 27, 19, 11,  3,
        61, 53, 45, 37, 29, 21, 13,  5,
        63, 55, 47, 39, 31, 23, 15,  7};

    /* The final permutation is the inverse of IP - no table is necessary */
    private static final byte[] ExpandTr = {	/* expansion operation */
        32,  1,  2,  3,  4,  5,
        4,  5,  6,  7,  8,  9,
        8,  9, 10, 11, 12, 13,
        12, 13, 14, 15, 16, 17,
        16, 17, 18, 19, 20, 21,
        20, 21, 22, 23, 24, 25,
        24, 25, 26, 27, 28, 29,
        28, 29, 30, 31, 32,  1};

    private static final byte[] PC1 = {		/* permuted choice table 1 */
        57, 49, 41, 33, 25, 17,  9,
        1, 58, 50, 42, 34, 26, 18,
        10,  2, 59, 51, 43, 35, 27,
        19, 11,  3, 60, 52, 44, 36,
    
        63, 55, 47, 39, 31, 23, 15,
        7, 62, 54, 46, 38, 30, 22,
        14,  6, 61, 53, 45, 37, 29,
        21, 13,  5, 28, 20, 12,  4};

    private static final byte[] Rotates = {	/* PC1 rotation schedule */
        1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1};


    private static final byte[] PC2 = {		/* permuted choice table 2 */
        9, 18,    14, 17, 11, 24,  1,  5,
        22, 25,     3, 28, 15,  6, 21, 10,
        35, 38,    23, 19, 12,  4, 26,  8,
        43, 54,    16,  7, 27, 20, 13,  2,

        0,  0,    41, 52, 31, 37, 47, 55,
        0,  0,    30, 40, 51, 45, 33, 48,
        0,  0,    44, 49, 39, 56, 34, 53,
        0,  0,    46, 42, 50, 36, 29, 32};

    private static final byte[][] S = {	/* 48->32 bit substitution tables */
        /* S[1]			*/
        {14,  4, 13,  1,  2, 15, 11,  8,  3, 10,  6, 12,  5,  9,  0,  7,
         0, 15,  7,  4, 14,  2, 13,  1, 10,  6, 12, 11,  9,  5,  3,  8,
         4,  1, 14,  8, 13,  6,  2, 11, 15, 12,  9,  7,  3, 10,  5,  0,
         15, 12,  8,  2,  4,  9,  1,  7,  5, 11,  3, 14, 10,  0,  6, 13},
        /* S[2]			*/
        {15,  1,  8, 14,  6, 11,  3,  4,  9,  7,  2, 13, 12,  0,  5, 10,
         3, 13,  4,  7, 15,  2,  8, 14, 12,  0,  1, 10,  6,  9, 11,  5,
         0, 14,  7, 11, 10,  4, 13,  1,  5,  8, 12,  6,  9,  3,  2, 15,
         13,  8, 10,  1,  3, 15,  4,  2, 11,  6,  7, 12,  0,  5, 14,  9},
        /* S[3]			*/
        {10,  0,  9, 14,  6,  3, 15,  5,  1, 13, 12,  7, 11,  4,  2,  8,
         13,  7,  0,  9,  3,  4,  6, 10,  2,  8,  5, 14, 12, 11, 15,  1,
         13,  6,  4,  9,  8, 15,  3,  0, 11,  1,  2, 12,  5, 10, 14,  7,
         1, 10, 13,  0,  6,  9,  8,  7,  4, 15, 14,  3, 11,  5,  2, 12},
        /* S[4]			*/
        {7, 13, 14,  3,  0,  6,  9, 10,  1,  2,  8,  5, 11, 12,  4, 15,
         13,  8, 11,  5,  6, 15,  0,  3,  4,  7,  2, 12,  1, 10, 14,  9,
         10,  6,  9,  0, 12, 11,  7, 13, 15,  1,  3, 14,  5,  2,  8,  4,
         3, 15,  0,  6, 10,  1, 13,  8,  9,  4,  5, 11, 12,  7,  2, 14},
        /* S[5]			*/
        {2, 12,  4,  1,  7, 10, 11,  6,  8,  5,  3, 15, 13,  0, 14,  9,
         14, 11,  2, 12,  4,  7, 13,  1,  5,  0, 15, 10,  3,  9,  8,  6,
         4,  2,  1, 11, 10, 13,  7,  8, 15,  9, 12,  5,  6,  3,  0, 14,
         11,  8, 12,  7,  1, 14,  2, 13,  6, 15,  0,  9, 10,  4,  5,  3},
        /* S[6]			*/
        {12,  1, 10, 15,  9,  2,  6,  8,  0, 13,  3,  4, 14,  7,  5, 11,
         10, 15,  4,  2,  7, 12,  9,  5,  6,  1, 13, 14,  0, 11,  3,  8,
         9, 14, 15,  5,  2,  8, 12,  3,  7,  0,  4, 10,  1, 13, 11,  6,
         4,  3,  2, 12,  9,  5, 15, 10, 11, 14,  1,  7,  6,  0,  8, 13},
        /* S[7]			*/
        {4, 11,  2, 14, 15,  0,  8, 13,  3, 12,  9,  7,  5, 10,  6,  1,
         13,  0, 11,  7,  4,  9,  1, 10, 14,  3,  5, 12,  2, 15,  8,  6,
         1,  4, 11, 13, 12,  3,  7, 14, 10, 15,  6,  8,  0,  5,  9,  2,
         6, 11, 13,  8,  1,  4, 10,  7,  9,  5,  0, 15, 14,  2,  3, 12},
        /* S[8]			*/
        {13,  2,  8,  4,  6, 15, 11,  1, 10,  9,  3, 14,  5,  0, 12,  7,
         1, 15, 13,  8, 10,  3,  7,  4, 12,  5,  6, 11,  0, 14,  9,  2,
         7, 11,  4,  1,  9, 12, 14,  2,  0,  6, 10, 13, 15,  3,  5,  8,
         2,  1, 14,  7,  4, 10,  8, 13, 15, 12,  9,  0,  3,  5,  6, 11}};

    private static final byte[] P32Tr = {	/* 32-bit permutation function */
        16,  7, 20, 21,
        29, 12, 28, 17,
        1, 15, 23, 26,
        5, 18, 31, 10,
        2,  8, 24, 14,
        32, 27,  3,  9,
        19, 13, 30,  6,
        22, 11,  4, 25};

    private static final byte[] CIFP = {	/* compressed/interleaved permutation */
        1,  2,  3,  4,   17, 18, 19, 20,
        5,  6,  7,  8,   21, 22, 23, 24,
        9, 10, 11, 12,   25, 26, 27, 28,
        13, 14, 15, 16,   29, 30, 31, 32,

        33, 34, 35, 36,   49, 50, 51, 52,
        37, 38, 39, 40,   53, 54, 55, 56,
        41, 42, 43, 44,   57, 58, 59, 60,
        45, 46, 47, 48,   61, 62, 63, 64};

    private static final byte[] ITOA64 = {		/* 0..63 => ascii-64 */
        (byte)'.',(byte) '/',(byte) '0',(byte) '1',(byte) '2',(byte) '3',(byte) '4',(byte) '5',
        (byte)'6',(byte) '7',(byte) '8',(byte) '9',(byte) 'A',(byte) 'B',(byte) 'C',(byte) 'D',
        (byte)'E',(byte) 'F',(byte) 'G',(byte) 'H',(byte) 'I',(byte) 'J',(byte) 'K',(byte) 'L', 
        (byte)'M',(byte) 'N',(byte) 'O',(byte) 'P',(byte) 'Q',(byte) 'R',(byte) 'S',(byte) 'T', 
        (byte)'U',(byte) 'V',(byte) 'W',(byte) 'X',(byte) 'Y',(byte) 'Z',(byte) 'a',(byte) 'b', 
        (byte)'c',(byte) 'd',(byte) 'e',(byte) 'f',(byte) 'g',(byte) 'h',(byte) 'i',(byte) 'j', 
        (byte)'k',(byte) 'l',(byte) 'm',(byte) 'n',(byte) 'o',(byte) 'p',(byte) 'q',(byte) 'r', 
        (byte)'s',(byte) 't',(byte) 'u',(byte) 'v',(byte) 'w',(byte) 'x',(byte) 'y',(byte) 'z'};

    /* =====  Tables that are initialized at run time  ==================== */

    private static byte[] A64TOI = new byte[128];	/* ascii-64 => 0..63 */

    /* Initial key schedule permutation */
    private static long[][] PC1ROT = new long[16][16];

    /* Subsequent key schedule rotation permutations */
    private static long[][][] PC2ROT = new long[2][16][16];

    /* Initial permutation/expansion table */
    private static long[][] IE3264 = new long[8][16];

    /* Table that combines the S, P, and E operations.  */
    private static long[][] SPE = new long[8][64];

    /* compressed/interleaved => final permutation table */
    private static long[][] CF6464 = new long[16][16];


    /* ==================================== */

    static {
        byte[] perm = new byte[64];
        byte[] temp = new byte[64];

        // inverse table.
        for (int i=0; i<64; i++) A64TOI[ITOA64[i]] = (byte)i;

        // PC1ROT - bit reverse, then PC1, then Rotate, then PC2
        for (int i=0; i<64; i++) perm[i] = (byte)0;;
        for (int i=0; i<64; i++) {
            int k;
            if ((k = (int)PC2[i]) == 0) continue;
            k += Rotates[0]-1;
            if ((k%28) < Rotates[0]) k -= 28;
            k = (int)PC1[k];
            if (k > 0) {
                k--;
                k = (k|0x07) - (k&0x07);
                k++;
            }
            perm[i] = (byte)k;
        }
        init_perm(PC1ROT, perm, 8);

        // PC2ROT - PC2 inverse, then Rotate, then PC2
        for (int j=0; j<2; j++) {
            int k;
            for (int i=0; i<64; i++) perm[i] = temp[i] = 0;
            for (int i=0; i<64; i++) {
                if ((k = (int)PC2[i]) == 0) continue;
                temp[k-1] = (byte)(i+1);
            }
            for (int i=0; i<64; i++) {
                if ((k = (int)PC2[i]) == 0) continue;
                k += j;
                if ((k%28) <= j) k -= 28;
                perm[i] = temp[k];
            }

            init_perm(PC2ROT[j], perm, 8);
        }

        // Bit reverse, intial permupation, expantion
        for (int i=0; i<8; i++) {
            for (int j=0; j<8; j++) {
                int k = (j < 2)? 0: IP[ExpandTr[i*6+j-2]-1];
                if (k > 32) k -= 32;
                else if (k > 0) k--;
                if (k > 0) {
                    k--;
                    k = (k|0x07) - (k&0x07);
                    k++;
                }
                perm[i*8+j] = (byte)k;
            }
        }

        init_perm(IE3264, perm, 8);

        // Compression, final permutation, bit reverse
        for (int i=0; i<64; i++) {
            int k = IP[CIFP[i]-1];
            if (k > 0) {
                k--;
                k = (k|0x07) - (k&0x07);
                k++;
            }
            perm[k-1] = (byte)(i+1);
        }

        init_perm(CF6464, perm, 8);

        // SPE table
        for (int i=0; i<48; i++)
            perm[i] = P32Tr[ExpandTr[i]-1];
        for (int t=0; t<8; t++) {
            for (int j=0; j<64; j++) {
                int k = (((j >> 0) & 0x01) << 5) | (((j >> 1) & 0x01) << 3) |
                    (((j >> 2) & 0x01) << 2) | (((j >> 3) & 0x01) << 1) |
                    (((j >> 4) & 0x01) << 0) | (((j >> 5) & 0x01) << 4);
                k = S[t][k];
                k = (((k >> 3) & 0x01) << 0) | (((k >> 2) & 0x01) << 1) |
                    (((k >> 1) & 0x01) << 2) | (((k >> 0) & 0x01) << 3);
                for (int i=0; i<32; i++) temp[i] = 0;
                for (int i=0; i<4; i++) temp[4*t+i] = (byte)((k >> i) & 0x01);
                long kk = 0;
                for (int i=24; --i>=0; ) kk = ((kk<<1) |
                                               ((long)temp[perm[i]-1])<<32 |
                                               ((long)temp[perm[i+24]-1]));

                SPE[t][j] = to_six_bit(kk);
            }
        }
    }

    /**
     * You can't call the constructer.
     */
    private UnixCrypt() { }

    /**
     * Returns the transposed and split code of a 24-bit code
     * into a 4-byte code, each having 6 bits.
     */
    private static int to_six_bit(int num) {
        return (((num << 26) & 0xfc000000) | ((num << 12) & 0xfc0000) | 
                ((num >> 2) & 0xfc00) | ((num >> 16) & 0xfc));
    }

    /**
     * Returns the transposed and split code of two 24-bit code 
     * into two 4-byte code, each having 6 bits.
     */
    private static long to_six_bit(long num) {
        return (((num << 26) & 0xfc000000fc000000L) | ((num << 12) & 0xfc000000fc0000L) | 
                ((num >> 2) & 0xfc000000fc00L) | ((num >> 16) & 0xfc000000fcL));
    }
  
    /**
     * Returns the permutation of the given 64-bit code with
     * the specified permutataion table.
     */
    private static long perm6464(long c, long[][]p) {
        long out = 0L;
        for (int i=8; --i>=0; ) {
            int t = (int)(0x00ff & c);
            c >>= 8;
            long tp = p[i<<1][t&0x0f];
            out |= tp;
            tp = p[(i<<1)+1][t>>4];
            out |= tp;
        }
        return out;
    }

    /**
     * Returns the permutation of the given 32-bit code with
     * the specified permutataion table.
     */
    private static long perm3264(int c, long[][]p) {
        long out = 0L;
        for (int i=4; --i>=0; ) {
            int t = (0x00ff & c);
            c >>= 8;
            long tp = p[i<<1][t&0x0f];
            out |= tp;
            tp = p[(i<<1)+1][t>>4];
            out |= tp;
        }
        return out;
    }

    /**
     * Returns the key schedule for the given key.
     */
    private static long[] des_setkey(long keyword) {
        long K = perm6464(keyword, PC1ROT);
        long[] KS = new long[16];
        KS[0] = K&~0x0303030300000000L;
    
        for (int i=1; i<16; i++) {
            KS[i] = K;
            K = perm6464(K, PC2ROT[Rotates[i]-1]);

            KS[i] = K&~0x0303030300000000L;
        }
        return KS;
    }

    /**
     * Returns the DES encrypted code of the given word with the specified 
     * environment.
     */
    private static long des_cipher(long in, int salt, int num_iter, long[] KS) {
        salt = to_six_bit(salt);
        long L = in;
        long R = L;
        L &= 0x5555555555555555L;
        R = (R & 0xaaaaaaaa00000000L) | ((R >> 1) & 0x0000000055555555L);
        L = ((((L << 1) | (L << 32)) & 0xffffffff00000000L) | 
             ((R | (R >> 32)) & 0x00000000ffffffffL));
    
        L = perm3264((int)(L>>32), IE3264);
        R = perm3264((int)(L&0xffffffff), IE3264);

        while (--num_iter >= 0) {
            for (int loop_count=0; loop_count<8; loop_count++) {
                long kp;
                long B;
                long k;

                kp = KS[(loop_count<<1)];
                k = ((R>>32) ^ R) & salt & 0xffffffffL;
                k |= (k<<32);
                B = (k ^ R ^ kp);

                L ^= (SPE[0][(int)((B>>58)&0x3f)] ^ SPE[1][(int)((B>>50)&0x3f)] ^
                      SPE[2][(int)((B>>42)&0x3f)] ^ SPE[3][(int)((B>>34)&0x3f)] ^
                      SPE[4][(int)((B>>26)&0x3f)] ^ SPE[5][(int)((B>>18)&0x3f)] ^
                      SPE[6][(int)((B>>10)&0x3f)] ^ SPE[7][(int)((B>>2)&0x3f)]);

                kp = KS[(loop_count<<1)+1];
                k = ((L>>32) ^ L) & salt & 0xffffffffL;
                k |= (k<<32);
                B = (k ^ L ^ kp);

                R ^= (SPE[0][(int)((B>>58)&0x3f)] ^ SPE[1][(int)((B>>50)&0x3f)] ^
                      SPE[2][(int)((B>>42)&0x3f)] ^ SPE[3][(int)((B>>34)&0x3f)] ^
                      SPE[4][(int)((B>>26)&0x3f)] ^ SPE[5][(int)((B>>18)&0x3f)] ^
                      SPE[6][(int)((B>>10)&0x3f)] ^ SPE[7][(int)((B>>2)&0x3f)]);
            }
            // swap L and R
            L ^= R;
            R ^= L;
            L ^= R;
        }
        L = ((((L>>35) & 0x0f0f0f0fL) | (((L&0xffffffff)<<1) & 0xf0f0f0f0L))<<32 |
             (((R>>35) & 0x0f0f0f0fL) | (((R&0xffffffff)<<1) & 0xf0f0f0f0L)));

        L = perm6464(L, CF6464);

        return L;
    }

    /**
     * Initializes the given permutation table with the mapping table.
     */
    private static void init_perm(long[][] perm, byte[] p,int chars_out) {
        for (int k=0; k<chars_out*8; k++) {

            int l = p[k] - 1;
            if (l < 0) continue;
            int i = l>>2;
            l = 1<<(l&0x03);
            for (int j=0; j<16; j++) {
                int s = ((k&0x07)+((7-(k>>3))<<3));
                if ((j & l) != 0x00) perm[i][j] |= (1L<<s);
            }
        }
    }

    /**
     * Encrypts String into crypt (Unix) code.
     * @param key the key to be encrypted
     * @param setting the salt to be used
     * @return the encrypted String
     */
    public static String crypt(String key, String setting)
    {
        long constdatablock = 0L;		/* encryption constant */
        byte[] cryptresult = new byte[13];	/* encrypted result */
        long keyword = 0L;
        /* invalid parameters! */
        if(key==null||setting==null) 
            return "*"; // will NOT match under ANY circumstances!

        int keylen = key.length();

        for (int i=0; i<8 ; i++) {
            keyword = (keyword << 8) | ((i < keylen)? 2*key.charAt(i): 0);
        }

        long[] KS = des_setkey(keyword);

        int salt = 0;
        for (int i=2; --i>=0;) {
            char c = (i < setting.length())? setting.charAt(i): '.';
            cryptresult[i] = (byte)c;
            salt = (salt<<6) | (0x00ff&A64TOI[c]);
        }

        long rsltblock = des_cipher(constdatablock, salt, 25, KS);

        cryptresult[12] = ITOA64[(((int)rsltblock)<<2)&0x3f];
        rsltblock >>= 4;
        for (int i=12; --i>=2; ) {
            cryptresult[i] = ITOA64[((int)rsltblock)&0x3f];
            rsltblock >>= 6;
        }

        return new String(cryptresult, 0x00, 0, 13);
    }

    public static void main(String[] arg)
    {
        if (arg.length!=2)
        {
            System.err.println("Usage - java org.openqa.jetty.util.UnixCrypt <key> <salt>");
            System.exit(1);
        }

        System.err.println("Crypt="+crypt(arg[0],arg[1]));
    }
    
}

