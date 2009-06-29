/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Netscape security libraries.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1994-2000
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 *  JARFILE.H
 * 
 *  Certain constants and structures for the archive format.
 *
 */

/* ZIP */

struct ZipLocal
  {
  char signature [4];
  char word [2];
  char bitflag [2];
  char method [2];
  char time [2];
  char date [2];
  char crc32 [4];
  char size [4];
  char orglen [4];
  char filename_len [2];
  char extrafield_len [2];
  };

struct ZipCentral
  {
  char signature [4];
  char version_made_by [2];
  char version [2];
  char bitflag [2];
  char method [2];
  char time [2];
  char date [2];
  char crc32 [4];
  char size [4];
  char orglen [4];
  char filename_len [2];
  char extrafield_len [2];
  char commentfield_len [2];
  char diskstart_number [2];
  char internal_attributes [2];
  char external_attributes [4];
  char localhdr_offset [4];
  };

struct ZipEnd
  {
  char signature [4];
  char disk_nr [2];
  char start_central_dir [2];
  char total_entries_disk [2];
  char total_entries_archive [2];
  char central_dir_size [4];
  char offset_central_dir [4];
  char commentfield_len [2];
  };

#define LSIG 0x04034B50l
#define CSIG 0x02014B50l
#define ESIG 0x06054B50l

/* TAR */

union TarEntry
  {
  struct header
    {
    char filename [100];
    char mode [8];
    char uid [8];
    char gid [8];
    char size [12];
    char time [12];
    char checksum [8];
    char linkflag;
    char linkname [100];
    }
  val;

  char buffer [512];
  };
