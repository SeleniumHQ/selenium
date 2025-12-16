// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Date/time formatting symbols for all locales.
 *
 * File generated from CLDR ver. 35.1
 *
 * This file covers those locales that are not covered in
 * "datetimesymbols.js".
 *
 * @suppress {const,missingRequire} Suppress "missing require" warnings for
 *     names like goog.i18n.DateTimeSymbols_af. They are included
 *     by requiring goog.i18n.DateTimeSymbols.
 */

// clang-format off

goog.provide('goog.i18n.DateTimeSymbolsExt');
goog.provide('goog.i18n.DateTimeSymbols_af_NA');
goog.provide('goog.i18n.DateTimeSymbols_af_ZA');
goog.provide('goog.i18n.DateTimeSymbols_agq');
goog.provide('goog.i18n.DateTimeSymbols_agq_CM');
goog.provide('goog.i18n.DateTimeSymbols_ak');
goog.provide('goog.i18n.DateTimeSymbols_ak_GH');
goog.provide('goog.i18n.DateTimeSymbols_am_ET');
goog.provide('goog.i18n.DateTimeSymbols_ar_001');
goog.provide('goog.i18n.DateTimeSymbols_ar_AE');
goog.provide('goog.i18n.DateTimeSymbols_ar_BH');
goog.provide('goog.i18n.DateTimeSymbols_ar_DJ');
goog.provide('goog.i18n.DateTimeSymbols_ar_EH');
goog.provide('goog.i18n.DateTimeSymbols_ar_ER');
goog.provide('goog.i18n.DateTimeSymbols_ar_IL');
goog.provide('goog.i18n.DateTimeSymbols_ar_IQ');
goog.provide('goog.i18n.DateTimeSymbols_ar_JO');
goog.provide('goog.i18n.DateTimeSymbols_ar_KM');
goog.provide('goog.i18n.DateTimeSymbols_ar_KW');
goog.provide('goog.i18n.DateTimeSymbols_ar_LB');
goog.provide('goog.i18n.DateTimeSymbols_ar_LY');
goog.provide('goog.i18n.DateTimeSymbols_ar_MA');
goog.provide('goog.i18n.DateTimeSymbols_ar_MR');
goog.provide('goog.i18n.DateTimeSymbols_ar_OM');
goog.provide('goog.i18n.DateTimeSymbols_ar_PS');
goog.provide('goog.i18n.DateTimeSymbols_ar_QA');
goog.provide('goog.i18n.DateTimeSymbols_ar_SA');
goog.provide('goog.i18n.DateTimeSymbols_ar_SD');
goog.provide('goog.i18n.DateTimeSymbols_ar_SO');
goog.provide('goog.i18n.DateTimeSymbols_ar_SS');
goog.provide('goog.i18n.DateTimeSymbols_ar_SY');
goog.provide('goog.i18n.DateTimeSymbols_ar_TD');
goog.provide('goog.i18n.DateTimeSymbols_ar_TN');
goog.provide('goog.i18n.DateTimeSymbols_ar_XB');
goog.provide('goog.i18n.DateTimeSymbols_ar_YE');
goog.provide('goog.i18n.DateTimeSymbols_as');
goog.provide('goog.i18n.DateTimeSymbols_as_IN');
goog.provide('goog.i18n.DateTimeSymbols_asa');
goog.provide('goog.i18n.DateTimeSymbols_asa_TZ');
goog.provide('goog.i18n.DateTimeSymbols_ast');
goog.provide('goog.i18n.DateTimeSymbols_ast_ES');
goog.provide('goog.i18n.DateTimeSymbols_az_Cyrl');
goog.provide('goog.i18n.DateTimeSymbols_az_Cyrl_AZ');
goog.provide('goog.i18n.DateTimeSymbols_az_Latn');
goog.provide('goog.i18n.DateTimeSymbols_az_Latn_AZ');
goog.provide('goog.i18n.DateTimeSymbols_bas');
goog.provide('goog.i18n.DateTimeSymbols_bas_CM');
goog.provide('goog.i18n.DateTimeSymbols_be_BY');
goog.provide('goog.i18n.DateTimeSymbols_bem');
goog.provide('goog.i18n.DateTimeSymbols_bem_ZM');
goog.provide('goog.i18n.DateTimeSymbols_bez');
goog.provide('goog.i18n.DateTimeSymbols_bez_TZ');
goog.provide('goog.i18n.DateTimeSymbols_bg_BG');
goog.provide('goog.i18n.DateTimeSymbols_bm');
goog.provide('goog.i18n.DateTimeSymbols_bm_ML');
goog.provide('goog.i18n.DateTimeSymbols_bn_BD');
goog.provide('goog.i18n.DateTimeSymbols_bn_IN');
goog.provide('goog.i18n.DateTimeSymbols_bo');
goog.provide('goog.i18n.DateTimeSymbols_bo_CN');
goog.provide('goog.i18n.DateTimeSymbols_bo_IN');
goog.provide('goog.i18n.DateTimeSymbols_br_FR');
goog.provide('goog.i18n.DateTimeSymbols_brx');
goog.provide('goog.i18n.DateTimeSymbols_brx_IN');
goog.provide('goog.i18n.DateTimeSymbols_bs_Cyrl');
goog.provide('goog.i18n.DateTimeSymbols_bs_Cyrl_BA');
goog.provide('goog.i18n.DateTimeSymbols_bs_Latn');
goog.provide('goog.i18n.DateTimeSymbols_bs_Latn_BA');
goog.provide('goog.i18n.DateTimeSymbols_ca_AD');
goog.provide('goog.i18n.DateTimeSymbols_ca_ES');
goog.provide('goog.i18n.DateTimeSymbols_ca_FR');
goog.provide('goog.i18n.DateTimeSymbols_ca_IT');
goog.provide('goog.i18n.DateTimeSymbols_ccp');
goog.provide('goog.i18n.DateTimeSymbols_ccp_BD');
goog.provide('goog.i18n.DateTimeSymbols_ccp_IN');
goog.provide('goog.i18n.DateTimeSymbols_ce');
goog.provide('goog.i18n.DateTimeSymbols_ce_RU');
goog.provide('goog.i18n.DateTimeSymbols_ceb');
goog.provide('goog.i18n.DateTimeSymbols_ceb_PH');
goog.provide('goog.i18n.DateTimeSymbols_cgg');
goog.provide('goog.i18n.DateTimeSymbols_cgg_UG');
goog.provide('goog.i18n.DateTimeSymbols_chr_US');
goog.provide('goog.i18n.DateTimeSymbols_ckb');
goog.provide('goog.i18n.DateTimeSymbols_ckb_IQ');
goog.provide('goog.i18n.DateTimeSymbols_ckb_IR');
goog.provide('goog.i18n.DateTimeSymbols_cs_CZ');
goog.provide('goog.i18n.DateTimeSymbols_cy_GB');
goog.provide('goog.i18n.DateTimeSymbols_da_DK');
goog.provide('goog.i18n.DateTimeSymbols_da_GL');
goog.provide('goog.i18n.DateTimeSymbols_dav');
goog.provide('goog.i18n.DateTimeSymbols_dav_KE');
goog.provide('goog.i18n.DateTimeSymbols_de_BE');
goog.provide('goog.i18n.DateTimeSymbols_de_DE');
goog.provide('goog.i18n.DateTimeSymbols_de_IT');
goog.provide('goog.i18n.DateTimeSymbols_de_LI');
goog.provide('goog.i18n.DateTimeSymbols_de_LU');
goog.provide('goog.i18n.DateTimeSymbols_dje');
goog.provide('goog.i18n.DateTimeSymbols_dje_NE');
goog.provide('goog.i18n.DateTimeSymbols_dsb');
goog.provide('goog.i18n.DateTimeSymbols_dsb_DE');
goog.provide('goog.i18n.DateTimeSymbols_dua');
goog.provide('goog.i18n.DateTimeSymbols_dua_CM');
goog.provide('goog.i18n.DateTimeSymbols_dyo');
goog.provide('goog.i18n.DateTimeSymbols_dyo_SN');
goog.provide('goog.i18n.DateTimeSymbols_dz');
goog.provide('goog.i18n.DateTimeSymbols_dz_BT');
goog.provide('goog.i18n.DateTimeSymbols_ebu');
goog.provide('goog.i18n.DateTimeSymbols_ebu_KE');
goog.provide('goog.i18n.DateTimeSymbols_ee');
goog.provide('goog.i18n.DateTimeSymbols_ee_GH');
goog.provide('goog.i18n.DateTimeSymbols_ee_TG');
goog.provide('goog.i18n.DateTimeSymbols_el_CY');
goog.provide('goog.i18n.DateTimeSymbols_el_GR');
goog.provide('goog.i18n.DateTimeSymbols_en_001');
goog.provide('goog.i18n.DateTimeSymbols_en_150');
goog.provide('goog.i18n.DateTimeSymbols_en_AE');
goog.provide('goog.i18n.DateTimeSymbols_en_AG');
goog.provide('goog.i18n.DateTimeSymbols_en_AI');
goog.provide('goog.i18n.DateTimeSymbols_en_AS');
goog.provide('goog.i18n.DateTimeSymbols_en_AT');
goog.provide('goog.i18n.DateTimeSymbols_en_BB');
goog.provide('goog.i18n.DateTimeSymbols_en_BE');
goog.provide('goog.i18n.DateTimeSymbols_en_BI');
goog.provide('goog.i18n.DateTimeSymbols_en_BM');
goog.provide('goog.i18n.DateTimeSymbols_en_BS');
goog.provide('goog.i18n.DateTimeSymbols_en_BW');
goog.provide('goog.i18n.DateTimeSymbols_en_BZ');
goog.provide('goog.i18n.DateTimeSymbols_en_CC');
goog.provide('goog.i18n.DateTimeSymbols_en_CH');
goog.provide('goog.i18n.DateTimeSymbols_en_CK');
goog.provide('goog.i18n.DateTimeSymbols_en_CM');
goog.provide('goog.i18n.DateTimeSymbols_en_CX');
goog.provide('goog.i18n.DateTimeSymbols_en_CY');
goog.provide('goog.i18n.DateTimeSymbols_en_DE');
goog.provide('goog.i18n.DateTimeSymbols_en_DG');
goog.provide('goog.i18n.DateTimeSymbols_en_DK');
goog.provide('goog.i18n.DateTimeSymbols_en_DM');
goog.provide('goog.i18n.DateTimeSymbols_en_ER');
goog.provide('goog.i18n.DateTimeSymbols_en_FI');
goog.provide('goog.i18n.DateTimeSymbols_en_FJ');
goog.provide('goog.i18n.DateTimeSymbols_en_FK');
goog.provide('goog.i18n.DateTimeSymbols_en_FM');
goog.provide('goog.i18n.DateTimeSymbols_en_GD');
goog.provide('goog.i18n.DateTimeSymbols_en_GG');
goog.provide('goog.i18n.DateTimeSymbols_en_GH');
goog.provide('goog.i18n.DateTimeSymbols_en_GI');
goog.provide('goog.i18n.DateTimeSymbols_en_GM');
goog.provide('goog.i18n.DateTimeSymbols_en_GU');
goog.provide('goog.i18n.DateTimeSymbols_en_GY');
goog.provide('goog.i18n.DateTimeSymbols_en_HK');
goog.provide('goog.i18n.DateTimeSymbols_en_IL');
goog.provide('goog.i18n.DateTimeSymbols_en_IM');
goog.provide('goog.i18n.DateTimeSymbols_en_IO');
goog.provide('goog.i18n.DateTimeSymbols_en_JE');
goog.provide('goog.i18n.DateTimeSymbols_en_JM');
goog.provide('goog.i18n.DateTimeSymbols_en_KE');
goog.provide('goog.i18n.DateTimeSymbols_en_KI');
goog.provide('goog.i18n.DateTimeSymbols_en_KN');
goog.provide('goog.i18n.DateTimeSymbols_en_KY');
goog.provide('goog.i18n.DateTimeSymbols_en_LC');
goog.provide('goog.i18n.DateTimeSymbols_en_LR');
goog.provide('goog.i18n.DateTimeSymbols_en_LS');
goog.provide('goog.i18n.DateTimeSymbols_en_MG');
goog.provide('goog.i18n.DateTimeSymbols_en_MH');
goog.provide('goog.i18n.DateTimeSymbols_en_MO');
goog.provide('goog.i18n.DateTimeSymbols_en_MP');
goog.provide('goog.i18n.DateTimeSymbols_en_MS');
goog.provide('goog.i18n.DateTimeSymbols_en_MT');
goog.provide('goog.i18n.DateTimeSymbols_en_MU');
goog.provide('goog.i18n.DateTimeSymbols_en_MW');
goog.provide('goog.i18n.DateTimeSymbols_en_MY');
goog.provide('goog.i18n.DateTimeSymbols_en_NA');
goog.provide('goog.i18n.DateTimeSymbols_en_NF');
goog.provide('goog.i18n.DateTimeSymbols_en_NG');
goog.provide('goog.i18n.DateTimeSymbols_en_NL');
goog.provide('goog.i18n.DateTimeSymbols_en_NR');
goog.provide('goog.i18n.DateTimeSymbols_en_NU');
goog.provide('goog.i18n.DateTimeSymbols_en_NZ');
goog.provide('goog.i18n.DateTimeSymbols_en_PG');
goog.provide('goog.i18n.DateTimeSymbols_en_PH');
goog.provide('goog.i18n.DateTimeSymbols_en_PK');
goog.provide('goog.i18n.DateTimeSymbols_en_PN');
goog.provide('goog.i18n.DateTimeSymbols_en_PR');
goog.provide('goog.i18n.DateTimeSymbols_en_PW');
goog.provide('goog.i18n.DateTimeSymbols_en_RW');
goog.provide('goog.i18n.DateTimeSymbols_en_SB');
goog.provide('goog.i18n.DateTimeSymbols_en_SC');
goog.provide('goog.i18n.DateTimeSymbols_en_SD');
goog.provide('goog.i18n.DateTimeSymbols_en_SE');
goog.provide('goog.i18n.DateTimeSymbols_en_SH');
goog.provide('goog.i18n.DateTimeSymbols_en_SI');
goog.provide('goog.i18n.DateTimeSymbols_en_SL');
goog.provide('goog.i18n.DateTimeSymbols_en_SS');
goog.provide('goog.i18n.DateTimeSymbols_en_SX');
goog.provide('goog.i18n.DateTimeSymbols_en_SZ');
goog.provide('goog.i18n.DateTimeSymbols_en_TC');
goog.provide('goog.i18n.DateTimeSymbols_en_TK');
goog.provide('goog.i18n.DateTimeSymbols_en_TO');
goog.provide('goog.i18n.DateTimeSymbols_en_TT');
goog.provide('goog.i18n.DateTimeSymbols_en_TV');
goog.provide('goog.i18n.DateTimeSymbols_en_TZ');
goog.provide('goog.i18n.DateTimeSymbols_en_UG');
goog.provide('goog.i18n.DateTimeSymbols_en_UM');
goog.provide('goog.i18n.DateTimeSymbols_en_US_POSIX');
goog.provide('goog.i18n.DateTimeSymbols_en_VC');
goog.provide('goog.i18n.DateTimeSymbols_en_VG');
goog.provide('goog.i18n.DateTimeSymbols_en_VI');
goog.provide('goog.i18n.DateTimeSymbols_en_VU');
goog.provide('goog.i18n.DateTimeSymbols_en_WS');
goog.provide('goog.i18n.DateTimeSymbols_en_XA');
goog.provide('goog.i18n.DateTimeSymbols_en_ZM');
goog.provide('goog.i18n.DateTimeSymbols_en_ZW');
goog.provide('goog.i18n.DateTimeSymbols_eo');
goog.provide('goog.i18n.DateTimeSymbols_eo_001');
goog.provide('goog.i18n.DateTimeSymbols_es_AR');
goog.provide('goog.i18n.DateTimeSymbols_es_BO');
goog.provide('goog.i18n.DateTimeSymbols_es_BR');
goog.provide('goog.i18n.DateTimeSymbols_es_BZ');
goog.provide('goog.i18n.DateTimeSymbols_es_CL');
goog.provide('goog.i18n.DateTimeSymbols_es_CO');
goog.provide('goog.i18n.DateTimeSymbols_es_CR');
goog.provide('goog.i18n.DateTimeSymbols_es_CU');
goog.provide('goog.i18n.DateTimeSymbols_es_DO');
goog.provide('goog.i18n.DateTimeSymbols_es_EA');
goog.provide('goog.i18n.DateTimeSymbols_es_EC');
goog.provide('goog.i18n.DateTimeSymbols_es_GQ');
goog.provide('goog.i18n.DateTimeSymbols_es_GT');
goog.provide('goog.i18n.DateTimeSymbols_es_HN');
goog.provide('goog.i18n.DateTimeSymbols_es_IC');
goog.provide('goog.i18n.DateTimeSymbols_es_NI');
goog.provide('goog.i18n.DateTimeSymbols_es_PA');
goog.provide('goog.i18n.DateTimeSymbols_es_PE');
goog.provide('goog.i18n.DateTimeSymbols_es_PH');
goog.provide('goog.i18n.DateTimeSymbols_es_PR');
goog.provide('goog.i18n.DateTimeSymbols_es_PY');
goog.provide('goog.i18n.DateTimeSymbols_es_SV');
goog.provide('goog.i18n.DateTimeSymbols_es_UY');
goog.provide('goog.i18n.DateTimeSymbols_es_VE');
goog.provide('goog.i18n.DateTimeSymbols_et_EE');
goog.provide('goog.i18n.DateTimeSymbols_eu_ES');
goog.provide('goog.i18n.DateTimeSymbols_ewo');
goog.provide('goog.i18n.DateTimeSymbols_ewo_CM');
goog.provide('goog.i18n.DateTimeSymbols_fa_AF');
goog.provide('goog.i18n.DateTimeSymbols_fa_IR');
goog.provide('goog.i18n.DateTimeSymbols_ff');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_BF');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_CM');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_GH');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_GM');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_GN');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_GW');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_LR');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_MR');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_NE');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_NG');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_SL');
goog.provide('goog.i18n.DateTimeSymbols_ff_Latn_SN');
goog.provide('goog.i18n.DateTimeSymbols_fi_FI');
goog.provide('goog.i18n.DateTimeSymbols_fil_PH');
goog.provide('goog.i18n.DateTimeSymbols_fo');
goog.provide('goog.i18n.DateTimeSymbols_fo_DK');
goog.provide('goog.i18n.DateTimeSymbols_fo_FO');
goog.provide('goog.i18n.DateTimeSymbols_fr_BE');
goog.provide('goog.i18n.DateTimeSymbols_fr_BF');
goog.provide('goog.i18n.DateTimeSymbols_fr_BI');
goog.provide('goog.i18n.DateTimeSymbols_fr_BJ');
goog.provide('goog.i18n.DateTimeSymbols_fr_BL');
goog.provide('goog.i18n.DateTimeSymbols_fr_CD');
goog.provide('goog.i18n.DateTimeSymbols_fr_CF');
goog.provide('goog.i18n.DateTimeSymbols_fr_CG');
goog.provide('goog.i18n.DateTimeSymbols_fr_CH');
goog.provide('goog.i18n.DateTimeSymbols_fr_CI');
goog.provide('goog.i18n.DateTimeSymbols_fr_CM');
goog.provide('goog.i18n.DateTimeSymbols_fr_DJ');
goog.provide('goog.i18n.DateTimeSymbols_fr_DZ');
goog.provide('goog.i18n.DateTimeSymbols_fr_FR');
goog.provide('goog.i18n.DateTimeSymbols_fr_GA');
goog.provide('goog.i18n.DateTimeSymbols_fr_GF');
goog.provide('goog.i18n.DateTimeSymbols_fr_GN');
goog.provide('goog.i18n.DateTimeSymbols_fr_GP');
goog.provide('goog.i18n.DateTimeSymbols_fr_GQ');
goog.provide('goog.i18n.DateTimeSymbols_fr_HT');
goog.provide('goog.i18n.DateTimeSymbols_fr_KM');
goog.provide('goog.i18n.DateTimeSymbols_fr_LU');
goog.provide('goog.i18n.DateTimeSymbols_fr_MA');
goog.provide('goog.i18n.DateTimeSymbols_fr_MC');
goog.provide('goog.i18n.DateTimeSymbols_fr_MF');
goog.provide('goog.i18n.DateTimeSymbols_fr_MG');
goog.provide('goog.i18n.DateTimeSymbols_fr_ML');
goog.provide('goog.i18n.DateTimeSymbols_fr_MQ');
goog.provide('goog.i18n.DateTimeSymbols_fr_MR');
goog.provide('goog.i18n.DateTimeSymbols_fr_MU');
goog.provide('goog.i18n.DateTimeSymbols_fr_NC');
goog.provide('goog.i18n.DateTimeSymbols_fr_NE');
goog.provide('goog.i18n.DateTimeSymbols_fr_PF');
goog.provide('goog.i18n.DateTimeSymbols_fr_PM');
goog.provide('goog.i18n.DateTimeSymbols_fr_RE');
goog.provide('goog.i18n.DateTimeSymbols_fr_RW');
goog.provide('goog.i18n.DateTimeSymbols_fr_SC');
goog.provide('goog.i18n.DateTimeSymbols_fr_SN');
goog.provide('goog.i18n.DateTimeSymbols_fr_SY');
goog.provide('goog.i18n.DateTimeSymbols_fr_TD');
goog.provide('goog.i18n.DateTimeSymbols_fr_TG');
goog.provide('goog.i18n.DateTimeSymbols_fr_TN');
goog.provide('goog.i18n.DateTimeSymbols_fr_VU');
goog.provide('goog.i18n.DateTimeSymbols_fr_WF');
goog.provide('goog.i18n.DateTimeSymbols_fr_YT');
goog.provide('goog.i18n.DateTimeSymbols_fur');
goog.provide('goog.i18n.DateTimeSymbols_fur_IT');
goog.provide('goog.i18n.DateTimeSymbols_fy');
goog.provide('goog.i18n.DateTimeSymbols_fy_NL');
goog.provide('goog.i18n.DateTimeSymbols_ga_IE');
goog.provide('goog.i18n.DateTimeSymbols_gd');
goog.provide('goog.i18n.DateTimeSymbols_gd_GB');
goog.provide('goog.i18n.DateTimeSymbols_gl_ES');
goog.provide('goog.i18n.DateTimeSymbols_gsw_CH');
goog.provide('goog.i18n.DateTimeSymbols_gsw_FR');
goog.provide('goog.i18n.DateTimeSymbols_gsw_LI');
goog.provide('goog.i18n.DateTimeSymbols_gu_IN');
goog.provide('goog.i18n.DateTimeSymbols_guz');
goog.provide('goog.i18n.DateTimeSymbols_guz_KE');
goog.provide('goog.i18n.DateTimeSymbols_gv');
goog.provide('goog.i18n.DateTimeSymbols_gv_IM');
goog.provide('goog.i18n.DateTimeSymbols_ha');
goog.provide('goog.i18n.DateTimeSymbols_ha_GH');
goog.provide('goog.i18n.DateTimeSymbols_ha_NE');
goog.provide('goog.i18n.DateTimeSymbols_ha_NG');
goog.provide('goog.i18n.DateTimeSymbols_haw_US');
goog.provide('goog.i18n.DateTimeSymbols_he_IL');
goog.provide('goog.i18n.DateTimeSymbols_hi_IN');
goog.provide('goog.i18n.DateTimeSymbols_hr_BA');
goog.provide('goog.i18n.DateTimeSymbols_hr_HR');
goog.provide('goog.i18n.DateTimeSymbols_hsb');
goog.provide('goog.i18n.DateTimeSymbols_hsb_DE');
goog.provide('goog.i18n.DateTimeSymbols_hu_HU');
goog.provide('goog.i18n.DateTimeSymbols_hy_AM');
goog.provide('goog.i18n.DateTimeSymbols_ia');
goog.provide('goog.i18n.DateTimeSymbols_ia_001');
goog.provide('goog.i18n.DateTimeSymbols_id_ID');
goog.provide('goog.i18n.DateTimeSymbols_ig');
goog.provide('goog.i18n.DateTimeSymbols_ig_NG');
goog.provide('goog.i18n.DateTimeSymbols_ii');
goog.provide('goog.i18n.DateTimeSymbols_ii_CN');
goog.provide('goog.i18n.DateTimeSymbols_is_IS');
goog.provide('goog.i18n.DateTimeSymbols_it_CH');
goog.provide('goog.i18n.DateTimeSymbols_it_IT');
goog.provide('goog.i18n.DateTimeSymbols_it_SM');
goog.provide('goog.i18n.DateTimeSymbols_it_VA');
goog.provide('goog.i18n.DateTimeSymbols_ja_JP');
goog.provide('goog.i18n.DateTimeSymbols_jgo');
goog.provide('goog.i18n.DateTimeSymbols_jgo_CM');
goog.provide('goog.i18n.DateTimeSymbols_jmc');
goog.provide('goog.i18n.DateTimeSymbols_jmc_TZ');
goog.provide('goog.i18n.DateTimeSymbols_jv');
goog.provide('goog.i18n.DateTimeSymbols_jv_ID');
goog.provide('goog.i18n.DateTimeSymbols_ka_GE');
goog.provide('goog.i18n.DateTimeSymbols_kab');
goog.provide('goog.i18n.DateTimeSymbols_kab_DZ');
goog.provide('goog.i18n.DateTimeSymbols_kam');
goog.provide('goog.i18n.DateTimeSymbols_kam_KE');
goog.provide('goog.i18n.DateTimeSymbols_kde');
goog.provide('goog.i18n.DateTimeSymbols_kde_TZ');
goog.provide('goog.i18n.DateTimeSymbols_kea');
goog.provide('goog.i18n.DateTimeSymbols_kea_CV');
goog.provide('goog.i18n.DateTimeSymbols_khq');
goog.provide('goog.i18n.DateTimeSymbols_khq_ML');
goog.provide('goog.i18n.DateTimeSymbols_ki');
goog.provide('goog.i18n.DateTimeSymbols_ki_KE');
goog.provide('goog.i18n.DateTimeSymbols_kk_KZ');
goog.provide('goog.i18n.DateTimeSymbols_kkj');
goog.provide('goog.i18n.DateTimeSymbols_kkj_CM');
goog.provide('goog.i18n.DateTimeSymbols_kl');
goog.provide('goog.i18n.DateTimeSymbols_kl_GL');
goog.provide('goog.i18n.DateTimeSymbols_kln');
goog.provide('goog.i18n.DateTimeSymbols_kln_KE');
goog.provide('goog.i18n.DateTimeSymbols_km_KH');
goog.provide('goog.i18n.DateTimeSymbols_kn_IN');
goog.provide('goog.i18n.DateTimeSymbols_ko_KP');
goog.provide('goog.i18n.DateTimeSymbols_ko_KR');
goog.provide('goog.i18n.DateTimeSymbols_kok');
goog.provide('goog.i18n.DateTimeSymbols_kok_IN');
goog.provide('goog.i18n.DateTimeSymbols_ks');
goog.provide('goog.i18n.DateTimeSymbols_ks_IN');
goog.provide('goog.i18n.DateTimeSymbols_ksb');
goog.provide('goog.i18n.DateTimeSymbols_ksb_TZ');
goog.provide('goog.i18n.DateTimeSymbols_ksf');
goog.provide('goog.i18n.DateTimeSymbols_ksf_CM');
goog.provide('goog.i18n.DateTimeSymbols_ksh');
goog.provide('goog.i18n.DateTimeSymbols_ksh_DE');
goog.provide('goog.i18n.DateTimeSymbols_ku');
goog.provide('goog.i18n.DateTimeSymbols_ku_TR');
goog.provide('goog.i18n.DateTimeSymbols_kw');
goog.provide('goog.i18n.DateTimeSymbols_kw_GB');
goog.provide('goog.i18n.DateTimeSymbols_ky_KG');
goog.provide('goog.i18n.DateTimeSymbols_lag');
goog.provide('goog.i18n.DateTimeSymbols_lag_TZ');
goog.provide('goog.i18n.DateTimeSymbols_lb');
goog.provide('goog.i18n.DateTimeSymbols_lb_LU');
goog.provide('goog.i18n.DateTimeSymbols_lg');
goog.provide('goog.i18n.DateTimeSymbols_lg_UG');
goog.provide('goog.i18n.DateTimeSymbols_lkt');
goog.provide('goog.i18n.DateTimeSymbols_lkt_US');
goog.provide('goog.i18n.DateTimeSymbols_ln_AO');
goog.provide('goog.i18n.DateTimeSymbols_ln_CD');
goog.provide('goog.i18n.DateTimeSymbols_ln_CF');
goog.provide('goog.i18n.DateTimeSymbols_ln_CG');
goog.provide('goog.i18n.DateTimeSymbols_lo_LA');
goog.provide('goog.i18n.DateTimeSymbols_lrc');
goog.provide('goog.i18n.DateTimeSymbols_lrc_IQ');
goog.provide('goog.i18n.DateTimeSymbols_lrc_IR');
goog.provide('goog.i18n.DateTimeSymbols_lt_LT');
goog.provide('goog.i18n.DateTimeSymbols_lu');
goog.provide('goog.i18n.DateTimeSymbols_lu_CD');
goog.provide('goog.i18n.DateTimeSymbols_luo');
goog.provide('goog.i18n.DateTimeSymbols_luo_KE');
goog.provide('goog.i18n.DateTimeSymbols_luy');
goog.provide('goog.i18n.DateTimeSymbols_luy_KE');
goog.provide('goog.i18n.DateTimeSymbols_lv_LV');
goog.provide('goog.i18n.DateTimeSymbols_mas');
goog.provide('goog.i18n.DateTimeSymbols_mas_KE');
goog.provide('goog.i18n.DateTimeSymbols_mas_TZ');
goog.provide('goog.i18n.DateTimeSymbols_mer');
goog.provide('goog.i18n.DateTimeSymbols_mer_KE');
goog.provide('goog.i18n.DateTimeSymbols_mfe');
goog.provide('goog.i18n.DateTimeSymbols_mfe_MU');
goog.provide('goog.i18n.DateTimeSymbols_mg');
goog.provide('goog.i18n.DateTimeSymbols_mg_MG');
goog.provide('goog.i18n.DateTimeSymbols_mgh');
goog.provide('goog.i18n.DateTimeSymbols_mgh_MZ');
goog.provide('goog.i18n.DateTimeSymbols_mgo');
goog.provide('goog.i18n.DateTimeSymbols_mgo_CM');
goog.provide('goog.i18n.DateTimeSymbols_mi');
goog.provide('goog.i18n.DateTimeSymbols_mi_NZ');
goog.provide('goog.i18n.DateTimeSymbols_mk_MK');
goog.provide('goog.i18n.DateTimeSymbols_ml_IN');
goog.provide('goog.i18n.DateTimeSymbols_mn_MN');
goog.provide('goog.i18n.DateTimeSymbols_mr_IN');
goog.provide('goog.i18n.DateTimeSymbols_ms_BN');
goog.provide('goog.i18n.DateTimeSymbols_ms_MY');
goog.provide('goog.i18n.DateTimeSymbols_ms_SG');
goog.provide('goog.i18n.DateTimeSymbols_mt_MT');
goog.provide('goog.i18n.DateTimeSymbols_mua');
goog.provide('goog.i18n.DateTimeSymbols_mua_CM');
goog.provide('goog.i18n.DateTimeSymbols_my_MM');
goog.provide('goog.i18n.DateTimeSymbols_mzn');
goog.provide('goog.i18n.DateTimeSymbols_mzn_IR');
goog.provide('goog.i18n.DateTimeSymbols_naq');
goog.provide('goog.i18n.DateTimeSymbols_naq_NA');
goog.provide('goog.i18n.DateTimeSymbols_nb_NO');
goog.provide('goog.i18n.DateTimeSymbols_nb_SJ');
goog.provide('goog.i18n.DateTimeSymbols_nd');
goog.provide('goog.i18n.DateTimeSymbols_nd_ZW');
goog.provide('goog.i18n.DateTimeSymbols_nds');
goog.provide('goog.i18n.DateTimeSymbols_nds_DE');
goog.provide('goog.i18n.DateTimeSymbols_nds_NL');
goog.provide('goog.i18n.DateTimeSymbols_ne_IN');
goog.provide('goog.i18n.DateTimeSymbols_ne_NP');
goog.provide('goog.i18n.DateTimeSymbols_nl_AW');
goog.provide('goog.i18n.DateTimeSymbols_nl_BE');
goog.provide('goog.i18n.DateTimeSymbols_nl_BQ');
goog.provide('goog.i18n.DateTimeSymbols_nl_CW');
goog.provide('goog.i18n.DateTimeSymbols_nl_NL');
goog.provide('goog.i18n.DateTimeSymbols_nl_SR');
goog.provide('goog.i18n.DateTimeSymbols_nl_SX');
goog.provide('goog.i18n.DateTimeSymbols_nmg');
goog.provide('goog.i18n.DateTimeSymbols_nmg_CM');
goog.provide('goog.i18n.DateTimeSymbols_nn');
goog.provide('goog.i18n.DateTimeSymbols_nn_NO');
goog.provide('goog.i18n.DateTimeSymbols_nnh');
goog.provide('goog.i18n.DateTimeSymbols_nnh_CM');
goog.provide('goog.i18n.DateTimeSymbols_nus');
goog.provide('goog.i18n.DateTimeSymbols_nus_SS');
goog.provide('goog.i18n.DateTimeSymbols_nyn');
goog.provide('goog.i18n.DateTimeSymbols_nyn_UG');
goog.provide('goog.i18n.DateTimeSymbols_om');
goog.provide('goog.i18n.DateTimeSymbols_om_ET');
goog.provide('goog.i18n.DateTimeSymbols_om_KE');
goog.provide('goog.i18n.DateTimeSymbols_or_IN');
goog.provide('goog.i18n.DateTimeSymbols_os');
goog.provide('goog.i18n.DateTimeSymbols_os_GE');
goog.provide('goog.i18n.DateTimeSymbols_os_RU');
goog.provide('goog.i18n.DateTimeSymbols_pa_Arab');
goog.provide('goog.i18n.DateTimeSymbols_pa_Arab_PK');
goog.provide('goog.i18n.DateTimeSymbols_pa_Guru');
goog.provide('goog.i18n.DateTimeSymbols_pa_Guru_IN');
goog.provide('goog.i18n.DateTimeSymbols_pl_PL');
goog.provide('goog.i18n.DateTimeSymbols_ps');
goog.provide('goog.i18n.DateTimeSymbols_ps_AF');
goog.provide('goog.i18n.DateTimeSymbols_ps_PK');
goog.provide('goog.i18n.DateTimeSymbols_pt_AO');
goog.provide('goog.i18n.DateTimeSymbols_pt_CH');
goog.provide('goog.i18n.DateTimeSymbols_pt_CV');
goog.provide('goog.i18n.DateTimeSymbols_pt_GQ');
goog.provide('goog.i18n.DateTimeSymbols_pt_GW');
goog.provide('goog.i18n.DateTimeSymbols_pt_LU');
goog.provide('goog.i18n.DateTimeSymbols_pt_MO');
goog.provide('goog.i18n.DateTimeSymbols_pt_MZ');
goog.provide('goog.i18n.DateTimeSymbols_pt_ST');
goog.provide('goog.i18n.DateTimeSymbols_pt_TL');
goog.provide('goog.i18n.DateTimeSymbols_qu');
goog.provide('goog.i18n.DateTimeSymbols_qu_BO');
goog.provide('goog.i18n.DateTimeSymbols_qu_EC');
goog.provide('goog.i18n.DateTimeSymbols_qu_PE');
goog.provide('goog.i18n.DateTimeSymbols_rm');
goog.provide('goog.i18n.DateTimeSymbols_rm_CH');
goog.provide('goog.i18n.DateTimeSymbols_rn');
goog.provide('goog.i18n.DateTimeSymbols_rn_BI');
goog.provide('goog.i18n.DateTimeSymbols_ro_MD');
goog.provide('goog.i18n.DateTimeSymbols_ro_RO');
goog.provide('goog.i18n.DateTimeSymbols_rof');
goog.provide('goog.i18n.DateTimeSymbols_rof_TZ');
goog.provide('goog.i18n.DateTimeSymbols_ru_BY');
goog.provide('goog.i18n.DateTimeSymbols_ru_KG');
goog.provide('goog.i18n.DateTimeSymbols_ru_KZ');
goog.provide('goog.i18n.DateTimeSymbols_ru_MD');
goog.provide('goog.i18n.DateTimeSymbols_ru_RU');
goog.provide('goog.i18n.DateTimeSymbols_ru_UA');
goog.provide('goog.i18n.DateTimeSymbols_rw');
goog.provide('goog.i18n.DateTimeSymbols_rw_RW');
goog.provide('goog.i18n.DateTimeSymbols_rwk');
goog.provide('goog.i18n.DateTimeSymbols_rwk_TZ');
goog.provide('goog.i18n.DateTimeSymbols_sah');
goog.provide('goog.i18n.DateTimeSymbols_sah_RU');
goog.provide('goog.i18n.DateTimeSymbols_saq');
goog.provide('goog.i18n.DateTimeSymbols_saq_KE');
goog.provide('goog.i18n.DateTimeSymbols_sbp');
goog.provide('goog.i18n.DateTimeSymbols_sbp_TZ');
goog.provide('goog.i18n.DateTimeSymbols_sd');
goog.provide('goog.i18n.DateTimeSymbols_sd_PK');
goog.provide('goog.i18n.DateTimeSymbols_se');
goog.provide('goog.i18n.DateTimeSymbols_se_FI');
goog.provide('goog.i18n.DateTimeSymbols_se_NO');
goog.provide('goog.i18n.DateTimeSymbols_se_SE');
goog.provide('goog.i18n.DateTimeSymbols_seh');
goog.provide('goog.i18n.DateTimeSymbols_seh_MZ');
goog.provide('goog.i18n.DateTimeSymbols_ses');
goog.provide('goog.i18n.DateTimeSymbols_ses_ML');
goog.provide('goog.i18n.DateTimeSymbols_sg');
goog.provide('goog.i18n.DateTimeSymbols_sg_CF');
goog.provide('goog.i18n.DateTimeSymbols_shi');
goog.provide('goog.i18n.DateTimeSymbols_shi_Latn');
goog.provide('goog.i18n.DateTimeSymbols_shi_Latn_MA');
goog.provide('goog.i18n.DateTimeSymbols_shi_Tfng');
goog.provide('goog.i18n.DateTimeSymbols_shi_Tfng_MA');
goog.provide('goog.i18n.DateTimeSymbols_si_LK');
goog.provide('goog.i18n.DateTimeSymbols_sk_SK');
goog.provide('goog.i18n.DateTimeSymbols_sl_SI');
goog.provide('goog.i18n.DateTimeSymbols_smn');
goog.provide('goog.i18n.DateTimeSymbols_smn_FI');
goog.provide('goog.i18n.DateTimeSymbols_sn');
goog.provide('goog.i18n.DateTimeSymbols_sn_ZW');
goog.provide('goog.i18n.DateTimeSymbols_so');
goog.provide('goog.i18n.DateTimeSymbols_so_DJ');
goog.provide('goog.i18n.DateTimeSymbols_so_ET');
goog.provide('goog.i18n.DateTimeSymbols_so_KE');
goog.provide('goog.i18n.DateTimeSymbols_so_SO');
goog.provide('goog.i18n.DateTimeSymbols_sq_AL');
goog.provide('goog.i18n.DateTimeSymbols_sq_MK');
goog.provide('goog.i18n.DateTimeSymbols_sq_XK');
goog.provide('goog.i18n.DateTimeSymbols_sr_Cyrl');
goog.provide('goog.i18n.DateTimeSymbols_sr_Cyrl_BA');
goog.provide('goog.i18n.DateTimeSymbols_sr_Cyrl_ME');
goog.provide('goog.i18n.DateTimeSymbols_sr_Cyrl_RS');
goog.provide('goog.i18n.DateTimeSymbols_sr_Cyrl_XK');
goog.provide('goog.i18n.DateTimeSymbols_sr_Latn_BA');
goog.provide('goog.i18n.DateTimeSymbols_sr_Latn_ME');
goog.provide('goog.i18n.DateTimeSymbols_sr_Latn_RS');
goog.provide('goog.i18n.DateTimeSymbols_sr_Latn_XK');
goog.provide('goog.i18n.DateTimeSymbols_sv_AX');
goog.provide('goog.i18n.DateTimeSymbols_sv_FI');
goog.provide('goog.i18n.DateTimeSymbols_sv_SE');
goog.provide('goog.i18n.DateTimeSymbols_sw_CD');
goog.provide('goog.i18n.DateTimeSymbols_sw_KE');
goog.provide('goog.i18n.DateTimeSymbols_sw_TZ');
goog.provide('goog.i18n.DateTimeSymbols_sw_UG');
goog.provide('goog.i18n.DateTimeSymbols_ta_IN');
goog.provide('goog.i18n.DateTimeSymbols_ta_LK');
goog.provide('goog.i18n.DateTimeSymbols_ta_MY');
goog.provide('goog.i18n.DateTimeSymbols_ta_SG');
goog.provide('goog.i18n.DateTimeSymbols_te_IN');
goog.provide('goog.i18n.DateTimeSymbols_teo');
goog.provide('goog.i18n.DateTimeSymbols_teo_KE');
goog.provide('goog.i18n.DateTimeSymbols_teo_UG');
goog.provide('goog.i18n.DateTimeSymbols_tg');
goog.provide('goog.i18n.DateTimeSymbols_tg_TJ');
goog.provide('goog.i18n.DateTimeSymbols_th_TH');
goog.provide('goog.i18n.DateTimeSymbols_ti');
goog.provide('goog.i18n.DateTimeSymbols_ti_ER');
goog.provide('goog.i18n.DateTimeSymbols_ti_ET');
goog.provide('goog.i18n.DateTimeSymbols_tk');
goog.provide('goog.i18n.DateTimeSymbols_tk_TM');
goog.provide('goog.i18n.DateTimeSymbols_to');
goog.provide('goog.i18n.DateTimeSymbols_to_TO');
goog.provide('goog.i18n.DateTimeSymbols_tr_CY');
goog.provide('goog.i18n.DateTimeSymbols_tr_TR');
goog.provide('goog.i18n.DateTimeSymbols_tt');
goog.provide('goog.i18n.DateTimeSymbols_tt_RU');
goog.provide('goog.i18n.DateTimeSymbols_twq');
goog.provide('goog.i18n.DateTimeSymbols_twq_NE');
goog.provide('goog.i18n.DateTimeSymbols_tzm');
goog.provide('goog.i18n.DateTimeSymbols_tzm_MA');
goog.provide('goog.i18n.DateTimeSymbols_ug');
goog.provide('goog.i18n.DateTimeSymbols_ug_CN');
goog.provide('goog.i18n.DateTimeSymbols_uk_UA');
goog.provide('goog.i18n.DateTimeSymbols_ur_IN');
goog.provide('goog.i18n.DateTimeSymbols_ur_PK');
goog.provide('goog.i18n.DateTimeSymbols_uz_Arab');
goog.provide('goog.i18n.DateTimeSymbols_uz_Arab_AF');
goog.provide('goog.i18n.DateTimeSymbols_uz_Cyrl');
goog.provide('goog.i18n.DateTimeSymbols_uz_Cyrl_UZ');
goog.provide('goog.i18n.DateTimeSymbols_uz_Latn');
goog.provide('goog.i18n.DateTimeSymbols_uz_Latn_UZ');
goog.provide('goog.i18n.DateTimeSymbols_vai');
goog.provide('goog.i18n.DateTimeSymbols_vai_Latn');
goog.provide('goog.i18n.DateTimeSymbols_vai_Latn_LR');
goog.provide('goog.i18n.DateTimeSymbols_vai_Vaii');
goog.provide('goog.i18n.DateTimeSymbols_vai_Vaii_LR');
goog.provide('goog.i18n.DateTimeSymbols_vi_VN');
goog.provide('goog.i18n.DateTimeSymbols_vun');
goog.provide('goog.i18n.DateTimeSymbols_vun_TZ');
goog.provide('goog.i18n.DateTimeSymbols_wae');
goog.provide('goog.i18n.DateTimeSymbols_wae_CH');
goog.provide('goog.i18n.DateTimeSymbols_wo');
goog.provide('goog.i18n.DateTimeSymbols_wo_SN');
goog.provide('goog.i18n.DateTimeSymbols_xh');
goog.provide('goog.i18n.DateTimeSymbols_xh_ZA');
goog.provide('goog.i18n.DateTimeSymbols_xog');
goog.provide('goog.i18n.DateTimeSymbols_xog_UG');
goog.provide('goog.i18n.DateTimeSymbols_yav');
goog.provide('goog.i18n.DateTimeSymbols_yav_CM');
goog.provide('goog.i18n.DateTimeSymbols_yi');
goog.provide('goog.i18n.DateTimeSymbols_yi_001');
goog.provide('goog.i18n.DateTimeSymbols_yo');
goog.provide('goog.i18n.DateTimeSymbols_yo_BJ');
goog.provide('goog.i18n.DateTimeSymbols_yo_NG');
goog.provide('goog.i18n.DateTimeSymbols_yue');
goog.provide('goog.i18n.DateTimeSymbols_yue_Hans');
goog.provide('goog.i18n.DateTimeSymbols_yue_Hans_CN');
goog.provide('goog.i18n.DateTimeSymbols_yue_Hant');
goog.provide('goog.i18n.DateTimeSymbols_yue_Hant_HK');
goog.provide('goog.i18n.DateTimeSymbols_zgh');
goog.provide('goog.i18n.DateTimeSymbols_zgh_MA');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hans');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hans_CN');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hans_HK');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hans_MO');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hans_SG');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hant');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hant_HK');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hant_MO');
goog.provide('goog.i18n.DateTimeSymbols_zh_Hant_TW');
goog.provide('goog.i18n.DateTimeSymbols_zu_ZA');
goog.require('goog.i18n.DateTimeSymbols');

/**
 * Date/time formatting symbols for locale af_NA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_af_NA = {
  ERAS: ['v.C.', 'n.C.'],
  ERANAMES: ['voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember'],
  STANDALONEMONTHS: ['Januarie', 'Februarie', 'Maart', 'April', 'Mei', 'Junie', 'Julie', 'Augustus', 'September', 'Oktober', 'November', 'Desember'],
  SHORTMONTHS: ['Jan.', 'Feb.', 'Mrt.', 'Apr.', 'Mei', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Des.'],
  STANDALONESHORTMONTHS: ['Jan.', 'Feb.', 'Mrt.', 'Apr.', 'Mei', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Des.'],
  WEEKDAYS: ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag'],
  STANDALONEWEEKDAYS: ['Sondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrydag', 'Saterdag'],
  SHORTWEEKDAYS: ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.'],
  STANDALONESHORTWEEKDAYS: ['So.', 'Ma.', 'Di.', 'Wo.', 'Do.', 'Vr.', 'Sa.'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'W', 'D', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'W', 'D', 'V', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1ste kwartaal', '2de kwartaal', '3de kwartaal', '4de kwartaal'],
  AMPMS: ['vm.', 'nm.'],
  DATEFORMATS: ['EEEE dd MMMM y', 'dd MMMM y', 'dd MMM y', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale af_ZA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_af_ZA = goog.i18n.DateTimeSymbols_af;


/**
 * Date/time formatting symbols for locale agq.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_agq = {
  ERAS: ['SK', 'BK'],
  ERANAMES: ['Sěe Kɨ̀lesto', 'Bǎa Kɨ̀lesto'],
  NARROWMONTHS: ['n', 'k', 't', 't', 's', 'z', 'k', 'f', 'd', 'l', 'c', 'f'],
  STANDALONENARROWMONTHS: ['n', 'k', 't', 't', 's', 'z', 'k', 'f', 'd', 'l', 'c', 'f'],
  MONTHS: ['ndzɔ̀ŋɔ̀nùm', 'ndzɔ̀ŋɔ̀kƗ̀zùʔ', 'ndzɔ̀ŋɔ̀tƗ̀dʉ̀ghà', 'ndzɔ̀ŋɔ̀tǎafʉ̄ghā', 'ndzɔ̀ŋèsèe', 'ndzɔ̀ŋɔ̀nzùghò', 'ndzɔ̀ŋɔ̀dùmlo', 'ndzɔ̀ŋɔ̀kwîfɔ̀e', 'ndzɔ̀ŋɔ̀tƗ̀fʉ̀ghàdzughù', 'ndzɔ̀ŋɔ̀ghǔuwelɔ̀m', 'ndzɔ̀ŋɔ̀chwaʔàkaa wo', 'ndzɔ̀ŋèfwòo'],
  STANDALONEMONTHS: ['ndzɔ̀ŋɔ̀nùm', 'ndzɔ̀ŋɔ̀kƗ̀zùʔ', 'ndzɔ̀ŋɔ̀tƗ̀dʉ̀ghà', 'ndzɔ̀ŋɔ̀tǎafʉ̄ghā', 'ndzɔ̀ŋèsèe', 'ndzɔ̀ŋɔ̀nzùghò', 'ndzɔ̀ŋɔ̀dùmlo', 'ndzɔ̀ŋɔ̀kwîfɔ̀e', 'ndzɔ̀ŋɔ̀tƗ̀fʉ̀ghàdzughù', 'ndzɔ̀ŋɔ̀ghǔuwelɔ̀m', 'ndzɔ̀ŋɔ̀chwaʔàkaa wo', 'ndzɔ̀ŋèfwòo'],
  SHORTMONTHS: ['nùm', 'kɨz', 'tɨd', 'taa', 'see', 'nzu', 'dum', 'fɔe', 'dzu', 'lɔm', 'kaa', 'fwo'],
  STANDALONESHORTMONTHS: ['nùm', 'kɨz', 'tɨd', 'taa', 'see', 'nzu', 'dum', 'fɔe', 'dzu', 'lɔm', 'kaa', 'fwo'],
  WEEKDAYS: ['tsuʔntsɨ', 'tsuʔukpà', 'tsuʔughɔe', 'tsuʔutɔ̀mlò', 'tsuʔumè', 'tsuʔughɨ̂m', 'tsuʔndzɨkɔʔɔ'],
  STANDALONEWEEKDAYS: ['tsuʔntsɨ', 'tsuʔukpà', 'tsuʔughɔe', 'tsuʔutɔ̀mlò', 'tsuʔumè', 'tsuʔughɨ̂m', 'tsuʔndzɨkɔʔɔ'],
  SHORTWEEKDAYS: ['nts', 'kpa', 'ghɔ', 'tɔm', 'ume', 'ghɨ', 'dzk'],
  STANDALONESHORTWEEKDAYS: ['nts', 'kpa', 'ghɔ', 'tɔm', 'ume', 'ghɨ', 'dzk'],
  NARROWWEEKDAYS: ['n', 'k', 'g', 't', 'u', 'g', 'd'],
  STANDALONENARROWWEEKDAYS: ['n', 'k', 'g', 't', 'u', 'g', 'd'],
  SHORTQUARTERS: ['kɨbâ kɨ 1', 'ugbâ u 2', 'ugbâ u 3', 'ugbâ u 4'],
  QUARTERS: ['kɨbâ kɨ 1', 'ugbâ u 2', 'ugbâ u 3', 'ugbâ u 4'],
  AMPMS: ['a.g', 'a.k'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale agq_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_agq_CM = goog.i18n.DateTimeSymbols_agq;


/**
 * Date/time formatting symbols for locale ak.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ak = {
  ERAS: ['AK', 'KE'],
  ERANAMES: ['Ansa Kristo', 'Kristo Ekyiri'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Sanda-Ɔpɛpɔn', 'Kwakwar-Ɔgyefuo', 'Ebɔw-Ɔbenem', 'Ebɔbira-Oforisuo', 'Esusow Aketseaba-Kɔtɔnimba', 'Obirade-Ayɛwohomumu', 'Ayɛwoho-Kitawonsa', 'Difuu-Ɔsandaa', 'Fankwa-Ɛbɔ', 'Ɔbɛsɛ-Ahinime', 'Ɔberɛfɛw-Obubuo', 'Mumu-Ɔpɛnimba'],
  STANDALONEMONTHS: ['Sanda-Ɔpɛpɔn', 'Kwakwar-Ɔgyefuo', 'Ebɔw-Ɔbenem', 'Ebɔbira-Oforisuo', 'Esusow Aketseaba-Kɔtɔnimba', 'Obirade-Ayɛwohomumu', 'Ayɛwoho-Kitawonsa', 'Difuu-Ɔsandaa', 'Fankwa-Ɛbɔ', 'Ɔbɛsɛ-Ahinime', 'Ɔberɛfɛw-Obubuo', 'Mumu-Ɔpɛnimba'],
  SHORTMONTHS: ['S-Ɔ', 'K-Ɔ', 'E-Ɔ', 'E-O', 'E-K', 'O-A', 'A-K', 'D-Ɔ', 'F-Ɛ', 'Ɔ-A', 'Ɔ-O', 'M-Ɔ'],
  STANDALONESHORTMONTHS: ['S-Ɔ', 'K-Ɔ', 'E-Ɔ', 'E-O', 'E-K', 'O-A', 'A-K', 'D-Ɔ', 'F-Ɛ', 'Ɔ-A', 'Ɔ-O', 'M-Ɔ'],
  WEEKDAYS: ['Kwesida', 'Dwowda', 'Benada', 'Wukuda', 'Yawda', 'Fida', 'Memeneda'],
  STANDALONEWEEKDAYS: ['Kwesida', 'Dwowda', 'Benada', 'Wukuda', 'Yawda', 'Fida', 'Memeneda'],
  SHORTWEEKDAYS: ['Kwe', 'Dwo', 'Ben', 'Wuk', 'Yaw', 'Fia', 'Mem'],
  STANDALONESHORTWEEKDAYS: ['Kwe', 'Dwo', 'Ben', 'Wuk', 'Yaw', 'Fia', 'Mem'],
  NARROWWEEKDAYS: ['K', 'D', 'B', 'W', 'Y', 'F', 'M'],
  STANDALONENARROWWEEKDAYS: ['K', 'D', 'B', 'W', 'Y', 'F', 'M'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AN', 'EW'],
  DATEFORMATS: ['EEEE, y MMMM dd', 'y MMMM d', 'y MMM d', 'yy/MM/dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ak_GH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ak_GH = goog.i18n.DateTimeSymbols_ak;


/**
 * Date/time formatting symbols for locale am_ET.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_am_ET = goog.i18n.DateTimeSymbols_am;


/**
 * Date/time formatting symbols for locale ar_001.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_001 = {
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_AE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_AE = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_BH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_BH = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_DJ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_DJ = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_EH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_EH = {
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_ER.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_ER = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_IL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_IL = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ar_IQ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_IQ = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  STANDALONENARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  MONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONEMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  SHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONESHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_JO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_JO = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  STANDALONENARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  MONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONEMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  SHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONESHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_KM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_KM = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_KW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_KW = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_LB.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_LB = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  STANDALONENARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  MONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONEMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  SHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONESHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_LY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_LY = goog.i18n.DateTimeSymbols_ar;


/**
 * Date/time formatting symbols for locale ar_MA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_MA = {
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'م', 'ن', 'ل', 'غ', 'ش', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'م', 'ن', 'ل', 'غ', 'ش', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_MR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_MR = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'إ', 'و', 'ن', 'ل', 'غ', 'ش', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'إ', 'و', 'ن', 'ل', 'غ', 'ش', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغشت', 'شتمبر', 'أكتوبر', 'نوفمبر', 'دجمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغشت', 'شتمبر', 'أكتوبر', 'نوفمبر', 'دجمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغشت', 'شتمبر', 'أكتوبر', 'نوفمبر', 'دجمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغشت', 'شتمبر', 'أكتوبر', 'نوفمبر', 'دجمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_OM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_OM = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_PS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_PS = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  STANDALONENARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  MONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONEMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  SHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONESHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_QA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_QA = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_SA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_SA = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ar_SD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_SD = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_SO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_SO = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_SS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_SS = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_SY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_SY = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  STANDALONENARROWMONTHS: ['ك', 'ش', 'آ', 'ن', 'أ', 'ح', 'ت', 'آ', 'أ', 'ت', 'ت', 'ك'],
  MONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONEMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  SHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  STANDALONESHORTMONTHS: ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ar_TD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_TD = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_TN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_TN = {
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ج', 'ف', 'م', 'أ', 'م', 'ج', 'ج', 'أ', 'س', 'أ', 'ن', 'د'],
  STANDALONENARROWMONTHS: ['ج', 'ف', 'م', 'أ', 'م', 'ج', 'ج', 'أ', 'س', 'أ', 'ن', 'د'],
  MONTHS: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_XB.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_XB = {
  ERAS: ['؜‮BC‬؜', '؜‮AD‬؜'],
  ERANAMES: ['؜‮Before‬؜ ؜‮Christ‬؜', '؜‮Anno‬؜ ؜‮Domini‬؜'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['؜‮January‬؜', '؜‮February‬؜', '؜‮March‬؜', '؜‮April‬؜', '؜‮May‬؜', '؜‮June‬؜', '؜‮July‬؜', '؜‮August‬؜', '؜‮September‬؜', '؜‮October‬؜', '؜‮November‬؜', '؜‮December‬؜'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['؜‮Jan‬؜', '؜‮Feb‬؜', '؜‮Mar‬؜', '؜‮Apr‬؜', '؜‮May‬؜', '؜‮Jun‬؜', '؜‮Jul‬؜', '؜‮Aug‬؜', '؜‮Sep‬؜', '؜‮Oct‬؜', '؜‮Nov‬؜', '؜‮Dec‬؜'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['؜‮Sunday‬؜', '؜‮Monday‬؜', '؜‮Tuesday‬؜', '؜‮Wednesday‬؜', '؜‮Thursday‬؜', '؜‮Friday‬؜', '؜‮Saturday‬؜'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['؜‮Sun‬؜', '؜‮Mon‬؜', '؜‮Tue‬؜', '؜‮Wed‬؜', '؜‮Thu‬؜', '؜‮Fri‬؜', '؜‮Sat‬؜'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['؜‮Q‬؜1', '؜‮Q‬؜2', '؜‮Q‬؜3', '؜‮Q‬؜4'],
  QUARTERS: ['1؜‮st‬؜ ؜‮quarter‬؜', '2؜‮nd‬؜ ؜‮quarter‬؜', '3؜‮rd‬؜ ؜‮quarter‬؜', '4؜‮th‬؜ ؜‮quarter‬؜'],
  AMPMS: ['؜‮AM‬؜', '؜‮PM‬؜'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'؜‮at‬؜\' {0}', '{1} \'؜‮at‬؜\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ar_YE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ar_YE = {
  ZERODIGIT: 0x0660,
  ERAS: ['ق.م', 'م'],
  ERANAMES: ['قبل الميلاد', 'ميلادي'],
  NARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  STANDALONENARROWMONTHS: ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
  MONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONEMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  SHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  STANDALONESHORTMONTHS: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  WEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONEWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  SHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  STANDALONESHORTWEEKDAYS: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  NARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  STANDALONENARROWWEEKDAYS: ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
  SHORTQUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  QUARTERS: ['الربع الأول', 'الربع الثاني', 'الربع الثالث', 'الربع الرابع'],
  AMPMS: ['ص', 'م'],
  DATEFORMATS: ['EEEE، d MMMM y', 'd MMMM y', 'dd‏/MM‏/y', 'd‏/M‏/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale as.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_as = {
  ZERODIGIT: 0x09E6,
  ERAS: ['খ্ৰীঃ পূঃ', 'খ্ৰীঃ'],
  ERANAMES: ['খ্ৰীষ্টপূৰ্ব', 'খ্ৰীষ্টাব্দ'],
  NARROWMONTHS: ['জ', 'ফ', 'ম', 'এ', 'ম', 'জ', 'জ', 'আ', 'ছ', 'অ', 'ন', 'ড'],
  STANDALONENARROWMONTHS: ['জ', 'ফ', 'ম', 'এ', 'ম', 'জ', 'জ', 'আ', 'ছ', 'অ', 'ন', 'ড'],
  MONTHS: ['জানুৱাৰী', 'ফেব্ৰুৱাৰী', 'মাৰ্চ', 'এপ্ৰিল', 'মে’', 'জুন', 'জুলাই', 'আগষ্ট', 'ছেপ্তেম্বৰ', 'অক্টোবৰ', 'নৱেম্বৰ', 'ডিচেম্বৰ'],
  STANDALONEMONTHS: ['জানুৱাৰী', 'ফেব্ৰুৱাৰী', 'মাৰ্চ', 'এপ্ৰিল', 'মে’', 'জুন', 'জুলাই', 'আগষ্ট', 'ছেপ্তেম্বৰ', 'অক্টোবৰ', 'নৱেম্বৰ', 'ডিচেম্বৰ'],
  SHORTMONTHS: ['জানু', 'ফেব্ৰু', 'মাৰ্চ', 'এপ্ৰিল', 'মে’', 'জুন', 'জুলাই', 'আগ', 'ছেপ্তে', 'অক্টো', 'নৱে', 'ডিচে'],
  STANDALONESHORTMONTHS: ['জানু', 'ফেব্ৰু', 'মাৰ্চ', 'এপ্ৰিল', 'মে’', 'জুন', 'জুলাই', 'আগ', 'ছেপ্তে', 'অক্টো', 'নৱে', 'ডিচে'],
  WEEKDAYS: ['দেওবাৰ', 'সোমবাৰ', 'মঙ্গলবাৰ', 'বুধবাৰ', 'বৃহস্পতিবাৰ', 'শুক্ৰবাৰ', 'শনিবাৰ'],
  STANDALONEWEEKDAYS: ['দেওবাৰ', 'সোমবাৰ', 'মঙ্গলবাৰ', 'বুধবাৰ', 'বৃহস্পতিবাৰ', 'শুক্ৰবাৰ', 'শনিবাৰ'],
  SHORTWEEKDAYS: ['দেও', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্ৰ', 'শনি'],
  STANDALONESHORTWEEKDAYS: ['দেও', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্ৰ', 'শনি'],
  NARROWWEEKDAYS: ['দ', 'স', 'ম', 'ব', 'ব', 'শ', 'শ'],
  STANDALONENARROWWEEKDAYS: ['দ', 'স', 'ম', 'ব', 'ব', 'শ', 'শ'],
  SHORTQUARTERS: ['১মঃ তিঃ', '২য়ঃ তিঃ', '৩য়ঃ তিঃ', '৪ৰ্থঃ তিঃ'],
  QUARTERS: ['প্ৰথম তিনিমাহ', 'দ্বিতীয় তিনিমাহ', 'তৃতীয় তিনিমাহ', 'চতুৰ্থ তিনিমাহ'],
  AMPMS: ['পূৰ্বাহ্ন', 'অপৰাহ্ন'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'dd-MM-y', 'd-M-y'],
  TIMEFORMATS: ['a h.mm.ss zzzz', 'a h.mm.ss z', 'a h.mm.ss', 'a h.mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale as_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_as_IN = goog.i18n.DateTimeSymbols_as;


/**
 * Date/time formatting symbols for locale asa.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_asa = {
  ERAS: ['KM', 'BM'],
  ERANAMES: ['Kabla yakwe Yethu', 'Baada yakwe Yethu'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Dec'],
  WEEKDAYS: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  SHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Ijm', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Ijm', 'Jmo'],
  NARROWWEEKDAYS: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
  STANDALONENARROWWEEKDAYS: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo 1', 'Robo 2', 'Robo 3', 'Robo 4'],
  AMPMS: ['icheheavo', 'ichamthi'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale asa_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_asa_TZ = goog.i18n.DateTimeSymbols_asa;


/**
 * Date/time formatting symbols for locale ast.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ast = {
  ERAS: ['e.C.', 'd.C.'],
  ERANAMES: ['enantes de Cristu', 'después de Cristu'],
  NARROWMONTHS: ['X', 'F', 'M', 'A', 'M', 'X', 'X', 'A', 'S', 'O', 'P', 'A'],
  STANDALONENARROWMONTHS: ['X', 'F', 'M', 'A', 'M', 'X', 'X', 'A', 'S', 'O', 'P', 'A'],
  MONTHS: ['de xineru', 'de febreru', 'de marzu', 'd’abril', 'de mayu', 'de xunu', 'de xunetu', 'd’agostu', 'de setiembre', 'd’ochobre', 'de payares', 'd’avientu'],
  STANDALONEMONTHS: ['xineru', 'febreru', 'marzu', 'abril', 'mayu', 'xunu', 'xunetu', 'agostu', 'setiembre', 'ochobre', 'payares', 'avientu'],
  SHORTMONTHS: ['xin', 'feb', 'mar', 'abr', 'may', 'xun', 'xnt', 'ago', 'set', 'och', 'pay', 'avi'],
  STANDALONESHORTMONTHS: ['Xin', 'Feb', 'Mar', 'Abr', 'May', 'Xun', 'Xnt', 'Ago', 'Set', 'Och', 'Pay', 'Avi'],
  WEEKDAYS: ['domingu', 'llunes', 'martes', 'miércoles', 'xueves', 'vienres', 'sábadu'],
  STANDALONEWEEKDAYS: ['domingu', 'llunes', 'martes', 'miércoles', 'xueves', 'vienres', 'sábadu'],
  SHORTWEEKDAYS: ['dom', 'llu', 'mar', 'mié', 'xue', 'vie', 'sáb'],
  STANDALONESHORTWEEKDAYS: ['dom', 'llu', 'mar', 'mié', 'xue', 'vie', 'sáb'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'X', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'X', 'V', 'S'],
  SHORTQUARTERS: ['1T', '2T', '3T', '4T'],
  QUARTERS: ['1er trimestre', '2u trimestre', '3er trimestre', '4u trimestre'],
  AMPMS: ['de la mañana', 'de la tarde'],
  DATEFORMATS: ['EEEE, d MMMM \'de\' y', 'd MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'a\' \'les\' {0}', '{1} \'a\' \'les\' {0}', '{1}, {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale ast_ES.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ast_ES = goog.i18n.DateTimeSymbols_ast;


/**
 * Date/time formatting symbols for locale az_Cyrl.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_az_Cyrl = {
  ERAS: ['е.ә.', 'ј.е.'],
  ERANAMES: ['ерамыздан әввәл', 'јени ера'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['јанвар', 'феврал', 'март', 'апрел', 'май', 'ијун', 'ијул', 'август', 'сентјабр', 'октјабр', 'нојабр', 'декабр'],
  STANDALONEMONTHS: ['Јанвар', 'Феврал', 'Март', 'Апрел', 'Май', 'Ијун', 'Ијул', 'Август', 'Сентјабр', 'Октјабр', 'Нојабр', 'Декабр'],
  SHORTMONTHS: ['јан', 'фев', 'мар', 'апр', 'май', 'ијн', 'ијл', 'авг', 'сен', 'окт', 'ној', 'дек'],
  STANDALONESHORTMONTHS: ['јан', 'фев', 'мар', 'апр', 'май', 'ијн', 'ијл', 'авг', 'сен', 'окт', 'ној', 'дек'],
  WEEKDAYS: ['базар', 'базар ертәси', 'чәршәнбә ахшамы', 'чәршәнбә', 'ҹүмә ахшамы', 'ҹүмә', 'шәнбә'],
  STANDALONEWEEKDAYS: ['базар', 'базар ертәси', 'чәршәнбә ахшамы', 'чәршәнбә', 'ҹүмә ахшамы', 'ҹүмә', 'шәнбә'],
  SHORTWEEKDAYS: ['Б.', 'Б.Е.', 'Ч.А.', 'Ч.', 'Ҹ.А.', 'Ҹ.', 'Ш.'],
  STANDALONESHORTWEEKDAYS: ['Б.', 'Б.Е.', 'Ч.А.', 'Ч.', 'Ҹ.А.', 'Ҹ.', 'Ш.'],
  NARROWWEEKDAYS: ['7', '1', '2', '3', '4', '5', '6'],
  STANDALONENARROWWEEKDAYS: ['7', '1', '2', '3', '4', '5', '6'],
  SHORTQUARTERS: ['1-ҹи кв.', '2-ҹи кв.', '3-ҹү кв.', '4-ҹү кв.'],
  QUARTERS: ['1-ҹи квартал', '2-ҹи квартал', '3-ҹү квартал', '4-ҹү квартал'],
  AMPMS: ['АМ', 'ПМ'],
  DATEFORMATS: ['d MMMM y, EEEE', 'd MMMM y', 'd MMM y', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale az_Cyrl_AZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_az_Cyrl_AZ = {
  ERAS: ['е.ә.', 'ј.е.'],
  ERANAMES: ['ерамыздан әввәл', 'јени ера'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['јанвар', 'феврал', 'март', 'апрел', 'май', 'ијун', 'ијул', 'август', 'сентјабр', 'октјабр', 'нојабр', 'декабр'],
  STANDALONEMONTHS: ['Јанвар', 'Феврал', 'Март', 'Апрел', 'Май', 'Ијун', 'Ијул', 'Август', 'Сентјабр', 'Октјабр', 'Нојабр', 'Декабр'],
  SHORTMONTHS: ['јан', 'фев', 'мар', 'апр', 'май', 'ијн', 'ијл', 'авг', 'сен', 'окт', 'ној', 'дек'],
  STANDALONESHORTMONTHS: ['јан', 'фев', 'мар', 'апр', 'май', 'ијн', 'ијл', 'авг', 'сен', 'окт', 'ној', 'дек'],
  WEEKDAYS: ['базар', 'базар ертәси', 'чәршәнбә ахшамы', 'чәршәнбә', 'ҹүмә ахшамы', 'ҹүмә', 'шәнбә'],
  STANDALONEWEEKDAYS: ['базар', 'базар ертәси', 'чәршәнбә ахшамы', 'чәршәнбә', 'ҹүмә ахшамы', 'ҹүмә', 'шәнбә'],
  SHORTWEEKDAYS: ['Б.', 'Б.Е.', 'Ч.А.', 'Ч.', 'Ҹ.А.', 'Ҹ.', 'Ш.'],
  STANDALONESHORTWEEKDAYS: ['Б.', 'Б.Е.', 'Ч.А.', 'Ч.', 'Ҹ.А.', 'Ҹ.', 'Ш.'],
  NARROWWEEKDAYS: ['7', '1', '2', '3', '4', '5', '6'],
  STANDALONENARROWWEEKDAYS: ['7', '1', '2', '3', '4', '5', '6'],
  SHORTQUARTERS: ['1-ҹи кв.', '2-ҹи кв.', '3-ҹү кв.', '4-ҹү кв.'],
  QUARTERS: ['1-ҹи квартал', '2-ҹи квартал', '3-ҹү квартал', '4-ҹү квартал'],
  AMPMS: ['АМ', 'ПМ'],
  DATEFORMATS: ['d MMMM y, EEEE', 'd MMMM y', 'd MMM y', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale az_Latn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_az_Latn = goog.i18n.DateTimeSymbols_az;


/**
 * Date/time formatting symbols for locale az_Latn_AZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_az_Latn_AZ = goog.i18n.DateTimeSymbols_az;


/**
 * Date/time formatting symbols for locale bas.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bas = {
  ERAS: ['b.Y.K', 'm.Y.K'],
  ERANAMES: ['bisū bi Yesù Krǐstò', 'i mbūs Yesù Krǐstò'],
  NARROWMONTHS: ['k', 'm', 'm', 'm', 'm', 'h', 'n', 'h', 'd', 'b', 'm', 'l'],
  STANDALONENARROWMONTHS: ['k', 'm', 'm', 'm', 'm', 'h', 'n', 'h', 'd', 'b', 'm', 'l'],
  MONTHS: ['Kɔndɔŋ', 'Màcɛ̂l', 'Màtùmb', 'Màtop', 'M̀puyɛ', 'Hìlòndɛ̀', 'Njèbà', 'Hìkaŋ', 'Dìpɔ̀s', 'Bìòôm', 'Màyɛsèp', 'Lìbuy li ńyèe'],
  STANDALONEMONTHS: ['Kɔndɔŋ', 'Màcɛ̂l', 'Màtùmb', 'Màtop', 'M̀puyɛ', 'Hìlòndɛ̀', 'Njèbà', 'Hìkaŋ', 'Dìpɔ̀s', 'Bìòôm', 'Màyɛsèp', 'Lìbuy li ńyèe'],
  SHORTMONTHS: ['kɔn', 'mac', 'mat', 'mto', 'mpu', 'hil', 'nje', 'hik', 'dip', 'bio', 'may', 'liɓ'],
  STANDALONESHORTMONTHS: ['kɔn', 'mac', 'mat', 'mto', 'mpu', 'hil', 'nje', 'hik', 'dip', 'bio', 'may', 'liɓ'],
  WEEKDAYS: ['ŋgwà nɔ̂y', 'ŋgwà njaŋgumba', 'ŋgwà ûm', 'ŋgwà ŋgê', 'ŋgwà mbɔk', 'ŋgwà kɔɔ', 'ŋgwà jôn'],
  STANDALONEWEEKDAYS: ['ŋgwà nɔ̂y', 'ŋgwà njaŋgumba', 'ŋgwà ûm', 'ŋgwà ŋgê', 'ŋgwà mbɔk', 'ŋgwà kɔɔ', 'ŋgwà jôn'],
  SHORTWEEKDAYS: ['nɔy', 'nja', 'uum', 'ŋge', 'mbɔ', 'kɔɔ', 'jon'],
  STANDALONESHORTWEEKDAYS: ['nɔy', 'nja', 'uum', 'ŋge', 'mbɔ', 'kɔɔ', 'jon'],
  NARROWWEEKDAYS: ['n', 'n', 'u', 'ŋ', 'm', 'k', 'j'],
  STANDALONENARROWWEEKDAYS: ['n', 'n', 'u', 'ŋ', 'm', 'k', 'j'],
  SHORTQUARTERS: ['K1s3', 'K2s3', 'K3s3', 'K4s3'],
  QUARTERS: ['Kèk bisu i soŋ iaâ', 'Kèk i ńyonos biɓaà i soŋ iaâ', 'Kèk i ńyonos biaâ i soŋ iaâ', 'Kèk i ńyonos binâ i soŋ iaâ'],
  AMPMS: ['I bikɛ̂glà', 'I ɓugajɔp'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale bas_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bas_CM = goog.i18n.DateTimeSymbols_bas;


/**
 * Date/time formatting symbols for locale be_BY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_be_BY = goog.i18n.DateTimeSymbols_be;


/**
 * Date/time formatting symbols for locale bem.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bem = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Yesu', 'After Yesu'],
  NARROWMONTHS: ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Machi', 'Epreo', 'Mei', 'Juni', 'Julai', 'Ogasti', 'Septemba', 'Oktoba', 'Novemba', 'Disemba'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Machi', 'Epreo', 'Mei', 'Juni', 'Julai', 'Ogasti', 'Septemba', 'Oktoba', 'Novemba', 'Disemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Epr', 'Mei', 'Jun', 'Jul', 'Oga', 'Sep', 'Okt', 'Nov', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Epr', 'Mei', 'Jun', 'Jul', 'Oga', 'Sep', 'Okt', 'Nov', 'Dis'],
  WEEKDAYS: ['Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano', 'Pachibelushi'],
  STANDALONEWEEKDAYS: ['Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano', 'Pachibelushi'],
  SHORTWEEKDAYS: ['Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano', 'Pachibelushi'],
  STANDALONESHORTWEEKDAYS: ['Pa Mulungu', 'Palichimo', 'Palichibuli', 'Palichitatu', 'Palichine', 'Palichisano', 'Pachibelushi'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['uluchelo', 'akasuba'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale bem_ZM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bem_ZM = goog.i18n.DateTimeSymbols_bem;


/**
 * Date/time formatting symbols for locale bez.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bez = {
  ERAS: ['KM', 'BM'],
  ERANAMES: ['Kabla ya Mtwaa', 'Baada ya Mtwaa'],
  NARROWMONTHS: ['H', 'V', 'D', 'T', 'H', 'S', 'S', 'N', 'T', 'K', 'K', 'K'],
  STANDALONENARROWMONTHS: ['H', 'V', 'D', 'T', 'H', 'S', 'S', 'N', 'T', 'K', 'K', 'K'],
  MONTHS: ['pa mwedzi gwa hutala', 'pa mwedzi gwa wuvili', 'pa mwedzi gwa wudatu', 'pa mwedzi gwa wutai', 'pa mwedzi gwa wuhanu', 'pa mwedzi gwa sita', 'pa mwedzi gwa saba', 'pa mwedzi gwa nane', 'pa mwedzi gwa tisa', 'pa mwedzi gwa kumi', 'pa mwedzi gwa kumi na moja', 'pa mwedzi gwa kumi na mbili'],
  STANDALONEMONTHS: ['pa mwedzi gwa hutala', 'pa mwedzi gwa wuvili', 'pa mwedzi gwa wudatu', 'pa mwedzi gwa wutai', 'pa mwedzi gwa wuhanu', 'pa mwedzi gwa sita', 'pa mwedzi gwa saba', 'pa mwedzi gwa nane', 'pa mwedzi gwa tisa', 'pa mwedzi gwa kumi', 'pa mwedzi gwa kumi na moja', 'pa mwedzi gwa kumi na mbili'],
  SHORTMONTHS: ['Hut', 'Vil', 'Dat', 'Tai', 'Han', 'Sit', 'Sab', 'Nan', 'Tis', 'Kum', 'Kmj', 'Kmb'],
  STANDALONESHORTMONTHS: ['Hut', 'Vil', 'Dat', 'Tai', 'Han', 'Sit', 'Sab', 'Nan', 'Tis', 'Kum', 'Kmj', 'Kmb'],
  WEEKDAYS: ['pa mulungu', 'pa shahuviluha', 'pa hivili', 'pa hidatu', 'pa hitayi', 'pa hihanu', 'pa shahulembela'],
  STANDALONEWEEKDAYS: ['pa mulungu', 'pa shahuviluha', 'pa hivili', 'pa hidatu', 'pa hitayi', 'pa hihanu', 'pa shahulembela'],
  SHORTWEEKDAYS: ['Mul', 'Vil', 'Hiv', 'Hid', 'Hit', 'Hih', 'Lem'],
  STANDALONESHORTWEEKDAYS: ['Mul', 'Vil', 'Hiv', 'Hid', 'Hit', 'Hih', 'Lem'],
  NARROWWEEKDAYS: ['M', 'J', 'H', 'H', 'H', 'W', 'J'],
  STANDALONENARROWWEEKDAYS: ['M', 'J', 'H', 'H', 'H', 'W', 'J'],
  SHORTQUARTERS: ['L1', 'L2', 'L3', 'L4'],
  QUARTERS: ['Lobo 1', 'Lobo 2', 'Lobo 3', 'Lobo 4'],
  AMPMS: ['pamilau', 'pamunyi'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale bez_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bez_TZ = goog.i18n.DateTimeSymbols_bez;


/**
 * Date/time formatting symbols for locale bg_BG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bg_BG = goog.i18n.DateTimeSymbols_bg;


/**
 * Date/time formatting symbols for locale bm.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bm = {
  ERAS: ['J.-C. ɲɛ', 'ni J.-C.'],
  ERANAMES: ['jezu krisiti ɲɛ', 'jezu krisiti minkɛ'],
  NARROWMONTHS: ['Z', 'F', 'M', 'A', 'M', 'Z', 'Z', 'U', 'S', 'Ɔ', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Z', 'F', 'M', 'A', 'M', 'Z', 'Z', 'U', 'S', 'Ɔ', 'N', 'D'],
  MONTHS: ['zanwuye', 'feburuye', 'marisi', 'awirili', 'mɛ', 'zuwɛn', 'zuluye', 'uti', 'sɛtanburu', 'ɔkutɔburu', 'nowanburu', 'desanburu'],
  STANDALONEMONTHS: ['zanwuye', 'feburuye', 'marisi', 'awirili', 'mɛ', 'zuwɛn', 'zuluye', 'uti', 'sɛtanburu', 'ɔkutɔburu', 'nowanburu', 'desanburu'],
  SHORTMONTHS: ['zan', 'feb', 'mar', 'awi', 'mɛ', 'zuw', 'zul', 'uti', 'sɛt', 'ɔku', 'now', 'des'],
  STANDALONESHORTMONTHS: ['zan', 'feb', 'mar', 'awi', 'mɛ', 'zuw', 'zul', 'uti', 'sɛt', 'ɔku', 'now', 'des'],
  WEEKDAYS: ['kari', 'ntɛnɛ', 'tarata', 'araba', 'alamisa', 'juma', 'sibiri'],
  STANDALONEWEEKDAYS: ['kari', 'ntɛnɛ', 'tarata', 'araba', 'alamisa', 'juma', 'sibiri'],
  SHORTWEEKDAYS: ['kar', 'ntɛ', 'tar', 'ara', 'ala', 'jum', 'sib'],
  STANDALONESHORTWEEKDAYS: ['kar', 'ntɛ', 'tar', 'ara', 'ala', 'jum', 'sib'],
  NARROWWEEKDAYS: ['K', 'N', 'T', 'A', 'A', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['K', 'N', 'T', 'A', 'A', 'J', 'S'],
  SHORTQUARTERS: ['KS1', 'KS2', 'KS3', 'KS4'],
  QUARTERS: ['kalo saba fɔlɔ', 'kalo saba filanan', 'kalo saba sabanan', 'kalo saba naaninan'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale bm_ML.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bm_ML = goog.i18n.DateTimeSymbols_bm;


/**
 * Date/time formatting symbols for locale bn_BD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bn_BD = goog.i18n.DateTimeSymbols_bn;


/**
 * Date/time formatting symbols for locale bn_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bn_IN = {
  ZERODIGIT: 0x09E6,
  ERAS: ['খ্রিস্টপূর্ব', 'খৃষ্টাব্দ'],
  ERANAMES: ['খ্রিস্টপূর্ব', 'খ্রীষ্টাব্দ'],
  NARROWMONTHS: ['জা', 'ফে', 'মা', 'এ', 'মে', 'জুন', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'],
  STANDALONENARROWMONTHS: ['জা', 'ফে', 'মা', 'এ', 'মে', 'জুন', 'জু', 'আ', 'সে', 'অ', 'ন', 'ডি'],
  MONTHS: ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  STANDALONEMONTHS: ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  SHORTMONTHS: ['জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  STANDALONESHORTMONTHS: ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
  WEEKDAYS: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
  STANDALONEWEEKDAYS: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
  SHORTWEEKDAYS: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'],
  STANDALONESHORTWEEKDAYS: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'],
  NARROWWEEKDAYS: ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'],
  STANDALONENARROWWEEKDAYS: ['র', 'সো', 'ম', 'বু', 'বৃ', 'শু', 'শ'],
  SHORTQUARTERS: ['ত্রৈমাসিক', 'দ্বিতীয় ত্রৈমাসিক', 'তৃতীয় ত্রৈমাসিক', 'চতুর্থ ত্রৈমাসিক'],
  QUARTERS: ['ত্রৈমাসিক', 'দ্বিতীয় ত্রৈমাসিক', 'তৃতীয় ত্রৈমাসিক', 'চতুর্থ ত্রৈমাসিক'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale bo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bo = {
  ERAS: ['སྤྱི་ལོ་སྔོན་', 'སྤྱི་ལོ་'],
  ERANAMES: ['སྤྱི་ལོ་སྔོན་', 'སྤྱི་ལོ་'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['ཟླ་བ་དང་པོ', 'ཟླ་བ་གཉིས་པ', 'ཟླ་བ་གསུམ་པ', 'ཟླ་བ་བཞི་པ', 'ཟླ་བ་ལྔ་པ', 'ཟླ་བ་དྲུག་པ', 'ཟླ་བ་བདུན་པ', 'ཟླ་བ་བརྒྱད་པ', 'ཟླ་བ་དགུ་པ', 'ཟླ་བ་བཅུ་པ', 'ཟླ་བ་བཅུ་གཅིག་པ', 'ཟླ་བ་བཅུ་གཉིས་པ'],
  STANDALONEMONTHS: ['ཟླ་བ་དང་པོ་', 'ཟླ་བ་གཉིས་པ་', 'ཟླ་བ་གསུམ་པ་', 'ཟླ་བ་བཞི་པ་', 'ཟླ་བ་ལྔ་པ་', 'ཟླ་བ་དྲུག་པ་', 'ཟླ་བ་བདུན་པ་', 'ཟླ་བ་བརྒྱད་པ་', 'ཟླ་བ་དགུ་པ་', 'ཟླ་བ་བཅུ་པ་', 'ཟླ་བ་བཅུ་གཅིག་པ་', 'ཟླ་བ་བཅུ་གཉིས་པ་'],
  SHORTMONTHS: ['ཟླ་༡', 'ཟླ་༢', 'ཟླ་༣', 'ཟླ་༤', 'ཟླ་༥', 'ཟླ་༦', 'ཟླ་༧', 'ཟླ་༨', 'ཟླ་༩', 'ཟླ་༡༠', 'ཟླ་༡༡', 'ཟླ་༡༢'],
  STANDALONESHORTMONTHS: ['ཟླ་༡', 'ཟླ་༢', 'ཟླ་༣', 'ཟླ་༤', 'ཟླ་༥', 'ཟླ་༦', 'ཟླ་༧', 'ཟླ་༨', 'ཟླ་༩', 'ཟླ་༡༠', 'ཟླ་༡༡', 'ཟླ་༡༢'],
  WEEKDAYS: ['གཟའ་ཉི་མ་', 'གཟའ་ཟླ་བ་', 'གཟའ་མིག་དམར་', 'གཟའ་ལྷག་པ་', 'གཟའ་ཕུར་བུ་', 'གཟའ་པ་སངས་', 'གཟའ་སྤེན་པ་'],
  STANDALONEWEEKDAYS: ['གཟའ་ཉི་མ་', 'གཟའ་ཟླ་བ་', 'གཟའ་མིག་དམར་', 'གཟའ་ལྷག་པ་', 'གཟའ་ཕུར་བུ་', 'གཟའ་པ་སངས་', 'གཟའ་སྤེན་པ་'],
  SHORTWEEKDAYS: ['ཉི་མ་', 'ཟླ་བ་', 'མིག་དམར་', 'ལྷག་པ་', 'ཕུར་བུ་', 'པ་སངས་', 'སྤེན་པ་'],
  STANDALONESHORTWEEKDAYS: ['ཉི་མ་', 'ཟླ་བ་', 'མིག་དམར་', 'ལྷག་པ་', 'ཕུར་བུ་', 'པ་སངས་', 'སྤེན་པ་'],
  NARROWWEEKDAYS: ['ཉི', 'ཟླ', 'མིག', 'ལྷག', 'ཕུར', 'སངས', 'སྤེན'],
  STANDALONENARROWWEEKDAYS: ['ཉི', 'ཟླ', 'མིག', 'ལྷག', 'ཕུར', 'སངས', 'སྤེན'],
  SHORTQUARTERS: ['དུས་ཚིགས་དང་པོ།', 'དུས་ཚིགས་གཉིས་པ།', 'དུས་ཚིགས་གསུམ་པ།', 'དུས་ཚིགས་བཞི་པ།'],
  QUARTERS: ['དུས་ཚིགས་དང་པོ།', 'དུས་ཚིགས་གཉིས་པ།', 'དུས་ཚིགས་གསུམ་པ།', 'དུས་ཚིགས་བཞི་པ།'],
  AMPMS: ['སྔ་དྲོ་', 'ཕྱི་དྲོ་'],
  DATEFORMATS: ['y MMMMའི་ཚེས་d, EEEE', 'སྤྱི་ལོ་y MMMMའི་ཚེས་d', 'y ལོའི་MMMཚེས་d', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale bo_CN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bo_CN = goog.i18n.DateTimeSymbols_bo;


/**
 * Date/time formatting symbols for locale bo_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bo_IN = {
  ERAS: ['སྤྱི་ལོ་སྔོན་', 'སྤྱི་ལོ་'],
  ERANAMES: ['སྤྱི་ལོ་སྔོན་', 'སྤྱི་ལོ་'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['ཟླ་བ་དང་པོ', 'ཟླ་བ་གཉིས་པ', 'ཟླ་བ་གསུམ་པ', 'ཟླ་བ་བཞི་པ', 'ཟླ་བ་ལྔ་པ', 'ཟླ་བ་དྲུག་པ', 'ཟླ་བ་བདུན་པ', 'ཟླ་བ་བརྒྱད་པ', 'ཟླ་བ་དགུ་པ', 'ཟླ་བ་བཅུ་པ', 'ཟླ་བ་བཅུ་གཅིག་པ', 'ཟླ་བ་བཅུ་གཉིས་པ'],
  STANDALONEMONTHS: ['ཟླ་བ་དང་པོ་', 'ཟླ་བ་གཉིས་པ་', 'ཟླ་བ་གསུམ་པ་', 'ཟླ་བ་བཞི་པ་', 'ཟླ་བ་ལྔ་པ་', 'ཟླ་བ་དྲུག་པ་', 'ཟླ་བ་བདུན་པ་', 'ཟླ་བ་བརྒྱད་པ་', 'ཟླ་བ་དགུ་པ་', 'ཟླ་བ་བཅུ་པ་', 'ཟླ་བ་བཅུ་གཅིག་པ་', 'ཟླ་བ་བཅུ་གཉིས་པ་'],
  SHORTMONTHS: ['ཟླ་༡', 'ཟླ་༢', 'ཟླ་༣', 'ཟླ་༤', 'ཟླ་༥', 'ཟླ་༦', 'ཟླ་༧', 'ཟླ་༨', 'ཟླ་༩', 'ཟླ་༡༠', 'ཟླ་༡༡', 'ཟླ་༡༢'],
  STANDALONESHORTMONTHS: ['ཟླ་༡', 'ཟླ་༢', 'ཟླ་༣', 'ཟླ་༤', 'ཟླ་༥', 'ཟླ་༦', 'ཟླ་༧', 'ཟླ་༨', 'ཟླ་༩', 'ཟླ་༡༠', 'ཟླ་༡༡', 'ཟླ་༡༢'],
  WEEKDAYS: ['གཟའ་ཉི་མ་', 'གཟའ་ཟླ་བ་', 'གཟའ་མིག་དམར་', 'གཟའ་ལྷག་པ་', 'གཟའ་ཕུར་བུ་', 'གཟའ་པ་སངས་', 'གཟའ་སྤེན་པ་'],
  STANDALONEWEEKDAYS: ['གཟའ་ཉི་མ་', 'གཟའ་ཟླ་བ་', 'གཟའ་མིག་དམར་', 'གཟའ་ལྷག་པ་', 'གཟའ་ཕུར་བུ་', 'གཟའ་པ་སངས་', 'གཟའ་སྤེན་པ་'],
  SHORTWEEKDAYS: ['ཉི་མ་', 'ཟླ་བ་', 'མིག་དམར་', 'ལྷག་པ་', 'ཕུར་བུ་', 'པ་སངས་', 'སྤེན་པ་'],
  STANDALONESHORTWEEKDAYS: ['ཉི་མ་', 'ཟླ་བ་', 'མིག་དམར་', 'ལྷག་པ་', 'ཕུར་བུ་', 'པ་སངས་', 'སྤེན་པ་'],
  NARROWWEEKDAYS: ['ཉི', 'ཟླ', 'མིག', 'ལྷག', 'ཕུར', 'སངས', 'སྤེན'],
  STANDALONENARROWWEEKDAYS: ['ཉི', 'ཟླ', 'མིག', 'ལྷག', 'ཕུར', 'སངས', 'སྤེན'],
  SHORTQUARTERS: ['དུས་ཚིགས་དང་པོ།', 'དུས་ཚིགས་གཉིས་པ།', 'དུས་ཚིགས་གསུམ་པ།', 'དུས་ཚིགས་བཞི་པ།'],
  QUARTERS: ['དུས་ཚིགས་དང་པོ།', 'དུས་ཚིགས་གཉིས་པ།', 'དུས་ཚིགས་གསུམ་པ།', 'དུས་ཚིགས་བཞི་པ།'],
  AMPMS: ['སྔ་དྲོ་', 'ཕྱི་དྲོ་'],
  DATEFORMATS: ['y MMMMའི་ཚེས་d, EEEE', 'སྤྱི་ལོ་y MMMMའི་ཚེས་d', 'y ལོའི་MMMཚེས་d', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale br_FR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_br_FR = goog.i18n.DateTimeSymbols_br;


/**
 * Date/time formatting symbols for locale brx.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_brx = {
  ERAS: ['ईसा.पूर्व', 'सन'],
  ERANAMES: ['ईसा.पूर्व', 'सन'],
  NARROWMONTHS: ['ज', 'फे', 'मा', 'ए', 'मे', 'जु', 'जु', 'आ', 'से', 'अ', 'न', 'दि'],
  STANDALONENARROWMONTHS: ['ज', 'फे', 'मा', 'ए', 'मे', 'जु', 'जु', 'आ', 'से', 'अ', 'न', 'दि'],
  MONTHS: ['जानुवारी', 'फेब्रुवारी', 'मार्स', 'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ', 'सेबथेज्ब़र', 'अखथबर', 'नबेज्ब़र', 'दिसेज्ब़र'],
  STANDALONEMONTHS: ['जानुवारी', 'फेब्रुवारी', 'मार्स', 'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ', 'सेबथेज्ब़र', 'अखथबर', 'नबेज्ब़र', 'दिसेज्ब़र'],
  SHORTMONTHS: ['जानुवारी', 'फेब्रुवारी', 'मार्स', 'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ', 'सेबथेज्ब़र', 'अखथबर', 'नबेज्ब़र', 'दिसेज्ब़र'],
  STANDALONESHORTMONTHS: ['जानुवारी', 'फेब्रुवारी', 'मार्स', 'एफ्रिल', 'मे', 'जुन', 'जुलाइ', 'आगस्थ', 'सेबथेज्ब़र', 'अखथबर', 'नबेज्ब़र', 'दिसेज्ब़र'],
  WEEKDAYS: ['रबिबार', 'समबार', 'मंगलबार', 'बुदबार', 'बिसथिबार', 'सुखुरबार', 'सुनिबार'],
  STANDALONEWEEKDAYS: ['रबिबार', 'समबार', 'मंगलबार', 'बुदबार', 'बिसथिबार', 'सुखुरबार', 'सुनिबार'],
  SHORTWEEKDAYS: ['रबि', 'सम', 'मंगल', 'बुद', 'बिसथि', 'सुखुर', 'सुनि'],
  STANDALONESHORTWEEKDAYS: ['रबि', 'सम', 'मंगल', 'बुद', 'बिसथि', 'सुखुर', 'सुनि'],
  NARROWWEEKDAYS: ['र', 'स', 'मं', 'बु', 'बि', 'सु', 'सु'],
  STANDALONENARROWWEEKDAYS: ['र', 'स', 'मं', 'बु', 'बि', 'सु', 'सु'],
  SHORTQUARTERS: ['सिथासे/खोन्दोसे/बाहागोसे', 'खावसे/खोन्दोनै/बाहागोनै', 'खावथाम/खोन्दोथाम/बाहागोथाम', 'खावब्रै/खोन्दोब्रै/फुरा/आबुं'],
  QUARTERS: ['सिथासे/खोन्दोसे/बाहागोसे', 'खावसे/खोन्दोनै/बाहागोनै', 'खावथाम/खोन्दोथाम/बाहागोथाम', 'खावब्रै/खोन्दोब्रै/फुरा/आबुं'],
  AMPMS: ['फुं', 'बेलासे'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale brx_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_brx_IN = goog.i18n.DateTimeSymbols_brx;


/**
 * Date/time formatting symbols for locale bs_Cyrl.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bs_Cyrl = {
  ERAS: ['п. н. е.', 'н. е.'],
  ERANAMES: ['прије нове ере', 'нове ере'],
  NARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  STANDALONENARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  MONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јуни', 'јули', 'аугуст', 'септембар', 'октобар', 'новембар', 'децембар'],
  STANDALONEMONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јуни', 'јули', 'аугуст', 'септембар', 'октобар', 'новембар', 'децембар'],
  SHORTMONTHS: ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'ауг', 'сеп', 'окт', 'нов', 'дец'],
  STANDALONESHORTMONTHS: ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'ауг', 'сеп', 'окт', 'нов', 'дец'],
  WEEKDAYS: ['недјеља', 'понедјељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
  STANDALONEWEEKDAYS: ['недјеља', 'понедјељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
  SHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
  STANDALONESHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
  NARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  STANDALONENARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  SHORTQUARTERS: ['К1', 'К2', 'К3', 'К4'],
  QUARTERS: ['Прво тромесечје', 'Друго тромесечје', 'Треће тромесечје', 'Четврто тромесечје'],
  AMPMS: ['пре подне', 'поподне'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale bs_Cyrl_BA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bs_Cyrl_BA = {
  ERAS: ['п. н. е.', 'н. е.'],
  ERANAMES: ['прије нове ере', 'нове ере'],
  NARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  STANDALONENARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  MONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јуни', 'јули', 'аугуст', 'септембар', 'октобар', 'новембар', 'децембар'],
  STANDALONEMONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јуни', 'јули', 'аугуст', 'септембар', 'октобар', 'новембар', 'децембар'],
  SHORTMONTHS: ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'ауг', 'сеп', 'окт', 'нов', 'дец'],
  STANDALONESHORTMONTHS: ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'ауг', 'сеп', 'окт', 'нов', 'дец'],
  WEEKDAYS: ['недјеља', 'понедјељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
  STANDALONEWEEKDAYS: ['недјеља', 'понедјељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
  SHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
  STANDALONESHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сри', 'чет', 'пет', 'суб'],
  NARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  STANDALONENARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  SHORTQUARTERS: ['К1', 'К2', 'К3', 'К4'],
  QUARTERS: ['Прво тромесечје', 'Друго тромесечје', 'Треће тромесечје', 'Четврто тромесечје'],
  AMPMS: ['пре подне', 'поподне'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale bs_Latn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bs_Latn = goog.i18n.DateTimeSymbols_bs;


/**
 * Date/time formatting symbols for locale bs_Latn_BA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_bs_Latn_BA = goog.i18n.DateTimeSymbols_bs;


/**
 * Date/time formatting symbols for locale ca_AD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ca_AD = goog.i18n.DateTimeSymbols_ca;


/**
 * Date/time formatting symbols for locale ca_ES.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ca_ES = goog.i18n.DateTimeSymbols_ca;


/**
 * Date/time formatting symbols for locale ca_FR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ca_FR = goog.i18n.DateTimeSymbols_ca;


/**
 * Date/time formatting symbols for locale ca_IT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ca_IT = goog.i18n.DateTimeSymbols_ca;


/**
 * Date/time formatting symbols for locale ccp.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ccp = {
  ERAS: ['𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄴𑄛𑄫𑄢𑄴𑄝𑄧', '𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄛𑄴𑄘𑄧'],
  ERANAMES: ['𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄴𑄛𑄫𑄢𑄴𑄝𑄧', '𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄛𑄴𑄘𑄧'],
  NARROWMONTHS: ['𑄎', '𑄜𑄬', '𑄟', '𑄃𑄬', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪', '𑄃', '𑄥𑄬', '𑄃𑄧', '𑄚𑄧', '𑄓𑄨'],
  STANDALONENARROWMONTHS: ['𑄎', '𑄜𑄬', '𑄟', '𑄃𑄬', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪', '𑄃', '𑄥𑄬', '𑄃𑄧', '𑄚𑄧', '𑄓𑄨'],
  MONTHS: ['𑄎𑄚𑄪𑄠𑄢𑄨', '𑄜𑄬𑄛𑄴𑄝𑄳𑄢𑄪𑄠𑄢𑄨', '𑄟𑄢𑄴𑄌𑄧', '𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪𑄣𑄭', '𑄃𑄉𑄧𑄌𑄴𑄑𑄴', '𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄃𑄧𑄇𑄴𑄑𑄬𑄝𑄧𑄢𑄴', '𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄧𑄢𑄴'],
  STANDALONEMONTHS: ['𑄎𑄚𑄪𑄠𑄢𑄨', '𑄜𑄬𑄛𑄴𑄝𑄳𑄢𑄪𑄠𑄢𑄨', '𑄟𑄢𑄴𑄌𑄧', '𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪𑄣𑄭', '𑄃𑄉𑄧𑄌𑄴𑄑𑄴', '𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄃𑄧𑄇𑄴𑄑𑄮𑄝𑄧𑄢𑄴', '𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄧𑄢𑄴'],
  SHORTMONTHS: ['𑄎𑄚𑄪', '𑄜𑄬𑄛𑄴', '𑄟𑄢𑄴𑄌𑄧', '𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪𑄣𑄭', '𑄃𑄉𑄧𑄌𑄴𑄑𑄴', '𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄃𑄧𑄇𑄴𑄑𑄮𑄝𑄧𑄢𑄴', '𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄢𑄴'],
  STANDALONESHORTMONTHS: ['𑄎𑄚𑄪𑄠𑄢𑄨', '𑄜𑄬𑄛𑄴𑄝𑄳𑄢𑄪𑄠𑄢𑄨', '𑄟𑄢𑄴𑄌𑄧', '𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪𑄣𑄭', '𑄃𑄉𑄧𑄌𑄴𑄑𑄴', '𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄃𑄧𑄇𑄴𑄑𑄮𑄝𑄧𑄢𑄴', '𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄧𑄢𑄴'],
  WEEKDAYS: ['𑄢𑄧𑄝𑄨𑄝𑄢𑄴', '𑄥𑄧𑄟𑄴𑄝𑄢𑄴', '𑄟𑄧𑄁𑄉𑄧𑄣𑄴𑄝𑄢𑄴', '𑄝𑄪𑄖𑄴𑄝𑄢𑄴', '𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴𑄝𑄢𑄴', '𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴𑄝𑄢𑄴', '𑄥𑄧𑄚𑄨𑄝𑄢𑄴'],
  STANDALONEWEEKDAYS: ['𑄢𑄧𑄝𑄨𑄝𑄢𑄴', '𑄥𑄧𑄟𑄴𑄝𑄢𑄴', '𑄟𑄧𑄁𑄉𑄧𑄣𑄴𑄝𑄢𑄴', '𑄝𑄪𑄖𑄴𑄝𑄢𑄴', '𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴𑄝𑄢𑄴', '𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴𑄝𑄢𑄴', '𑄥𑄧𑄚𑄨𑄝𑄢𑄴'],
  SHORTWEEKDAYS: ['𑄢𑄧𑄝𑄨', '𑄥𑄧𑄟𑄴', '𑄟𑄧𑄁𑄉𑄧𑄣𑄴', '𑄝𑄪𑄖𑄴', '𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴', '𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴', '𑄥𑄧𑄚𑄨'],
  STANDALONESHORTWEEKDAYS: ['𑄢𑄧𑄝𑄨', '𑄥𑄧𑄟𑄴', '𑄟𑄧𑄁𑄉𑄧𑄣𑄴', '𑄝𑄪𑄖𑄴', '𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴', '𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴', '𑄥𑄧𑄚𑄨'],
  NARROWWEEKDAYS: ['𑄢𑄧', '𑄥𑄧', '𑄟𑄧', '𑄝𑄪', '𑄝𑄳𑄢𑄨', '𑄥𑄪', '𑄥𑄧'],
  STANDALONENARROWWEEKDAYS: ['𑄢𑄧', '𑄥𑄧', '𑄟𑄧', '𑄝𑄪', '𑄝𑄳𑄢𑄨', '𑄥𑄪', '𑄥𑄧'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['𑄖𑄨𑄚𑄴𑄟𑄎𑄧𑄢𑄴', '𑄘𑄨 𑄛𑄳𑄆𑄘𑄳𑄠𑄬 𑄖𑄨𑄚𑄴𑄟𑄎𑄧𑄢𑄴', '𑄖𑄨𑄚𑄴 𑄛𑄳𑄆𑄘𑄳𑄠𑄬 𑄖𑄨𑄚𑄴𑄟𑄎𑄧𑄢𑄴', '𑄌𑄳𑄆𑄬𑄢𑄴 𑄛𑄳𑄆𑄘𑄳𑄠𑄬 𑄖𑄨𑄚𑄴𑄟𑄎𑄧𑄢𑄴'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ccp_BD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ccp_BD = goog.i18n.DateTimeSymbols_ccp;


/**
 * Date/time formatting symbols for locale ccp_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ccp_IN = {
  ERAS: ['𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄴𑄛𑄫𑄢𑄴𑄝𑄧', '𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄛𑄴𑄘𑄧'],
  ERANAMES: ['𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄴𑄛𑄫𑄢𑄴𑄝𑄧', '𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄛𑄴𑄘𑄧'],
  NARROWMONTHS: ['𑄎', '𑄜𑄬', '𑄟', '𑄃𑄬', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪', '𑄃', '𑄥𑄬', '𑄃𑄧', '𑄚𑄧', '𑄓𑄨'],
  STANDALONENARROWMONTHS: ['𑄎', '𑄜𑄬', '𑄟', '𑄃𑄬', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪', '𑄃', '𑄥𑄬', '𑄃𑄧', '𑄚𑄧', '𑄓𑄨'],
  MONTHS: ['𑄎𑄚𑄪𑄠𑄢𑄨', '𑄜𑄬𑄛𑄴𑄝𑄳𑄢𑄪𑄠𑄢𑄨', '𑄟𑄢𑄴𑄌𑄧', '𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪𑄣𑄭', '𑄃𑄉𑄧𑄌𑄴𑄑𑄴', '𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄃𑄧𑄇𑄴𑄑𑄬𑄝𑄧𑄢𑄴', '𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄧𑄢𑄴'],
  STANDALONEMONTHS: ['𑄎𑄚𑄪𑄠𑄢𑄨', '𑄜𑄬𑄛𑄴𑄝𑄳𑄢𑄪𑄠𑄢𑄨', '𑄟𑄢𑄴𑄌𑄧', '𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪𑄣𑄭', '𑄃𑄉𑄧𑄌𑄴𑄑𑄴', '𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄃𑄧𑄇𑄴𑄑𑄮𑄝𑄧𑄢𑄴', '𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄧𑄢𑄴'],
  SHORTMONTHS: ['𑄎𑄚𑄪', '𑄜𑄬𑄛𑄴', '𑄟𑄢𑄴𑄌𑄧', '𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪𑄣𑄭', '𑄃𑄉𑄧𑄌𑄴𑄑𑄴', '𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄃𑄧𑄇𑄴𑄑𑄮𑄝𑄧𑄢𑄴', '𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄢𑄴'],
  STANDALONESHORTMONTHS: ['𑄎𑄚𑄪𑄠𑄢𑄨', '𑄜𑄬𑄛𑄴𑄝𑄳𑄢𑄪𑄠𑄢𑄨', '𑄟𑄢𑄴𑄌𑄧', '𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴', '𑄟𑄬', '𑄎𑄪𑄚𑄴', '𑄎𑄪𑄣𑄭', '𑄃𑄉𑄧𑄌𑄴𑄑𑄴', '𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄃𑄧𑄇𑄴𑄑𑄮𑄝𑄧𑄢𑄴', '𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴', '𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄧𑄢𑄴'],
  WEEKDAYS: ['𑄢𑄧𑄝𑄨𑄝𑄢𑄴', '𑄥𑄧𑄟𑄴𑄝𑄢𑄴', '𑄟𑄧𑄁𑄉𑄧𑄣𑄴𑄝𑄢𑄴', '𑄝𑄪𑄖𑄴𑄝𑄢𑄴', '𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴𑄝𑄢𑄴', '𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴𑄝𑄢𑄴', '𑄥𑄧𑄚𑄨𑄝𑄢𑄴'],
  STANDALONEWEEKDAYS: ['𑄢𑄧𑄝𑄨𑄝𑄢𑄴', '𑄥𑄧𑄟𑄴𑄝𑄢𑄴', '𑄟𑄧𑄁𑄉𑄧𑄣𑄴𑄝𑄢𑄴', '𑄝𑄪𑄖𑄴𑄝𑄢𑄴', '𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴𑄝𑄢𑄴', '𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴𑄝𑄢𑄴', '𑄥𑄧𑄚𑄨𑄝𑄢𑄴'],
  SHORTWEEKDAYS: ['𑄢𑄧𑄝𑄨', '𑄥𑄧𑄟𑄴', '𑄟𑄧𑄁𑄉𑄧𑄣𑄴', '𑄝𑄪𑄖𑄴', '𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴', '𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴', '𑄥𑄧𑄚𑄨'],
  STANDALONESHORTWEEKDAYS: ['𑄢𑄧𑄝𑄨', '𑄥𑄧𑄟𑄴', '𑄟𑄧𑄁𑄉𑄧𑄣𑄴', '𑄝𑄪𑄖𑄴', '𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴', '𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴', '𑄥𑄧𑄚𑄨'],
  NARROWWEEKDAYS: ['𑄢𑄧', '𑄥𑄧', '𑄟𑄧', '𑄝𑄪', '𑄝𑄳𑄢𑄨', '𑄥𑄪', '𑄥𑄧'],
  STANDALONENARROWWEEKDAYS: ['𑄢𑄧', '𑄥𑄧', '𑄟𑄧', '𑄝𑄪', '𑄝𑄳𑄢𑄨', '𑄥𑄪', '𑄥𑄧'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['𑄖𑄨𑄚𑄴𑄟𑄎𑄧𑄢𑄴', '𑄘𑄨 𑄛𑄳𑄆𑄘𑄳𑄠𑄬 𑄖𑄨𑄚𑄴𑄟𑄎𑄧𑄢𑄴', '𑄖𑄨𑄚𑄴 𑄛𑄳𑄆𑄘𑄳𑄠𑄬 𑄖𑄨𑄚𑄴𑄟𑄎𑄧𑄢𑄴', '𑄌𑄳𑄆𑄬𑄢𑄴 𑄛𑄳𑄆𑄘𑄳𑄠𑄬 𑄖𑄨𑄚𑄴𑄟𑄎𑄧𑄢𑄴'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ce.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ce = {
  ERAS: ['в. э. тӀ. я', 'в. э'],
  ERANAMES: ['Ӏийса пайхамар вина де кхачале', 'Ӏийса пайхамар вина дийнахь дуьйна'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  STANDALONEMONTHS: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  SHORTMONTHS: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  STANDALONESHORTMONTHS: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  WEEKDAYS: ['кӀира', 'оршот', 'шинара', 'кхаара', 'еара', 'пӀераска', 'шуот'],
  STANDALONEWEEKDAYS: ['кӀира', 'оршот', 'шинара', 'кхаара', 'еара', 'пӀераска', 'шуот'],
  SHORTWEEKDAYS: ['кӀи', 'ор', 'ши', 'кха', 'еа', 'пӀе', 'шуо'],
  STANDALONESHORTWEEKDAYS: ['кӀи', 'ор', 'ши', 'кха', 'еа', 'пӀе', 'шуо'],
  NARROWWEEKDAYS: ['кӀи', 'ор', 'ши', 'кха', 'еа', 'пӀе', 'шуо'],
  STANDALONENARROWWEEKDAYS: ['кӀ', 'о', 'ш', 'кх', 'е', 'пӀ', 'ш'],
  SHORTQUARTERS: ['1-гӀа кв.', '2-гӀа кв.', '3-гӀа кв.', '4-гӀа кв.'],
  QUARTERS: ['1-гӀа квартал', '2-гӀа квартал', '3-гӀа квартал', '4-гӀа квартал'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale ce_RU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ce_RU = goog.i18n.DateTimeSymbols_ce;


/**
 * Date/time formatting symbols for locale ceb.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ceb = {
  ERAS: ['WK', 'KP'],
  ERANAMES: ['WK', 'KP'],
  NARROWMONTHS: ['E', 'P', 'M', 'A', 'M', 'H', 'H', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'P', 'M', 'A', 'M', 'H', 'H', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Enero', 'Pebrero', 'Marso', 'April', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  STANDALONEMONTHS: ['Enero', 'Pebrero', 'Marso', 'April', 'Mayo', 'Hunyo', 'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre'],
  SHORTMONTHS: ['En', 'Peb', 'Mar', 'Apr', 'May', 'Hun', 'Hul', 'Ag', 'Set', 'Okt', 'Nob', 'Dis'],
  STANDALONESHORTMONTHS: ['En', 'Peb', 'Mar', 'Apr', 'May', 'Hun', 'Hul', 'Ag', 'Set', 'Okt', 'Nob', 'Dis'],
  WEEKDAYS: ['Domingo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'],
  STANDALONEWEEKDAYS: ['Domingo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'],
  SHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mks', 'Hu', 'Bi', 'Sa'],
  STANDALONESHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mks', 'Hu', 'Bi', 'Sa'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'H', 'B', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'H', 'B', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Una sa matag-tulo ka bulan', 'Ikaduha sa matag-tulo ka bulan', 'Ikatulo sa matag-tulo ka bulan', 'Ikaupat sa matag-tulo ka bulan'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'sa\' {0}', '{1} \'sa\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ceb_PH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ceb_PH = goog.i18n.DateTimeSymbols_ceb;


/**
 * Date/time formatting symbols for locale cgg.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_cgg = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Kurisito Atakaijire', 'Kurisito Yaijire'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Okwokubanza', 'Okwakabiri', 'Okwakashatu', 'Okwakana', 'Okwakataana', 'Okwamukaaga', 'Okwamushanju', 'Okwamunaana', 'Okwamwenda', 'Okwaikumi', 'Okwaikumi na kumwe', 'Okwaikumi na ibiri'],
  STANDALONEMONTHS: ['Okwokubanza', 'Okwakabiri', 'Okwakashatu', 'Okwakana', 'Okwakataana', 'Okwamukaaga', 'Okwamushanju', 'Okwamunaana', 'Okwamwenda', 'Okwaikumi', 'Okwaikumi na kumwe', 'Okwaikumi na ibiri'],
  SHORTMONTHS: ['KBZ', 'KBR', 'KST', 'KKN', 'KTN', 'KMK', 'KMS', 'KMN', 'KMW', 'KKM', 'KNK', 'KNB'],
  STANDALONESHORTMONTHS: ['KBZ', 'KBR', 'KST', 'KKN', 'KTN', 'KMK', 'KMS', 'KMN', 'KMW', 'KKM', 'KNK', 'KNB'],
  WEEKDAYS: ['Sande', 'Orwokubanza', 'Orwakabiri', 'Orwakashatu', 'Orwakana', 'Orwakataano', 'Orwamukaaga'],
  STANDALONEWEEKDAYS: ['Sande', 'Orwokubanza', 'Orwakabiri', 'Orwakashatu', 'Orwakana', 'Orwakataano', 'Orwamukaaga'],
  SHORTWEEKDAYS: ['SAN', 'ORK', 'OKB', 'OKS', 'OKN', 'OKT', 'OMK'],
  STANDALONESHORTWEEKDAYS: ['SAN', 'ORK', 'OKB', 'OKS', 'OKN', 'OKT', 'OMK'],
  NARROWWEEKDAYS: ['S', 'K', 'R', 'S', 'N', 'T', 'M'],
  STANDALONENARROWWEEKDAYS: ['S', 'K', 'R', 'S', 'N', 'T', 'M'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['KWOTA 1', 'KWOTA 2', 'KWOTA 3', 'KWOTA 4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale cgg_UG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_cgg_UG = goog.i18n.DateTimeSymbols_cgg;


/**
 * Date/time formatting symbols for locale chr_US.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_chr_US = goog.i18n.DateTimeSymbols_chr;


/**
 * Date/time formatting symbols for locale ckb.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ckb = {
  ZERODIGIT: 0x0660,
  ERAS: ['پێش زایین', 'زایینی'],
  ERANAMES: ['پێش زایین', 'زایینی'],
  NARROWMONTHS: ['ک', 'ش', 'ئ', 'ن', 'ئ', 'ح', 'ت', 'ئ', 'ئ', 'ت', 'ت', 'ک'],
  STANDALONENARROWMONTHS: ['ک', 'ش', 'ئ', 'ن', 'ئ', 'ح', 'ت', 'ئ', 'ئ', 'ت', 'ت', 'ک'],
  MONTHS: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'],
  STANDALONEMONTHS: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'],
  SHORTMONTHS: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'],
  STANDALONESHORTMONTHS: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'],
  WEEKDAYS: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
  STANDALONEWEEKDAYS: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
  SHORTWEEKDAYS: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
  STANDALONESHORTWEEKDAYS: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
  NARROWWEEKDAYS: ['ی', 'د', 'س', 'چ', 'پ', 'ھ', 'ش'],
  STANDALONENARROWWEEKDAYS: ['ی', 'د', 'س', 'چ', 'پ', 'ھ', 'ش'],
  SHORTQUARTERS: ['چ١', 'چ٢', 'چ٣', 'چ٤'],
  QUARTERS: ['چارەکی یەکەم', 'چارەکی دووەم', 'چارەکی سێەم', 'چارەکی چوارەم'],
  AMPMS: ['ب.ن', 'د.ن'],
  DATEFORMATS: ['y MMMM d, EEEE', 'dی MMMMی y', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ckb_IQ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ckb_IQ = goog.i18n.DateTimeSymbols_ckb;


/**
 * Date/time formatting symbols for locale ckb_IR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ckb_IR = {
  ZERODIGIT: 0x0660,
  ERAS: ['پێش زایین', 'زایینی'],
  ERANAMES: ['پێش زایین', 'زایینی'],
  NARROWMONTHS: ['ک', 'ش', 'ئ', 'ن', 'ئ', 'ح', 'ت', 'ئ', 'ئ', 'ت', 'ت', 'ک'],
  STANDALONENARROWMONTHS: ['ک', 'ش', 'ئ', 'ن', 'ئ', 'ح', 'ت', 'ئ', 'ئ', 'ت', 'ت', 'ک'],
  MONTHS: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'],
  STANDALONEMONTHS: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'],
  SHORTMONTHS: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'],
  STANDALONESHORTMONTHS: ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'],
  WEEKDAYS: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
  STANDALONEWEEKDAYS: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
  SHORTWEEKDAYS: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
  STANDALONESHORTWEEKDAYS: ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'],
  NARROWWEEKDAYS: ['ی', 'د', 'س', 'چ', 'پ', 'ھ', 'ش'],
  STANDALONENARROWWEEKDAYS: ['ی', 'د', 'س', 'چ', 'پ', 'ھ', 'ش'],
  SHORTQUARTERS: ['چ١', 'چ٢', 'چ٣', 'چ٤'],
  QUARTERS: ['چارەکی یەکەم', 'چارەکی دووەم', 'چارەکی سێەم', 'چارەکی چوارەم'],
  AMPMS: ['ب.ن', 'د.ن'],
  DATEFORMATS: ['y MMMM d, EEEE', 'dی MMMMی y', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 4],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale cs_CZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_cs_CZ = goog.i18n.DateTimeSymbols_cs;


/**
 * Date/time formatting symbols for locale cy_GB.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_cy_GB = goog.i18n.DateTimeSymbols_cy;


/**
 * Date/time formatting symbols for locale da_DK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_da_DK = goog.i18n.DateTimeSymbols_da;


/**
 * Date/time formatting symbols for locale da_GL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_da_GL = {
  ERAS: ['f.Kr.', 'e.Kr.'],
  ERANAMES: ['f.Kr.', 'e.Kr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'],
  STANDALONEWEEKDAYS: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'],
  SHORTWEEKDAYS: ['søn.', 'man.', 'tir.', 'ons.', 'tor.', 'fre.', 'lør.'],
  STANDALONESHORTWEEKDAYS: ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  SHORTQUARTERS: ['1. kvt.', '2. kvt.', '3. kvt.', '4. kvt.'],
  QUARTERS: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE \'den\' d. MMMM y', 'd. MMMM y', 'd. MMM y', 'dd.MM.y'],
  TIMEFORMATS: ['HH.mm.ss zzzz', 'HH.mm.ss z', 'HH.mm.ss', 'HH.mm'],
  DATETIMEFORMATS: ['{1} \'kl\'. {0}', '{1} \'kl\'. {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale dav.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dav = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Kristo', 'Baada ya Kristo'],
  NARROWMONTHS: ['I', 'K', 'K', 'K', 'K', 'K', 'M', 'W', 'I', 'I', 'I', 'I'],
  STANDALONENARROWMONTHS: ['I', 'K', 'K', 'K', 'K', 'K', 'M', 'W', 'I', 'I', 'I', 'I'],
  MONTHS: ['Mori ghwa imbiri', 'Mori ghwa kawi', 'Mori ghwa kadadu', 'Mori ghwa kana', 'Mori ghwa kasanu', 'Mori ghwa karandadu', 'Mori ghwa mfungade', 'Mori ghwa wunyanya', 'Mori ghwa ikenda', 'Mori ghwa ikumi', 'Mori ghwa ikumi na imweri', 'Mori ghwa ikumi na iwi'],
  STANDALONEMONTHS: ['Mori ghwa imbiri', 'Mori ghwa kawi', 'Mori ghwa kadadu', 'Mori ghwa kana', 'Mori ghwa kasanu', 'Mori ghwa karandadu', 'Mori ghwa mfungade', 'Mori ghwa wunyanya', 'Mori ghwa ikenda', 'Mori ghwa ikumi', 'Mori ghwa ikumi na imweri', 'Mori ghwa ikumi na iwi'],
  SHORTMONTHS: ['Imb', 'Kaw', 'Kad', 'Kan', 'Kas', 'Kar', 'Mfu', 'Wun', 'Ike', 'Iku', 'Imw', 'Iwi'],
  STANDALONESHORTMONTHS: ['Imb', 'Kaw', 'Kad', 'Kan', 'Kas', 'Kar', 'Mfu', 'Wun', 'Ike', 'Iku', 'Imw', 'Iwi'],
  WEEKDAYS: ['Ituku ja jumwa', 'Kuramuka jimweri', 'Kuramuka kawi', 'Kuramuka kadadu', 'Kuramuka kana', 'Kuramuka kasanu', 'Kifula nguwo'],
  STANDALONEWEEKDAYS: ['Ituku ja jumwa', 'Kuramuka jimweri', 'Kuramuka kawi', 'Kuramuka kadadu', 'Kuramuka kana', 'Kuramuka kasanu', 'Kifula nguwo'],
  SHORTWEEKDAYS: ['Jum', 'Jim', 'Kaw', 'Kad', 'Kan', 'Kas', 'Ngu'],
  STANDALONESHORTWEEKDAYS: ['Jum', 'Jim', 'Kaw', 'Kad', 'Kan', 'Kas', 'Ngu'],
  NARROWWEEKDAYS: ['J', 'J', 'K', 'K', 'K', 'K', 'N'],
  STANDALONENARROWWEEKDAYS: ['J', 'J', 'K', 'K', 'K', 'K', 'N'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Kimu cha imbiri', 'Kimu cha kawi', 'Kimu cha kadadu', 'Kimu cha kana'],
  AMPMS: ['Luma lwa K', 'luma lwa p'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale dav_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dav_KE = goog.i18n.DateTimeSymbols_dav;


/**
 * Date/time formatting symbols for locale de_BE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_de_BE = goog.i18n.DateTimeSymbols_de;


/**
 * Date/time formatting symbols for locale de_DE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_de_DE = goog.i18n.DateTimeSymbols_de;


/**
 * Date/time formatting symbols for locale de_IT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_de_IT = {
  ERAS: ['v. Chr.', 'n. Chr.'],
  ERANAMES: ['v. Chr.', 'n. Chr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  STANDALONEMONTHS: ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  SHORTMONTHS: ['Jän.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
  STANDALONESHORTMONTHS: ['Jän', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  WEEKDAYS: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  STANDALONEWEEKDAYS: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  SHORTWEEKDAYS: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
  STANDALONESHORTWEEKDAYS: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. Quartal', '2. Quartal', '3. Quartal', '4. Quartal'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'dd.MM.y', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'um\' {0}', '{1} \'um\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale de_LI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_de_LI = goog.i18n.DateTimeSymbols_de;


/**
 * Date/time formatting symbols for locale de_LU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_de_LU = goog.i18n.DateTimeSymbols_de;


/**
 * Date/time formatting symbols for locale dje.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dje = {
  ERAS: ['IJ', 'IZ'],
  ERANAMES: ['Isaa jine', 'Isaa zamanoo'],
  NARROWMONTHS: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
  MONTHS: ['Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur', 'Oktoobur', 'Noowanbur', 'Deesanbur'],
  STANDALONEMONTHS: ['Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur', 'Oktoobur', 'Noowanbur', 'Deesanbur'],
  SHORTMONTHS: ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
  STANDALONESHORTMONTHS: ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
  WEEKDAYS: ['Alhadi', 'Atinni', 'Atalaata', 'Alarba', 'Alhamisi', 'Alzuma', 'Asibti'],
  STANDALONEWEEKDAYS: ['Alhadi', 'Atinni', 'Atalaata', 'Alarba', 'Alhamisi', 'Alzuma', 'Asibti'],
  SHORTWEEKDAYS: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
  STANDALONESHORTWEEKDAYS: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
  NARROWWEEKDAYS: ['H', 'T', 'T', 'L', 'M', 'Z', 'S'],
  STANDALONENARROWWEEKDAYS: ['H', 'T', 'T', 'L', 'M', 'Z', 'S'],
  SHORTQUARTERS: ['A1', 'A2', 'A3', 'A4'],
  QUARTERS: ['Arrubu 1', 'Arrubu 2', 'Arrubu 3', 'Arrubu 4'],
  AMPMS: ['Subbaahi', 'Zaarikay b'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale dje_NE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dje_NE = goog.i18n.DateTimeSymbols_dje;


/**
 * Date/time formatting symbols for locale dsb.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dsb = {
  ERAS: ['pś.Chr.n.', 'pó Chr.n.'],
  ERANAMES: ['pśed Kristusowym naroźenim', 'pó Kristusowem naroźenju'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  MONTHS: ['januara', 'februara', 'měrca', 'apryla', 'maja', 'junija', 'julija', 'awgusta', 'septembra', 'oktobra', 'nowembra', 'decembra'],
  STANDALONEMONTHS: ['januar', 'februar', 'měrc', 'apryl', 'maj', 'junij', 'julij', 'awgust', 'september', 'oktober', 'nowember', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'měr.', 'apr.', 'maj.', 'jun.', 'jul.', 'awg.', 'sep.', 'okt.', 'now.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'měr', 'apr', 'maj', 'jun', 'jul', 'awg', 'sep', 'okt', 'now', 'dec'],
  WEEKDAYS: ['njeźela', 'pónjeźele', 'wałtora', 'srjoda', 'stwórtk', 'pětk', 'sobota'],
  STANDALONEWEEKDAYS: ['njeźela', 'pónjeźele', 'wałtora', 'srjoda', 'stwórtk', 'pětk', 'sobota'],
  SHORTWEEKDAYS: ['nje', 'pón', 'wał', 'srj', 'stw', 'pět', 'sob'],
  STANDALONESHORTWEEKDAYS: ['nje', 'pón', 'wał', 'srj', 'stw', 'pět', 'sob'],
  NARROWWEEKDAYS: ['n', 'p', 'w', 's', 's', 'p', 's'],
  STANDALONENARROWWEEKDAYS: ['n', 'p', 'w', 's', 's', 'p', 's'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. kwartal', '2. kwartal', '3. kwartal', '4. kwartal'],
  AMPMS: ['dopołdnja', 'wótpołdnja'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'd.M.y', 'd.M.yy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale dsb_DE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dsb_DE = goog.i18n.DateTimeSymbols_dsb;


/**
 * Date/time formatting symbols for locale dua.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dua = {
  ERAS: ['ɓ.Ys', 'mb.Ys'],
  ERANAMES: ['ɓoso ɓwá yáɓe lá', 'mbúsa kwédi a Yés'],
  NARROWMONTHS: ['d', 'ŋ', 's', 'd', 'e', 'e', 'm', 'd', 'n', 'm', 't', 'e'],
  STANDALONENARROWMONTHS: ['d', 'ŋ', 's', 'd', 'e', 'e', 'm', 'd', 'n', 'm', 't', 'e'],
  MONTHS: ['dimɔ́di', 'ŋgɔndɛ', 'sɔŋɛ', 'diɓáɓá', 'emiasele', 'esɔpɛsɔpɛ', 'madiɓɛ́díɓɛ́', 'diŋgindi', 'nyɛtɛki', 'mayésɛ́', 'tiníní', 'eláŋgɛ́'],
  STANDALONEMONTHS: ['dimɔ́di', 'ŋgɔndɛ', 'sɔŋɛ', 'diɓáɓá', 'emiasele', 'esɔpɛsɔpɛ', 'madiɓɛ́díɓɛ́', 'diŋgindi', 'nyɛtɛki', 'mayésɛ́', 'tiníní', 'eláŋgɛ́'],
  SHORTMONTHS: ['di', 'ŋgɔn', 'sɔŋ', 'diɓ', 'emi', 'esɔ', 'mad', 'diŋ', 'nyɛt', 'may', 'tin', 'elá'],
  STANDALONESHORTMONTHS: ['di', 'ŋgɔn', 'sɔŋ', 'diɓ', 'emi', 'esɔ', 'mad', 'diŋ', 'nyɛt', 'may', 'tin', 'elá'],
  WEEKDAYS: ['éti', 'mɔ́sú', 'kwasú', 'mukɔ́sú', 'ŋgisú', 'ɗónɛsú', 'esaɓasú'],
  STANDALONEWEEKDAYS: ['éti', 'mɔ́sú', 'kwasú', 'mukɔ́sú', 'ŋgisú', 'ɗónɛsú', 'esaɓasú'],
  SHORTWEEKDAYS: ['ét', 'mɔ́s', 'kwa', 'muk', 'ŋgi', 'ɗón', 'esa'],
  STANDALONESHORTWEEKDAYS: ['ét', 'mɔ́s', 'kwa', 'muk', 'ŋgi', 'ɗón', 'esa'],
  NARROWWEEKDAYS: ['e', 'm', 'k', 'm', 'ŋ', 'ɗ', 'e'],
  STANDALONENARROWWEEKDAYS: ['e', 'm', 'k', 'm', 'ŋ', 'ɗ', 'e'],
  SHORTQUARTERS: ['ndu1', 'ndu2', 'ndu3', 'ndu4'],
  QUARTERS: ['ndúmbū nyá ɓosó', 'ndúmbū ní lóndɛ́ íɓaá', 'ndúmbū ní lóndɛ́ ílálo', 'ndúmbū ní lóndɛ́ ínɛ́y'],
  AMPMS: ['idiɓa', 'ebyámu'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale dua_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dua_CM = goog.i18n.DateTimeSymbols_dua;


/**
 * Date/time formatting symbols for locale dyo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dyo = {
  ERAS: ['ArY', 'AtY'],
  ERANAMES: ['Ariŋuu Yeesu', 'Atooŋe Yeesu'],
  NARROWMONTHS: ['S', 'F', 'M', 'A', 'M', 'S', 'S', 'U', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['S', 'F', 'M', 'A', 'M', 'S', 'S', 'U', 'S', 'O', 'N', 'D'],
  MONTHS: ['Sanvie', 'Fébirie', 'Mars', 'Aburil', 'Mee', 'Sueŋ', 'Súuyee', 'Ut', 'Settembar', 'Oktobar', 'Novembar', 'Disambar'],
  STANDALONEMONTHS: ['Sanvie', 'Fébirie', 'Mars', 'Aburil', 'Mee', 'Sueŋ', 'Súuyee', 'Ut', 'Settembar', 'Oktobar', 'Novembar', 'Disambar'],
  SHORTMONTHS: ['Sa', 'Fe', 'Ma', 'Ab', 'Me', 'Su', 'Sú', 'Ut', 'Se', 'Ok', 'No', 'De'],
  STANDALONESHORTMONTHS: ['Sa', 'Fe', 'Ma', 'Ab', 'Me', 'Su', 'Sú', 'Ut', 'Se', 'Ok', 'No', 'De'],
  WEEKDAYS: ['Dimas', 'Teneŋ', 'Talata', 'Alarbay', 'Aramisay', 'Arjuma', 'Sibiti'],
  STANDALONEWEEKDAYS: ['Dimas', 'Teneŋ', 'Talata', 'Alarbay', 'Aramisay', 'Arjuma', 'Sibiti'],
  SHORTWEEKDAYS: ['Dim', 'Ten', 'Tal', 'Ala', 'Ara', 'Arj', 'Sib'],
  STANDALONESHORTWEEKDAYS: ['Dim', 'Ten', 'Tal', 'Ala', 'Ara', 'Arj', 'Sib'],
  NARROWWEEKDAYS: ['D', 'T', 'T', 'A', 'A', 'A', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'T', 'T', 'A', 'A', 'A', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale dyo_SN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dyo_SN = goog.i18n.DateTimeSymbols_dyo;


/**
 * Date/time formatting symbols for locale dz.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dz = {
  ZERODIGIT: 0x0F20,
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['༡', '༢', '༣', '4', '༥', '༦', '༧', '༨', '9', '༡༠', '༡༡', '༡༢'],
  STANDALONENARROWMONTHS: ['༡', '༢', '༣', '༤', '༥', '༦', '༧', '༨', '༩', '༡༠', '༡༡', '༡༢'],
  MONTHS: ['ཟླ་དངཔ་', 'ཟླ་གཉིས་པ་', 'ཟླ་གསུམ་པ་', 'ཟླ་བཞི་པ་', 'ཟླ་ལྔ་པ་', 'ཟླ་དྲུག་པ', 'ཟླ་བདུན་པ་', 'ཟླ་བརྒྱད་པ་', 'ཟླ་དགུ་པ་', 'ཟླ་བཅུ་པ་', 'ཟླ་བཅུ་གཅིག་པ་', 'ཟླ་བཅུ་གཉིས་པ་'],
  STANDALONEMONTHS: ['སྤྱི་ཟླ་དངཔ་', 'སྤྱི་ཟླ་གཉིས་པ་', 'སྤྱི་ཟླ་གསུམ་པ་', 'སྤྱི་ཟླ་བཞི་པ', 'སྤྱི་ཟླ་ལྔ་པ་', 'སྤྱི་ཟླ་དྲུག་པ', 'སྤྱི་ཟླ་བདུན་པ་', 'སྤྱི་ཟླ་བརྒྱད་པ་', 'སྤྱི་ཟླ་དགུ་པ་', 'སྤྱི་ཟླ་བཅུ་པ་', 'སྤྱི་ཟླ་བཅུ་གཅིག་པ་', 'སྤྱི་ཟླ་བཅུ་གཉིས་པ་'],
  SHORTMONTHS: ['༡', '༢', '༣', '༤', '༥', '༦', '༧', '༨', '༩', '༡༠', '༡༡', '12'],
  STANDALONESHORTMONTHS: ['ཟླ་༡', 'ཟླ་༢', 'ཟླ་༣', 'ཟླ་༤', 'ཟླ་༥', 'ཟླ་༦', 'ཟླ་༧', 'ཟླ་༨', 'ཟླ་༩', 'ཟླ་༡༠', 'ཟླ་༡༡', 'ཟླ་༡༢'],
  WEEKDAYS: ['གཟའ་ཟླ་བ་', 'གཟའ་མིག་དམར་', 'གཟའ་ལྷག་པ་', 'གཟའ་ཕུར་བུ་', 'གཟའ་པ་སངས་', 'གཟའ་སྤེན་པ་', 'གཟའ་ཉི་མ་'],
  STANDALONEWEEKDAYS: ['གཟའ་ཟླ་བ་', 'གཟའ་མིག་དམར་', 'གཟའ་ལྷག་པ་', 'གཟའ་ཕུར་བུ་', 'གཟའ་པ་སངས་', 'གཟའ་སྤེན་པ་', 'གཟའ་ཉི་མ་'],
  SHORTWEEKDAYS: ['ཟླ་', 'མིར་', 'ལྷག་', 'ཕུར་', 'སངས་', 'སྤེན་', 'ཉི་'],
  STANDALONESHORTWEEKDAYS: ['ཟླ་', 'མིར་', 'ལྷག་', 'ཕུར་', 'སངས་', 'སྤེན་', 'ཉི་'],
  NARROWWEEKDAYS: ['ཟླ', 'མིར', 'ལྷག', 'ཕུར', 'སངྶ', 'སྤེན', 'ཉི'],
  STANDALONENARROWWEEKDAYS: ['ཟླ', 'མིར', 'ལྷག', 'ཕུར', 'སངྶ', 'སྤེན', 'ཉི'],
  SHORTQUARTERS: ['བཞི་དཔྱ་༡', 'བཞི་དཔྱ་༢', 'བཞི་དཔྱ་༣', 'བཞི་དཔྱ་༤'],
  QUARTERS: ['བཞི་དཔྱ་དང་པ་', 'བཞི་དཔྱ་གཉིས་པ་', 'བཞི་དཔྱ་གསུམ་པ་', 'བཞི་དཔྱ་བཞི་པ་'],
  AMPMS: ['སྔ་ཆ་', 'ཕྱི་ཆ་'],
  DATEFORMATS: ['EEEE, སྤྱི་ལོ་y MMMM ཚེས་dd', 'སྤྱི་ལོ་y MMMM ཚེས་ dd', 'སྤྱི་ལོ་y ཟླ་MMM ཚེས་dd', 'y-MM-dd'],
  TIMEFORMATS: ['ཆུ་ཚོད་ h སྐར་མ་ mm:ss a zzzz', 'ཆུ་ཚོད་ h སྐར་མ་ mm:ss a z', 'ཆུ་ཚོད་h:mm:ss a', 'ཆུ་ཚོད་ h སྐར་མ་ mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale dz_BT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_dz_BT = goog.i18n.DateTimeSymbols_dz;


/**
 * Date/time formatting symbols for locale ebu.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ebu = {
  ERAS: ['MK', 'TK'],
  ERANAMES: ['Mbere ya Kristo', 'Thutha wa Kristo'],
  NARROWMONTHS: ['M', 'K', 'K', 'K', 'G', 'G', 'M', 'K', 'K', 'I', 'I', 'I'],
  STANDALONENARROWMONTHS: ['M', 'K', 'K', 'K', 'G', 'G', 'M', 'K', 'K', 'I', 'I', 'I'],
  MONTHS: ['Mweri wa mbere', 'Mweri wa kaĩri', 'Mweri wa kathatũ', 'Mweri wa kana', 'Mweri wa gatano', 'Mweri wa gatantatũ', 'Mweri wa mũgwanja', 'Mweri wa kanana', 'Mweri wa kenda', 'Mweri wa ikũmi', 'Mweri wa ikũmi na ũmwe', 'Mweri wa ikũmi na Kaĩrĩ'],
  STANDALONEMONTHS: ['Mweri wa mbere', 'Mweri wa kaĩri', 'Mweri wa kathatũ', 'Mweri wa kana', 'Mweri wa gatano', 'Mweri wa gatantatũ', 'Mweri wa mũgwanja', 'Mweri wa kanana', 'Mweri wa kenda', 'Mweri wa ikũmi', 'Mweri wa ikũmi na ũmwe', 'Mweri wa ikũmi na Kaĩrĩ'],
  SHORTMONTHS: ['Mbe', 'Kai', 'Kat', 'Kan', 'Gat', 'Gan', 'Mug', 'Knn', 'Ken', 'Iku', 'Imw', 'Igi'],
  STANDALONESHORTMONTHS: ['Mbe', 'Kai', 'Kat', 'Kan', 'Gat', 'Gan', 'Mug', 'Knn', 'Ken', 'Iku', 'Imw', 'Igi'],
  WEEKDAYS: ['Kiumia', 'Njumatatu', 'Njumaine', 'Njumatano', 'Aramithi', 'Njumaa', 'NJumamothii'],
  STANDALONEWEEKDAYS: ['Kiumia', 'Njumatatu', 'Njumaine', 'Njumatano', 'Aramithi', 'Njumaa', 'NJumamothii'],
  SHORTWEEKDAYS: ['Kma', 'Tat', 'Ine', 'Tan', 'Arm', 'Maa', 'NMM'],
  STANDALONESHORTWEEKDAYS: ['Kma', 'Tat', 'Ine', 'Tan', 'Arm', 'Maa', 'NMM'],
  NARROWWEEKDAYS: ['K', 'N', 'N', 'N', 'A', 'M', 'N'],
  STANDALONENARROWWEEKDAYS: ['K', 'N', 'N', 'N', 'A', 'M', 'N'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Kuota ya mbere', 'Kuota ya Kaĩrĩ', 'Kuota ya kathatu', 'Kuota ya kana'],
  AMPMS: ['KI', 'UT'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ebu_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ebu_KE = goog.i18n.DateTimeSymbols_ebu;


/**
 * Date/time formatting symbols for locale ee.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ee = {
  ERAS: ['HYV', 'Yŋ'],
  ERANAMES: ['Hafi Yesu Va', 'Yesu ŋɔli'],
  NARROWMONTHS: ['d', 'd', 't', 'a', 'd', 'm', 's', 'd', 'a', 'k', 'a', 'd'],
  STANDALONENARROWMONTHS: ['d', 'd', 't', 'a', 'd', 'm', 's', 'd', 'a', 'k', 'a', 'd'],
  MONTHS: ['dzove', 'dzodze', 'tedoxe', 'afɔfĩe', 'dama', 'masa', 'siamlɔm', 'deasiamime', 'anyɔnyɔ', 'kele', 'adeɛmekpɔxe', 'dzome'],
  STANDALONEMONTHS: ['dzove', 'dzodze', 'tedoxe', 'afɔfĩe', 'dama', 'masa', 'siamlɔm', 'deasiamime', 'anyɔnyɔ', 'kele', 'adeɛmekpɔxe', 'dzome'],
  SHORTMONTHS: ['dzv', 'dzd', 'ted', 'afɔ', 'dam', 'mas', 'sia', 'dea', 'any', 'kel', 'ade', 'dzm'],
  STANDALONESHORTMONTHS: ['dzv', 'dzd', 'ted', 'afɔ', 'dam', 'mas', 'sia', 'dea', 'any', 'kel', 'ade', 'dzm'],
  WEEKDAYS: ['kɔsiɖa', 'dzoɖa', 'blaɖa', 'kuɖa', 'yawoɖa', 'fiɖa', 'memleɖa'],
  STANDALONEWEEKDAYS: ['kɔsiɖa', 'dzoɖa', 'blaɖa', 'kuɖa', 'yawoɖa', 'fiɖa', 'memleɖa'],
  SHORTWEEKDAYS: ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
  STANDALONESHORTWEEKDAYS: ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
  NARROWWEEKDAYS: ['k', 'd', 'b', 'k', 'y', 'f', 'm'],
  STANDALONENARROWWEEKDAYS: ['k', 'd', 'b', 'k', 'y', 'f', 'm'],
  SHORTQUARTERS: ['k1', 'k2', 'k3', 'k4'],
  QUARTERS: ['kɔta gbãtɔ', 'kɔta evelia', 'kɔta etɔ̃lia', 'kɔta enelia'],
  AMPMS: ['ŋdi', 'ɣetrɔ'],
  DATEFORMATS: ['EEEE, MMMM d \'lia\' y', 'MMMM d \'lia\' y', 'MMM d \'lia\', y', 'M/d/yy'],
  TIMEFORMATS: ['a \'ga\' h:mm:ss zzzz', 'a \'ga\' h:mm:ss z', 'a \'ga\' h:mm:ss', 'a \'ga\' h:mm'],
  DATETIMEFORMATS: ['{0} {1}', '{0} {1}', '{0} {1}', '{0} {1}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ee_GH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ee_GH = goog.i18n.DateTimeSymbols_ee;


/**
 * Date/time formatting symbols for locale ee_TG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ee_TG = {
  ERAS: ['HYV', 'Yŋ'],
  ERANAMES: ['Hafi Yesu Va', 'Yesu ŋɔli'],
  NARROWMONTHS: ['d', 'd', 't', 'a', 'd', 'm', 's', 'd', 'a', 'k', 'a', 'd'],
  STANDALONENARROWMONTHS: ['d', 'd', 't', 'a', 'd', 'm', 's', 'd', 'a', 'k', 'a', 'd'],
  MONTHS: ['dzove', 'dzodze', 'tedoxe', 'afɔfĩe', 'dama', 'masa', 'siamlɔm', 'deasiamime', 'anyɔnyɔ', 'kele', 'adeɛmekpɔxe', 'dzome'],
  STANDALONEMONTHS: ['dzove', 'dzodze', 'tedoxe', 'afɔfĩe', 'dama', 'masa', 'siamlɔm', 'deasiamime', 'anyɔnyɔ', 'kele', 'adeɛmekpɔxe', 'dzome'],
  SHORTMONTHS: ['dzv', 'dzd', 'ted', 'afɔ', 'dam', 'mas', 'sia', 'dea', 'any', 'kel', 'ade', 'dzm'],
  STANDALONESHORTMONTHS: ['dzv', 'dzd', 'ted', 'afɔ', 'dam', 'mas', 'sia', 'dea', 'any', 'kel', 'ade', 'dzm'],
  WEEKDAYS: ['kɔsiɖa', 'dzoɖa', 'blaɖa', 'kuɖa', 'yawoɖa', 'fiɖa', 'memleɖa'],
  STANDALONEWEEKDAYS: ['kɔsiɖa', 'dzoɖa', 'blaɖa', 'kuɖa', 'yawoɖa', 'fiɖa', 'memleɖa'],
  SHORTWEEKDAYS: ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
  STANDALONESHORTWEEKDAYS: ['kɔs', 'dzo', 'bla', 'kuɖ', 'yaw', 'fiɖ', 'mem'],
  NARROWWEEKDAYS: ['k', 'd', 'b', 'k', 'y', 'f', 'm'],
  STANDALONENARROWWEEKDAYS: ['k', 'd', 'b', 'k', 'y', 'f', 'm'],
  SHORTQUARTERS: ['k1', 'k2', 'k3', 'k4'],
  QUARTERS: ['kɔta gbãtɔ', 'kɔta evelia', 'kɔta etɔ̃lia', 'kɔta enelia'],
  AMPMS: ['ŋdi', 'ɣetrɔ'],
  DATEFORMATS: ['EEEE, MMMM d \'lia\' y', 'MMMM d \'lia\' y', 'MMM d \'lia\', y', 'M/d/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{0} {1}', '{0} {1}', '{0} {1}', '{0} {1}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale el_CY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_el_CY = {
  ERAS: ['π.Χ.', 'μ.Χ.'],
  ERANAMES: ['προ Χριστού', 'μετά Χριστόν'],
  NARROWMONTHS: ['Ι', 'Φ', 'Μ', 'Α', 'Μ', 'Ι', 'Ι', 'Α', 'Σ', 'Ο', 'Ν', 'Δ'],
  STANDALONENARROWMONTHS: ['Ι', 'Φ', 'Μ', 'Α', 'Μ', 'Ι', 'Ι', 'Α', 'Σ', 'Ο', 'Ν', 'Δ'],
  MONTHS: ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου', 'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'],
  STANDALONEMONTHS: ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'],
  SHORTMONTHS: ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'],
  STANDALONESHORTMONTHS: ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'],
  WEEKDAYS: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'],
  STANDALONEWEEKDAYS: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'],
  SHORTWEEKDAYS: ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'],
  STANDALONESHORTWEEKDAYS: ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'],
  NARROWWEEKDAYS: ['Κ', 'Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ'],
  STANDALONENARROWWEEKDAYS: ['Κ', 'Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ'],
  SHORTQUARTERS: ['Τ1', 'Τ2', 'Τ3', 'Τ4'],
  QUARTERS: ['1ο τρίμηνο', '2ο τρίμηνο', '3ο τρίμηνο', '4ο τρίμηνο'],
  AMPMS: ['π.μ.', 'μ.μ.'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} - {0}', '{1} - {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale el_GR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_el_GR = goog.i18n.DateTimeSymbols_el;


/**
 * Date/time formatting symbols for locale en_001.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_001 = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_150.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_150 = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_AE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_AE = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale en_AG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_AG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_AI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_AI = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_AS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_AS = goog.i18n.DateTimeSymbols_en;


/**
 * Date/time formatting symbols for locale en_AT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_AT = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_BB.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_BB = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_BE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_BE = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'dd MMM y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_BI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_BI = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_BM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_BM = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_BS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_BS = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_BW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_BW = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, dd MMMM y', 'dd MMMM y', 'dd MMM y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_BZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_BZ = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, dd MMMM y', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_CC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_CC = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_CH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_CH = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_CK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_CK = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_CM = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_CX.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_CX = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_CY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_CY = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_DE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_DE = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_DG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_DG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_DK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_DK = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH.mm.ss zzzz', 'HH.mm.ss z', 'HH.mm.ss', 'HH.mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_DM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_DM = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_ER.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_ER = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_FI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_FI = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['H.mm.ss zzzz', 'H.mm.ss z', 'H.mm.ss', 'H.mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_FJ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_FJ = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_FK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_FK = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_FM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_FM = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_GD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_GD = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_GG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_GG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_GH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_GH = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_GI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_GI = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_GM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_GM = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_GU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_GU = goog.i18n.DateTimeSymbols_en;


/**
 * Date/time formatting symbols for locale en_GY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_GY = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_HK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_HK = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_IL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_IL = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_IM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_IM = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_IO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_IO = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_JE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_JE = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_JM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_JM = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_KE = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_KI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_KI = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_KN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_KN = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_KY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_KY = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_LC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_LC = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_LR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_LR = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_LS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_LS = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_MG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_MH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MH = goog.i18n.DateTimeSymbols_en;


/**
 * Date/time formatting symbols for locale en_MO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MO = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_MP.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MP = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_MS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MS = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_MT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MT = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'dd MMMM y', 'dd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_MU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MU = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_MW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MW = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_MY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_MY = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_NA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_NA = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_NF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_NF = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_NG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_NG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_NL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_NL = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_NR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_NR = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_NU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_NU = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_NZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_NZ = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd/MM/y', 'd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_PG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_PG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_PH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_PH = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_PK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_PK = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'dd-MMM-y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_PN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_PN = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_PR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_PR = goog.i18n.DateTimeSymbols_en;


/**
 * Date/time formatting symbols for locale en_PW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_PW = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_RW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_RW = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_SB.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SB = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_SC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SC = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_SD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SD = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale en_SE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SE = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale en_SH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SH = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_SI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SI = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_SL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SL = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_SS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SS = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_SX.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SX = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_SZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_SZ = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_TC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_TC = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_TK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_TK = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_TO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_TO = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_TT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_TT = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_TV.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_TV = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_TZ = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_UG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_UG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_UM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_UM = goog.i18n.DateTimeSymbols_en;


/**
 * Date/time formatting symbols for locale en_US_POSIX.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_US_POSIX = goog.i18n.DateTimeSymbols_en;


/**
 * Date/time formatting symbols for locale en_VC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_VC = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_VG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_VG = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_VI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_VI = goog.i18n.DateTimeSymbols_en;


/**
 * Date/time formatting symbols for locale en_VU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_VU = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_WS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_WS = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale en_XA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_XA = {
  ERAS: ['[ƁÇ one]', '[ÅÐ one]'],
  ERANAMES: ['[Ɓéƒöŕé Çĥŕîšţ one two]', '[Åññö Ðöɱîñî one two]'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['[Ĵåñûåŕý one]', '[Ƒéƀŕûåŕý one]', '[Ṁåŕçĥ one]', '[Åþŕîļ one]', '[Ṁåý one]', '[Ĵûñé one]', '[Ĵûļý one]', '[Åûĝûšţ one]', '[Šéþţéɱƀéŕ one two]', '[Öçţöƀéŕ one]', '[Ñöṽéɱƀéŕ one]', '[Ðéçéɱƀéŕ one]'],
  STANDALONEMONTHS: ['[Ĵåñûåŕý one]', '[Ƒéƀŕûåŕý one]', '[Ṁåŕçĥ one]', '[Åþŕîļ one]', '[Ṁåý one]', '[Ĵûñé one]', '[Ĵûļý one]', '[Åûĝûšţ one]', '[Šéþţéɱƀéŕ one two]', '[Öçţöƀéŕ one]', '[Ñöṽéɱƀéŕ one]', '[Ðéçéɱƀéŕ one]'],
  SHORTMONTHS: ['[Ĵåñ one]', '[Ƒéƀ one]', '[Ṁåŕ one]', '[Åþŕ one]', '[Ṁåý one]', '[Ĵûñ one]', '[Ĵûļ one]', '[Åûĝ one]', '[Šéþ one]', '[Öçţ one]', '[Ñöṽ one]', '[Ðéç one]'],
  STANDALONESHORTMONTHS: ['[Ĵåñ one]', '[Ƒéƀ one]', '[Ṁåŕ one]', '[Åþŕ one]', '[Ṁåý one]', '[Ĵûñ one]', '[Ĵûļ one]', '[Åûĝ one]', '[Šéþ one]', '[Öçţ one]', '[Ñöṽ one]', '[Ðéç one]'],
  WEEKDAYS: ['[Šûñðåý one]', '[Ṁöñðåý one]', '[Ţûéšðåý one]', '[Ŵéðñéšðåý one two]', '[Ţĥûŕšðåý one]', '[Ƒŕîðåý one]', '[Šåţûŕðåý one]'],
  STANDALONEWEEKDAYS: ['[Šûñðåý one]', '[Ṁöñðåý one]', '[Ţûéšðåý one]', '[Ŵéðñéšðåý one two]', '[Ţĥûŕšðåý one]', '[Ƒŕîðåý one]', '[Šåţûŕðåý one]'],
  SHORTWEEKDAYS: ['[Šûñ one]', '[Ṁöñ one]', '[Ţûé one]', '[Ŵéð one]', '[Ţĥû one]', '[Ƒŕî one]', '[Šåţ one]'],
  STANDALONESHORTWEEKDAYS: ['[Šûñ one]', '[Ṁöñ one]', '[Ţûé one]', '[Ŵéð one]', '[Ţĥû one]', '[Ƒŕî one]', '[Šåţ one]'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['[Ǫ① one]', '[Ǫ② one]', '[Ǫ③ one]', '[Ǫ④ one]'],
  QUARTERS: ['[①šţ ǫûåŕţéŕ one two]', '[②ñð ǫûåŕţéŕ one two]', '[③ŕð ǫûåŕţéŕ one two]', '[④ţĥ ǫûåŕţéŕ one two]'],
  AMPMS: ['[ÅṀ one]', '[ÞṀ one]'],
  DATEFORMATS: ['[EEEE, MMMM d, y]', '[MMMM d, y]', '[MMM d, y]', '[M/d/yy]'],
  TIMEFORMATS: ['[h:mm:ss a zzzz]', '[h:mm:ss a z]', '[h:mm:ss a]', '[h:mm a]'],
  DATETIMEFORMATS: ['[{1} \'åţ\' {0} \'one\']', '[{1} \'åţ\' {0} \'one\']', '[{1}, {0}]', '[{1}, {0}]'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_ZM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_ZM = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale en_ZW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_en_ZW = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Before Christ', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, dd MMMM y', 'dd MMMM y', 'dd MMM,y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'at\' {0}', '{1} \'at\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale eo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_eo = {
  ERAS: ['aK', 'pK'],
  ERANAMES: ['aK', 'pK'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['januaro', 'februaro', 'marto', 'aprilo', 'majo', 'junio', 'julio', 'aŭgusto', 'septembro', 'oktobro', 'novembro', 'decembro'],
  STANDALONEMONTHS: ['januaro', 'februaro', 'marto', 'aprilo', 'majo', 'junio', 'julio', 'aŭgusto', 'septembro', 'oktobro', 'novembro', 'decembro'],
  SHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aŭg', 'sep', 'okt', 'nov', 'dec'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aŭg', 'sep', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['dimanĉo', 'lundo', 'mardo', 'merkredo', 'ĵaŭdo', 'vendredo', 'sabato'],
  STANDALONEWEEKDAYS: ['dimanĉo', 'lundo', 'mardo', 'merkredo', 'ĵaŭdo', 'vendredo', 'sabato'],
  SHORTWEEKDAYS: ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa'],
  STANDALONESHORTWEEKDAYS: ['di', 'lu', 'ma', 'me', 'ĵa', 've', 'sa'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['atm', 'ptm'],
  DATEFORMATS: ['EEEE, d-\'a\' \'de\' MMMM y', 'y-MMMM-dd', 'y-MMM-dd', 'yy-MM-dd'],
  TIMEFORMATS: ['H-\'a\' \'horo\' \'kaj\' m:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale eo_001.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_eo_001 = goog.i18n.DateTimeSymbols_eo;


/**
 * Date/time formatting symbols for locale es_AR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_AR = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.er trimestre', '2.º trimestre', '3.er trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_BO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_BO = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM \'de\' y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_BR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_BR = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_BZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_BZ = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_CL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_CL = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd-MM-y', 'dd-MM-yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_CO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_CO = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd/MM/y', 'd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_CR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_CR = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_CU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_CU = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_DO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_DO = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_EA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_EA = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.er trimestre', '2.º trimestre', '3.er trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['H:mm:ss (zzzz)', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_EC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_EC = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_GQ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_GQ = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.er trimestre', '2.º trimestre', '3.er trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['H:mm:ss (zzzz)', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_GT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_GT = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd/MM/y', 'd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_HN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_HN = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE dd \'de\' MMMM \'de\' y', 'dd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_IC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_IC = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.er trimestre', '2.º trimestre', '3.er trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['H:mm:ss (zzzz)', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_NI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_NI = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_PA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_PA = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er. trimestre', '2do. trimestre', '3er. trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'MM/dd/y', 'MM/dd/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_PE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_PE = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'set.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Oct.', 'Nov.', 'Dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_PH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_PH = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.er trimestre', '2.º trimestre', '3.er trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_PR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_PR = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'MM/dd/y', 'MM/dd/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_PY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_PY = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_SV.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_SV = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale es_UY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_UY = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'set.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Set.', 'Oct.', 'Nov.', 'Dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale es_VE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_es_VE = {
  ERAS: ['a. C.', 'd. C.'],
  ERANAMES: ['antes de Cristo', 'después de Cristo'],
  NARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  STANDALONEMONTHS: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  SHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  STANDALONESHORTMONTHS: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
  WEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  SHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  STANDALONESHORTWEEKDAYS: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2do trimestre', '3er trimestre', '4to trimestre'],
  AMPMS: ['a. m.', 'p. m.'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale et_EE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_et_EE = goog.i18n.DateTimeSymbols_et;


/**
 * Date/time formatting symbols for locale eu_ES.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_eu_ES = goog.i18n.DateTimeSymbols_eu;


/**
 * Date/time formatting symbols for locale ewo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ewo = {
  ERAS: ['oyk', 'ayk'],
  ERANAMES: ['osúsúa Yésus kiri', 'ámvus Yésus Kirís'],
  NARROWMONTHS: ['o', 'b', 'l', 'n', 't', 's', 'z', 'm', 'e', 'a', 'd', 'b'],
  STANDALONENARROWMONTHS: ['o', 'b', 'l', 'n', 't', 's', 'z', 'm', 'e', 'a', 'd', 'b'],
  MONTHS: ['ngɔn osú', 'ngɔn bɛ̌', 'ngɔn lála', 'ngɔn nyina', 'ngɔn tána', 'ngɔn saməna', 'ngɔn zamgbála', 'ngɔn mwom', 'ngɔn ebulú', 'ngɔn awóm', 'ngɔn awóm ai dziá', 'ngɔn awóm ai bɛ̌'],
  STANDALONEMONTHS: ['ngɔn osú', 'ngɔn bɛ̌', 'ngɔn lála', 'ngɔn nyina', 'ngɔn tána', 'ngɔn saməna', 'ngɔn zamgbála', 'ngɔn mwom', 'ngɔn ebulú', 'ngɔn awóm', 'ngɔn awóm ai dziá', 'ngɔn awóm ai bɛ̌'],
  SHORTMONTHS: ['ngo', 'ngb', 'ngl', 'ngn', 'ngt', 'ngs', 'ngz', 'ngm', 'nge', 'nga', 'ngad', 'ngab'],
  STANDALONESHORTMONTHS: ['ngo', 'ngb', 'ngl', 'ngn', 'ngt', 'ngs', 'ngz', 'ngm', 'nge', 'nga', 'ngad', 'ngab'],
  WEEKDAYS: ['sɔ́ndɔ', 'mɔ́ndi', 'sɔ́ndɔ məlú mə́bɛ̌', 'sɔ́ndɔ məlú mə́lɛ́', 'sɔ́ndɔ məlú mə́nyi', 'fúladé', 'séradé'],
  STANDALONEWEEKDAYS: ['sɔ́ndɔ', 'mɔ́ndi', 'sɔ́ndɔ məlú mə́bɛ̌', 'sɔ́ndɔ məlú mə́lɛ́', 'sɔ́ndɔ məlú mə́nyi', 'fúladé', 'séradé'],
  SHORTWEEKDAYS: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'fúl', 'sér'],
  STANDALONESHORTWEEKDAYS: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'fúl', 'sér'],
  NARROWWEEKDAYS: ['s', 'm', 's', 's', 's', 'f', 's'],
  STANDALONENARROWWEEKDAYS: ['s', 'm', 's', 's', 's', 'f', 's'],
  SHORTQUARTERS: ['nno', 'nnb', 'nnl', 'nnny'],
  QUARTERS: ['nsámbá ngɔn asú', 'nsámbá ngɔn bɛ̌', 'nsámbá ngɔn lála', 'nsámbá ngɔn nyina'],
  AMPMS: ['kíkíríg', 'ngəgógəle'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ewo_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ewo_CM = goog.i18n.DateTimeSymbols_ewo;


/**
 * Date/time formatting symbols for locale fa_AF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fa_AF = {
  ZERODIGIT: 0x06F0,
  ERAS: ['ق.م.', 'م.'],
  ERANAMES: ['قبل از میلاد', 'میلادی'],
  NARROWMONTHS: ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'ا', 'ن', 'د'],
  STANDALONENARROWMONTHS: ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'ا', 'ن', 'د'],
  MONTHS: ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنو', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جول', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسم'],
  STANDALONESHORTMONTHS: ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  WEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  STANDALONEWEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  SHORTWEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  STANDALONESHORTWEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  NARROWWEEKDAYS: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
  STANDALONENARROWWEEKDAYS: ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
  SHORTQUARTERS: ['ر۱', 'ر۲', 'ر۳', 'ر۴'],
  QUARTERS: ['ربع اول', 'ربع دوم', 'ربع سوم', 'ربع چهارم'],
  AMPMS: ['قبل‌ازظهر', 'بعدازظهر'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'y/M/d'],
  TIMEFORMATS: ['H:mm:ss (zzzz)', 'H:mm:ss (z)', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1}، ساعت {0}', '{1}، ساعت {0}', '{1}،‏ {0}', '{1}،‏ {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [3, 4],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale fa_IR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fa_IR = goog.i18n.DateTimeSymbols_fa;


/**
 * Date/time formatting symbols for locale ff.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff = {
  ERAS: ['H-I', 'C-I'],
  ERANAMES: ['Hade Iisa', 'Caggal Iisa'],
  NARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  STANDALONENARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  MONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  STANDALONEMONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  SHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  STANDALONESHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  WEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  STANDALONEWEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  SHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  STANDALONESHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  NARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  STANDALONENARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Termes 1', 'Termes 2', 'Termes 3', 'Termes 4'],
  AMPMS: ['subaka', 'kikiiɗe'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ff_Latn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn = goog.i18n.DateTimeSymbols_ff;


/**
 * Date/time formatting symbols for locale ff_Latn_BF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_BF = goog.i18n.DateTimeSymbols_ff;


/**
 * Date/time formatting symbols for locale ff_Latn_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_CM = goog.i18n.DateTimeSymbols_ff;


/**
 * Date/time formatting symbols for locale ff_Latn_GH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_GH = {
  ERAS: ['H-I', 'C-I'],
  ERANAMES: ['Hade Iisa', 'Caggal Iisa'],
  NARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  STANDALONENARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  MONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  STANDALONEMONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  SHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  STANDALONESHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  WEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  STANDALONEWEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  SHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  STANDALONESHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  NARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  STANDALONENARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Termes 1', 'Termes 2', 'Termes 3', 'Termes 4'],
  AMPMS: ['subaka', 'kikiiɗe'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ff_Latn_GM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_GM = {
  ERAS: ['H-I', 'C-I'],
  ERANAMES: ['Hade Iisa', 'Caggal Iisa'],
  NARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  STANDALONENARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  MONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  STANDALONEMONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  SHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  STANDALONESHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  WEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  STANDALONEWEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  SHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  STANDALONESHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  NARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  STANDALONENARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Termes 1', 'Termes 2', 'Termes 3', 'Termes 4'],
  AMPMS: ['subaka', 'kikiiɗe'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ff_Latn_GN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_GN = goog.i18n.DateTimeSymbols_ff;


/**
 * Date/time formatting symbols for locale ff_Latn_GW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_GW = goog.i18n.DateTimeSymbols_ff;


/**
 * Date/time formatting symbols for locale ff_Latn_LR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_LR = {
  ERAS: ['H-I', 'C-I'],
  ERANAMES: ['Hade Iisa', 'Caggal Iisa'],
  NARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  STANDALONENARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  MONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  STANDALONEMONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  SHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  STANDALONESHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  WEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  STANDALONEWEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  SHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  STANDALONESHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  NARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  STANDALONENARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Termes 1', 'Termes 2', 'Termes 3', 'Termes 4'],
  AMPMS: ['subaka', 'kikiiɗe'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ff_Latn_MR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_MR = {
  ERAS: ['H-I', 'C-I'],
  ERANAMES: ['Hade Iisa', 'Caggal Iisa'],
  NARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  STANDALONENARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  MONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  STANDALONEMONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  SHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  STANDALONESHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  WEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  STANDALONEWEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  SHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  STANDALONESHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  NARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  STANDALONENARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Termes 1', 'Termes 2', 'Termes 3', 'Termes 4'],
  AMPMS: ['subaka', 'kikiiɗe'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ff_Latn_NE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_NE = goog.i18n.DateTimeSymbols_ff;


/**
 * Date/time formatting symbols for locale ff_Latn_NG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_NG = goog.i18n.DateTimeSymbols_ff;


/**
 * Date/time formatting symbols for locale ff_Latn_SL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_SL = {
  ERAS: ['H-I', 'C-I'],
  ERANAMES: ['Hade Iisa', 'Caggal Iisa'],
  NARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  STANDALONENARROWMONTHS: ['s', 'c', 'm', 's', 'd', 'k', 'm', 'j', 's', 'y', 'j', 'b'],
  MONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  STANDALONEMONTHS: ['siilo', 'colte', 'mbooy', 'seeɗto', 'duujal', 'korse', 'morso', 'juko', 'siilto', 'yarkomaa', 'jolal', 'bowte'],
  SHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  STANDALONESHORTMONTHS: ['sii', 'col', 'mbo', 'see', 'duu', 'kor', 'mor', 'juk', 'slt', 'yar', 'jol', 'bow'],
  WEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  STANDALONEWEEKDAYS: ['dewo', 'aaɓnde', 'mawbaare', 'njeslaare', 'naasaande', 'mawnde', 'hoore-biir'],
  SHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  STANDALONESHORTWEEKDAYS: ['dew', 'aaɓ', 'maw', 'nje', 'naa', 'mwd', 'hbi'],
  NARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  STANDALONENARROWWEEKDAYS: ['d', 'a', 'm', 'n', 'n', 'm', 'h'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Termes 1', 'Termes 2', 'Termes 3', 'Termes 4'],
  AMPMS: ['subaka', 'kikiiɗe'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ff_Latn_SN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ff_Latn_SN = goog.i18n.DateTimeSymbols_ff;


/**
 * Date/time formatting symbols for locale fi_FI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fi_FI = goog.i18n.DateTimeSymbols_fi;


/**
 * Date/time formatting symbols for locale fil_PH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fil_PH = goog.i18n.DateTimeSymbols_fil;


/**
 * Date/time formatting symbols for locale fo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fo = {
  ERAS: ['f.Kr.', 'e.Kr.'],
  ERANAMES: ['fyri Krist', 'eftir Krist'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januar', 'februar', 'mars', 'apríl', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'],
  STANDALONEMONTHS: ['januar', 'februar', 'mars', 'apríl', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'],
  SHORTMONTHS: ['jan.', 'feb.', 'mar.', 'apr.', 'mai', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
  WEEKDAYS: ['sunnudagur', 'mánadagur', 'týsdagur', 'mikudagur', 'hósdagur', 'fríggjadagur', 'leygardagur'],
  STANDALONEWEEKDAYS: ['sunnudagur', 'mánadagur', 'týsdagur', 'mikudagur', 'hósdagur', 'fríggjadagur', 'leygardagur'],
  SHORTWEEKDAYS: ['sun.', 'mán.', 'týs.', 'mik.', 'hós.', 'frí.', 'ley.'],
  STANDALONESHORTWEEKDAYS: ['sun', 'mán', 'týs', 'mik', 'hós', 'frí', 'ley'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'M', 'H', 'F', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'M', 'H', 'F', 'L'],
  SHORTQUARTERS: ['1. ársfj.', '2. ársfj.', '3. ársfj.', '4. ársfj.'],
  QUARTERS: ['1. ársfjórðingur', '2. ársfjórðingur', '3. ársfjórðingur', '4. ársfjórðingur'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'dd.MM.y', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'kl\'. {0}', '{1} \'kl\'. {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale fo_DK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fo_DK = goog.i18n.DateTimeSymbols_fo;


/**
 * Date/time formatting symbols for locale fo_FO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fo_FO = goog.i18n.DateTimeSymbols_fo;


/**
 * Date/time formatting symbols for locale fr_BE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_BE = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/MM/yy'],
  TIMEFORMATS: ['H \'h\' mm \'min\' ss \'s\' zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale fr_BF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_BF = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_BI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_BI = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_BJ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_BJ = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_BL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_BL = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_CD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_CD = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_CF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_CF = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_CG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_CG = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_CH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_CH = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd.MM.yy'],
  TIMEFORMATS: ['HH.mm:ss \'h\' zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale fr_CI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_CI = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_CM = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['matin', 'soir'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_DJ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_DJ = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale fr_DZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_DZ = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale fr_FR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_FR = goog.i18n.DateTimeSymbols_fr;


/**
 * Date/time formatting symbols for locale fr_GA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_GA = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_GF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_GF = goog.i18n.DateTimeSymbols_fr;


/**
 * Date/time formatting symbols for locale fr_GN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_GN = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_GP.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_GP = goog.i18n.DateTimeSymbols_fr;


/**
 * Date/time formatting symbols for locale fr_GQ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_GQ = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_HT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_HT = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_KM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_KM = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_LU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_LU = goog.i18n.DateTimeSymbols_fr;


/**
 * Date/time formatting symbols for locale fr_MA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_MA = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'jui.', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['jan.', 'fév.', 'mar.', 'avr.', 'mai', 'jui.', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_MC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_MC = goog.i18n.DateTimeSymbols_fr;


/**
 * Date/time formatting symbols for locale fr_MF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_MF = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_MG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_MG = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_ML.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_ML = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['le 1er trimestre', 'le 2ème trimestre', 'le 3ème trimestre', 'le 4ème trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_MQ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_MQ = goog.i18n.DateTimeSymbols_fr;


/**
 * Date/time formatting symbols for locale fr_MR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_MR = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_MU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_MU = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_NC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_NC = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_NE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_NE = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_PF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_PF = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_PM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_PM = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_RE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_RE = goog.i18n.DateTimeSymbols_fr;


/**
 * Date/time formatting symbols for locale fr_RW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_RW = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_SC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_SC = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_SN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_SN = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_SY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_SY = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale fr_TD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_TD = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_TG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_TG = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_TN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_TN = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_VU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_VU = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_WF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_WF = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fr_YT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fr_YT = {
  ERAS: ['av. J.-C.', 'ap. J.-C.'],
  ERANAMES: ['avant Jésus-Christ', 'après Jésus-Christ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  STANDALONEMONTHS: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  SHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  STANDALONESHORTMONTHS: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  WEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  STANDALONEWEEKDAYS: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  SHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  STANDALONESHORTWEEKDAYS: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1er trimestre', '2e trimestre', '3e trimestre', '4e trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'à\' {0}', '{1} \'à\' {0}', '{1} \'à\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale fur.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fur = {
  ERAS: ['pdC', 'ddC'],
  ERANAMES: ['pdC', 'ddC'],
  NARROWMONTHS: ['Z', 'F', 'M', 'A', 'M', 'J', 'L', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Z', 'F', 'M', 'A', 'M', 'J', 'L', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Zenâr', 'Fevrâr', 'Març', 'Avrîl', 'Mai', 'Jugn', 'Lui', 'Avost', 'Setembar', 'Otubar', 'Novembar', 'Dicembar'],
  STANDALONEMONTHS: ['Zenâr', 'Fevrâr', 'Març', 'Avrîl', 'Mai', 'Jugn', 'Lui', 'Avost', 'Setembar', 'Otubar', 'Novembar', 'Dicembar'],
  SHORTMONTHS: ['Zen', 'Fev', 'Mar', 'Avr', 'Mai', 'Jug', 'Lui', 'Avo', 'Set', 'Otu', 'Nov', 'Dic'],
  STANDALONESHORTMONTHS: ['Zen', 'Fev', 'Mar', 'Avr', 'Mai', 'Jug', 'Lui', 'Avo', 'Set', 'Otu', 'Nov', 'Dic'],
  WEEKDAYS: ['domenie', 'lunis', 'martars', 'miercus', 'joibe', 'vinars', 'sabide'],
  STANDALONEWEEKDAYS: ['domenie', 'lunis', 'martars', 'miercus', 'joibe', 'vinars', 'sabide'],
  SHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mie', 'joi', 'vin', 'sab'],
  STANDALONESHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mie', 'joi', 'vin', 'sab'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Prin trimestri', 'Secont trimestri', 'Tierç trimestri', 'Cuart trimestri'],
  AMPMS: ['a.', 'p.'],
  DATEFORMATS: ['EEEE d \'di\' MMMM \'dal\' y', 'd \'di\' MMMM \'dal\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale fur_IT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fur_IT = goog.i18n.DateTimeSymbols_fur;


/**
 * Date/time formatting symbols for locale fy.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fy = {
  ERAS: ['f.Kr.', 'n.Kr.'],
  ERANAMES: ['Foar Kristus', 'nei Kristus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Jannewaris', 'Febrewaris', 'Maart', 'April', 'Maaie', 'Juny', 'July', 'Augustus', 'Septimber', 'Oktober', 'Novimber', 'Desimber'],
  STANDALONEMONTHS: ['Jannewaris', 'Febrewaris', 'Maart', 'April', 'Maaie', 'Juny', 'July', 'Augustus', 'Septimber', 'Oktober', 'Novimber', 'Desimber'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['snein', 'moandei', 'tiisdei', 'woansdei', 'tongersdei', 'freed', 'sneon'],
  STANDALONEWEEKDAYS: ['snein', 'moandei', 'tiisdei', 'woansdei', 'tongersdei', 'freed', 'sneon'],
  SHORTWEEKDAYS: ['si', 'mo', 'ti', 'wo', 'to', 'fr', 'so'],
  STANDALONESHORTWEEKDAYS: ['si', 'mo', 'ti', 'wo', 'to', 'fr', 'so'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1e fearnsjier', '2e fearnsjier', '3e fearnsjier', '4e fearnsjier'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'om\' {0}', '{1} \'om\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale fy_NL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_fy_NL = goog.i18n.DateTimeSymbols_fy;


/**
 * Date/time formatting symbols for locale ga_IE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ga_IE = goog.i18n.DateTimeSymbols_ga;


/**
 * Date/time formatting symbols for locale gd.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gd = {
  ERAS: ['RC', 'AD'],
  ERANAMES: ['Ro Chrìosta', 'An dèidh Chrìosta'],
  NARROWMONTHS: ['F', 'G', 'M', 'G', 'C', 'Ò', 'I', 'L', 'S', 'D', 'S', 'D'],
  STANDALONENARROWMONTHS: ['F', 'G', 'M', 'G', 'C', 'Ò', 'I', 'L', 'S', 'D', 'S', 'D'],
  MONTHS: ['dhen Fhaoilleach', 'dhen Ghearran', 'dhen Mhàrt', 'dhen Ghiblean', 'dhen Chèitean', 'dhen Ògmhios', 'dhen Iuchar', 'dhen Lùnastal', 'dhen t-Sultain', 'dhen Dàmhair', 'dhen t-Samhain', 'dhen Dùbhlachd'],
  STANDALONEMONTHS: ['Am Faoilleach', 'An Gearran', 'Am Màrt', 'An Giblean', 'An Cèitean', 'An t-Ògmhios', 'An t-Iuchar', 'An Lùnastal', 'An t-Sultain', 'An Dàmhair', 'An t-Samhain', 'An Dùbhlachd'],
  SHORTMONTHS: ['Faoi', 'Gearr', 'Màrt', 'Gibl', 'Cèit', 'Ògmh', 'Iuch', 'Lùna', 'Sult', 'Dàmh', 'Samh', 'Dùbh'],
  STANDALONESHORTMONTHS: ['Faoi', 'Gearr', 'Màrt', 'Gibl', 'Cèit', 'Ògmh', 'Iuch', 'Lùna', 'Sult', 'Dàmh', 'Samh', 'Dùbh'],
  WEEKDAYS: ['DiDòmhnaich', 'DiLuain', 'DiMàirt', 'DiCiadain', 'DiarDaoin', 'DihAoine', 'DiSathairne'],
  STANDALONEWEEKDAYS: ['DiDòmhnaich', 'DiLuain', 'DiMàirt', 'DiCiadain', 'DiarDaoin', 'DihAoine', 'DiSathairne'],
  SHORTWEEKDAYS: ['DiD', 'DiL', 'DiM', 'DiC', 'Dia', 'Dih', 'DiS'],
  STANDALONESHORTWEEKDAYS: ['DiD', 'DiL', 'DiM', 'DiC', 'Dia', 'Dih', 'DiS'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'C', 'A', 'H', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'C', 'A', 'H', 'S'],
  SHORTQUARTERS: ['C1', 'C2', 'C3', 'C4'],
  QUARTERS: ['1d chairteal', '2na cairteal', '3s cairteal', '4mh cairteal'],
  AMPMS: ['m', 'f'],
  DATEFORMATS: ['EEEE, d\'mh\' MMMM y', 'd\'mh\' MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale gd_GB.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gd_GB = goog.i18n.DateTimeSymbols_gd;


/**
 * Date/time formatting symbols for locale gl_ES.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gl_ES = goog.i18n.DateTimeSymbols_gl;


/**
 * Date/time formatting symbols for locale gsw_CH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gsw_CH = goog.i18n.DateTimeSymbols_gsw;


/**
 * Date/time formatting symbols for locale gsw_FR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gsw_FR = goog.i18n.DateTimeSymbols_gsw;


/**
 * Date/time formatting symbols for locale gsw_LI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gsw_LI = goog.i18n.DateTimeSymbols_gsw;


/**
 * Date/time formatting symbols for locale gu_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gu_IN = goog.i18n.DateTimeSymbols_gu;


/**
 * Date/time formatting symbols for locale guz.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_guz = {
  ERAS: ['YA', 'YK'],
  ERANAMES: ['Yeso ataiborwa', 'Yeso kaiboirwe'],
  NARROWMONTHS: ['C', 'F', 'M', 'A', 'M', 'J', 'C', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['C', 'F', 'M', 'A', 'M', 'J', 'C', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Chanuari', 'Feburari', 'Machi', 'Apiriri', 'Mei', 'Juni', 'Chulai', 'Agosti', 'Septemba', 'Okitoba', 'Nobemba', 'Disemba'],
  STANDALONEMONTHS: ['Chanuari', 'Feburari', 'Machi', 'Apiriri', 'Mei', 'Juni', 'Chulai', 'Agosti', 'Septemba', 'Okitoba', 'Nobemba', 'Disemba'],
  SHORTMONTHS: ['Can', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Cul', 'Agt', 'Sep', 'Okt', 'Nob', 'Dis'],
  STANDALONESHORTMONTHS: ['Can', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Cul', 'Agt', 'Sep', 'Okt', 'Nob', 'Dis'],
  WEEKDAYS: ['Chumapiri', 'Chumatato', 'Chumaine', 'Chumatano', 'Aramisi', 'Ichuma', 'Esabato'],
  STANDALONEWEEKDAYS: ['Chumapiri', 'Chumatato', 'Chumaine', 'Chumatano', 'Aramisi', 'Ichuma', 'Esabato'],
  SHORTWEEKDAYS: ['Cpr', 'Ctt', 'Cmn', 'Cmt', 'Ars', 'Icm', 'Est'],
  STANDALONESHORTWEEKDAYS: ['Cpr', 'Ctt', 'Cmn', 'Cmt', 'Ars', 'Icm', 'Est'],
  NARROWWEEKDAYS: ['C', 'C', 'C', 'C', 'A', 'I', 'E'],
  STANDALONENARROWWEEKDAYS: ['C', 'C', 'C', 'C', 'A', 'I', 'E'],
  SHORTQUARTERS: ['E1', 'E2', 'E3', 'E4'],
  QUARTERS: ['Erobo entang’ani', 'Erobo yakabere', 'Erobo yagatato', 'Erobo yakane'],
  AMPMS: ['Mambia', 'Mog'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale guz_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_guz_KE = goog.i18n.DateTimeSymbols_guz;


/**
 * Date/time formatting symbols for locale gv.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gv = {
  ERAS: ['RC', 'AD'],
  ERANAMES: ['RC', 'AD'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Jerrey-geuree', 'Toshiaght-arree', 'Mayrnt', 'Averil', 'Boaldyn', 'Mean-souree', 'Jerrey-souree', 'Luanistyn', 'Mean-fouyir', 'Jerrey-fouyir', 'Mee Houney', 'Mee ny Nollick'],
  STANDALONEMONTHS: ['Jerrey-geuree', 'Toshiaght-arree', 'Mayrnt', 'Averil', 'Boaldyn', 'Mean-souree', 'Jerrey-souree', 'Luanistyn', 'Mean-fouyir', 'Jerrey-fouyir', 'Mee Houney', 'Mee ny Nollick'],
  SHORTMONTHS: ['J-guer', 'T-arree', 'Mayrnt', 'Avrril', 'Boaldyn', 'M-souree', 'J-souree', 'Luanistyn', 'M-fouyir', 'J-fouyir', 'M-Houney', 'M-Nollick'],
  STANDALONESHORTMONTHS: ['J-guer', 'T-arree', 'Mayrnt', 'Avrril', 'Boaldyn', 'M-souree', 'J-souree', 'Luanistyn', 'M-fouyir', 'J-fouyir', 'M-Houney', 'M-Nollick'],
  WEEKDAYS: ['Jedoonee', 'Jelhein', 'Jemayrt', 'Jercean', 'Jerdein', 'Jeheiney', 'Jesarn'],
  STANDALONEWEEKDAYS: ['Jedoonee', 'Jelhein', 'Jemayrt', 'Jercean', 'Jerdein', 'Jeheiney', 'Jesarn'],
  SHORTWEEKDAYS: ['Jed', 'Jel', 'Jem', 'Jerc', 'Jerd', 'Jeh', 'Jes'],
  STANDALONESHORTWEEKDAYS: ['Jed', 'Jel', 'Jem', 'Jerc', 'Jerd', 'Jeh', 'Jes'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale gv_IM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_gv_IM = goog.i18n.DateTimeSymbols_gv;


/**
 * Date/time formatting symbols for locale ha.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ha = {
  ERAS: ['K.H', 'BHAI'],
  ERANAMES: ['Kafin haihuwar annab', 'Bayan haihuwar annab'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'Y', 'Y', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'Y', 'Y', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni', 'Yuli', 'Agusta', 'Satumba', 'Oktoba', 'Nuwamba', 'Disamba'],
  STANDALONEMONTHS: ['Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni', 'Yuli', 'Agusta', 'Satumba', 'Oktoba', 'Nuwamba', 'Disamba'],
  SHORTMONTHS: ['Jan', 'Fab', 'Mar', 'Afi', 'May', 'Yun', 'Yul', 'Agu', 'Sat', 'Okt', 'Nuw', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Fab', 'Mar', 'Afi', 'May', 'Yun', 'Yul', 'Agu', 'Sat', 'Okt', 'Nuw', 'Dis'],
  WEEKDAYS: ['Lahadi', 'Litinin', 'Talata', 'Laraba', 'Alhamis', 'Jummaʼa', 'Asabar'],
  STANDALONEWEEKDAYS: ['Lahadi', 'Litinin', 'Talata', 'Laraba', 'Alhamis', 'Jummaʼa', 'Asabar'],
  SHORTWEEKDAYS: ['Lah', 'Lit', 'Tal', 'Lar', 'Alh', 'Jum', 'Asa'],
  STANDALONESHORTWEEKDAYS: ['Lah', 'Lit', 'Tal', 'Lar', 'Alh', 'Jum', 'Asa'],
  NARROWWEEKDAYS: ['L', 'L', 'T', 'L', 'A', 'J', 'A'],
  STANDALONENARROWWEEKDAYS: ['L', 'L', 'T', 'L', 'A', 'J', 'A'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Kwata na ɗaya', 'Kwata na biyu', 'Kwata na uku', 'Kwata na huɗu'],
  AMPMS: ['Safiya', 'Yamma'],
  DATEFORMATS: ['EEEE d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ha_GH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ha_GH = {
  ERAS: ['K.H', 'BHAI'],
  ERANAMES: ['Kafin haihuwar annab', 'Bayan haihuwar annab'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'Y', 'Y', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'Y', 'Y', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni', 'Yuli', 'Agusta', 'Satumba', 'Oktoba', 'Nuwamba', 'Disamba'],
  STANDALONEMONTHS: ['Janairu', 'Faburairu', 'Maris', 'Afirilu', 'Mayu', 'Yuni', 'Yuli', 'Agusta', 'Satumba', 'Oktoba', 'Nuwamba', 'Disamba'],
  SHORTMONTHS: ['Jan', 'Fab', 'Mar', 'Afi', 'May', 'Yun', 'Yul', 'Agu', 'Sat', 'Okt', 'Nuw', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Fab', 'Mar', 'Afi', 'May', 'Yun', 'Yul', 'Agu', 'Sat', 'Okt', 'Nuw', 'Dis'],
  WEEKDAYS: ['Lahadi', 'Litinin', 'Talata', 'Laraba', 'Alhamis', 'Jummaʼa', 'Asabar'],
  STANDALONEWEEKDAYS: ['Lahadi', 'Litinin', 'Talata', 'Laraba', 'Alhamis', 'Jummaʼa', 'Asabar'],
  SHORTWEEKDAYS: ['Lah', 'Lit', 'Tal', 'Lar', 'Alh', 'Jum', 'Asa'],
  STANDALONESHORTWEEKDAYS: ['Lah', 'Lit', 'Tal', 'Lar', 'Alh', 'Jum', 'Asa'],
  NARROWWEEKDAYS: ['L', 'L', 'T', 'L', 'A', 'J', 'A'],
  STANDALONENARROWWEEKDAYS: ['L', 'L', 'T', 'L', 'A', 'J', 'A'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Kwata na ɗaya', 'Kwata na biyu', 'Kwata na uku', 'Kwata na huɗu'],
  AMPMS: ['Safiya', 'Yamma'],
  DATEFORMATS: ['EEEE d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ha_NE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ha_NE = goog.i18n.DateTimeSymbols_ha;


/**
 * Date/time formatting symbols for locale ha_NG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ha_NG = goog.i18n.DateTimeSymbols_ha;


/**
 * Date/time formatting symbols for locale haw_US.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_haw_US = goog.i18n.DateTimeSymbols_haw;


/**
 * Date/time formatting symbols for locale he_IL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_he_IL = goog.i18n.DateTimeSymbols_he;


/**
 * Date/time formatting symbols for locale hi_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_hi_IN = goog.i18n.DateTimeSymbols_hi;


/**
 * Date/time formatting symbols for locale hr_BA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_hr_BA = {
  ERAS: ['pr. Kr.', 'po. Kr.'],
  ERANAMES: ['prije Krista', 'poslije Krista'],
  NARROWMONTHS: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.'],
  STANDALONENARROWMONTHS: ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.', '11.', '12.'],
  MONTHS: ['siječnja', 'veljače', 'ožujka', 'travnja', 'svibnja', 'lipnja', 'srpnja', 'kolovoza', 'rujna', 'listopada', 'studenoga', 'prosinca'],
  STANDALONEMONTHS: ['siječanj', 'veljača', 'ožujak', 'travanj', 'svibanj', 'lipanj', 'srpanj', 'kolovoz', 'rujan', 'listopad', 'studeni', 'prosinac'],
  SHORTMONTHS: ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp', 'kol', 'ruj', 'lis', 'stu', 'pro'],
  STANDALONESHORTMONTHS: ['sij', 'velj', 'ožu', 'tra', 'svi', 'lip', 'srp', 'kol', 'ruj', 'lis', 'stu', 'pro'],
  WEEKDAYS: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
  STANDALONEWEEKDAYS: ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
  SHORTWEEKDAYS: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
  STANDALONESHORTWEEKDAYS: ['ned', 'pon', 'uto', 'sri', 'čet', 'pet', 'sub'],
  NARROWWEEKDAYS: ['N', 'P', 'U', 'S', 'Č', 'P', 'S'],
  STANDALONENARROWWEEKDAYS: ['N', 'P', 'U', 'S', 'Č', 'P', 'S'],
  SHORTQUARTERS: ['1. kv.', '2. kv.', '3. kv.', '4. kv.'],
  QUARTERS: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d. MMMM y.', 'd. MMMM y.', 'd. MMM y.', 'd. M. yy.'],
  TIMEFORMATS: ['HH:mm:ss (zzzz)', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'u\' {0}', '{1} \'u\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale hr_HR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_hr_HR = goog.i18n.DateTimeSymbols_hr;


/**
 * Date/time formatting symbols for locale hsb.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_hsb = {
  ERAS: ['př.Chr.n.', 'po Chr.n.'],
  ERANAMES: ['před Chrystowym narodźenjom', 'po Chrystowym narodźenju'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  MONTHS: ['januara', 'februara', 'měrca', 'apryla', 'meje', 'junija', 'julija', 'awgusta', 'septembra', 'oktobra', 'nowembra', 'decembra'],
  STANDALONEMONTHS: ['januar', 'februar', 'měrc', 'apryl', 'meja', 'junij', 'julij', 'awgust', 'september', 'oktober', 'nowember', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'měr.', 'apr.', 'mej.', 'jun.', 'jul.', 'awg.', 'sep.', 'okt.', 'now.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'měr', 'apr', 'mej', 'jun', 'jul', 'awg', 'sep', 'okt', 'now', 'dec'],
  WEEKDAYS: ['njedźela', 'póndźela', 'wutora', 'srjeda', 'štwórtk', 'pjatk', 'sobota'],
  STANDALONEWEEKDAYS: ['njedźela', 'póndźela', 'wutora', 'srjeda', 'štwórtk', 'pjatk', 'sobota'],
  SHORTWEEKDAYS: ['nje', 'pón', 'wut', 'srj', 'štw', 'pja', 'sob'],
  STANDALONESHORTWEEKDAYS: ['nje', 'pón', 'wut', 'srj', 'štw', 'pja', 'sob'],
  NARROWWEEKDAYS: ['n', 'p', 'w', 's', 'š', 'p', 's'],
  STANDALONENARROWWEEKDAYS: ['n', 'p', 'w', 's', 'š', 'p', 's'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. kwartal', '2. kwartal', '3. kwartal', '4. kwartal'],
  AMPMS: ['dopołdnja', 'popołdnju'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'd.M.y', 'd.M.yy'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm \'hodź\'.'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale hsb_DE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_hsb_DE = goog.i18n.DateTimeSymbols_hsb;


/**
 * Date/time formatting symbols for locale hu_HU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_hu_HU = goog.i18n.DateTimeSymbols_hu;


/**
 * Date/time formatting symbols for locale hy_AM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_hy_AM = goog.i18n.DateTimeSymbols_hy;


/**
 * Date/time formatting symbols for locale ia.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ia = {
  ERAS: ['a.Chr.', 'p.Chr.'],
  ERANAMES: ['ante Christo', 'post Christo'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['januario', 'februario', 'martio', 'april', 'maio', 'junio', 'julio', 'augusto', 'septembre', 'octobre', 'novembre', 'decembre'],
  STANDALONEMONTHS: ['januario', 'februario', 'martio', 'april', 'maio', 'junio', 'julio', 'augusto', 'septembre', 'octobre', 'novembre', 'decembre'],
  SHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  WEEKDAYS: ['dominica', 'lunedi', 'martedi', 'mercuridi', 'jovedi', 'venerdi', 'sabbato'],
  STANDALONEWEEKDAYS: ['dominica', 'lunedi', 'martedi', 'mercuridi', 'jovedi', 'venerdi', 'sabbato'],
  SHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mer', 'jov', 'ven', 'sab'],
  STANDALONESHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mer', 'jov', 'ven', 'sab'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'j', 'v', 's'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1me trimestre', '2nde trimestre', '3tie trimestre', '4te trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE \'le\' d \'de\' MMMM y', 'd \'de\' MMMM y', 'd MMM y', 'dd-MM-y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'a\' {0}', '{1} \'a\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ia_001.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ia_001 = goog.i18n.DateTimeSymbols_ia;


/**
 * Date/time formatting symbols for locale id_ID.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_id_ID = goog.i18n.DateTimeSymbols_id;


/**
 * Date/time formatting symbols for locale ig.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ig = {
  ERAS: ['T.K.', 'A.K.'],
  ERANAMES: ['Tupu Kristi', 'Afọ Kristi'],
  NARROWMONTHS: ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'Ọ', 'S', 'Ọ', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'E', 'M', 'J', 'J', 'Ọ', 'S', 'Ọ', 'N', 'D'],
  MONTHS: ['Jenụwarị', 'Febrụwarị', 'Maachị', 'Epreel', 'Mee', 'Juun', 'Julaị', 'Ọgọọst', 'Septemba', 'Ọktoba', 'Novemba', 'Disemba'],
  STANDALONEMONTHS: ['Jenụwarị', 'Febrụwarị', 'Maachị', 'Epreel', 'Mee', 'Juun', 'Julaị', 'Ọgọọst', 'Septemba', 'Ọktoba', 'Novemba', 'Disemba'],
  SHORTMONTHS: ['Jen', 'Feb', 'Maa', 'Epr', 'Mee', 'Juu', 'Jul', 'Ọgọ', 'Sep', 'Ọkt', 'Nov', 'Dis'],
  STANDALONESHORTMONTHS: ['Jen', 'Feb', 'Maa', 'Epr', 'Mee', 'Juu', 'Jul', 'Ọgọ', 'Sep', 'Ọkt', 'Nov', 'Dis'],
  WEEKDAYS: ['Ụbọchị Ụka', 'Mọnde', 'Tiuzdee', 'Wenezdee', 'Tọọzdee', 'Fraịdee', 'Satọdee'],
  STANDALONEWEEKDAYS: ['Ụbọchị Ụka', 'Mọnde', 'Tiuzdee', 'Wenezdee', 'Tọọzdee', 'Fraịdee', 'Satọdee'],
  SHORTWEEKDAYS: ['Ụka', 'Mọn', 'Tiu', 'Wen', 'Tọọ', 'Fraị', 'Satọdee'],
  STANDALONESHORTWEEKDAYS: ['Ụka', 'Mọn', 'Tiu', 'Wen', 'Tọọ', 'Fraị', 'Satọdee'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Ọ1', 'Ọ2', 'Ọ3', 'Ọ4'],
  QUARTERS: ['Ọkara 1', 'Ọkara 2', 'Ọkara 3', 'Ọkara 4'],
  AMPMS: ['N’ụtụtụ', 'N’abali'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'na\' {0}', '{1} \'na\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ig_NG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ig_NG = goog.i18n.DateTimeSymbols_ig;


/**
 * Date/time formatting symbols for locale ii.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ii = {
  ERAS: ['ꃅꋊꂿ', 'ꃅꋊꊂ'],
  ERANAMES: ['ꃅꋊꂿ', 'ꃅꋊꊂ'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['ꋍꆪ', 'ꑍꆪ', 'ꌕꆪ', 'ꇖꆪ', 'ꉬꆪ', 'ꃘꆪ', 'ꏃꆪ', 'ꉆꆪ', 'ꈬꆪ', 'ꊰꆪ', 'ꊰꊪꆪ', 'ꊰꑋꆪ'],
  STANDALONEMONTHS: ['ꋍꆪ', 'ꑍꆪ', 'ꌕꆪ', 'ꇖꆪ', 'ꉬꆪ', 'ꃘꆪ', 'ꏃꆪ', 'ꉆꆪ', 'ꈬꆪ', 'ꊰꆪ', 'ꊰꊪꆪ', 'ꊰꑋꆪ'],
  SHORTMONTHS: ['ꋍꆪ', 'ꑍꆪ', 'ꌕꆪ', 'ꇖꆪ', 'ꉬꆪ', 'ꃘꆪ', 'ꏃꆪ', 'ꉆꆪ', 'ꈬꆪ', 'ꊰꆪ', 'ꊰꊪꆪ', 'ꊰꑋꆪ'],
  STANDALONESHORTMONTHS: ['ꋍꆪ', 'ꑍꆪ', 'ꌕꆪ', 'ꇖꆪ', 'ꉬꆪ', 'ꃘꆪ', 'ꏃꆪ', 'ꉆꆪ', 'ꈬꆪ', 'ꊰꆪ', 'ꊰꊪꆪ', 'ꊰꑋꆪ'],
  WEEKDAYS: ['ꑭꆏꑍ', 'ꆏꊂꋍ', 'ꆏꊂꑍ', 'ꆏꊂꌕ', 'ꆏꊂꇖ', 'ꆏꊂꉬ', 'ꆏꊂꃘ'],
  STANDALONEWEEKDAYS: ['ꑭꆏꑍ', 'ꆏꊂꋍ', 'ꆏꊂꑍ', 'ꆏꊂꌕ', 'ꆏꊂꇖ', 'ꆏꊂꉬ', 'ꆏꊂꃘ'],
  SHORTWEEKDAYS: ['ꑭꆏ', 'ꆏꋍ', 'ꆏꑍ', 'ꆏꌕ', 'ꆏꇖ', 'ꆏꉬ', 'ꆏꃘ'],
  STANDALONESHORTWEEKDAYS: ['ꑭꆏ', 'ꆏꋍ', 'ꆏꑍ', 'ꆏꌕ', 'ꆏꇖ', 'ꆏꉬ', 'ꆏꃘ'],
  NARROWWEEKDAYS: ['ꆏ', 'ꋍ', 'ꑍ', 'ꌕ', 'ꇖ', 'ꉬ', 'ꃘ'],
  STANDALONENARROWWEEKDAYS: ['ꆏ', 'ꋍ', 'ꑍ', 'ꌕ', 'ꇖ', 'ꉬ', 'ꃘ'],
  SHORTQUARTERS: ['ꃅꑌ', 'ꃅꎸ', 'ꃅꍵ', 'ꃅꋆ'],
  QUARTERS: ['ꃅꑌ', 'ꃅꎸ', 'ꃅꍵ', 'ꃅꋆ'],
  AMPMS: ['ꎸꄑ', 'ꁯꋒ'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ii_CN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ii_CN = goog.i18n.DateTimeSymbols_ii;


/**
 * Date/time formatting symbols for locale is_IS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_is_IS = goog.i18n.DateTimeSymbols_is;


/**
 * Date/time formatting symbols for locale it_CH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_it_CH = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['avanti Cristo', 'dopo Cristo'],
  NARROWMONTHS: ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  STANDALONEMONTHS: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
  SHORTMONTHS: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
  STANDALONESHORTMONTHS: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
  WEEKDAYS: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
  STANDALONEWEEKDAYS: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
  SHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
  STANDALONESHORTWEEKDAYS: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'M', 'G', 'V', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1º trimestre', '2º trimestre', '3º trimestre', '4º trimestre'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale it_IT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_it_IT = goog.i18n.DateTimeSymbols_it;


/**
 * Date/time formatting symbols for locale it_SM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_it_SM = goog.i18n.DateTimeSymbols_it;


/**
 * Date/time formatting symbols for locale it_VA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_it_VA = goog.i18n.DateTimeSymbols_it;


/**
 * Date/time formatting symbols for locale ja_JP.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ja_JP = goog.i18n.DateTimeSymbols_ja;


/**
 * Date/time formatting symbols for locale jgo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_jgo = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['tsɛttsɛt mɛŋguꞌ mi ɛ́ lɛɛnɛ Kɛlísɛtɔ gɔ ńɔ́', 'tsɛttsɛt mɛŋguꞌ mi ɛ́ fúnɛ Kɛlísɛtɔ tɔ́ mɔ́'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Nduŋmbi Saŋ', 'Pɛsaŋ Pɛ́pá', 'Pɛsaŋ Pɛ́tát', 'Pɛsaŋ Pɛ́nɛ́kwa', 'Pɛsaŋ Pataa', 'Pɛsaŋ Pɛ́nɛ́ntúkú', 'Pɛsaŋ Saambá', 'Pɛsaŋ Pɛ́nɛ́fɔm', 'Pɛsaŋ Pɛ́nɛ́pfúꞋú', 'Pɛsaŋ Nɛgɛ́m', 'Pɛsaŋ Ntsɔ̌pmɔ́', 'Pɛsaŋ Ntsɔ̌ppá'],
  STANDALONEMONTHS: ['Nduŋmbi Saŋ', 'Pɛsaŋ Pɛ́pá', 'Pɛsaŋ Pɛ́tát', 'Pɛsaŋ Pɛ́nɛ́kwa', 'Pɛsaŋ Pataa', 'Pɛsaŋ Pɛ́nɛ́ntúkú', 'Pɛsaŋ Saambá', 'Pɛsaŋ Pɛ́nɛ́fɔm', 'Pɛsaŋ Pɛ́nɛ́pfúꞋú', 'Pɛsaŋ Nɛgɛ́m', 'Pɛsaŋ Ntsɔ̌pmɔ́', 'Pɛsaŋ Ntsɔ̌ppá'],
  SHORTMONTHS: ['Nduŋmbi Saŋ', 'Pɛsaŋ Pɛ́pá', 'Pɛsaŋ Pɛ́tát', 'Pɛsaŋ Pɛ́nɛ́kwa', 'Pɛsaŋ Pataa', 'Pɛsaŋ Pɛ́nɛ́ntúkú', 'Pɛsaŋ Saambá', 'Pɛsaŋ Pɛ́nɛ́fɔm', 'Pɛsaŋ Pɛ́nɛ́pfúꞋú', 'Pɛsaŋ Nɛgɛ́m', 'Pɛsaŋ Ntsɔ̌pmɔ́', 'Pɛsaŋ Ntsɔ̌ppá'],
  STANDALONESHORTMONTHS: ['Nduŋmbi Saŋ', 'Pɛsaŋ Pɛ́pá', 'Pɛsaŋ Pɛ́tát', 'Pɛsaŋ Pɛ́nɛ́kwa', 'Pɛsaŋ Pataa', 'Pɛsaŋ Pɛ́nɛ́ntúkú', 'Pɛsaŋ Saambá', 'Pɛsaŋ Pɛ́nɛ́fɔm', 'Pɛsaŋ Pɛ́nɛ́pfúꞋú', 'Pɛsaŋ Nɛgɛ́m', 'Pɛsaŋ Ntsɔ̌pmɔ́', 'Pɛsaŋ Ntsɔ̌ppá'],
  WEEKDAYS: ['Sɔ́ndi', 'Mɔ́ndi', 'Ápta Mɔ́ndi', 'Wɛ́nɛsɛdɛ', 'Tɔ́sɛdɛ', 'Fɛlâyɛdɛ', 'Sásidɛ'],
  STANDALONEWEEKDAYS: ['Sɔ́ndi', 'Mɔ́ndi', 'Ápta Mɔ́ndi', 'Wɛ́nɛsɛdɛ', 'Tɔ́sɛdɛ', 'Fɛlâyɛdɛ', 'Sásidɛ'],
  SHORTWEEKDAYS: ['Sɔ́ndi', 'Mɔ́ndi', 'Ápta Mɔ́ndi', 'Wɛ́nɛsɛdɛ', 'Tɔ́sɛdɛ', 'Fɛlâyɛdɛ', 'Sásidɛ'],
  STANDALONESHORTWEEKDAYS: ['Sɔ́ndi', 'Mɔ́ndi', 'Ápta Mɔ́ndi', 'Wɛ́nɛsɛdɛ', 'Tɔ́sɛdɛ', 'Fɛlâyɛdɛ', 'Sásidɛ'],
  NARROWWEEKDAYS: ['Sɔ́', 'Mɔ́', 'ÁM', 'Wɛ́', 'Tɔ́', 'Fɛ', 'Sá'],
  STANDALONENARROWWEEKDAYS: ['Sɔ́', 'Mɔ́', 'ÁM', 'Wɛ́', 'Tɔ́', 'Fɛ', 'Sá'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['mbaꞌmbaꞌ', 'ŋka mbɔ́t nji'],
  DATEFORMATS: ['EEEE, y MMMM dd', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale jgo_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_jgo_CM = goog.i18n.DateTimeSymbols_jgo;


/**
 * Date/time formatting symbols for locale jmc.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_jmc = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Kristu', 'Baada ya Kristu'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Machi', 'Aprilyi', 'Mei', 'Junyi', 'Julyai', 'Agusti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Machi', 'Aprilyi', 'Mei', 'Junyi', 'Julyai', 'Agusti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Jumapilyi', 'Jumatatuu', 'Jumanne', 'Jumatanu', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Jumapilyi', 'Jumatatuu', 'Jumanne', 'Jumatanu', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  SHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  NARROWWEEKDAYS: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
  STANDALONENARROWWEEKDAYS: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo 1', 'Robo 2', 'Robo 3', 'Robo 4'],
  AMPMS: ['utuko', 'kyiukonyi'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale jmc_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_jmc_TZ = goog.i18n.DateTimeSymbols_jmc;


/**
 * Date/time formatting symbols for locale jv.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_jv = {
  ERAS: ['SM', 'M'],
  ERANAMES: ['Sakdurunge Masehi', 'Masehi'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  STANDALONEWEEKDAYS: ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
  SHORTWEEKDAYS: ['Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
  NARROWWEEKDAYS: ['A', 'S', 'S', 'R', 'K', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['A', 'S', 'S', 'R', 'K', 'J', 'S'],
  SHORTQUARTERS: ['TW1', 'TW2', 'TW3', 'TW4'],
  QUARTERS: ['triwulan kaping pisan', 'triwulan kaping loro', 'triwulan kaping telu', 'triwulan kaping papat'],
  AMPMS: ['Isuk', 'Wengi'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale jv_ID.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_jv_ID = goog.i18n.DateTimeSymbols_jv;


/**
 * Date/time formatting symbols for locale ka_GE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ka_GE = goog.i18n.DateTimeSymbols_ka;


/**
 * Date/time formatting symbols for locale kab.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kab = {
  ERAS: ['snd. T.Ɛ', 'sld. T.Ɛ'],
  ERANAMES: ['send talalit n Ɛisa', 'seld talalit n Ɛisa'],
  NARROWMONTHS: ['Y', 'F', 'M', 'Y', 'M', 'Y', 'Y', 'Ɣ', 'C', 'T', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Y', 'F', 'M', 'Y', 'M', 'Y', 'Y', 'Ɣ', 'C', 'T', 'N', 'D'],
  MONTHS: ['Yennayer', 'Fuṛar', 'Meɣres', 'Yebrir', 'Mayyu', 'Yunyu', 'Yulyu', 'Ɣuct', 'Ctembeṛ', 'Tubeṛ', 'Nunembeṛ', 'Duǧembeṛ'],
  STANDALONEMONTHS: ['Yennayer', 'Fuṛar', 'Meɣres', 'Yebrir', 'Mayyu', 'Yunyu', 'Yulyu', 'Ɣuct', 'Ctembeṛ', 'Tubeṛ', 'Nunembeṛ', 'Duǧembeṛ'],
  SHORTMONTHS: ['Yen', 'Fur', 'Meɣ', 'Yeb', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cte', 'Tub', 'Nun', 'Duǧ'],
  STANDALONESHORTMONTHS: ['Yen', 'Fur', 'Meɣ', 'Yeb', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cte', 'Tub', 'Nun', 'Duǧ'],
  WEEKDAYS: ['Yanass', 'Sanass', 'Kraḍass', 'Kuẓass', 'Samass', 'Sḍisass', 'Sayass'],
  STANDALONEWEEKDAYS: ['Yanass', 'Sanass', 'Kraḍass', 'Kuẓass', 'Samass', 'Sḍisass', 'Sayass'],
  SHORTWEEKDAYS: ['Yan', 'San', 'Kraḍ', 'Kuẓ', 'Sam', 'Sḍis', 'Say'],
  STANDALONESHORTWEEKDAYS: ['Yan', 'San', 'Kraḍ', 'Kuẓ', 'Sam', 'Sḍis', 'Say'],
  NARROWWEEKDAYS: ['Y', 'S', 'K', 'K', 'S', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['Y', 'S', 'K', 'K', 'S', 'S', 'S'],
  SHORTQUARTERS: ['Kḍg1', 'Kḍg2', 'Kḍg3', 'Kḍg4'],
  QUARTERS: ['akraḍaggur amenzu', 'akraḍaggur wis-sin', 'akraḍaggur wis-kraḍ', 'akraḍaggur wis-kuẓ'],
  AMPMS: ['n tufat', 'n tmeddit'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale kab_DZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kab_DZ = goog.i18n.DateTimeSymbols_kab;


/**
 * Date/time formatting symbols for locale kam.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kam = {
  ERAS: ['MY', 'IY'],
  ERANAMES: ['Mbee wa Yesũ', 'Ĩtina wa Yesũ'],
  NARROWMONTHS: ['M', 'K', 'K', 'K', 'K', 'T', 'M', 'N', 'K', 'Ĩ', 'Ĩ', 'Ĩ'],
  STANDALONENARROWMONTHS: ['M', 'K', 'K', 'K', 'K', 'T', 'M', 'N', 'K', 'Ĩ', 'Ĩ', 'Ĩ'],
  MONTHS: ['Mwai wa mbee', 'Mwai wa kelĩ', 'Mwai wa katatũ', 'Mwai wa kana', 'Mwai wa katano', 'Mwai wa thanthatũ', 'Mwai wa muonza', 'Mwai wa nyaanya', 'Mwai wa kenda', 'Mwai wa ĩkumi', 'Mwai wa ĩkumi na ĩmwe', 'Mwai wa ĩkumi na ilĩ'],
  STANDALONEMONTHS: ['Mwai wa mbee', 'Mwai wa kelĩ', 'Mwai wa katatũ', 'Mwai wa kana', 'Mwai wa katano', 'Mwai wa thanthatũ', 'Mwai wa muonza', 'Mwai wa nyaanya', 'Mwai wa kenda', 'Mwai wa ĩkumi', 'Mwai wa ĩkumi na ĩmwe', 'Mwai wa ĩkumi na ilĩ'],
  SHORTMONTHS: ['Mbe', 'Kel', 'Ktũ', 'Kan', 'Ktn', 'Tha', 'Moo', 'Nya', 'Knd', 'Ĩku', 'Ĩkm', 'Ĩkl'],
  STANDALONESHORTMONTHS: ['Mbe', 'Kel', 'Ktũ', 'Kan', 'Ktn', 'Tha', 'Moo', 'Nya', 'Knd', 'Ĩku', 'Ĩkm', 'Ĩkl'],
  WEEKDAYS: ['Wa kyumwa', 'Wa kwambĩlĩlya', 'Wa kelĩ', 'Wa katatũ', 'Wa kana', 'Wa katano', 'Wa thanthatũ'],
  STANDALONEWEEKDAYS: ['Wa kyumwa', 'Wa kwambĩlĩlya', 'Wa kelĩ', 'Wa katatũ', 'Wa kana', 'Wa katano', 'Wa thanthatũ'],
  SHORTWEEKDAYS: ['Wky', 'Wkw', 'Wkl', 'Wtũ', 'Wkn', 'Wtn', 'Wth'],
  STANDALONESHORTWEEKDAYS: ['Wky', 'Wkw', 'Wkl', 'Wtũ', 'Wkn', 'Wtn', 'Wth'],
  NARROWWEEKDAYS: ['Y', 'W', 'E', 'A', 'A', 'A', 'A'],
  STANDALONENARROWWEEKDAYS: ['Y', 'W', 'E', 'A', 'A', 'A', 'A'],
  SHORTQUARTERS: ['L1', 'L2', 'L3', 'L4'],
  QUARTERS: ['Lovo ya mbee', 'Lovo ya kelĩ', 'Lovo ya katatũ', 'Lovo ya kana'],
  AMPMS: ['Ĩyakwakya', 'Ĩyawĩoo'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale kam_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kam_KE = goog.i18n.DateTimeSymbols_kam;


/**
 * Date/time formatting symbols for locale kde.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kde = {
  ERAS: ['AY', 'NY'],
  ERANAMES: ['Akanapawa Yesu', 'Nankuida Yesu'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Mwedi Ntandi', 'Mwedi wa Pili', 'Mwedi wa Tatu', 'Mwedi wa Nchechi', 'Mwedi wa Nnyano', 'Mwedi wa Nnyano na Umo', 'Mwedi wa Nnyano na Mivili', 'Mwedi wa Nnyano na Mitatu', 'Mwedi wa Nnyano na Nchechi', 'Mwedi wa Nnyano na Nnyano', 'Mwedi wa Nnyano na Nnyano na U', 'Mwedi wa Nnyano na Nnyano na M'],
  STANDALONEMONTHS: ['Mwedi Ntandi', 'Mwedi wa Pili', 'Mwedi wa Tatu', 'Mwedi wa Nchechi', 'Mwedi wa Nnyano', 'Mwedi wa Nnyano na Umo', 'Mwedi wa Nnyano na Mivili', 'Mwedi wa Nnyano na Mitatu', 'Mwedi wa Nnyano na Nchechi', 'Mwedi wa Nnyano na Nnyano', 'Mwedi wa Nnyano na Nnyano na U', 'Mwedi wa Nnyano na Nnyano na M'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Liduva lyapili', 'Liduva lyatatu', 'Liduva lyanchechi', 'Liduva lyannyano', 'Liduva lyannyano na linji', 'Liduva lyannyano na mavili', 'Liduva litandi'],
  STANDALONEWEEKDAYS: ['Liduva lyapili', 'Liduva lyatatu', 'Liduva lyanchechi', 'Liduva lyannyano', 'Liduva lyannyano na linji', 'Liduva lyannyano na mavili', 'Liduva litandi'],
  SHORTWEEKDAYS: ['Ll2', 'Ll3', 'Ll4', 'Ll5', 'Ll6', 'Ll7', 'Ll1'],
  STANDALONESHORTWEEKDAYS: ['Ll2', 'Ll3', 'Ll4', 'Ll5', 'Ll6', 'Ll7', 'Ll1'],
  NARROWWEEKDAYS: ['2', '3', '4', '5', '6', '7', '1'],
  STANDALONENARROWWEEKDAYS: ['2', '3', '4', '5', '6', '7', '1'],
  SHORTQUARTERS: ['L1', 'L2', 'L3', 'L4'],
  QUARTERS: ['Lobo 1', 'Lobo 2', 'Lobo 3', 'Lobo 4'],
  AMPMS: ['Muhi', 'Chilo'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale kde_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kde_TZ = goog.i18n.DateTimeSymbols_kde;


/**
 * Date/time formatting symbols for locale kea.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kea = {
  ERAS: ['AK', 'DK'],
  ERANAMES: ['Antis di Kristu', 'Dispos di Kristu'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Janeru', 'Febreru', 'Marsu', 'Abril', 'Maiu', 'Junhu', 'Julhu', 'Agostu', 'Setenbru', 'Otubru', 'Nuvenbru', 'Dizenbru'],
  STANDALONEMONTHS: ['Janeru', 'Febreru', 'Marsu', 'Abril', 'Maiu', 'Junhu', 'Julhu', 'Agostu', 'Setenbru', 'Otubru', 'Nuvenbru', 'Dizenbru'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Otu', 'Nuv', 'Diz'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Otu', 'Nuv', 'Diz'],
  WEEKDAYS: ['dumingu', 'sigunda-fera', 'tersa-fera', 'kuarta-fera', 'kinta-fera', 'sesta-fera', 'sabadu'],
  STANDALONEWEEKDAYS: ['dumingu', 'sigunda-fera', 'tersa-fera', 'kuarta-fera', 'kinta-fera', 'sesta-fera', 'sábadu'],
  SHORTWEEKDAYS: ['dum', 'sig', 'ter', 'kua', 'kin', 'ses', 'sab'],
  STANDALONESHORTWEEKDAYS: ['dum', 'sig', 'ter', 'kua', 'kin', 'ses', 'sab'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'K', 'K', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'K', 'K', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1º trimestri', '2º trimestri', '3º trimestri', '4º trimestri'],
  AMPMS: ['am', 'pm'],
  DATEFORMATS: ['EEEE, d \'di\' MMMM \'di\' y', 'd \'di\' MMMM \'di\' y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale kea_CV.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kea_CV = goog.i18n.DateTimeSymbols_kea;


/**
 * Date/time formatting symbols for locale khq.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_khq = {
  ERAS: ['IJ', 'IZ'],
  ERANAMES: ['Isaa jine', 'Isaa jamanoo'],
  NARROWMONTHS: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
  MONTHS: ['Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur', 'Oktoobur', 'Noowanbur', 'Deesanbur'],
  STANDALONEMONTHS: ['Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur', 'Oktoobur', 'Noowanbur', 'Deesanbur'],
  SHORTMONTHS: ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
  STANDALONESHORTMONTHS: ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
  WEEKDAYS: ['Alhadi', 'Atini', 'Atalata', 'Alarba', 'Alhamiisa', 'Aljuma', 'Assabdu'],
  STANDALONEWEEKDAYS: ['Alhadi', 'Atini', 'Atalata', 'Alarba', 'Alhamiisa', 'Aljuma', 'Assabdu'],
  SHORTWEEKDAYS: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alj', 'Ass'],
  STANDALONESHORTWEEKDAYS: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alj', 'Ass'],
  NARROWWEEKDAYS: ['H', 'T', 'T', 'L', 'L', 'L', 'S'],
  STANDALONENARROWWEEKDAYS: ['H', 'T', 'T', 'L', 'L', 'L', 'S'],
  SHORTQUARTERS: ['A1', 'A2', 'A3', 'A4'],
  QUARTERS: ['Arrubu 1', 'Arrubu 2', 'Arrubu 3', 'Arrubu 4'],
  AMPMS: ['Adduha', 'Aluula'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale khq_ML.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_khq_ML = goog.i18n.DateTimeSymbols_khq;


/**
 * Date/time formatting symbols for locale ki.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ki = {
  ERAS: ['MK', 'TK'],
  ERANAMES: ['Mbere ya Kristo', 'Thutha wa Kristo'],
  NARROWMONTHS: ['J', 'K', 'G', 'K', 'G', 'G', 'M', 'K', 'K', 'I', 'I', 'D'],
  STANDALONENARROWMONTHS: ['J', 'K', 'G', 'K', 'G', 'G', 'M', 'K', 'K', 'I', 'I', 'D'],
  MONTHS: ['Njenuarĩ', 'Mwere wa kerĩ', 'Mwere wa gatatũ', 'Mwere wa kana', 'Mwere wa gatano', 'Mwere wa gatandatũ', 'Mwere wa mũgwanja', 'Mwere wa kanana', 'Mwere wa kenda', 'Mwere wa ikũmi', 'Mwere wa ikũmi na ũmwe', 'Ndithemba'],
  STANDALONEMONTHS: ['Njenuarĩ', 'Mwere wa kerĩ', 'Mwere wa gatatũ', 'Mwere wa kana', 'Mwere wa gatano', 'Mwere wa gatandatũ', 'Mwere wa mũgwanja', 'Mwere wa kanana', 'Mwere wa kenda', 'Mwere wa ikũmi', 'Mwere wa ikũmi na ũmwe', 'Ndithemba'],
  SHORTMONTHS: ['JEN', 'WKR', 'WGT', 'WKN', 'WTN', 'WTD', 'WMJ', 'WNN', 'WKD', 'WIK', 'WMW', 'DIT'],
  STANDALONESHORTMONTHS: ['JEN', 'WKR', 'WGT', 'WKN', 'WTN', 'WTD', 'WMJ', 'WNN', 'WKD', 'WIK', 'WMW', 'DIT'],
  WEEKDAYS: ['Kiumia', 'Njumatatũ', 'Njumaine', 'Njumatana', 'Aramithi', 'Njumaa', 'Njumamothi'],
  STANDALONEWEEKDAYS: ['Kiumia', 'Njumatatũ', 'Njumaine', 'Njumatana', 'Aramithi', 'Njumaa', 'Njumamothi'],
  SHORTWEEKDAYS: ['KMA', 'NTT', 'NMN', 'NMT', 'ART', 'NMA', 'NMM'],
  STANDALONESHORTWEEKDAYS: ['KMA', 'NTT', 'NMN', 'NMT', 'ART', 'NMA', 'NMM'],
  NARROWWEEKDAYS: ['K', 'N', 'N', 'N', 'A', 'N', 'N'],
  STANDALONENARROWWEEKDAYS: ['K', 'N', 'N', 'N', 'A', 'N', 'N'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo ya mbere', 'Robo ya kerĩ', 'Robo ya gatatũ', 'Robo ya kana'],
  AMPMS: ['Kiroko', 'Hwaĩ-inĩ'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ki_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ki_KE = goog.i18n.DateTimeSymbols_ki;


/**
 * Date/time formatting symbols for locale kk_KZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kk_KZ = goog.i18n.DateTimeSymbols_kk;


/**
 * Date/time formatting symbols for locale kkj.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kkj = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['pamba', 'wanja', 'mbiyɔ mɛndoŋgɔ', 'Nyɔlɔmbɔŋgɔ', 'Mɔnɔ ŋgbanja', 'Nyaŋgwɛ ŋgbanja', 'kuŋgwɛ', 'fɛ', 'njapi', 'nyukul', '11', 'ɓulɓusɛ'],
  STANDALONEMONTHS: ['pamba', 'wanja', 'mbiyɔ mɛndoŋgɔ', 'Nyɔlɔmbɔŋgɔ', 'Mɔnɔ ŋgbanja', 'Nyaŋgwɛ ŋgbanja', 'kuŋgwɛ', 'fɛ', 'njapi', 'nyukul', '11', 'ɓulɓusɛ'],
  SHORTMONTHS: ['pamba', 'wanja', 'mbiyɔ mɛndoŋgɔ', 'Nyɔlɔmbɔŋgɔ', 'Mɔnɔ ŋgbanja', 'Nyaŋgwɛ ŋgbanja', 'kuŋgwɛ', 'fɛ', 'njapi', 'nyukul', '11', 'ɓulɓusɛ'],
  STANDALONESHORTMONTHS: ['pamba', 'wanja', 'mbiyɔ mɛndoŋgɔ', 'Nyɔlɔmbɔŋgɔ', 'Mɔnɔ ŋgbanja', 'Nyaŋgwɛ ŋgbanja', 'kuŋgwɛ', 'fɛ', 'njapi', 'nyukul', '11', 'ɓulɓusɛ'],
  WEEKDAYS: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi'],
  STANDALONEWEEKDAYS: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi'],
  SHORTWEEKDAYS: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi'],
  STANDALONESHORTWEEKDAYS: ['sɔndi', 'lundi', 'mardi', 'mɛrkɛrɛdi', 'yedi', 'vaŋdɛrɛdi', 'mɔnɔ sɔndi'],
  NARROWWEEKDAYS: ['so', 'lu', 'ma', 'mɛ', 'ye', 'va', 'ms'],
  STANDALONENARROWWEEKDAYS: ['so', 'lu', 'ma', 'mɛ', 'ye', 'va', 'ms'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE dd MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale kkj_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kkj_CM = goog.i18n.DateTimeSymbols_kkj;


/**
 * Date/time formatting symbols for locale kl.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kl = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['januari', 'februari', 'martsi', 'aprili', 'maji', 'juni', 'juli', 'augustusi', 'septemberi', 'oktoberi', 'novemberi', 'decemberi'],
  STANDALONEMONTHS: ['januari', 'februari', 'martsi', 'aprili', 'maji', 'juni', 'juli', 'augustusi', 'septemberi', 'oktoberi', 'novemberi', 'decemberi'],
  SHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['sapaat', 'ataasinngorneq', 'marlunngorneq', 'pingasunngorneq', 'sisamanngorneq', 'tallimanngorneq', 'arfininngorneq'],
  STANDALONEWEEKDAYS: ['sapaat', 'ataasinngorneq', 'marlunngorneq', 'pingasunngorneq', 'sisamanngorneq', 'tallimanngorneq', 'arfininngorneq'],
  SHORTWEEKDAYS: ['sap', 'ata', 'mar', 'pin', 'sis', 'tal', 'arf'],
  STANDALONESHORTWEEKDAYS: ['sap', 'ata', 'mar', 'pin', 'sis', 'tal', 'arf'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH.mm.ss zzzz', 'HH.mm.ss z', 'HH.mm.ss', 'HH.mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale kl_GL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kl_GL = goog.i18n.DateTimeSymbols_kl;


/**
 * Date/time formatting symbols for locale kln.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kln = {
  ERAS: ['AM', 'KO'],
  ERANAMES: ['Amait kesich Jesu', 'Kokakesich Jesu'],
  NARROWMONTHS: ['M', 'N', 'T', 'I', 'M', 'P', 'N', 'R', 'B', 'E', 'K', 'K'],
  STANDALONENARROWMONTHS: ['M', 'N', 'T', 'I', 'M', 'P', 'N', 'R', 'B', 'E', 'K', 'K'],
  MONTHS: ['Mulgul', 'Ng’atyaato', 'Kiptaamo', 'Iwootkuut', 'Mamuut', 'Paagi', 'Ng’eiyeet', 'Rooptui', 'Bureet', 'Epeeso', 'Kipsuunde ne taai', 'Kipsuunde nebo aeng’'],
  STANDALONEMONTHS: ['Mulgul', 'Ng’atyaato', 'Kiptaamo', 'Iwootkuut', 'Mamuut', 'Paagi', 'Ng’eiyeet', 'Rooptui', 'Bureet', 'Epeeso', 'Kipsuunde ne taai', 'Kipsuunde nebo aeng’'],
  SHORTMONTHS: ['Mul', 'Ngat', 'Taa', 'Iwo', 'Mam', 'Paa', 'Nge', 'Roo', 'Bur', 'Epe', 'Kpt', 'Kpa'],
  STANDALONESHORTMONTHS: ['Mul', 'Ngat', 'Taa', 'Iwo', 'Mam', 'Paa', 'Nge', 'Roo', 'Bur', 'Epe', 'Kpt', 'Kpa'],
  WEEKDAYS: ['Kotisap', 'Kotaai', 'Koaeng’', 'Kosomok', 'Koang’wan', 'Komuut', 'Kolo'],
  STANDALONEWEEKDAYS: ['Kotisap', 'Kotaai', 'Koaeng’', 'Kosomok', 'Koang’wan', 'Komuut', 'Kolo'],
  SHORTWEEKDAYS: ['Kts', 'Kot', 'Koo', 'Kos', 'Koa', 'Kom', 'Kol'],
  STANDALONESHORTWEEKDAYS: ['Kts', 'Kot', 'Koo', 'Kos', 'Koa', 'Kom', 'Kol'],
  NARROWWEEKDAYS: ['T', 'T', 'O', 'S', 'A', 'M', 'L'],
  STANDALONENARROWWEEKDAYS: ['T', 'T', 'O', 'S', 'A', 'M', 'L'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo netai', 'Robo nebo aeng’', 'Robo nebo somok', 'Robo nebo ang’wan'],
  AMPMS: ['karoon', 'kooskoliny'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale kln_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kln_KE = goog.i18n.DateTimeSymbols_kln;


/**
 * Date/time formatting symbols for locale km_KH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_km_KH = goog.i18n.DateTimeSymbols_km;


/**
 * Date/time formatting symbols for locale kn_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kn_IN = goog.i18n.DateTimeSymbols_kn;


/**
 * Date/time formatting symbols for locale ko_KP.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ko_KP = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['기원전', '서기'],
  NARROWMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  STANDALONENARROWMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  MONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  STANDALONEMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  SHORTMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  STANDALONESHORTMONTHS: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  WEEKDAYS: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  STANDALONEWEEKDAYS: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  SHORTWEEKDAYS: ['일', '월', '화', '수', '목', '금', '토'],
  STANDALONESHORTWEEKDAYS: ['일', '월', '화', '수', '목', '금', '토'],
  NARROWWEEKDAYS: ['일', '월', '화', '수', '목', '금', '토'],
  STANDALONENARROWWEEKDAYS: ['일', '월', '화', '수', '목', '금', '토'],
  SHORTQUARTERS: ['1분기', '2분기', '3분기', '4분기'],
  QUARTERS: ['제 1/4분기', '제 2/4분기', '제 3/4분기', '제 4/4분기'],
  AMPMS: ['오전', '오후'],
  DATEFORMATS: ['y년 M월 d일 EEEE', 'y년 M월 d일', 'y. M. d.', 'yy. M. d.'],
  TIMEFORMATS: ['a h시 m분 s초 zzzz', 'a h시 m분 s초 z', 'a h:mm:ss', 'a h:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ko_KR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ko_KR = goog.i18n.DateTimeSymbols_ko;


/**
 * Date/time formatting symbols for locale kok.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kok = {
  ERAS: ['क्रिस्तपूर्व', 'क्रिस्तशखा'],
  ERANAMES: ['क्रिस्तपूर्व', 'क्रिस्तशखा'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलाय', 'आगोस्त', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
  STANDALONEMONTHS: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलाय', 'आगोस्त', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
  SHORTMONTHS: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलाय', 'आगोस्त', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
  STANDALONESHORTMONTHS: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलाय', 'आगोस्त', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'],
  WEEKDAYS: ['आयतार', 'सोमार', 'मंगळार', 'बुधवार', 'गुरुवार', 'शुक्रार', 'शेनवार'],
  STANDALONEWEEKDAYS: ['आयतार', 'सोमार', 'मंगळार', 'बुधवार', 'गुरुवार', 'शुक्रार', 'शेनवार'],
  SHORTWEEKDAYS: ['आयतार', 'सोमार', 'मंगळार', 'बुधवार', 'गुरुवार', 'शुक्रार', 'शेनवार'],
  STANDALONESHORTWEEKDAYS: ['आयतार', 'सोमार', 'मंगळार', 'बुधवार', 'गुरुवार', 'शुक्रार', 'शेनवार'],
  NARROWWEEKDAYS: ['आ', 'सो', 'मं', 'बु', 'गु', 'शु', 'शे'],
  STANDALONENARROWWEEKDAYS: ['आ', 'सो', 'मं', 'बु', 'गु', 'शु', 'शे'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['म.पू.', 'म.नं.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'dd-MM-y', 'd-M-yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale kok_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kok_IN = goog.i18n.DateTimeSymbols_kok;


/**
 * Date/time formatting symbols for locale ks.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ks = {
  ZERODIGIT: 0x06F0,
  ERAS: ['بی سی', 'اے ڈی'],
  ERANAMES: ['قبٕل مسیٖح', 'عیٖسوی سنہٕ'],
  NARROWMONTHS: ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'س', 'ا', 'ن'],
  STANDALONENARROWMONTHS: ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'س', 'ا', 'ن'],
  MONTHS: ['جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن', 'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن', 'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن', 'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر', 'نومبر', 'دسمبر'],
  STANDALONESHORTMONTHS: ['جنؤری', 'فرؤری', 'مارٕچ', 'اپریل', 'میٔ', 'جوٗن', 'جوٗلایی', 'اگست', 'ستمبر', 'اکتوٗبر', 'نومبر', 'دسمبر'],
  WEEKDAYS: ['اَتھوار', 'ژٔندرٕروار', 'بۆموار', 'بودوار', 'برؠسوار', 'جُمہ', 'بٹوار'],
  STANDALONEWEEKDAYS: ['اَتھوار', 'ژٔندرٕروار', 'بۆموار', 'بودوار', 'برؠسوار', 'جُمہ', 'بٹوار'],
  SHORTWEEKDAYS: ['آتھوار', 'ژٔندٕروار', 'بۆموار', 'بودوار', 'برؠسوار', 'جُمہ', 'بٹوار'],
  STANDALONESHORTWEEKDAYS: ['آتھوار', 'ژٔندٕروار', 'بۆموار', 'بودوار', 'برؠسوار', 'جُمہ', 'بٹوار'],
  NARROWWEEKDAYS: ['ا', 'ژ', 'ب', 'ب', 'ب', 'ج', 'ب'],
  STANDALONENARROWWEEKDAYS: ['ا', 'ژ', 'ب', 'ب', 'ب', 'ج', 'ب'],
  SHORTQUARTERS: ['ژۄباگ', 'دۆیِم ژۄباگ', 'تریِم ژۄباگ', 'ژوٗرِم ژۄباگ'],
  QUARTERS: ['گۄڑنیُک ژۄباگ', 'دۆیِم ژۄباگ', 'تریِم ژۄباگ', 'ژوٗرِم ژۄباگ'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ks_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ks_IN = goog.i18n.DateTimeSymbols_ks;


/**
 * Date/time formatting symbols for locale ksb.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ksb = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Klisto', 'Baada ya Klisto'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januali', 'Febluali', 'Machi', 'Aplili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Januali', 'Febluali', 'Machi', 'Aplili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Jumaapii', 'Jumaatatu', 'Jumaane', 'Jumaatano', 'Alhamisi', 'Ijumaa', 'Jumaamosi'],
  STANDALONEWEEKDAYS: ['Jumaapii', 'Jumaatatu', 'Jumaane', 'Jumaatano', 'Alhamisi', 'Ijumaa', 'Jumaamosi'],
  SHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jmn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jmn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  NARROWWEEKDAYS: ['2', '3', '4', '5', 'A', 'I', '1'],
  STANDALONENARROWWEEKDAYS: ['2', '3', '4', '5', 'A', 'I', '1'],
  SHORTQUARTERS: ['L1', 'L2', 'L3', 'L4'],
  QUARTERS: ['Lobo ya bosi', 'Lobo ya mbii', 'Lobo ya nnd’atu', 'Lobo ya nne'],
  AMPMS: ['makeo', 'nyiaghuo'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ksb_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ksb_TZ = goog.i18n.DateTimeSymbols_ksb;


/**
 * Date/time formatting symbols for locale ksf.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ksf = {
  ERAS: ['d.Y.', 'k.Y.'],
  ERANAMES: ['di Yɛ́sus aká yálɛ', 'cámɛɛn kǝ kǝbɔpka Y'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['ŋwíí a ntɔ́ntɔ', 'ŋwíí akǝ bɛ́ɛ', 'ŋwíí akǝ ráá', 'ŋwíí akǝ nin', 'ŋwíí akǝ táan', 'ŋwíí akǝ táafɔk', 'ŋwíí akǝ táabɛɛ', 'ŋwíí akǝ táaraa', 'ŋwíí akǝ táanin', 'ŋwíí akǝ ntɛk', 'ŋwíí akǝ ntɛk di bɔ́k', 'ŋwíí akǝ ntɛk di bɛ́ɛ'],
  STANDALONEMONTHS: ['ŋwíí a ntɔ́ntɔ', 'ŋwíí akǝ bɛ́ɛ', 'ŋwíí akǝ ráá', 'ŋwíí akǝ nin', 'ŋwíí akǝ táan', 'ŋwíí akǝ táafɔk', 'ŋwíí akǝ táabɛɛ', 'ŋwíí akǝ táaraa', 'ŋwíí akǝ táanin', 'ŋwíí akǝ ntɛk', 'ŋwíí akǝ ntɛk di bɔ́k', 'ŋwíí akǝ ntɛk di bɛ́ɛ'],
  SHORTMONTHS: ['ŋ1', 'ŋ2', 'ŋ3', 'ŋ4', 'ŋ5', 'ŋ6', 'ŋ7', 'ŋ8', 'ŋ9', 'ŋ10', 'ŋ11', 'ŋ12'],
  STANDALONESHORTMONTHS: ['ŋ1', 'ŋ2', 'ŋ3', 'ŋ4', 'ŋ5', 'ŋ6', 'ŋ7', 'ŋ8', 'ŋ9', 'ŋ10', 'ŋ11', 'ŋ12'],
  WEEKDAYS: ['sɔ́ndǝ', 'lǝndí', 'maadí', 'mɛkrɛdí', 'jǝǝdí', 'júmbá', 'samdí'],
  STANDALONEWEEKDAYS: ['sɔ́ndǝ', 'lǝndí', 'maadí', 'mɛkrɛdí', 'jǝǝdí', 'júmbá', 'samdí'],
  SHORTWEEKDAYS: ['sɔ́n', 'lǝn', 'maa', 'mɛk', 'jǝǝ', 'júm', 'sam'],
  STANDALONESHORTWEEKDAYS: ['sɔ́n', 'lǝn', 'maa', 'mɛk', 'jǝǝ', 'júm', 'sam'],
  NARROWWEEKDAYS: ['s', 'l', 'm', 'm', 'j', 'j', 's'],
  STANDALONENARROWWEEKDAYS: ['s', 'l', 'm', 'm', 'j', 'j', 's'],
  SHORTQUARTERS: ['i1', 'i2', 'i3', 'i4'],
  QUARTERS: ['id́ɛ́n kǝbǝk kǝ ntɔ́ntɔ́', 'idɛ́n kǝbǝk kǝ kǝbɛ́ɛ', 'idɛ́n kǝbǝk kǝ kǝráá', 'idɛ́n kǝbǝk kǝ kǝnin'],
  AMPMS: ['sárúwá', 'cɛɛ́nko'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ksf_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ksf_CM = goog.i18n.DateTimeSymbols_ksf;


/**
 * Date/time formatting symbols for locale ksh.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ksh = {
  ERAS: ['v. Chr.', 'n. Chr.'],
  ERANAMES: ['vür Krestos', 'noh Krestos'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  MONTHS: ['Jannewa', 'Fäbrowa', 'Määz', 'Aprell', 'Mai', 'Juuni', 'Juuli', 'Oujoß', 'Septämber', 'Oktohber', 'Novämber', 'Dezämber'],
  STANDALONEMONTHS: ['Jannewa', 'Fäbrowa', 'Määz', 'Aprell', 'Mai', 'Juuni', 'Juuli', 'Oujoß', 'Septämber', 'Oktohber', 'Novämber', 'Dezämber'],
  SHORTMONTHS: ['Jan', 'Fäb', 'Mäz', 'Apr', 'Mai', 'Jun', 'Jul', 'Ouj', 'Säp', 'Okt', 'Nov', 'Dez'],
  STANDALONESHORTMONTHS: ['Jan.', 'Fäb.', 'Mäz.', 'Apr.', 'Mai', 'Jun.', 'Jul.', 'Ouj.', 'Säp.', 'Okt.', 'Nov.', 'Dez.'],
  WEEKDAYS: ['Sunndaach', 'Mohndaach', 'Dinnsdaach', 'Metwoch', 'Dunnersdaach', 'Friidaach', 'Samsdaach'],
  STANDALONEWEEKDAYS: ['Sunndaach', 'Mohndaach', 'Dinnsdaach', 'Metwoch', 'Dunnersdaach', 'Friidaach', 'Samsdaach'],
  SHORTWEEKDAYS: ['Su.', 'Mo.', 'Di.', 'Me.', 'Du.', 'Fr.', 'Sa.'],
  STANDALONESHORTWEEKDAYS: ['Su.', 'Mo.', 'Di.', 'Me.', 'Du.', 'Fr.', 'Sa.'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  SHORTQUARTERS: ['1.Q.', '2.Q.', '3.Q.', '4.Q.'],
  QUARTERS: ['1. Quattahl', '2. Quattahl', '3. Quattahl', '4. Quattahl'],
  AMPMS: ['Uhr vörmiddaachs', 'Uhr nommendaachs'],
  DATEFORMATS: ['EEEE, \'dä\' d. MMMM y', 'd. MMMM y', 'd. MMM. y', 'd. M. y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale ksh_DE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ksh_DE = goog.i18n.DateTimeSymbols_ksh;


/**
 * Date/time formatting symbols for locale ku.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ku = {
  ERAS: ['BZ', 'PZ'],
  ERANAMES: ['berî zayînê', 'piştî zayînê'],
  NARROWMONTHS: ['R', 'R', 'A', 'A', 'G', 'P', 'T', 'G', 'R', 'K', 'S', 'B'],
  STANDALONENARROWMONTHS: ['R', 'R', 'A', 'A', 'G', 'P', 'T', 'G', 'R', 'K', 'S', 'B'],
  MONTHS: ['rêbendanê', 'reşemiyê', 'adarê', 'avrêlê', 'gulanê', 'pûşperê', 'tîrmehê', 'gelawêjê', 'rezberê', 'kewçêrê', 'sermawezê', 'berfanbarê'],
  STANDALONEMONTHS: ['rêbendan', 'reşemî', 'adar', 'avrêl', 'gulan', 'pûşper', 'tîrmeh', 'gelawêj', 'rezber', 'kewçêr', 'sermawez', 'berfanbar'],
  SHORTMONTHS: ['rêb', 'reş', 'ada', 'avr', 'gul', 'pûş', 'tîr', 'gel', 'rez', 'kew', 'ser', 'ber'],
  STANDALONESHORTMONTHS: ['rêb', 'reş', 'ada', 'avr', 'gul', 'pûş', 'tîr', 'gel', 'rez', 'kew', 'ser', 'ber'],
  WEEKDAYS: ['yekşem', 'duşem', 'sêşem', 'çarşem', 'pêncşem', 'în', 'şemî'],
  STANDALONEWEEKDAYS: ['yekşem', 'duşem', 'sêşem', 'çarşem', 'pêncşem', 'în', 'şemî'],
  SHORTWEEKDAYS: ['yş', 'dş', 'sş', 'çş', 'pş', 'în', 'ş'],
  STANDALONESHORTWEEKDAYS: ['yş', 'dş', 'sş', 'çş', 'pş', 'în', 'ş'],
  NARROWWEEKDAYS: ['Y', 'D', 'S', 'Ç', 'P', 'Î', 'Ş'],
  STANDALONENARROWWEEKDAYS: ['Y', 'D', 'S', 'Ç', 'P', 'Î', 'Ş'],
  SHORTQUARTERS: ['Ç1', 'Ç2', 'Ç3', 'Ç4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ku_TR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ku_TR = goog.i18n.DateTimeSymbols_ku;


/**
 * Date/time formatting symbols for locale kw.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kw = {
  ERAS: ['RC', 'AD'],
  ERANAMES: ['RC', 'AD'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['mis Genver', 'mis Hwevrer', 'mis Meurth', 'mis Ebrel', 'mis Me', 'mis Metheven', 'mis Gortheren', 'mis Est', 'mis Gwynngala', 'mis Hedra', 'mis Du', 'mis Kevardhu'],
  STANDALONEMONTHS: ['mis Genver', 'mis Hwevrer', 'mis Meurth', 'mis Ebrel', 'mis Me', 'mis Metheven', 'mis Gortheren', 'mis Est', 'mis Gwynngala', 'mis Hedra', 'mis Du', 'mis Kevardhu'],
  SHORTMONTHS: ['Gen', 'Hwe', 'Meu', 'Ebr', 'Me', 'Met', 'Gor', 'Est', 'Gwn', 'Hed', 'Du', 'Kev'],
  STANDALONESHORTMONTHS: ['Gen', 'Hwe', 'Meu', 'Ebr', 'Me', 'Met', 'Gor', 'Est', 'Gwn', 'Hed', 'Du', 'Kev'],
  WEEKDAYS: ['dy Sul', 'dy Lun', 'dy Meurth', 'dy Merher', 'dy Yow', 'dy Gwener', 'dy Sadorn'],
  STANDALONEWEEKDAYS: ['dy Sul', 'dy Lun', 'dy Meurth', 'dy Merher', 'dy Yow', 'dy Gwener', 'dy Sadorn'],
  SHORTWEEKDAYS: ['Sul', 'Lun', 'Mth', 'Mhr', 'Yow', 'Gwe', 'Sad'],
  STANDALONESHORTWEEKDAYS: ['Sul', 'Lun', 'Mth', 'Mhr', 'Yow', 'Gwe', 'Sad'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale kw_GB.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_kw_GB = goog.i18n.DateTimeSymbols_kw;


/**
 * Date/time formatting symbols for locale ky_KG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ky_KG = goog.i18n.DateTimeSymbols_ky;


/**
 * Date/time formatting symbols for locale lag.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lag = {
  ERAS: ['KSA', 'KA'],
  ERANAMES: ['Kɨrɨsitʉ sɨ anavyaal', 'Kɨrɨsitʉ akavyaalwe'],
  NARROWMONTHS: ['F', 'N', 'K', 'I', 'I', 'I', 'M', 'V', 'S', 'I', 'S', 'S'],
  STANDALONENARROWMONTHS: ['F', 'N', 'K', 'I', 'I', 'I', 'M', 'V', 'S', 'I', 'S', 'S'],
  MONTHS: ['Kʉfúngatɨ', 'Kʉnaanɨ', 'Kʉkeenda', 'Kwiikumi', 'Kwiinyambála', 'Kwiidwaata', 'Kʉmʉʉnchɨ', 'Kʉvɨɨrɨ', 'Kʉsaatʉ', 'Kwiinyi', 'Kʉsaano', 'Kʉsasatʉ'],
  STANDALONEMONTHS: ['Kʉfúngatɨ', 'Kʉnaanɨ', 'Kʉkeenda', 'Kwiikumi', 'Kwiinyambála', 'Kwiidwaata', 'Kʉmʉʉnchɨ', 'Kʉvɨɨrɨ', 'Kʉsaatʉ', 'Kwiinyi', 'Kʉsaano', 'Kʉsasatʉ'],
  SHORTMONTHS: ['Fúngatɨ', 'Naanɨ', 'Keenda', 'Ikúmi', 'Inyambala', 'Idwaata', 'Mʉʉnchɨ', 'Vɨɨrɨ', 'Saatʉ', 'Inyi', 'Saano', 'Sasatʉ'],
  STANDALONESHORTMONTHS: ['Fúngatɨ', 'Naanɨ', 'Keenda', 'Ikúmi', 'Inyambala', 'Idwaata', 'Mʉʉnchɨ', 'Vɨɨrɨ', 'Saatʉ', 'Inyi', 'Saano', 'Sasatʉ'],
  WEEKDAYS: ['Jumapíiri', 'Jumatátu', 'Jumaíne', 'Jumatáano', 'Alamíisi', 'Ijumáa', 'Jumamóosi'],
  STANDALONEWEEKDAYS: ['Jumapíiri', 'Jumatátu', 'Jumaíne', 'Jumatáano', 'Alamíisi', 'Ijumáa', 'Jumamóosi'],
  SHORTWEEKDAYS: ['Píili', 'Táatu', 'Íne', 'Táano', 'Alh', 'Ijm', 'Móosi'],
  STANDALONESHORTWEEKDAYS: ['Píili', 'Táatu', 'Íne', 'Táano', 'Alh', 'Ijm', 'Móosi'],
  NARROWWEEKDAYS: ['P', 'T', 'E', 'O', 'A', 'I', 'M'],
  STANDALONENARROWWEEKDAYS: ['P', 'T', 'E', 'O', 'A', 'I', 'M'],
  SHORTQUARTERS: ['Ncho 1', 'Ncho 2', 'Ncho 3', 'Ncho 4'],
  QUARTERS: ['Ncholo ya 1', 'Ncholo ya 2', 'Ncholo ya 3', 'Ncholo ya 4'],
  AMPMS: ['TOO', 'MUU'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale lag_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lag_TZ = goog.i18n.DateTimeSymbols_lag;


/**
 * Date/time formatting symbols for locale lb.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lb = {
  ERAS: ['v. Chr.', 'n. Chr.'],
  ERANAMES: ['v. Chr.', 'n. Chr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januar', 'Februar', 'Mäerz', 'Abrëll', 'Mee', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  STANDALONEMONTHS: ['Januar', 'Februar', 'Mäerz', 'Abrëll', 'Mee', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  SHORTMONTHS: ['Jan.', 'Feb.', 'Mäe.', 'Abr.', 'Mee', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mäe', 'Abr', 'Mee', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
  WEEKDAYS: ['Sonndeg', 'Méindeg', 'Dënschdeg', 'Mëttwoch', 'Donneschdeg', 'Freideg', 'Samschdeg'],
  STANDALONEWEEKDAYS: ['Sonndeg', 'Méindeg', 'Dënschdeg', 'Mëttwoch', 'Donneschdeg', 'Freideg', 'Samschdeg'],
  SHORTWEEKDAYS: ['Son.', 'Méi.', 'Dën.', 'Mët.', 'Don.', 'Fre.', 'Sam.'],
  STANDALONESHORTWEEKDAYS: ['Son', 'Méi', 'Dën', 'Mët', 'Don', 'Fre', 'Sam'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'M', 'D', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. Quartal', '2. Quartal', '3. Quartal', '4. Quartal'],
  AMPMS: ['moies', 'nomëttes'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'd. MMM y', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale lb_LU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lb_LU = goog.i18n.DateTimeSymbols_lb;


/**
 * Date/time formatting symbols for locale lg.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lg = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Kulisito nga tannaza', 'Bukya Kulisito Azaal'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Janwaliyo', 'Febwaliyo', 'Marisi', 'Apuli', 'Maayi', 'Juuni', 'Julaayi', 'Agusito', 'Sebuttemba', 'Okitobba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Janwaliyo', 'Febwaliyo', 'Marisi', 'Apuli', 'Maayi', 'Juuni', 'Julaayi', 'Agusito', 'Sebuttemba', 'Okitobba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apu', 'Maa', 'Juu', 'Jul', 'Agu', 'Seb', 'Oki', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apu', 'Maa', 'Juu', 'Jul', 'Agu', 'Seb', 'Oki', 'Nov', 'Des'],
  WEEKDAYS: ['Sabbiiti', 'Balaza', 'Lwakubiri', 'Lwakusatu', 'Lwakuna', 'Lwakutaano', 'Lwamukaaga'],
  STANDALONEWEEKDAYS: ['Sabbiiti', 'Balaza', 'Lwakubiri', 'Lwakusatu', 'Lwakuna', 'Lwakutaano', 'Lwamukaaga'],
  SHORTWEEKDAYS: ['Sab', 'Bal', 'Lw2', 'Lw3', 'Lw4', 'Lw5', 'Lw6'],
  STANDALONESHORTWEEKDAYS: ['Sab', 'Bal', 'Lw2', 'Lw3', 'Lw4', 'Lw5', 'Lw6'],
  NARROWWEEKDAYS: ['S', 'B', 'L', 'L', 'L', 'L', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'B', 'L', 'L', 'L', 'L', 'L'],
  SHORTQUARTERS: ['Kya1', 'Kya2', 'Kya3', 'Kya4'],
  QUARTERS: ['Kyakuna 1', 'Kyakuna 2', 'Kyakuna 3', 'Kyakuna 4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale lg_UG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lg_UG = goog.i18n.DateTimeSymbols_lg;


/**
 * Date/time formatting symbols for locale lkt.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lkt = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Wiótheȟika Wí', 'Thiyóȟeyuŋka Wí', 'Ištáwičhayazaŋ Wí', 'Pȟežítȟo Wí', 'Čhaŋwápetȟo Wí', 'Wípazukȟa-wašté Wí', 'Čhaŋpȟásapa Wí', 'Wasútȟuŋ Wí', 'Čhaŋwápeǧi Wí', 'Čhaŋwápe-kasná Wí', 'Waníyetu Wí', 'Tȟahékapšuŋ Wí'],
  STANDALONEMONTHS: ['Wiótheȟika Wí', 'Thiyóȟeyuŋka Wí', 'Ištáwičhayazaŋ Wí', 'Pȟežítȟo Wí', 'Čhaŋwápetȟo Wí', 'Wípazukȟa-wašté Wí', 'Čhaŋpȟásapa Wí', 'Wasútȟuŋ Wí', 'Čhaŋwápeǧi Wí', 'Čhaŋwápe-kasná Wí', 'Waníyetu Wí', 'Tȟahékapšuŋ Wí'],
  SHORTMONTHS: ['Wiótheȟika Wí', 'Thiyóȟeyuŋka Wí', 'Ištáwičhayazaŋ Wí', 'Pȟežítȟo Wí', 'Čhaŋwápetȟo Wí', 'Wípazukȟa-wašté Wí', 'Čhaŋpȟásapa Wí', 'Wasútȟuŋ Wí', 'Čhaŋwápeǧi Wí', 'Čhaŋwápe-kasná Wí', 'Waníyetu Wí', 'Tȟahékapšuŋ Wí'],
  STANDALONESHORTMONTHS: ['Wiótheȟika Wí', 'Thiyóȟeyuŋka Wí', 'Ištáwičhayazaŋ Wí', 'Pȟežítȟo Wí', 'Čhaŋwápetȟo Wí', 'Wípazukȟa-wašté Wí', 'Čhaŋpȟásapa Wí', 'Wasútȟuŋ Wí', 'Čhaŋwápeǧi Wí', 'Čhaŋwápe-kasná Wí', 'Waníyetu Wí', 'Tȟahékapšuŋ Wí'],
  WEEKDAYS: ['Aŋpétuwakȟaŋ', 'Aŋpétuwaŋži', 'Aŋpétunuŋpa', 'Aŋpétuyamni', 'Aŋpétutopa', 'Aŋpétuzaptaŋ', 'Owáŋgyužažapi'],
  STANDALONEWEEKDAYS: ['Aŋpétuwakȟaŋ', 'Aŋpétuwaŋži', 'Aŋpétunuŋpa', 'Aŋpétuyamni', 'Aŋpétutopa', 'Aŋpétuzaptaŋ', 'Owáŋgyužažapi'],
  SHORTWEEKDAYS: ['Aŋpétuwakȟaŋ', 'Aŋpétuwaŋži', 'Aŋpétunuŋpa', 'Aŋpétuyamni', 'Aŋpétutopa', 'Aŋpétuzaptaŋ', 'Owáŋgyužažapi'],
  STANDALONESHORTWEEKDAYS: ['Aŋpétuwakȟaŋ', 'Aŋpétuwaŋži', 'Aŋpétunuŋpa', 'Aŋpétuyamni', 'Aŋpétutopa', 'Aŋpétuzaptaŋ', 'Owáŋgyužažapi'],
  NARROWWEEKDAYS: ['A', 'W', 'N', 'Y', 'T', 'Z', 'O'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale lkt_US.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lkt_US = goog.i18n.DateTimeSymbols_lkt;


/**
 * Date/time formatting symbols for locale ln_AO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ln_AO = goog.i18n.DateTimeSymbols_ln;


/**
 * Date/time formatting symbols for locale ln_CD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ln_CD = goog.i18n.DateTimeSymbols_ln;


/**
 * Date/time formatting symbols for locale ln_CF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ln_CF = goog.i18n.DateTimeSymbols_ln;


/**
 * Date/time formatting symbols for locale ln_CG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ln_CG = goog.i18n.DateTimeSymbols_ln;


/**
 * Date/time formatting symbols for locale lo_LA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lo_LA = goog.i18n.DateTimeSymbols_lo;


/**
 * Date/time formatting symbols for locale lrc.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lrc = {
  ZERODIGIT: 0x06F0,
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر', 'نوڤامر', 'دئسامر'],
  STANDALONEMONTHS: ['جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر', 'نوڤامر', 'دئسامر'],
  SHORTMONTHS: ['جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر', 'نوڤامر', 'دئسامر'],
  STANDALONESHORTMONTHS: ['جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر', 'نوڤامر', 'دئسامر'],
  WEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONEWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 4],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale lrc_IQ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lrc_IQ = {
  ZERODIGIT: 0x06F0,
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر', 'نوڤامر', 'دئسامر'],
  STANDALONEMONTHS: ['جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر', 'نوڤامر', 'دئسامر'],
  SHORTMONTHS: ['جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر', 'نوڤامر', 'دئسامر'],
  STANDALONESHORTMONTHS: ['جانڤیە', 'فئڤریە', 'مارس', 'آڤریل', 'مئی', 'جوٙأن', 'جوٙلا', 'آگوست', 'سئپتامر', 'ئوکتوڤر', 'نوڤامر', 'دئسامر'],
  WEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONEWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 5],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale lrc_IR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lrc_IR = goog.i18n.DateTimeSymbols_lrc;


/**
 * Date/time formatting symbols for locale lt_LT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lt_LT = goog.i18n.DateTimeSymbols_lt;


/**
 * Date/time formatting symbols for locale lu.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lu = {
  ERAS: ['kmp. Y.K.', 'kny. Y. K.'],
  ERANAMES: ['Kumpala kwa Yezu Kli', 'Kunyima kwa Yezu Kli'],
  NARROWMONTHS: ['C', 'L', 'L', 'M', 'L', 'L', 'K', 'L', 'L', 'L', 'K', 'C'],
  STANDALONENARROWMONTHS: ['C', 'L', 'L', 'M', 'L', 'L', 'K', 'L', 'L', 'L', 'K', 'C'],
  MONTHS: ['Ciongo', 'Lùishi', 'Lusòlo', 'Mùuyà', 'Lumùngùlù', 'Lufuimi', 'Kabàlàshìpù', 'Lùshìkà', 'Lutongolo', 'Lungùdi', 'Kaswèkèsè', 'Ciswà'],
  STANDALONEMONTHS: ['Ciongo', 'Lùishi', 'Lusòlo', 'Mùuyà', 'Lumùngùlù', 'Lufuimi', 'Kabàlàshìpù', 'Lùshìkà', 'Lutongolo', 'Lungùdi', 'Kaswèkèsè', 'Ciswà'],
  SHORTMONTHS: ['Cio', 'Lui', 'Lus', 'Muu', 'Lum', 'Luf', 'Kab', 'Lush', 'Lut', 'Lun', 'Kas', 'Cis'],
  STANDALONESHORTMONTHS: ['Cio', 'Lui', 'Lus', 'Muu', 'Lum', 'Luf', 'Kab', 'Lush', 'Lut', 'Lun', 'Kas', 'Cis'],
  WEEKDAYS: ['Lumingu', 'Nkodya', 'Ndàayà', 'Ndangù', 'Njòwa', 'Ngòvya', 'Lubingu'],
  STANDALONEWEEKDAYS: ['Lumingu', 'Nkodya', 'Ndàayà', 'Ndangù', 'Njòwa', 'Ngòvya', 'Lubingu'],
  SHORTWEEKDAYS: ['Lum', 'Nko', 'Ndy', 'Ndg', 'Njw', 'Ngv', 'Lub'],
  STANDALONESHORTWEEKDAYS: ['Lum', 'Nko', 'Ndy', 'Ndg', 'Njw', 'Ngv', 'Lub'],
  NARROWWEEKDAYS: ['L', 'N', 'N', 'N', 'N', 'N', 'L'],
  STANDALONENARROWWEEKDAYS: ['L', 'N', 'N', 'N', 'N', 'N', 'L'],
  SHORTQUARTERS: ['M1', 'M2', 'M3', 'M4'],
  QUARTERS: ['Mueji 1', 'Mueji 2', 'Mueji 3', 'Mueji 4'],
  AMPMS: ['Dinda', 'Dilolo'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale lu_CD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lu_CD = goog.i18n.DateTimeSymbols_lu;


/**
 * Date/time formatting symbols for locale luo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_luo = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Kapok Kristo obiro', 'Ka Kristo osebiro'],
  NARROWMONTHS: ['C', 'R', 'D', 'N', 'B', 'U', 'B', 'B', 'C', 'P', 'C', 'P'],
  STANDALONENARROWMONTHS: ['C', 'R', 'D', 'N', 'B', 'U', 'B', 'B', 'C', 'P', 'C', 'P'],
  MONTHS: ['Dwe mar Achiel', 'Dwe mar Ariyo', 'Dwe mar Adek', 'Dwe mar Ang’wen', 'Dwe mar Abich', 'Dwe mar Auchiel', 'Dwe mar Abiriyo', 'Dwe mar Aboro', 'Dwe mar Ochiko', 'Dwe mar Apar', 'Dwe mar gi achiel', 'Dwe mar Apar gi ariyo'],
  STANDALONEMONTHS: ['Dwe mar Achiel', 'Dwe mar Ariyo', 'Dwe mar Adek', 'Dwe mar Ang’wen', 'Dwe mar Abich', 'Dwe mar Auchiel', 'Dwe mar Abiriyo', 'Dwe mar Aboro', 'Dwe mar Ochiko', 'Dwe mar Apar', 'Dwe mar gi achiel', 'Dwe mar Apar gi ariyo'],
  SHORTMONTHS: ['DAC', 'DAR', 'DAD', 'DAN', 'DAH', 'DAU', 'DAO', 'DAB', 'DOC', 'DAP', 'DGI', 'DAG'],
  STANDALONESHORTMONTHS: ['DAC', 'DAR', 'DAD', 'DAN', 'DAH', 'DAU', 'DAO', 'DAB', 'DOC', 'DAP', 'DGI', 'DAG'],
  WEEKDAYS: ['Jumapil', 'Wuok Tich', 'Tich Ariyo', 'Tich Adek', 'Tich Ang’wen', 'Tich Abich', 'Ngeso'],
  STANDALONEWEEKDAYS: ['Jumapil', 'Wuok Tich', 'Tich Ariyo', 'Tich Adek', 'Tich Ang’wen', 'Tich Abich', 'Ngeso'],
  SHORTWEEKDAYS: ['JMP', 'WUT', 'TAR', 'TAD', 'TAN', 'TAB', 'NGS'],
  STANDALONESHORTWEEKDAYS: ['JMP', 'WUT', 'TAR', 'TAD', 'TAN', 'TAB', 'NGS'],
  NARROWWEEKDAYS: ['J', 'W', 'T', 'T', 'T', 'T', 'N'],
  STANDALONENARROWWEEKDAYS: ['J', 'W', 'T', 'T', 'T', 'T', 'N'],
  SHORTQUARTERS: ['NMN1', 'NMN2', 'NMN3', 'NMN4'],
  QUARTERS: ['nus mar nus 1', 'nus mar nus 2', 'nus mar nus 3', 'nus mar nus 4'],
  AMPMS: ['OD', 'OT'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale luo_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_luo_KE = goog.i18n.DateTimeSymbols_luo;


/**
 * Date/time formatting symbols for locale luy.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_luy = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Imberi ya Kuuza Kwa', 'Muhiga Kuvita Kuuza'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Jumapiri', 'Jumatatu', 'Jumanne', 'Jumatano', 'Murwa wa Kanne', 'Murwa wa Katano', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Jumapiri', 'Jumatatu', 'Jumanne', 'Jumatano', 'Murwa wa Kanne', 'Murwa wa Katano', 'Jumamosi'],
  SHORTWEEKDAYS: ['J2', 'J3', 'J4', 'J5', 'Al', 'Ij', 'J1'],
  STANDALONESHORTWEEKDAYS: ['J2', 'J3', 'J4', 'J5', 'Al', 'Ij', 'J1'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Robo ya Kala', 'Robo ya Kaviri', 'Robo ya Kavaga', 'Robo ya Kanne'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale luy_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_luy_KE = goog.i18n.DateTimeSymbols_luy;


/**
 * Date/time formatting symbols for locale lv_LV.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_lv_LV = goog.i18n.DateTimeSymbols_lv;


/**
 * Date/time formatting symbols for locale mas.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mas = {
  ERAS: ['MY', 'EY'],
  ERANAMES: ['Meínō Yɛ́sʉ', 'Eínō Yɛ́sʉ'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Oladalʉ́', 'Arát', 'Ɔɛnɨ́ɔɨŋɔk', 'Olodoyíóríê inkókúâ', 'Oloilépūnyīē inkókúâ', 'Kújúɔrɔk', 'Mórusásin', 'Ɔlɔ́ɨ́bɔ́rárɛ', 'Kúshîn', 'Olgísan', 'Pʉshʉ́ka', 'Ntʉ́ŋʉ́s'],
  STANDALONEMONTHS: ['Oladalʉ́', 'Arát', 'Ɔɛnɨ́ɔɨŋɔk', 'Olodoyíóríê inkókúâ', 'Oloilépūnyīē inkókúâ', 'Kújúɔrɔk', 'Mórusásin', 'Ɔlɔ́ɨ́bɔ́rárɛ', 'Kúshîn', 'Olgísan', 'Pʉshʉ́ka', 'Ntʉ́ŋʉ́s'],
  SHORTMONTHS: ['Dal', 'Ará', 'Ɔɛn', 'Doy', 'Lép', 'Rok', 'Sás', 'Bɔ́r', 'Kús', 'Gís', 'Shʉ́', 'Ntʉ́'],
  STANDALONESHORTMONTHS: ['Dal', 'Ará', 'Ɔɛn', 'Doy', 'Lép', 'Rok', 'Sás', 'Bɔ́r', 'Kús', 'Gís', 'Shʉ́', 'Ntʉ́'],
  WEEKDAYS: ['Jumapílí', 'Jumatátu', 'Jumane', 'Jumatánɔ', 'Alaámisi', 'Jumáa', 'Jumamósi'],
  STANDALONEWEEKDAYS: ['Jumapílí', 'Jumatátu', 'Jumane', 'Jumatánɔ', 'Alaámisi', 'Jumáa', 'Jumamósi'],
  SHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  NARROWWEEKDAYS: ['2', '3', '4', '5', '6', '7', '1'],
  STANDALONENARROWWEEKDAYS: ['2', '3', '4', '5', '6', '7', '1'],
  SHORTQUARTERS: ['E1', 'E2', 'E3', 'E4'],
  QUARTERS: ['Erobo 1', 'Erobo 2', 'Erobo 3', 'Erobo 4'],
  AMPMS: ['Ɛnkakɛnyá', 'Ɛndámâ'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale mas_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mas_KE = goog.i18n.DateTimeSymbols_mas;


/**
 * Date/time formatting symbols for locale mas_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mas_TZ = {
  ERAS: ['MY', 'EY'],
  ERANAMES: ['Meínō Yɛ́sʉ', 'Eínō Yɛ́sʉ'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Oladalʉ́', 'Arát', 'Ɔɛnɨ́ɔɨŋɔk', 'Olodoyíóríê inkókúâ', 'Oloilépūnyīē inkókúâ', 'Kújúɔrɔk', 'Mórusásin', 'Ɔlɔ́ɨ́bɔ́rárɛ', 'Kúshîn', 'Olgísan', 'Pʉshʉ́ka', 'Ntʉ́ŋʉ́s'],
  STANDALONEMONTHS: ['Oladalʉ́', 'Arát', 'Ɔɛnɨ́ɔɨŋɔk', 'Olodoyíóríê inkókúâ', 'Oloilépūnyīē inkókúâ', 'Kújúɔrɔk', 'Mórusásin', 'Ɔlɔ́ɨ́bɔ́rárɛ', 'Kúshîn', 'Olgísan', 'Pʉshʉ́ka', 'Ntʉ́ŋʉ́s'],
  SHORTMONTHS: ['Dal', 'Ará', 'Ɔɛn', 'Doy', 'Lép', 'Rok', 'Sás', 'Bɔ́r', 'Kús', 'Gís', 'Shʉ́', 'Ntʉ́'],
  STANDALONESHORTMONTHS: ['Dal', 'Ará', 'Ɔɛn', 'Doy', 'Lép', 'Rok', 'Sás', 'Bɔ́r', 'Kús', 'Gís', 'Shʉ́', 'Ntʉ́'],
  WEEKDAYS: ['Jumapílí', 'Jumatátu', 'Jumane', 'Jumatánɔ', 'Alaámisi', 'Jumáa', 'Jumamósi'],
  STANDALONEWEEKDAYS: ['Jumapílí', 'Jumatátu', 'Jumane', 'Jumatánɔ', 'Alaámisi', 'Jumáa', 'Jumamósi'],
  SHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  NARROWWEEKDAYS: ['2', '3', '4', '5', '6', '7', '1'],
  STANDALONENARROWWEEKDAYS: ['2', '3', '4', '5', '6', '7', '1'],
  SHORTQUARTERS: ['E1', 'E2', 'E3', 'E4'],
  QUARTERS: ['Erobo 1', 'Erobo 2', 'Erobo 3', 'Erobo 4'],
  AMPMS: ['Ɛnkakɛnyá', 'Ɛndámâ'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale mer.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mer = {
  ERAS: ['MK', 'NK'],
  ERANAMES: ['Mbere ya Kristũ', 'Nyuma ya Kristũ'],
  NARROWMONTHS: ['J', 'F', 'M', 'Ĩ', 'M', 'N', 'N', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'Ĩ', 'M', 'N', 'N', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januarĩ', 'Feburuarĩ', 'Machi', 'Ĩpurũ', 'Mĩĩ', 'Njuni', 'Njuraĩ', 'Agasti', 'Septemba', 'Oktũba', 'Novemba', 'Dicemba'],
  STANDALONEMONTHS: ['Januarĩ', 'Feburuarĩ', 'Machi', 'Ĩpurũ', 'Mĩĩ', 'Njuni', 'Njuraĩ', 'Agasti', 'Septemba', 'Oktũba', 'Novemba', 'Dicemba'],
  SHORTMONTHS: ['JAN', 'FEB', 'MAC', 'ĨPU', 'MĨĨ', 'NJU', 'NJR', 'AGA', 'SPT', 'OKT', 'NOV', 'DEC'],
  STANDALONESHORTMONTHS: ['JAN', 'FEB', 'MAC', 'ĨPU', 'MĨĨ', 'NJU', 'NJR', 'AGA', 'SPT', 'OKT', 'NOV', 'DEC'],
  WEEKDAYS: ['Kiumia', 'Muramuko', 'Wairi', 'Wethatu', 'Wena', 'Wetano', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Kiumia', 'Muramuko', 'Wairi', 'Wethatu', 'Wena', 'Wetano', 'Jumamosi'],
  SHORTWEEKDAYS: ['KIU', 'MRA', 'WAI', 'WET', 'WEN', 'WTN', 'JUM'],
  STANDALONESHORTWEEKDAYS: ['KIU', 'MRA', 'WAI', 'WET', 'WEN', 'WTN', 'JUM'],
  NARROWWEEKDAYS: ['K', 'M', 'W', 'W', 'W', 'W', 'J'],
  STANDALONENARROWWEEKDAYS: ['K', 'M', 'W', 'W', 'W', 'W', 'J'],
  SHORTQUARTERS: ['Ĩmwe kĩrĩ inya', 'Ijĩrĩ kĩrĩ inya', 'Ithatũ kĩrĩ inya', 'Inya kĩrĩ inya'],
  QUARTERS: ['Ĩmwe kĩrĩ inya', 'Ijĩrĩ kĩrĩ inya', 'Ithatũ kĩrĩ inya', 'Inya kĩrĩ inya'],
  AMPMS: ['RŨ', 'ŨG'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale mer_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mer_KE = goog.i18n.DateTimeSymbols_mer;


/**
 * Date/time formatting symbols for locale mfe.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mfe = {
  ERAS: ['av. Z-K', 'ap. Z-K'],
  ERANAMES: ['avan Zezi-Krist', 'apre Zezi-Krist'],
  NARROWMONTHS: ['z', 'f', 'm', 'a', 'm', 'z', 'z', 'o', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['z', 'f', 'm', 'a', 'm', 'z', 'z', 'o', 's', 'o', 'n', 'd'],
  MONTHS: ['zanvie', 'fevriye', 'mars', 'avril', 'me', 'zin', 'zilye', 'out', 'septam', 'oktob', 'novam', 'desam'],
  STANDALONEMONTHS: ['zanvie', 'fevriye', 'mars', 'avril', 'me', 'zin', 'zilye', 'out', 'septam', 'oktob', 'novam', 'desam'],
  SHORTMONTHS: ['zan', 'fev', 'mar', 'avr', 'me', 'zin', 'zil', 'out', 'sep', 'okt', 'nov', 'des'],
  STANDALONESHORTMONTHS: ['zan', 'fev', 'mar', 'avr', 'me', 'zin', 'zil', 'out', 'sep', 'okt', 'nov', 'des'],
  WEEKDAYS: ['dimans', 'lindi', 'mardi', 'merkredi', 'zedi', 'vandredi', 'samdi'],
  STANDALONEWEEKDAYS: ['dimans', 'lindi', 'mardi', 'merkredi', 'zedi', 'vandredi', 'samdi'],
  SHORTWEEKDAYS: ['dim', 'lin', 'mar', 'mer', 'ze', 'van', 'sam'],
  STANDALONESHORTWEEKDAYS: ['dim', 'lin', 'mar', 'mer', 'ze', 'van', 'sam'],
  NARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'z', 'v', 's'],
  STANDALONENARROWWEEKDAYS: ['d', 'l', 'm', 'm', 'z', 'v', 's'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1e trimes', '2em trimes', '3em trimes', '4em trimes'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale mfe_MU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mfe_MU = goog.i18n.DateTimeSymbols_mfe;


/**
 * Date/time formatting symbols for locale mg.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mg = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Alohan’i JK', 'Aorian’i JK'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'],
  STANDALONEMONTHS: ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mey', 'Jon', 'Jol', 'Aog', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'Mey', 'Jon', 'Jol', 'Aog', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Asabotsy'],
  STANDALONEWEEKDAYS: ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Asabotsy'],
  SHORTWEEKDAYS: ['Alah', 'Alats', 'Tal', 'Alar', 'Alak', 'Zom', 'Asab'],
  STANDALONESHORTWEEKDAYS: ['Alah', 'Alats', 'Tal', 'Alar', 'Alak', 'Zom', 'Asab'],
  NARROWWEEKDAYS: ['A', 'A', 'T', 'A', 'A', 'Z', 'A'],
  STANDALONENARROWWEEKDAYS: ['A', 'A', 'T', 'A', 'A', 'Z', 'A'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Telovolana voalohany', 'Telovolana faharoa', 'Telovolana fahatelo', 'Telovolana fahefatra'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale mg_MG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mg_MG = goog.i18n.DateTimeSymbols_mg;


/**
 * Date/time formatting symbols for locale mgh.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mgh = {
  ERAS: ['HY', 'YY'],
  ERANAMES: ['Hinapiya yesu', 'Yopia yesu'],
  NARROWMONTHS: ['K', 'U', 'R', 'C', 'T', 'M', 'S', 'N', 'T', 'K', 'M', 'Y'],
  STANDALONENARROWMONTHS: ['K', 'U', 'R', 'C', 'T', 'M', 'S', 'N', 'T', 'K', 'M', 'Y'],
  MONTHS: ['Mweri wo kwanza', 'Mweri wo unayeli', 'Mweri wo uneraru', 'Mweri wo unecheshe', 'Mweri wo unethanu', 'Mweri wo thanu na mocha', 'Mweri wo saba', 'Mweri wo nane', 'Mweri wo tisa', 'Mweri wo kumi', 'Mweri wo kumi na moja', 'Mweri wo kumi na yel’li'],
  STANDALONEMONTHS: ['Mweri wo kwanza', 'Mweri wo unayeli', 'Mweri wo uneraru', 'Mweri wo unecheshe', 'Mweri wo unethanu', 'Mweri wo thanu na mocha', 'Mweri wo saba', 'Mweri wo nane', 'Mweri wo tisa', 'Mweri wo kumi', 'Mweri wo kumi na moja', 'Mweri wo kumi na yel’li'],
  SHORTMONTHS: ['Kwa', 'Una', 'Rar', 'Che', 'Tha', 'Moc', 'Sab', 'Nan', 'Tis', 'Kum', 'Moj', 'Yel'],
  STANDALONESHORTMONTHS: ['Kwa', 'Una', 'Rar', 'Che', 'Tha', 'Moc', 'Sab', 'Nan', 'Tis', 'Kum', 'Moj', 'Yel'],
  WEEKDAYS: ['Sabato', 'Jumatatu', 'Jumanne', 'Jumatano', 'Arahamisi', 'Ijumaa', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Sabato', 'Jumatatu', 'Jumanne', 'Jumatano', 'Arahamisi', 'Ijumaa', 'Jumamosi'],
  SHORTWEEKDAYS: ['Sab', 'Jtt', 'Jnn', 'Jtn', 'Ara', 'Iju', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Sab', 'Jtt', 'Jnn', 'Jtn', 'Ara', 'Iju', 'Jmo'],
  NARROWWEEKDAYS: ['S', 'J', 'J', 'J', 'A', 'I', 'J'],
  STANDALONENARROWWEEKDAYS: ['S', 'J', 'J', 'J', 'A', 'I', 'J'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['wichishu', 'mchochil’l'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale mgh_MZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mgh_MZ = goog.i18n.DateTimeSymbols_mgh;


/**
 * Date/time formatting symbols for locale mgo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mgo = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['M1', 'A2', 'M3', 'N4', 'F5', 'I6', 'A7', 'I8', 'K9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['M1', 'A2', 'M3', 'N4', 'F5', 'I6', 'A7', 'I8', 'K9', '10', '11', '12'],
  MONTHS: ['iməg mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd', 'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'],
  STANDALONEMONTHS: ['iməg mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd', 'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'],
  SHORTMONTHS: ['mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd', 'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'],
  STANDALONESHORTMONTHS: ['mbegtug', 'imeg àbùbì', 'imeg mbəŋchubi', 'iməg ngwə̀t', 'iməg fog', 'iməg ichiibɔd', 'iməg àdùmbə̀ŋ', 'iməg ichika', 'iməg kud', 'iməg tèsiʼe', 'iməg zò', 'iməg krizmed'],
  WEEKDAYS: ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7'],
  STANDALONEWEEKDAYS: ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7'],
  SHORTWEEKDAYS: ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7'],
  STANDALONESHORTWEEKDAYS: ['Aneg 1', 'Aneg 2', 'Aneg 3', 'Aneg 4', 'Aneg 5', 'Aneg 6', 'Aneg 7'],
  NARROWWEEKDAYS: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
  STANDALONENARROWWEEKDAYS: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, y MMMM dd', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale mgo_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mgo_CM = goog.i18n.DateTimeSymbols_mgo;


/**
 * Date/time formatting symbols for locale mi.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mi = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['K', 'H', 'P', 'P', 'H', 'P', 'H', 'H', 'M', 'N', 'R', 'H'],
  STANDALONENARROWMONTHS: ['K', 'H', 'P', 'P', 'H', 'P', 'H', 'H', 'M', 'N', 'R', 'H'],
  MONTHS: ['Kohitātea', 'Huitanguru', 'Poutūterangi', 'Paengawhāwhā', 'Haratua', 'Pipiri', 'Hōngongoi', 'Hereturikōkā', 'Mahuru', 'Whiringa-ā-nuku', 'Whiringa-ā-rangi', 'Hakihea'],
  STANDALONEMONTHS: ['Kohitātea', 'Huitanguru', 'Poutūterangi', 'Paengawhāwhā', 'Haratua', 'Pipiri', 'Hōngongoi', 'Hereturikōkā', 'Mahuru', 'Whiringa-ā-nuku', 'Whiringa-ā-rangi', 'Hakihea'],
  SHORTMONTHS: ['Kohi', 'Hui', 'Pou', 'Pae', 'Hara', 'Pipi', 'Hōngo', 'Here', 'Mahu', 'Nuku', 'Rangi', 'Haki'],
  STANDALONESHORTMONTHS: ['Kohi', 'Hui', 'Pou', 'Pae', 'Hara', 'Pipi', 'Hōngo', 'Here', 'Mahu', 'Nuku', 'Rangi', 'Haki'],
  WEEKDAYS: ['Rātapu', 'Rāhina', 'Rātū', 'Rāapa', 'Rāpare', 'Rāmere', 'Rāhoroi'],
  STANDALONEWEEKDAYS: ['Rātapu', 'Rāhina', 'Rātū', 'Rāapa', 'Rāpare', 'Rāmere', 'Rāhoroi'],
  SHORTWEEKDAYS: ['Tap', 'Hin', 'Tū', 'Apa', 'Par', 'Mer', 'Hor'],
  STANDALONESHORTWEEKDAYS: ['Tap', 'Hin', 'Tū', 'Apa', 'Par', 'Mer', 'Hor'],
  NARROWWEEKDAYS: ['T', 'H', 'T', 'A', 'P', 'M', 'H'],
  STANDALONENARROWWEEKDAYS: ['T', 'H', 'T', 'A', 'P', 'M', 'H'],
  SHORTQUARTERS: ['HW1', 'HW2', 'HW3', 'HW4'],
  QUARTERS: ['Hauwhā tuatahi', 'Hauwhā tuarua', 'Hauwhā tuatoru', 'Hauwhā tuawhā'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss', 'h:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale mi_NZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mi_NZ = goog.i18n.DateTimeSymbols_mi;


/**
 * Date/time formatting symbols for locale mk_MK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mk_MK = goog.i18n.DateTimeSymbols_mk;


/**
 * Date/time formatting symbols for locale ml_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ml_IN = goog.i18n.DateTimeSymbols_ml;


/**
 * Date/time formatting symbols for locale mn_MN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mn_MN = goog.i18n.DateTimeSymbols_mn;


/**
 * Date/time formatting symbols for locale mr_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mr_IN = goog.i18n.DateTimeSymbols_mr;


/**
 * Date/time formatting symbols for locale ms_BN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ms_BN = {
  ERAS: ['S.M.', 'TM'],
  ERANAMES: ['S.M.', 'TM'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
  WEEKDAYS: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
  STANDALONEWEEKDAYS: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
  SHORTWEEKDAYS: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
  NARROWWEEKDAYS: ['A', 'I', 'S', 'R', 'K', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['A', 'I', 'S', 'R', 'K', 'J', 'S'],
  SHORTQUARTERS: ['S1', 'S2', 'S3', 'S4'],
  QUARTERS: ['Suku pertama', 'Suku Ke-2', 'Suku Ke-3', 'Suku Ke-4'],
  AMPMS: ['PG', 'PTG'],
  DATEFORMATS: ['dd MMMM y', 'd MMMM y', 'd MMM y', 'd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ms_MY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ms_MY = goog.i18n.DateTimeSymbols_ms;


/**
 * Date/time formatting symbols for locale ms_SG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ms_SG = {
  ERAS: ['S.M.', 'TM'],
  ERANAMES: ['S.M.', 'TM'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'O', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun', 'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
  WEEKDAYS: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
  STANDALONEWEEKDAYS: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
  SHORTWEEKDAYS: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'],
  NARROWWEEKDAYS: ['A', 'I', 'S', 'R', 'K', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['A', 'I', 'S', 'R', 'K', 'J', 'S'],
  SHORTQUARTERS: ['S1', 'S2', 'S3', 'S4'],
  QUARTERS: ['Suku pertama', 'Suku Ke-2', 'Suku Ke-3', 'Suku Ke-4'],
  AMPMS: ['PG', 'PTG'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale mt_MT.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mt_MT = goog.i18n.DateTimeSymbols_mt;


/**
 * Date/time formatting symbols for locale mua.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mua = {
  ERAS: ['KK', 'PK'],
  ERANAMES: ['KǝPel Kristu', 'Pel Kristu'],
  NARROWMONTHS: ['O', 'A', 'I', 'F', 'D', 'B', 'L', 'M', 'E', 'U', 'W', 'Y'],
  STANDALONENARROWMONTHS: ['O', 'A', 'I', 'F', 'D', 'B', 'L', 'M', 'E', 'U', 'W', 'Y'],
  MONTHS: ['Fĩi Loo', 'Cokcwaklaŋne', 'Cokcwaklii', 'Fĩi Marfoo', 'Madǝǝuutǝbijaŋ', 'Mamǝŋgwãafahbii', 'Mamǝŋgwãalii', 'Madǝmbii', 'Fĩi Dǝɓlii', 'Fĩi Mundaŋ', 'Fĩi Gwahlle', 'Fĩi Yuru'],
  STANDALONEMONTHS: ['Fĩi Loo', 'Cokcwaklaŋne', 'Cokcwaklii', 'Fĩi Marfoo', 'Madǝǝuutǝbijaŋ', 'Mamǝŋgwãafahbii', 'Mamǝŋgwãalii', 'Madǝmbii', 'Fĩi Dǝɓlii', 'Fĩi Mundaŋ', 'Fĩi Gwahlle', 'Fĩi Yuru'],
  SHORTMONTHS: ['FLO', 'CLA', 'CKI', 'FMF', 'MAD', 'MBI', 'MLI', 'MAM', 'FDE', 'FMU', 'FGW', 'FYU'],
  STANDALONESHORTMONTHS: ['FLO', 'CLA', 'CKI', 'FMF', 'MAD', 'MBI', 'MLI', 'MAM', 'FDE', 'FMU', 'FGW', 'FYU'],
  WEEKDAYS: ['Com’yakke', 'Comlaaɗii', 'Comzyiiɗii', 'Comkolle', 'Comkaldǝɓlii', 'Comgaisuu', 'Comzyeɓsuu'],
  STANDALONEWEEKDAYS: ['Com’yakke', 'Comlaaɗii', 'Comzyiiɗii', 'Comkolle', 'Comkaldǝɓlii', 'Comgaisuu', 'Comzyeɓsuu'],
  SHORTWEEKDAYS: ['Cya', 'Cla', 'Czi', 'Cko', 'Cka', 'Cga', 'Cze'],
  STANDALONESHORTWEEKDAYS: ['Cya', 'Cla', 'Czi', 'Cko', 'Cka', 'Cga', 'Cze'],
  NARROWWEEKDAYS: ['Y', 'L', 'Z', 'O', 'A', 'G', 'E'],
  STANDALONENARROWWEEKDAYS: ['Y', 'L', 'Z', 'O', 'A', 'G', 'E'],
  SHORTQUARTERS: ['F1', 'F2', 'F3', 'F4'],
  QUARTERS: ['Tai fĩi sai ma tǝn kee zah', 'Tai fĩi sai zah lǝn gwa ma kee', 'Tai fĩi sai zah lǝn sai ma kee', 'Tai fĩi sai ma coo kee zah ‘na'],
  AMPMS: ['comme', 'lilli'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale mua_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mua_CM = goog.i18n.DateTimeSymbols_mua;


/**
 * Date/time formatting symbols for locale my_MM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_my_MM = goog.i18n.DateTimeSymbols_my;


/**
 * Date/time formatting symbols for locale mzn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mzn = {
  ZERODIGIT: 0x06F0,
  ERAS: ['پ.م', 'م.'],
  ERANAMES: ['قبل میلاد', 'بعد میلاد'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  STANDALONEMONTHS: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  SHORTMONTHS: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  STANDALONESHORTMONTHS: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
  WEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONEWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [4, 4],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale mzn_IR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_mzn_IR = goog.i18n.DateTimeSymbols_mzn;


/**
 * Date/time formatting symbols for locale naq.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_naq = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Xristub aiǃâ', 'Xristub khaoǃgâ'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['ǃKhanni', 'ǃKhanǀgôab', 'ǀKhuuǁkhâb', 'ǃHôaǂkhaib', 'ǃKhaitsâb', 'Gamaǀaeb', 'ǂKhoesaob', 'Aoǁkhuumûǁkhâb', 'Taraǀkhuumûǁkhâb', 'ǂNûǁnâiseb', 'ǀHooǂgaeb', 'Hôasoreǁkhâb'],
  STANDALONEMONTHS: ['ǃKhanni', 'ǃKhanǀgôab', 'ǀKhuuǁkhâb', 'ǃHôaǂkhaib', 'ǃKhaitsâb', 'Gamaǀaeb', 'ǂKhoesaob', 'Aoǁkhuumûǁkhâb', 'Taraǀkhuumûǁkhâb', 'ǂNûǁnâiseb', 'ǀHooǂgaeb', 'Hôasoreǁkhâb'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  WEEKDAYS: ['Sontaxtsees', 'Mantaxtsees', 'Denstaxtsees', 'Wunstaxtsees', 'Dondertaxtsees', 'Fraitaxtsees', 'Satertaxtsees'],
  STANDALONEWEEKDAYS: ['Sontaxtsees', 'Mantaxtsees', 'Denstaxtsees', 'Wunstaxtsees', 'Dondertaxtsees', 'Fraitaxtsees', 'Satertaxtsees'],
  SHORTWEEKDAYS: ['Son', 'Ma', 'De', 'Wu', 'Do', 'Fr', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Son', 'Ma', 'De', 'Wu', 'Do', 'Fr', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'E', 'W', 'D', 'F', 'A'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'E', 'W', 'D', 'F', 'A'],
  SHORTQUARTERS: ['KW1', 'KW2', 'KW3', 'KW4'],
  QUARTERS: ['1ro kwartals', '2ǁî kwartals', '3ǁî kwartals', '4ǁî kwartals'],
  AMPMS: ['ǁgoagas', 'ǃuias'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale naq_NA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_naq_NA = goog.i18n.DateTimeSymbols_naq;


/**
 * Date/time formatting symbols for locale nb_NO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nb_NO = goog.i18n.DateTimeSymbols_nb;


/**
 * Date/time formatting symbols for locale nb_SJ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nb_SJ = goog.i18n.DateTimeSymbols_nb;


/**
 * Date/time formatting symbols for locale nd.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nd = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['UKristo angakabuyi', 'Ukristo ebuyile'],
  NARROWMONTHS: ['Z', 'N', 'M', 'M', 'N', 'N', 'N', 'N', 'M', 'M', 'L', 'M'],
  STANDALONENARROWMONTHS: ['Z', 'N', 'M', 'M', 'N', 'N', 'N', 'N', 'M', 'M', 'L', 'M'],
  MONTHS: ['Zibandlela', 'Nhlolanja', 'Mbimbitho', 'Mabasa', 'Nkwenkwezi', 'Nhlangula', 'Ntulikazi', 'Ncwabakazi', 'Mpandula', 'Mfumfu', 'Lwezi', 'Mpalakazi'],
  STANDALONEMONTHS: ['Zibandlela', 'Nhlolanja', 'Mbimbitho', 'Mabasa', 'Nkwenkwezi', 'Nhlangula', 'Ntulikazi', 'Ncwabakazi', 'Mpandula', 'Mfumfu', 'Lwezi', 'Mpalakazi'],
  SHORTMONTHS: ['Zib', 'Nhlo', 'Mbi', 'Mab', 'Nkw', 'Nhla', 'Ntu', 'Ncw', 'Mpan', 'Mfu', 'Lwe', 'Mpal'],
  STANDALONESHORTMONTHS: ['Zib', 'Nhlo', 'Mbi', 'Mab', 'Nkw', 'Nhla', 'Ntu', 'Ncw', 'Mpan', 'Mfu', 'Lwe', 'Mpal'],
  WEEKDAYS: ['Sonto', 'Mvulo', 'Sibili', 'Sithathu', 'Sine', 'Sihlanu', 'Mgqibelo'],
  STANDALONEWEEKDAYS: ['Sonto', 'Mvulo', 'Sibili', 'Sithathu', 'Sine', 'Sihlanu', 'Mgqibelo'],
  SHORTWEEKDAYS: ['Son', 'Mvu', 'Sib', 'Sit', 'Sin', 'Sih', 'Mgq'],
  STANDALONESHORTWEEKDAYS: ['Son', 'Mvu', 'Sib', 'Sit', 'Sin', 'Sih', 'Mgq'],
  NARROWWEEKDAYS: ['S', 'M', 'S', 'S', 'S', 'S', 'M'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'S', 'S', 'S', 'S', 'M'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Kota 1', 'Kota 2', 'Kota 3', 'Kota 4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale nd_ZW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nd_ZW = goog.i18n.DateTimeSymbols_nd;


/**
 * Date/time formatting symbols for locale nds.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nds = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12'],
  STANDALONEMONTHS: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12'],
  SHORTMONTHS: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12'],
  STANDALONESHORTMONTHS: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08', 'M09', 'M10', 'M11', 'M12'],
  WEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONEWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale nds_DE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nds_DE = goog.i18n.DateTimeSymbols_nds;


/**
 * Date/time formatting symbols for locale nds_NL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nds_NL = goog.i18n.DateTimeSymbols_nds;


/**
 * Date/time formatting symbols for locale ne_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ne_IN = {
  ZERODIGIT: 0x0966,
  ERAS: ['ईसा पूर्व', 'सन्'],
  ERANAMES: ['ईसा पूर्व', 'सन्'],
  NARROWMONTHS: ['जन', 'फेब', 'मार्च', 'अप्र', 'मे', 'जुन', 'जुल', 'अग', 'सेप', 'अक्टो', 'नोभे', 'डिसे'],
  STANDALONENARROWMONTHS: ['जन', 'फेेब', 'मार्च', 'अप्र', 'मे', 'जुन', 'जुल', 'अग', 'सेप', 'अक्टो', 'नोभे', 'डिसे'],
  MONTHS: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'],
  STANDALONEMONTHS: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'],
  SHORTMONTHS: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'],
  STANDALONESHORTMONTHS: ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'],
  WEEKDAYS: ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'],
  STANDALONEWEEKDAYS: ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'],
  SHORTWEEKDAYS: ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिहि', 'शुक्र', 'शनि'],
  STANDALONESHORTWEEKDAYS: ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिहि', 'शुक्र', 'शनि'],
  NARROWWEEKDAYS: ['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'],
  STANDALONENARROWWEEKDAYS: ['आ', 'सो', 'म', 'बु', 'बि', 'शु', 'श'],
  SHORTQUARTERS: ['पहिलो सत्र', 'दोस्रो सत्र', 'तेस्रो सत्र', 'चौथो सत्र'],
  QUARTERS: ['पहिलो सत्र', 'दोस्रो सत्र', 'तेस्रो सत्र', 'चौथो सत्र'],
  AMPMS: ['पूर्वाह्न', 'अपराह्न'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'yy/M/d'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ne_NP.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ne_NP = goog.i18n.DateTimeSymbols_ne;


/**
 * Date/time formatting symbols for locale nl_AW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nl_AW = {
  ERAS: ['v.Chr.', 'n.Chr.'],
  ERANAMES: ['voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  STANDALONEWEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  SHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  STANDALONESHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  NARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  STANDALONENARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'om\' {0}', '{1} \'om\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nl_BE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nl_BE = {
  ERAS: ['v.Chr.', 'n.Chr.'],
  ERANAMES: ['voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  STANDALONEWEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  SHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  STANDALONESHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  NARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  STANDALONENARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'om\' {0}', '{1} \'om\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale nl_BQ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nl_BQ = {
  ERAS: ['v.Chr.', 'n.Chr.'],
  ERANAMES: ['voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  STANDALONEWEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  SHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  STANDALONESHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  NARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  STANDALONENARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'om\' {0}', '{1} \'om\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nl_CW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nl_CW = {
  ERAS: ['v.Chr.', 'n.Chr.'],
  ERANAMES: ['voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  STANDALONEWEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  SHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  STANDALONESHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  NARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  STANDALONENARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'om\' {0}', '{1} \'om\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nl_NL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nl_NL = goog.i18n.DateTimeSymbols_nl;


/**
 * Date/time formatting symbols for locale nl_SR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nl_SR = {
  ERAS: ['v.Chr.', 'n.Chr.'],
  ERANAMES: ['voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  STANDALONEWEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  SHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  STANDALONESHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  NARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  STANDALONENARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'om\' {0}', '{1} \'om\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nl_SX.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nl_SX = {
  ERAS: ['v.Chr.', 'n.Chr.'],
  ERANAMES: ['voor Christus', 'na Christus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mrt.', 'apr.', 'mei', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  STANDALONEWEEKDAYS: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
  SHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  STANDALONESHORTWEEKDAYS: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
  NARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  STANDALONENARROWWEEKDAYS: ['Z', 'M', 'D', 'W', 'D', 'V', 'Z'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1e kwartaal', '2e kwartaal', '3e kwartaal', '4e kwartaal'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'om\' {0}', '{1} \'om\' {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nmg.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nmg = {
  ERAS: ['BL', 'PB'],
  ERANAMES: ['Bó Lahlɛ̄', 'Pfiɛ Burī'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['ngwɛn matáhra', 'ngwɛn ńmba', 'ngwɛn ńlal', 'ngwɛn ńna', 'ngwɛn ńtan', 'ngwɛn ńtuó', 'ngwɛn hɛmbuɛrí', 'ngwɛn lɔmbi', 'ngwɛn rɛbvuâ', 'ngwɛn wum', 'ngwɛn wum navǔr', 'krísimin'],
  STANDALONEMONTHS: ['ngwɛn matáhra', 'ngwɛn ńmba', 'ngwɛn ńlal', 'ngwɛn ńna', 'ngwɛn ńtan', 'ngwɛn ńtuó', 'ngwɛn hɛmbuɛrí', 'ngwɛn lɔmbi', 'ngwɛn rɛbvuâ', 'ngwɛn wum', 'ngwɛn wum navǔr', 'krísimin'],
  SHORTMONTHS: ['ng1', 'ng2', 'ng3', 'ng4', 'ng5', 'ng6', 'ng7', 'ng8', 'ng9', 'ng10', 'ng11', 'kris'],
  STANDALONESHORTMONTHS: ['ng1', 'ng2', 'ng3', 'ng4', 'ng5', 'ng6', 'ng7', 'ng8', 'ng9', 'ng10', 'ng11', 'kris'],
  WEEKDAYS: ['sɔ́ndɔ', 'mɔ́ndɔ', 'sɔ́ndɔ mafú mába', 'sɔ́ndɔ mafú málal', 'sɔ́ndɔ mafú mána', 'mabágá má sukul', 'sásadi'],
  STANDALONEWEEKDAYS: ['sɔ́ndɔ', 'mɔ́ndɔ', 'sɔ́ndɔ mafú mába', 'sɔ́ndɔ mafú málal', 'sɔ́ndɔ mafú mána', 'mabágá má sukul', 'sásadi'],
  SHORTWEEKDAYS: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'mbs', 'sas'],
  STANDALONESHORTWEEKDAYS: ['sɔ́n', 'mɔ́n', 'smb', 'sml', 'smn', 'mbs', 'sas'],
  NARROWWEEKDAYS: ['s', 'm', 's', 's', 's', 'm', 's'],
  STANDALONENARROWWEEKDAYS: ['s', 'm', 's', 's', 's', 'm', 's'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['Tindɛ nvúr', 'Tindɛ ńmba', 'Tindɛ ńlal', 'Tindɛ ńna'],
  AMPMS: ['maná', 'kugú'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nmg_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nmg_CM = goog.i18n.DateTimeSymbols_nmg;


/**
 * Date/time formatting symbols for locale nn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nn = {
  ERAS: ['f.Kr.', 'e.Kr.'],
  ERANAMES: ['f.Kr.', 'e.Kr.'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'],
  STANDALONEMONTHS: ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'],
  SHORTMONTHS: ['jan.', 'feb.', 'mars', 'apr.', 'mai', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'],
  WEEKDAYS: ['søndag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag'],
  STANDALONEWEEKDAYS: ['søndag', 'måndag', 'tysdag', 'onsdag', 'torsdag', 'fredag', 'laurdag'],
  SHORTWEEKDAYS: ['sø.', 'må.', 'ty.', 'on.', 'to.', 'fr.', 'la.'],
  STANDALONESHORTWEEKDAYS: ['søn', 'mån', 'tys', 'ons', 'tor', 'fre', 'lau'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['1. kvartal', '2. kvartal', '3. kvartal', '4. kvartal'],
  AMPMS: ['formiddag', 'ettermiddag'],
  DATEFORMATS: ['EEEE d. MMMM y', 'd. MMMM y', 'd. MMM y', 'dd.MM.y'],
  TIMEFORMATS: ['\'kl\'. HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} \'kl\'. {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale nn_NO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nn_NO = goog.i18n.DateTimeSymbols_nn;


/**
 * Date/time formatting symbols for locale nnh.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nnh = {
  ERAS: ['m.z.Y.', 'm.g.n.Y.'],
  ERANAMES: ['mé zyé Yěsô', 'mé gÿo ńzyé Yěsô'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['saŋ tsetsɛ̀ɛ lùm', 'saŋ kàg ngwóŋ', 'saŋ lepyè shúm', 'saŋ cÿó', 'saŋ tsɛ̀ɛ cÿó', 'saŋ njÿoláʼ', 'saŋ tyɛ̀b tyɛ̀b mbʉ̀ŋ', 'saŋ mbʉ̀ŋ', 'saŋ ngwɔ̀ʼ mbÿɛ', 'saŋ tàŋa tsetsáʼ', 'saŋ mejwoŋó', 'saŋ lùm'],
  STANDALONEMONTHS: ['saŋ tsetsɛ̀ɛ lùm', 'saŋ kàg ngwóŋ', 'saŋ lepyè shúm', 'saŋ cÿó', 'saŋ tsɛ̀ɛ cÿó', 'saŋ njÿoláʼ', 'saŋ tyɛ̀b tyɛ̀b mbʉ̀ŋ', 'saŋ mbʉ̀ŋ', 'saŋ ngwɔ̀ʼ mbÿɛ', 'saŋ tàŋa tsetsáʼ', 'saŋ mejwoŋó', 'saŋ lùm'],
  SHORTMONTHS: ['saŋ tsetsɛ̀ɛ lùm', 'saŋ kàg ngwóŋ', 'saŋ lepyè shúm', 'saŋ cÿó', 'saŋ tsɛ̀ɛ cÿó', 'saŋ njÿoláʼ', 'saŋ tyɛ̀b tyɛ̀b mbʉ̀ŋ', 'saŋ mbʉ̀ŋ', 'saŋ ngwɔ̀ʼ mbÿɛ', 'saŋ tàŋa tsetsáʼ', 'saŋ mejwoŋó', 'saŋ lùm'],
  STANDALONESHORTMONTHS: ['saŋ tsetsɛ̀ɛ lùm', 'saŋ kàg ngwóŋ', 'saŋ lepyè shúm', 'saŋ cÿó', 'saŋ tsɛ̀ɛ cÿó', 'saŋ njÿoláʼ', 'saŋ tyɛ̀b tyɛ̀b mbʉ̀ŋ', 'saŋ mbʉ̀ŋ', 'saŋ ngwɔ̀ʼ mbÿɛ', 'saŋ tàŋa tsetsáʼ', 'saŋ mejwoŋó', 'saŋ lùm'],
  WEEKDAYS: ['lyɛʼɛ́ sẅíŋtè', 'mvfò lyɛ̌ʼ', 'mbɔ́ɔntè mvfò lyɛ̌ʼ', 'tsètsɛ̀ɛ lyɛ̌ʼ', 'mbɔ́ɔntè tsetsɛ̀ɛ lyɛ̌ʼ', 'mvfò màga lyɛ̌ʼ', 'màga lyɛ̌ʼ'],
  STANDALONEWEEKDAYS: ['lyɛʼɛ́ sẅíŋtè', 'mvfò lyɛ̌ʼ', 'mbɔ́ɔntè mvfò lyɛ̌ʼ', 'tsètsɛ̀ɛ lyɛ̌ʼ', 'mbɔ́ɔntè tsetsɛ̀ɛ lyɛ̌ʼ', 'mvfò màga lyɛ̌ʼ', 'màga lyɛ̌ʼ'],
  SHORTWEEKDAYS: ['lyɛʼɛ́ sẅíŋtè', 'mvfò lyɛ̌ʼ', 'mbɔ́ɔntè mvfò lyɛ̌ʼ', 'tsètsɛ̀ɛ lyɛ̌ʼ', 'mbɔ́ɔntè tsetsɛ̀ɛ lyɛ̌ʼ', 'mvfò màga lyɛ̌ʼ', 'màga lyɛ̌ʼ'],
  STANDALONESHORTWEEKDAYS: ['lyɛʼɛ́ sẅíŋtè', 'mvfò lyɛ̌ʼ', 'mbɔ́ɔntè mvfò lyɛ̌ʼ', 'tsètsɛ̀ɛ lyɛ̌ʼ', 'mbɔ́ɔntè tsetsɛ̀ɛ lyɛ̌ʼ', 'mvfò màga lyɛ̌ʼ', 'màga lyɛ̌ʼ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['mbaʼámbaʼ', 'ncwònzém'],
  DATEFORMATS: ['EEEE , \'lyɛ\'̌ʼ d \'na\' MMMM, y', '\'lyɛ\'̌ʼ d \'na\' MMMM, y', 'd MMM, y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1},{0}', '{1}, {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nnh_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nnh_CM = goog.i18n.DateTimeSymbols_nnh;


/**
 * Date/time formatting symbols for locale nus.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nus = {
  ERAS: ['AY', 'ƐY'],
  ERANAMES: ['A ka̱n Yecu ni dap', 'Ɛ ca Yecu dap'],
  NARROWMONTHS: ['T', 'P', 'D', 'G', 'D', 'K', 'P', 'T', 'T', 'L', 'K', 'T'],
  STANDALONENARROWMONTHS: ['T', 'P', 'D', 'G', 'D', 'K', 'P', 'T', 'T', 'L', 'K', 'T'],
  MONTHS: ['Tiop thar pɛt', 'Pɛt', 'Duɔ̱ɔ̱ŋ', 'Guak', 'Duät', 'Kornyoot', 'Pay yie̱tni', 'Tho̱o̱r', 'Tɛɛr', 'Laath', 'Kur', 'Tio̱p in di̱i̱t'],
  STANDALONEMONTHS: ['Tiop thar pɛt', 'Pɛt', 'Duɔ̱ɔ̱ŋ', 'Guak', 'Duät', 'Kornyoot', 'Pay yie̱tni', 'Tho̱o̱r', 'Tɛɛr', 'Laath', 'Kur', 'Tio̱p in di̱i̱t'],
  SHORTMONTHS: ['Tiop', 'Pɛt', 'Duɔ̱ɔ̱', 'Guak', 'Duä', 'Kor', 'Pay', 'Thoo', 'Tɛɛ', 'Laa', 'Kur', 'Tid'],
  STANDALONESHORTMONTHS: ['Tiop', 'Pɛt', 'Duɔ̱ɔ̱', 'Guak', 'Duä', 'Kor', 'Pay', 'Thoo', 'Tɛɛ', 'Laa', 'Kur', 'Tid'],
  WEEKDAYS: ['Cäŋ kuɔth', 'Jiec la̱t', 'Rɛw lätni', 'Diɔ̱k lätni', 'Ŋuaan lätni', 'Dhieec lätni', 'Bäkɛl lätni'],
  STANDALONEWEEKDAYS: ['Cäŋ kuɔth', 'Jiec la̱t', 'Rɛw lätni', 'Diɔ̱k lätni', 'Ŋuaan lätni', 'Dhieec lätni', 'Bäkɛl lätni'],
  SHORTWEEKDAYS: ['Cäŋ', 'Jiec', 'Rɛw', 'Diɔ̱k', 'Ŋuaan', 'Dhieec', 'Bäkɛl'],
  STANDALONESHORTWEEKDAYS: ['Cäŋ', 'Jiec', 'Rɛw', 'Diɔ̱k', 'Ŋuaan', 'Dhieec', 'Bäkɛl'],
  NARROWWEEKDAYS: ['C', 'J', 'R', 'D', 'Ŋ', 'D', 'B'],
  STANDALONENARROWWEEKDAYS: ['C', 'J', 'R', 'D', 'Ŋ', 'D', 'B'],
  SHORTQUARTERS: ['P1', 'P2', 'P3', 'P4'],
  QUARTERS: ['Päth diɔk tin nhiam', 'Päth diɔk tin guurɛ', 'Päth diɔk tin wä kɔɔriɛn', 'Päth diɔk tin jiɔakdiɛn'],
  AMPMS: ['RW', 'TŊ'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/MM/y'],
  TIMEFORMATS: ['zzzz h:mm:ss a', 'z h:mm:ss a', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nus_SS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nus_SS = goog.i18n.DateTimeSymbols_nus;


/**
 * Date/time formatting symbols for locale nyn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nyn = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Kurisito Atakaijire', 'Kurisito Yaijire'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Okwokubanza', 'Okwakabiri', 'Okwakashatu', 'Okwakana', 'Okwakataana', 'Okwamukaaga', 'Okwamushanju', 'Okwamunaana', 'Okwamwenda', 'Okwaikumi', 'Okwaikumi na kumwe', 'Okwaikumi na ibiri'],
  STANDALONEMONTHS: ['Okwokubanza', 'Okwakabiri', 'Okwakashatu', 'Okwakana', 'Okwakataana', 'Okwamukaaga', 'Okwamushanju', 'Okwamunaana', 'Okwamwenda', 'Okwaikumi', 'Okwaikumi na kumwe', 'Okwaikumi na ibiri'],
  SHORTMONTHS: ['KBZ', 'KBR', 'KST', 'KKN', 'KTN', 'KMK', 'KMS', 'KMN', 'KMW', 'KKM', 'KNK', 'KNB'],
  STANDALONESHORTMONTHS: ['KBZ', 'KBR', 'KST', 'KKN', 'KTN', 'KMK', 'KMS', 'KMN', 'KMW', 'KKM', 'KNK', 'KNB'],
  WEEKDAYS: ['Sande', 'Orwokubanza', 'Orwakabiri', 'Orwakashatu', 'Orwakana', 'Orwakataano', 'Orwamukaaga'],
  STANDALONEWEEKDAYS: ['Sande', 'Orwokubanza', 'Orwakabiri', 'Orwakashatu', 'Orwakana', 'Orwakataano', 'Orwamukaaga'],
  SHORTWEEKDAYS: ['SAN', 'ORK', 'OKB', 'OKS', 'OKN', 'OKT', 'OMK'],
  STANDALONESHORTWEEKDAYS: ['SAN', 'ORK', 'OKB', 'OKS', 'OKN', 'OKT', 'OMK'],
  NARROWWEEKDAYS: ['S', 'K', 'R', 'S', 'N', 'T', 'M'],
  STANDALONENARROWWEEKDAYS: ['S', 'K', 'R', 'S', 'N', 'T', 'M'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['KWOTA 1', 'KWOTA 2', 'KWOTA 3', 'KWOTA 4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale nyn_UG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_nyn_UG = goog.i18n.DateTimeSymbols_nyn;


/**
 * Date/time formatting symbols for locale om.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_om = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['Dheengadda Jeesu', 'CE'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Amajjii', 'Guraandhala', 'Bitooteessa', 'Elba', 'Caamsa', 'Waxabajjii', 'Adooleessa', 'Hagayya', 'Fuulbana', 'Onkololeessa', 'Sadaasa', 'Muddee'],
  STANDALONEMONTHS: ['Amajjii', 'Guraandhala', 'Bitooteessa', 'Elba', 'Caamsa', 'Waxabajjii', 'Adooleessa', 'Hagayya', 'Fuulbana', 'Onkololeessa', 'Sadaasa', 'Muddee'],
  SHORTMONTHS: ['Ama', 'Gur', 'Bit', 'Elb', 'Cam', 'Wax', 'Ado', 'Hag', 'Ful', 'Onk', 'Sad', 'Mud'],
  STANDALONESHORTMONTHS: ['Ama', 'Gur', 'Bit', 'Elb', 'Cam', 'Wax', 'Ado', 'Hag', 'Ful', 'Onk', 'Sad', 'Mud'],
  WEEKDAYS: ['Dilbata', 'Wiixata', 'Qibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata'],
  STANDALONEWEEKDAYS: ['Dilbata', 'Wiixata', 'Qibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata'],
  SHORTWEEKDAYS: ['Dil', 'Wix', 'Qib', 'Rob', 'Kam', 'Jim', 'San'],
  STANDALONESHORTWEEKDAYS: ['Dil', 'Wix', 'Qib', 'Rob', 'Kam', 'Jim', 'San'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Kurmaana 1', 'Kurmaana 2', 'Kurmaana 3', 'Kurmaana 4'],
  AMPMS: ['WD', 'WB'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale om_ET.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_om_ET = goog.i18n.DateTimeSymbols_om;


/**
 * Date/time formatting symbols for locale om_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_om_KE = {
  ERAS: ['KD', 'CE'],
  ERANAMES: ['Dheengadda Jeesu', 'CE'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['A', 'G', 'B', 'E', 'C', 'W', 'A', 'H', 'F', 'O', 'S', 'M'],
  MONTHS: ['Amajjii', 'Guraandhala', 'Bitooteessa', 'Elba', 'Caamsa', 'Waxabajjii', 'Adooleessa', 'Hagayya', 'Fuulbana', 'Onkololeessa', 'Sadaasa', 'Muddee'],
  STANDALONEMONTHS: ['Amajjii', 'Guraandhala', 'Bitooteessa', 'Elba', 'Caamsa', 'Waxabajjii', 'Adooleessa', 'Hagayya', 'Fuulbana', 'Onkololeessa', 'Sadaasa', 'Muddee'],
  SHORTMONTHS: ['Ama', 'Gur', 'Bit', 'Elb', 'Cam', 'Wax', 'Ado', 'Hag', 'Ful', 'Onk', 'Sad', 'Mud'],
  STANDALONESHORTMONTHS: ['Ama', 'Gur', 'Bit', 'Elb', 'Cam', 'Wax', 'Ado', 'Hag', 'Ful', 'Onk', 'Sad', 'Mud'],
  WEEKDAYS: ['Dilbata', 'Wiixata', 'Qibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata'],
  STANDALONEWEEKDAYS: ['Dilbata', 'Wiixata', 'Qibxata', 'Roobii', 'Kamiisa', 'Jimaata', 'Sanbata'],
  SHORTWEEKDAYS: ['Dil', 'Wix', 'Qib', 'Rob', 'Kam', 'Jim', 'San'],
  STANDALONESHORTWEEKDAYS: ['Dil', 'Wix', 'Qib', 'Rob', 'Kam', 'Jim', 'San'],
  NARROWWEEKDAYS: ['D', 'W', 'Q', 'R', 'K', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'W', 'Q', 'R', 'K', 'J', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Kurmaana 1', 'Kurmaana 2', 'Kurmaana 3', 'Kurmaana 4'],
  AMPMS: ['WD', 'WB'],
  DATEFORMATS: ['EEEE, MMMM d, y', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale or_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_or_IN = goog.i18n.DateTimeSymbols_or;


/**
 * Date/time formatting symbols for locale os.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_os = {
  ERAS: ['н.д.а.', 'н.д.'],
  ERANAMES: ['н.д.а.', 'н.д.'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['январы', 'февралы', 'мартъийы', 'апрелы', 'майы', 'июны', 'июлы', 'августы', 'сентябры', 'октябры', 'ноябры', 'декабры'],
  STANDALONEMONTHS: ['Январь', 'Февраль', 'Мартъи', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  SHORTMONTHS: ['янв.', 'фев.', 'мар.', 'апр.', 'майы', 'июны', 'июлы', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'],
  STANDALONESHORTMONTHS: ['Янв.', 'Февр.', 'Март.', 'Апр.', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.', 'Нояб.', 'Дек.'],
  WEEKDAYS: ['хуыцаубон', 'къуырисӕр', 'дыццӕг', 'ӕртыццӕг', 'цыппӕрӕм', 'майрӕмбон', 'сабат'],
  STANDALONEWEEKDAYS: ['Хуыцаубон', 'Къуырисӕр', 'Дыццӕг', 'Ӕртыццӕг', 'Цыппӕрӕм', 'Майрӕмбон', 'Сабат'],
  SHORTWEEKDAYS: ['хцб', 'крс', 'дцг', 'ӕрт', 'цпр', 'мрб', 'сбт'],
  STANDALONESHORTWEEKDAYS: ['Хцб', 'Крс', 'Дцг', 'Ӕрт', 'Цпр', 'Мрб', 'Сбт'],
  NARROWWEEKDAYS: ['Х', 'К', 'Д', 'Ӕ', 'Ц', 'М', 'С'],
  STANDALONENARROWWEEKDAYS: ['Х', 'К', 'Д', 'Ӕ', 'Ц', 'М', 'С'],
  SHORTQUARTERS: ['1-аг кв.', '2-аг кв.', '3-аг кв.', '4-ӕм кв.'],
  QUARTERS: ['1-аг квартал', '2-аг квартал', '3-аг квартал', '4-ӕм квартал'],
  AMPMS: ['ӕмбисбоны размӕ', 'ӕмбисбоны фӕстӕ'],
  DATEFORMATS: ['EEEE, d MMMM, y \'аз\'', 'd MMMM, y \'аз\'', 'dd MMM y \'аз\'', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale os_GE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_os_GE = goog.i18n.DateTimeSymbols_os;


/**
 * Date/time formatting symbols for locale os_RU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_os_RU = {
  ERAS: ['н.д.а.', 'н.д.'],
  ERANAMES: ['н.д.а.', 'н.д.'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['январы', 'февралы', 'мартъийы', 'апрелы', 'майы', 'июны', 'июлы', 'августы', 'сентябры', 'октябры', 'ноябры', 'декабры'],
  STANDALONEMONTHS: ['Январь', 'Февраль', 'Мартъи', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
  SHORTMONTHS: ['янв.', 'фев.', 'мар.', 'апр.', 'майы', 'июны', 'июлы', 'авг.', 'сен.', 'окт.', 'ноя.', 'дек.'],
  STANDALONESHORTMONTHS: ['Янв.', 'Февр.', 'Март.', 'Апр.', 'Май', 'Июнь', 'Июль', 'Авг.', 'Сент.', 'Окт.', 'Нояб.', 'Дек.'],
  WEEKDAYS: ['хуыцаубон', 'къуырисӕр', 'дыццӕг', 'ӕртыццӕг', 'цыппӕрӕм', 'майрӕмбон', 'сабат'],
  STANDALONEWEEKDAYS: ['Хуыцаубон', 'Къуырисӕр', 'Дыццӕг', 'Ӕртыццӕг', 'Цыппӕрӕм', 'Майрӕмбон', 'Сабат'],
  SHORTWEEKDAYS: ['хцб', 'крс', 'дцг', 'ӕрт', 'цпр', 'мрб', 'сбт'],
  STANDALONESHORTWEEKDAYS: ['Хцб', 'Крс', 'Дцг', 'Ӕрт', 'Цпр', 'Мрб', 'Сбт'],
  NARROWWEEKDAYS: ['Х', 'К', 'Д', 'Ӕ', 'Ц', 'М', 'С'],
  STANDALONENARROWWEEKDAYS: ['Х', 'К', 'Д', 'Ӕ', 'Ц', 'М', 'С'],
  SHORTQUARTERS: ['1-аг кв.', '2-аг кв.', '3-аг кв.', '4-ӕм кв.'],
  QUARTERS: ['1-аг квартал', '2-аг квартал', '3-аг квартал', '4-ӕм квартал'],
  AMPMS: ['ӕмбисбоны размӕ', 'ӕмбисбоны фӕстӕ'],
  DATEFORMATS: ['EEEE, d MMMM, y \'аз\'', 'd MMMM, y \'аз\'', 'dd MMM y \'аз\'', 'dd.MM.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale pa_Arab.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pa_Arab = {
  ZERODIGIT: 0x06F0,
  ERAS: ['ايساپورو', 'سں'],
  ERANAMES: ['ايساپورو', 'سں'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONESHORTMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  WEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  STANDALONEWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  SHORTWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  STANDALONESHORTWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['چوتھاي پہلاں', 'چوتھاي دوجا', 'چوتھاي تيجا', 'چوتھاي چوتھا'],
  QUARTERS: ['چوتھاي پہلاں', 'چوتھاي دوجا', 'چوتھاي تيجا', 'چوتھاي چوتھا'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, dd MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale pa_Arab_PK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pa_Arab_PK = {
  ZERODIGIT: 0x06F0,
  ERAS: ['ايساپورو', 'سں'],
  ERANAMES: ['ايساپورو', 'سں'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONESHORTMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئ', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  WEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  STANDALONEWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  SHORTWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  STANDALONESHORTWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بُدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['چوتھاي پہلاں', 'چوتھاي دوجا', 'چوتھاي تيجا', 'چوتھاي چوتھا'],
  QUARTERS: ['چوتھاي پہلاں', 'چوتھاي دوجا', 'چوتھاي تيجا', 'چوتھاي چوتھا'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, dd MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale pa_Guru.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pa_Guru = goog.i18n.DateTimeSymbols_pa;


/**
 * Date/time formatting symbols for locale pa_Guru_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pa_Guru_IN = goog.i18n.DateTimeSymbols_pa;


/**
 * Date/time formatting symbols for locale pl_PL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pl_PL = goog.i18n.DateTimeSymbols_pl;


/**
 * Date/time formatting symbols for locale ps.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ps = {
  ZERODIGIT: 0x06F0,
  ERAS: ['له میلاد وړاندې', 'م.'],
  ERANAMES: ['له میلاد څخه وړاندې', 'له میلاد څخه وروسته'],
  NARROWMONTHS: ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'ا', 'ن', 'د'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اگست', 'سېپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوري', 'فېبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اگست', 'سېپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONESHORTMONTHS: ['جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  WEEKDAYS: ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'],
  STANDALONEWEEKDAYS: ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'],
  SHORTWEEKDAYS: ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'],
  STANDALONESHORTWEEKDAYS: ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['لومړۍ ربعه', '۲مه ربعه', '۳مه ربعه', '۴مه ربعه'],
  QUARTERS: ['لومړۍ ربعه', '۲مه ربعه', '۳مه ربعه', '۴مه ربعه'],
  AMPMS: ['غ.م.', 'غ.و.'],
  DATEFORMATS: ['EEEE د y د MMMM d', 'د y د MMMM d', 'y MMM d', 'y/M/d'],
  TIMEFORMATS: ['H:mm:ss (zzzz)', 'H:mm:ss (z)', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [3, 4],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale ps_AF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ps_AF = goog.i18n.DateTimeSymbols_ps;


/**
 * Date/time formatting symbols for locale ps_PK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ps_PK = {
  ZERODIGIT: 0x06F0,
  ERAS: ['له میلاد وړاندې', 'م.'],
  ERANAMES: ['له میلاد څخه وړاندې', 'له میلاد څخه وروسته'],
  NARROWMONTHS: ['ج', 'ف', 'م', 'ا', 'م', 'ج', 'ج', 'ا', 'س', 'ا', 'ن', 'د'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اگست', 'سېپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوري', 'فېبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اگست', 'سېپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONESHORTMONTHS: ['جنوري', 'فبروري', 'مارچ', 'اپریل', 'مۍ', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  WEEKDAYS: ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'],
  STANDALONEWEEKDAYS: ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'],
  SHORTWEEKDAYS: ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'],
  STANDALONESHORTWEEKDAYS: ['يونۍ', 'دونۍ', 'درېنۍ', 'څلرنۍ', 'پينځنۍ', 'جمعه', 'اونۍ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['لومړۍ ربعه', '۲مه ربعه', '۳مه ربعه', '۴مه ربعه'],
  QUARTERS: ['لومړۍ ربعه', '۲مه ربعه', '۳مه ربعه', '۴مه ربعه'],
  AMPMS: ['غ.م.', 'غ.و.'],
  DATEFORMATS: ['EEEE د y د MMMM d', 'د y د MMMM d', 'y MMM d', 'y/M/d'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale pt_AO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_AO = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale pt_CH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_CH = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale pt_CV.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_CV = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale pt_GQ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_GQ = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale pt_GW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_GW = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale pt_LU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_LU = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale pt_MO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_MO = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale pt_MZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_MZ = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale pt_ST.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_ST = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale pt_TL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_pt_TL = {
  ERAS: ['a.C.', 'd.C.'],
  ERANAMES: ['antes de Cristo', 'depois de Cristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  STANDALONEMONTHS: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
  SHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  STANDALONESHORTMONTHS: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  WEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  STANDALONEWEEKDAYS: ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'],
  SHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  STANDALONESHORTWEEKDAYS: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  NARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
  SHORTQUARTERS: ['T1', 'T2', 'T3', 'T4'],
  QUARTERS: ['1.º trimestre', '2.º trimestre', '3.º trimestre', '4.º trimestre'],
  AMPMS: ['da manhã', 'da tarde'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'dd/MM/y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'às\' {0}', '{1} \'às\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale qu.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_qu = {
  ERAS: ['BCE', 'd.C.'],
  ERANAMES: ['BCE', 'd.C.'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  STANDALONEMONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  SHORTMONTHS: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
  STANDALONESHORTMONTHS: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
  WEEKDAYS: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  STANDALONEWEEKDAYS: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  SHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{0} {1}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale qu_BO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_qu_BO = {
  ERAS: ['BCE', 'd.C.'],
  ERANAMES: ['BCE', 'd.C.'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  STANDALONEMONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  SHORTMONTHS: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
  STANDALONESHORTMONTHS: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
  WEEKDAYS: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  STANDALONEWEEKDAYS: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  SHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{0} {1}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale qu_EC.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_qu_EC = {
  ERAS: ['BCE', 'd.C.'],
  ERANAMES: ['BCE', 'd.C.'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  STANDALONEMONTHS: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  SHORTMONTHS: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
  STANDALONESHORTMONTHS: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'],
  WEEKDAYS: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  STANDALONEWEEKDAYS: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  SHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'],
  NARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{0} {1}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale qu_PE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_qu_PE = goog.i18n.DateTimeSymbols_qu;


/**
 * Date/time formatting symbols for locale rm.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rm = {
  ERAS: ['av. Cr.', 's. Cr.'],
  ERANAMES: ['avant Cristus', 'suenter Cristus'],
  NARROWMONTHS: ['S', 'F', 'M', 'A', 'M', 'Z', 'F', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['S', 'F', 'M', 'A', 'M', 'Z', 'F', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['schaner', 'favrer', 'mars', 'avrigl', 'matg', 'zercladur', 'fanadur', 'avust', 'settember', 'october', 'november', 'december'],
  STANDALONEMONTHS: ['schaner', 'favrer', 'mars', 'avrigl', 'matg', 'zercladur', 'fanadur', 'avust', 'settember', 'october', 'november', 'december'],
  SHORTMONTHS: ['schan.', 'favr.', 'mars', 'avr.', 'matg', 'zercl.', 'fan.', 'avust', 'sett.', 'oct.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['schan.', 'favr.', 'mars', 'avr.', 'matg', 'zercl.', 'fan.', 'avust', 'sett.', 'oct.', 'nov.', 'dec.'],
  WEEKDAYS: ['dumengia', 'glindesdi', 'mardi', 'mesemna', 'gievgia', 'venderdi', 'sonda'],
  STANDALONEWEEKDAYS: ['dumengia', 'glindesdi', 'mardi', 'mesemna', 'gievgia', 'venderdi', 'sonda'],
  SHORTWEEKDAYS: ['du', 'gli', 'ma', 'me', 'gie', 've', 'so'],
  STANDALONESHORTWEEKDAYS: ['du', 'gli', 'ma', 'me', 'gie', 've', 'so'],
  NARROWWEEKDAYS: ['D', 'G', 'M', 'M', 'G', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'G', 'M', 'M', 'G', 'V', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. quartal', '2. quartal', '3. quartal', '4. quartal'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, \'ils\' d \'da\' MMMM y', 'd \'da\' MMMM y', 'dd-MM-y', 'dd-MM-yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale rm_CH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rm_CH = goog.i18n.DateTimeSymbols_rm;


/**
 * Date/time formatting symbols for locale rn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rn = {
  ERAS: ['Mb.Y.', 'Ny.Y'],
  ERANAMES: ['Mbere ya Yezu', 'Nyuma ya Yezu'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Nzero', 'Ruhuhuma', 'Ntwarante', 'Ndamukiza', 'Rusama', 'Ruheshi', 'Mukakaro', 'Nyandagaro', 'Nyakanga', 'Gitugutu', 'Munyonyo', 'Kigarama'],
  STANDALONEMONTHS: ['Nzero', 'Ruhuhuma', 'Ntwarante', 'Ndamukiza', 'Rusama', 'Ruheshi', 'Mukakaro', 'Nyandagaro', 'Nyakanga', 'Gitugutu', 'Munyonyo', 'Kigarama'],
  SHORTMONTHS: ['Mut.', 'Gas.', 'Wer.', 'Mat.', 'Gic.', 'Kam.', 'Nya.', 'Kan.', 'Nze.', 'Ukw.', 'Ugu.', 'Uku.'],
  STANDALONESHORTMONTHS: ['Mut.', 'Gas.', 'Wer.', 'Mat.', 'Gic.', 'Kam.', 'Nya.', 'Kan.', 'Nze.', 'Ukw.', 'Ugu.', 'Uku.'],
  WEEKDAYS: ['Ku w’indwi', 'Ku wa mbere', 'Ku wa kabiri', 'Ku wa gatatu', 'Ku wa kane', 'Ku wa gatanu', 'Ku wa gatandatu'],
  STANDALONEWEEKDAYS: ['Ku w’indwi', 'Ku wa mbere', 'Ku wa kabiri', 'Ku wa gatatu', 'Ku wa kane', 'Ku wa gatanu', 'Ku wa gatandatu'],
  SHORTWEEKDAYS: ['cu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
  STANDALONESHORTWEEKDAYS: ['cu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['I1', 'I2', 'I3', 'I4'],
  QUARTERS: ['Igice ca mbere c’umwaka', 'Igice ca kabiri c’umwaka', 'Igice ca gatatu c’umwaka', 'Igice ca kane c’umwaka'],
  AMPMS: ['Z.MU.', 'Z.MW.'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale rn_BI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rn_BI = goog.i18n.DateTimeSymbols_rn;


/**
 * Date/time formatting symbols for locale ro_MD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ro_MD = {
  ERAS: ['î.Hr.', 'd.Hr.'],
  ERANAMES: ['înainte de Hristos', 'după Hristos'],
  NARROWMONTHS: ['I', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['I', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
  STANDALONEMONTHS: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
  SHORTMONTHS: ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.', 'dec.'],
  WEEKDAYS: ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'],
  STANDALONEWEEKDAYS: ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'],
  SHORTWEEKDAYS: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
  STANDALONESHORTWEEKDAYS: ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'],
  NARROWWEEKDAYS: ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'L', 'Ma', 'Mi', 'J', 'V', 'S'],
  SHORTQUARTERS: ['trim. 1', 'trim. 2', 'trim. 3', 'trim. 4'],
  QUARTERS: ['trimestrul 1', 'trimestrul 2', 'trimestrul 3', 'trimestrul 4'],
  AMPMS: ['a.m.', 'p.m.'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd.MM.y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ro_RO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ro_RO = goog.i18n.DateTimeSymbols_ro;


/**
 * Date/time formatting symbols for locale rof.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rof = {
  ERAS: ['KM', 'BM'],
  ERANAMES: ['Kabla ya Mayesu', 'Baada ya Mayesu'],
  NARROWMONTHS: ['K', 'K', 'K', 'K', 'T', 'S', 'S', 'N', 'T', 'I', 'I', 'I'],
  STANDALONENARROWMONTHS: ['K', 'K', 'K', 'K', 'T', 'S', 'S', 'N', 'T', 'I', 'I', 'I'],
  MONTHS: ['Mweri wa kwanza', 'Mweri wa kaili', 'Mweri wa katatu', 'Mweri wa kaana', 'Mweri wa tanu', 'Mweri wa sita', 'Mweri wa saba', 'Mweri wa nane', 'Mweri wa tisa', 'Mweri wa ikumi', 'Mweri wa ikumi na moja', 'Mweri wa ikumi na mbili'],
  STANDALONEMONTHS: ['Mweri wa kwanza', 'Mweri wa kaili', 'Mweri wa katatu', 'Mweri wa kaana', 'Mweri wa tanu', 'Mweri wa sita', 'Mweri wa saba', 'Mweri wa nane', 'Mweri wa tisa', 'Mweri wa ikumi', 'Mweri wa ikumi na moja', 'Mweri wa ikumi na mbili'],
  SHORTMONTHS: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
  STANDALONESHORTMONTHS: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'],
  WEEKDAYS: ['Ijumapili', 'Ijumatatu', 'Ijumanne', 'Ijumatano', 'Alhamisi', 'Ijumaa', 'Ijumamosi'],
  STANDALONEWEEKDAYS: ['Ijumapili', 'Ijumatatu', 'Ijumanne', 'Ijumatano', 'Alhamisi', 'Ijumaa', 'Ijumamosi'],
  SHORTWEEKDAYS: ['Ijp', 'Ijt', 'Ijn', 'Ijtn', 'Alh', 'Iju', 'Ijm'],
  STANDALONESHORTWEEKDAYS: ['Ijp', 'Ijt', 'Ijn', 'Ijtn', 'Alh', 'Iju', 'Ijm'],
  NARROWWEEKDAYS: ['2', '3', '4', '5', '6', '7', '1'],
  STANDALONENARROWWEEKDAYS: ['2', '3', '4', '5', '6', '7', '1'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo ya kwanza', 'Robo ya kaili', 'Robo ya katatu', 'Robo ya kaana'],
  AMPMS: ['kang’ama', 'kingoto'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale rof_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rof_TZ = goog.i18n.DateTimeSymbols_rof;


/**
 * Date/time formatting symbols for locale ru_BY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ru_BY = {
  ERAS: ['до н. э.', 'н. э.'],
  ERANAMES: ['до Рождества Христова', 'от Рождества Христова'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  STANDALONEMONTHS: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  SHORTMONTHS: ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  STANDALONESHORTMONTHS: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  WEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  STANDALONEWEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  SHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONESHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  NARROWWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONENARROWWEEKDAYS: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  SHORTQUARTERS: ['1-й кв.', '2-й кв.', '3-й кв.', '4-й кв.'],
  QUARTERS: ['1-й квартал', '2-й квартал', '3-й квартал', '4-й квартал'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y \'г\'.', 'd MMMM y \'г\'.', 'd MMM y \'г\'.', 'dd.MM.y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ru_KG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ru_KG = {
  ERAS: ['до н. э.', 'н. э.'],
  ERANAMES: ['до Рождества Христова', 'от Рождества Христова'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  STANDALONEMONTHS: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  SHORTMONTHS: ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  STANDALONESHORTMONTHS: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  WEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  STANDALONEWEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  SHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONESHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  NARROWWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONENARROWWEEKDAYS: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  SHORTQUARTERS: ['1-й кв.', '2-й кв.', '3-й кв.', '4-й кв.'],
  QUARTERS: ['1-й квартал', '2-й квартал', '3-й квартал', '4-й квартал'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y \'г\'.', 'd MMMM y \'г\'.', 'd MMM y \'г\'.', 'dd.MM.y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ru_KZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ru_KZ = {
  ERAS: ['до н. э.', 'н. э.'],
  ERANAMES: ['до Рождества Христова', 'от Рождества Христова'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  STANDALONEMONTHS: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  SHORTMONTHS: ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  STANDALONESHORTMONTHS: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  WEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  STANDALONEWEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  SHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONESHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  NARROWWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONENARROWWEEKDAYS: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  SHORTQUARTERS: ['1-й кв.', '2-й кв.', '3-й кв.', '4-й кв.'],
  QUARTERS: ['1-й квартал', '2-й квартал', '3-й квартал', '4-й квартал'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y \'г\'.', 'd MMMM y \'г\'.', 'd MMM y \'г\'.', 'dd.MM.y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ru_MD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ru_MD = {
  ERAS: ['до н. э.', 'н. э.'],
  ERANAMES: ['до Рождества Христова', 'от Рождества Христова'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  STANDALONEMONTHS: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  SHORTMONTHS: ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  STANDALONESHORTMONTHS: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  WEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  STANDALONEWEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  SHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONESHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  NARROWWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONENARROWWEEKDAYS: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  SHORTQUARTERS: ['1-й кв.', '2-й кв.', '3-й кв.', '4-й кв.'],
  QUARTERS: ['1-й квартал', '2-й квартал', '3-й квартал', '4-й квартал'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y \'г\'.', 'd MMMM y \'г\'.', 'd MMM y \'г\'.', 'dd.MM.y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ru_RU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ru_RU = goog.i18n.DateTimeSymbols_ru;


/**
 * Date/time formatting symbols for locale ru_UA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ru_UA = {
  ERAS: ['до н. э.', 'н. э.'],
  ERANAMES: ['до Рождества Христова', 'от Рождества Христова'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  STANDALONEMONTHS: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  SHORTMONTHS: ['янв.', 'февр.', 'мар.', 'апр.', 'мая', 'июн.', 'июл.', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  STANDALONESHORTMONTHS: ['янв.', 'февр.', 'март', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  WEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  STANDALONEWEEKDAYS: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  SHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONESHORTWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  NARROWWEEKDAYS: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
  STANDALONENARROWWEEKDAYS: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'],
  SHORTQUARTERS: ['1-й кв.', '2-й кв.', '3-й кв.', '4-й кв.'],
  QUARTERS: ['1-й квартал', '2-й квартал', '3-й квартал', '4-й квартал'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y \'г\'.', 'd MMMM y \'г\'.', 'd MMM y \'г\'.', 'dd.MM.y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale rw.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rw = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicuransi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeli', 'Ukwakira', 'Ugushyingo', 'Ukuboza'],
  STANDALONEMONTHS: ['Mutarama', 'Gashyantare', 'Werurwe', 'Mata', 'Gicuransi', 'Kamena', 'Nyakanga', 'Kanama', 'Nzeli', 'Ukwakira', 'Ugushyingo', 'Ukuboza'],
  SHORTMONTHS: ['mut.', 'gas.', 'wer.', 'mat.', 'gic.', 'kam.', 'nya.', 'kan.', 'nze.', 'ukw.', 'ugu.', 'uku.'],
  STANDALONESHORTMONTHS: ['mut.', 'gas.', 'wer.', 'mat.', 'gic.', 'kam.', 'nya.', 'kan.', 'nze.', 'ukw.', 'ugu.', 'uku.'],
  WEEKDAYS: ['Ku cyumweru', 'Kuwa mbere', 'Kuwa kabiri', 'Kuwa gatatu', 'Kuwa kane', 'Kuwa gatanu', 'Kuwa gatandatu'],
  STANDALONEWEEKDAYS: ['Ku cyumweru', 'Kuwa mbere', 'Kuwa kabiri', 'Kuwa gatatu', 'Kuwa kane', 'Kuwa gatanu', 'Kuwa gatandatu'],
  SHORTWEEKDAYS: ['cyu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
  STANDALONESHORTWEEKDAYS: ['cyu.', 'mbe.', 'kab.', 'gtu.', 'kan.', 'gnu.', 'gnd.'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['I1', 'I2', 'I3', 'I4'],
  QUARTERS: ['igihembwe cya mbere', 'igihembwe cya kabiri', 'igihembwe cya gatatu', 'igihembwe cya kane'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale rw_RW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rw_RW = goog.i18n.DateTimeSymbols_rw;


/**
 * Date/time formatting symbols for locale rwk.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rwk = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Kristu', 'Baada ya Kristu'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Machi', 'Aprilyi', 'Mei', 'Junyi', 'Julyai', 'Agusti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Machi', 'Aprilyi', 'Mei', 'Junyi', 'Julyai', 'Agusti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Jumapilyi', 'Jumatatuu', 'Jumanne', 'Jumatanu', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Jumapilyi', 'Jumatatuu', 'Jumanne', 'Jumatanu', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  SHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  NARROWWEEKDAYS: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
  STANDALONENARROWWEEKDAYS: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo 1', 'Robo 2', 'Robo 3', 'Robo 4'],
  AMPMS: ['utuko', 'kyiukonyi'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale rwk_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_rwk_TZ = goog.i18n.DateTimeSymbols_rwk;


/**
 * Date/time formatting symbols for locale sah.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sah = {
  ERAS: ['б. э. и.', 'б. э'],
  ERANAMES: ['б. э. и.', 'б. э'],
  NARROWMONTHS: ['Т', 'О', 'К', 'М', 'Ы', 'Б', 'О', 'А', 'Б', 'А', 'С', 'А'],
  STANDALONENARROWMONTHS: ['Т', 'О', 'К', 'М', 'Ы', 'Б', 'О', 'А', 'Б', 'А', 'С', 'А'],
  MONTHS: ['Тохсунньу', 'Олунньу', 'Кулун тутар', 'Муус устар', 'Ыам ыйын', 'Бэс ыйын', 'От ыйын', 'Атырдьых ыйын', 'Балаҕан ыйын', 'Алтынньы', 'Сэтинньи', 'ахсынньы'],
  STANDALONEMONTHS: ['тохсунньу', 'олунньу', 'кулун тутар', 'муус устар', 'ыам ыйа', 'бэс ыйа', 'от ыйа', 'атырдьых ыйа', 'балаҕан ыйа', 'алтынньы', 'сэтинньи', 'ахсынньы'],
  SHORTMONTHS: ['Тохс', 'Олун', 'Клн', 'Мсу', 'Ыам', 'Бэс', 'Отй', 'Атр', 'Блҕ', 'Алт', 'Сэт', 'Ахс'],
  STANDALONESHORTMONTHS: ['Тохс', 'Олун', 'Клн', 'Мсу', 'Ыам', 'Бэс', 'Отй', 'Атр', 'Блҕ', 'Алт', 'Сэт', 'Ахс'],
  WEEKDAYS: ['баскыһыанньа', 'бэнидиэнньик', 'оптуорунньук', 'сэрэдэ', 'чэппиэр', 'Бээтиҥсэ', 'субуота'],
  STANDALONEWEEKDAYS: ['баскыһыанньа', 'бэнидиэнньик', 'оптуорунньук', 'сэрэдэ', 'чэппиэр', 'Бээтиҥсэ', 'субуота'],
  SHORTWEEKDAYS: ['бс', 'бн', 'оп', 'сэ', 'чп', 'бэ', 'сб'],
  STANDALONESHORTWEEKDAYS: ['бс', 'бн', 'оп', 'сэ', 'чп', 'бэ', 'сб'],
  NARROWWEEKDAYS: ['Б', 'Б', 'О', 'С', 'Ч', 'Б', 'С'],
  STANDALONENARROWWEEKDAYS: ['Б', 'Б', 'О', 'С', 'Ч', 'Б', 'С'],
  SHORTQUARTERS: ['1-кы кб', '2-с кб', '3-с кб', '4-с кб'],
  QUARTERS: ['1-кы кыбаартал', '2-с кыбаартал', '3-с кыбаартал', '4-с кыбаартал'],
  AMPMS: ['ЭИ', 'ЭК'],
  DATEFORMATS: ['y \'сыл\' MMMM d \'күнэ\', EEEE', 'y, MMMM d', 'y, MMM d', 'yy/M/d'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale sah_RU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sah_RU = goog.i18n.DateTimeSymbols_sah;


/**
 * Date/time formatting symbols for locale saq.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_saq = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Christo', 'Baada ya Christo'],
  NARROWMONTHS: ['O', 'W', 'O', 'O', 'I', 'I', 'S', 'I', 'S', 'T', 'T', 'T'],
  STANDALONENARROWMONTHS: ['O', 'W', 'O', 'O', 'I', 'I', 'S', 'I', 'S', 'T', 'T', 'T'],
  MONTHS: ['Lapa le obo', 'Lapa le waare', 'Lapa le okuni', 'Lapa le ong’wan', 'Lapa le imet', 'Lapa le ile', 'Lapa le sapa', 'Lapa le isiet', 'Lapa le saal', 'Lapa le tomon', 'Lapa le tomon obo', 'Lapa le tomon waare'],
  STANDALONEMONTHS: ['Lapa le obo', 'Lapa le waare', 'Lapa le okuni', 'Lapa le ong’wan', 'Lapa le imet', 'Lapa le ile', 'Lapa le sapa', 'Lapa le isiet', 'Lapa le saal', 'Lapa le tomon', 'Lapa le tomon obo', 'Lapa le tomon waare'],
  SHORTMONTHS: ['Obo', 'Waa', 'Oku', 'Ong', 'Ime', 'Ile', 'Sap', 'Isi', 'Saa', 'Tom', 'Tob', 'Tow'],
  STANDALONESHORTMONTHS: ['Obo', 'Waa', 'Oku', 'Ong', 'Ime', 'Ile', 'Sap', 'Isi', 'Saa', 'Tom', 'Tob', 'Tow'],
  WEEKDAYS: ['Mderot ee are', 'Mderot ee kuni', 'Mderot ee ong’wan', 'Mderot ee inet', 'Mderot ee ile', 'Mderot ee sapa', 'Mderot ee kwe'],
  STANDALONEWEEKDAYS: ['Mderot ee are', 'Mderot ee kuni', 'Mderot ee ong’wan', 'Mderot ee inet', 'Mderot ee ile', 'Mderot ee sapa', 'Mderot ee kwe'],
  SHORTWEEKDAYS: ['Are', 'Kun', 'Ong', 'Ine', 'Ile', 'Sap', 'Kwe'],
  STANDALONESHORTWEEKDAYS: ['Are', 'Kun', 'Ong', 'Ine', 'Ile', 'Sap', 'Kwe'],
  NARROWWEEKDAYS: ['A', 'K', 'O', 'I', 'I', 'S', 'K'],
  STANDALONENARROWWEEKDAYS: ['A', 'K', 'O', 'I', 'I', 'S', 'K'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo 1', 'Robo 2', 'Robo 3', 'Robo 4'],
  AMPMS: ['Tesiran', 'Teipa'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale saq_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_saq_KE = goog.i18n.DateTimeSymbols_saq;


/**
 * Date/time formatting symbols for locale sbp.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sbp = {
  ERAS: ['AK', 'PK'],
  ERANAMES: ['Ashanali uKilisito', 'Pamwandi ya Kilisto'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Mupalangulwa', 'Mwitope', 'Mushende', 'Munyi', 'Mushende Magali', 'Mujimbi', 'Mushipepo', 'Mupuguto', 'Munyense', 'Mokhu', 'Musongandembwe', 'Muhaano'],
  STANDALONEMONTHS: ['Mupalangulwa', 'Mwitope', 'Mushende', 'Munyi', 'Mushende Magali', 'Mujimbi', 'Mushipepo', 'Mupuguto', 'Munyense', 'Mokhu', 'Musongandembwe', 'Muhaano'],
  SHORTMONTHS: ['Mup', 'Mwi', 'Msh', 'Mun', 'Mag', 'Muj', 'Msp', 'Mpg', 'Mye', 'Mok', 'Mus', 'Muh'],
  STANDALONESHORTMONTHS: ['Mup', 'Mwi', 'Msh', 'Mun', 'Mag', 'Muj', 'Msp', 'Mpg', 'Mye', 'Mok', 'Mus', 'Muh'],
  WEEKDAYS: ['Mulungu', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alahamisi', 'Ijumaa', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Mulungu', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alahamisi', 'Ijumaa', 'Jumamosi'],
  SHORTWEEKDAYS: ['Mul', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Mul', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  NARROWWEEKDAYS: ['M', 'J', 'J', 'J', 'A', 'I', 'J'],
  STANDALONENARROWWEEKDAYS: ['M', 'J', 'J', 'J', 'A', 'I', 'J'],
  SHORTQUARTERS: ['L1', 'L2', 'L3', 'L4'],
  QUARTERS: ['Lobo 1', 'Lobo 2', 'Lobo 3', 'Lobo 4'],
  AMPMS: ['Lwamilawu', 'Pashamihe'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sbp_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sbp_TZ = goog.i18n.DateTimeSymbols_sbp;


/**
 * Date/time formatting symbols for locale sd.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sd = {
  ZERODIGIT: 0x0660,
  ERAS: ['BC', 'CD'],
  ERANAMES: ['مسيح کان اڳ', 'عيسوي کان پهرين'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'],
  STANDALONEMONTHS: ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'],
  SHORTMONTHS: ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'],
  STANDALONESHORTMONTHS: ['جنوري', 'فيبروري', 'مارچ', 'اپريل', 'مئي', 'جون', 'جولاءِ', 'آگسٽ', 'سيپٽمبر', 'آڪٽوبر', 'نومبر', 'ڊسمبر'],
  WEEKDAYS: ['آچر', 'سومر', 'اڱارو', 'اربع', 'خميس', 'جمعو', 'ڇنڇر'],
  STANDALONEWEEKDAYS: ['آچر', 'سومر', 'اڱارو', 'اربع', 'خميس', 'جمعو', 'ڇنڇر'],
  SHORTWEEKDAYS: ['آچر', 'سومر', 'اڱارو', 'اربع', 'خميس', 'جمعو', 'ڇنڇر'],
  STANDALONESHORTWEEKDAYS: ['آچر', 'سومر', 'اڱارو', 'اربع', 'خميس', 'جمعو', 'ڇنڇر'],
  NARROWWEEKDAYS: ['آچر', 'سو', 'اڱارو', 'اربع', 'خم', 'جمعو', 'ڇنڇر'],
  STANDALONENARROWWEEKDAYS: ['آچر', 'سو', 'اڱارو', 'اربع', 'خم', 'جمعو', 'ڇنڇر'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q5'],
  QUARTERS: ['پهرين ٽي ماهي', 'ٻين ٽي ماهي', 'ٽين ٽي ماهي', 'چوٿين ٽي ماهي'],
  AMPMS: ['صبح، منجهند', 'منجهند، شام'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale sd_PK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sd_PK = goog.i18n.DateTimeSymbols_sd;


/**
 * Date/time formatting symbols for locale se.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_se = {
  ERAS: ['o.Kr.', 'm.Kr.'],
  ERANAMES: ['ovdal Kristtusa', 'maŋŋel Kristtusa'],
  NARROWMONTHS: ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
  STANDALONENARROWMONTHS: ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
  MONTHS: ['ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu', 'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'],
  STANDALONEMONTHS: ['ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu', 'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'],
  SHORTMONTHS: ['ođđj', 'guov', 'njuk', 'cuo', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb', 'juov'],
  STANDALONESHORTMONTHS: ['ođđj', 'guov', 'njuk', 'cuo', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb', 'juov'],
  WEEKDAYS: ['sotnabeaivi', 'vuossárga', 'maŋŋebárga', 'gaskavahkku', 'duorasdat', 'bearjadat', 'lávvardat'],
  STANDALONEWEEKDAYS: ['sotnabeaivi', 'vuossárga', 'maŋŋebárga', 'gaskavahkku', 'duorasdat', 'bearjadat', 'lávvardat'],
  SHORTWEEKDAYS: ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
  STANDALONESHORTWEEKDAYS: ['sotn', 'vuos', 'maŋ', 'gask', 'duor', 'bear', 'láv'],
  NARROWWEEKDAYS: ['S', 'V', 'M', 'G', 'D', 'B', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'V', 'M', 'G', 'D', 'B', 'L'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['iđitbeaivet', 'eahketbeaivet'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale se_FI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_se_FI = {
  ERAS: ['oKr.', 'mKr.'],
  ERANAMES: ['ovdal Kristusa', 'maŋŋel Kristusa'],
  NARROWMONTHS: ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
  STANDALONENARROWMONTHS: ['O', 'G', 'N', 'C', 'M', 'G', 'S', 'B', 'Č', 'G', 'S', 'J'],
  MONTHS: ['ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu', 'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'],
  STANDALONEMONTHS: ['ođđajagemánnu', 'guovvamánnu', 'njukčamánnu', 'cuoŋománnu', 'miessemánnu', 'geassemánnu', 'suoidnemánnu', 'borgemánnu', 'čakčamánnu', 'golggotmánnu', 'skábmamánnu', 'juovlamánnu'],
  SHORTMONTHS: ['ođđj', 'guov', 'njuk', 'cuoŋ', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb', 'juov'],
  STANDALONESHORTMONTHS: ['ođđj', 'guov', 'njuk', 'cuoŋ', 'mies', 'geas', 'suoi', 'borg', 'čakč', 'golg', 'skáb', 'juov'],
  WEEKDAYS: ['sotnabeaivi', 'mánnodat', 'disdat', 'gaskavahkku', 'duorastat', 'bearjadat', 'lávvordat'],
  STANDALONEWEEKDAYS: ['sotnabeaivi', 'mánnodat', 'disdat', 'gaskavahkku', 'duorastat', 'bearjadat', 'lávvordat'],
  SHORTWEEKDAYS: ['so', 'má', 'di', 'ga', 'du', 'be', 'lá'],
  STANDALONESHORTWEEKDAYS: ['so', 'má', 'di', 'ga', 'du', 'be', 'lá'],
  NARROWWEEKDAYS: ['S', 'M', 'D', 'G', 'D', 'B', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'D', 'G', 'D', 'B', 'L'],
  SHORTQUARTERS: ['1Q', '2Q', '3Q', '4Q'],
  QUARTERS: ['1. njealjádas', '2. njealjádas', '3. njealjádas', '4. njealjádas'],
  AMPMS: ['ib', 'eb'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd.MM.y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale se_NO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_se_NO = goog.i18n.DateTimeSymbols_se;


/**
 * Date/time formatting symbols for locale se_SE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_se_SE = goog.i18n.DateTimeSymbols_se;


/**
 * Date/time formatting symbols for locale seh.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_seh = {
  ERAS: ['AC', 'AD'],
  ERANAMES: ['Antes de Cristo', 'Anno Domini'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Janeiro', 'Fevreiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Augusto', 'Setembro', 'Otubro', 'Novembro', 'Decembro'],
  STANDALONEMONTHS: ['Janeiro', 'Fevreiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Augusto', 'Setembro', 'Otubro', 'Novembro', 'Decembro'],
  SHORTMONTHS: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Aug', 'Set', 'Otu', 'Nov', 'Dec'],
  STANDALONESHORTMONTHS: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Aug', 'Set', 'Otu', 'Nov', 'Dec'],
  WEEKDAYS: ['Dimingu', 'Chiposi', 'Chipiri', 'Chitatu', 'Chinai', 'Chishanu', 'Sabudu'],
  STANDALONEWEEKDAYS: ['Dimingu', 'Chiposi', 'Chipiri', 'Chitatu', 'Chinai', 'Chishanu', 'Sabudu'],
  SHORTWEEKDAYS: ['Dim', 'Pos', 'Pir', 'Tat', 'Nai', 'Sha', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Dim', 'Pos', 'Pir', 'Tat', 'Nai', 'Sha', 'Sab'],
  NARROWWEEKDAYS: ['D', 'P', 'C', 'T', 'N', 'S', 'S'],
  STANDALONENARROWWEEKDAYS: ['D', 'P', 'C', 'T', 'N', 'S', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d \'de\' MMMM \'de\' y', 'd \'de\' MMMM \'de\' y', 'd \'de\' MMM \'de\' y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale seh_MZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_seh_MZ = goog.i18n.DateTimeSymbols_seh;


/**
 * Date/time formatting symbols for locale ses.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ses = {
  ERAS: ['IJ', 'IZ'],
  ERANAMES: ['Isaa jine', 'Isaa zamanoo'],
  NARROWMONTHS: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
  MONTHS: ['Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur', 'Oktoobur', 'Noowanbur', 'Deesanbur'],
  STANDALONEMONTHS: ['Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur', 'Oktoobur', 'Noowanbur', 'Deesanbur'],
  SHORTMONTHS: ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
  STANDALONESHORTMONTHS: ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
  WEEKDAYS: ['Alhadi', 'Atinni', 'Atalaata', 'Alarba', 'Alhamiisa', 'Alzuma', 'Asibti'],
  STANDALONEWEEKDAYS: ['Alhadi', 'Atinni', 'Atalaata', 'Alarba', 'Alhamiisa', 'Alzuma', 'Asibti'],
  SHORTWEEKDAYS: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
  STANDALONESHORTWEEKDAYS: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
  NARROWWEEKDAYS: ['H', 'T', 'T', 'L', 'L', 'L', 'S'],
  STANDALONENARROWWEEKDAYS: ['H', 'T', 'T', 'L', 'L', 'L', 'S'],
  SHORTQUARTERS: ['A1', 'A2', 'A3', 'A4'],
  QUARTERS: ['Arrubu 1', 'Arrubu 2', 'Arrubu 3', 'Arrubu 4'],
  AMPMS: ['Adduha', 'Aluula'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ses_ML.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ses_ML = goog.i18n.DateTimeSymbols_ses;


/**
 * Date/time formatting symbols for locale sg.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sg = {
  ERAS: ['KnK', 'NpK'],
  ERANAMES: ['Kôzo na Krîstu', 'Na pekô tî Krîstu'],
  NARROWMONTHS: ['N', 'F', 'M', 'N', 'B', 'F', 'L', 'K', 'M', 'N', 'N', 'K'],
  STANDALONENARROWMONTHS: ['N', 'F', 'M', 'N', 'B', 'F', 'L', 'K', 'M', 'N', 'N', 'K'],
  MONTHS: ['Nyenye', 'Fulundïgi', 'Mbängü', 'Ngubùe', 'Bêläwü', 'Föndo', 'Lengua', 'Kükürü', 'Mvuka', 'Ngberere', 'Nabändüru', 'Kakauka'],
  STANDALONEMONTHS: ['Nyenye', 'Fulundïgi', 'Mbängü', 'Ngubùe', 'Bêläwü', 'Föndo', 'Lengua', 'Kükürü', 'Mvuka', 'Ngberere', 'Nabändüru', 'Kakauka'],
  SHORTMONTHS: ['Nye', 'Ful', 'Mbä', 'Ngu', 'Bêl', 'Fön', 'Len', 'Kük', 'Mvu', 'Ngb', 'Nab', 'Kak'],
  STANDALONESHORTMONTHS: ['Nye', 'Ful', 'Mbä', 'Ngu', 'Bêl', 'Fön', 'Len', 'Kük', 'Mvu', 'Ngb', 'Nab', 'Kak'],
  WEEKDAYS: ['Bikua-ôko', 'Bïkua-ûse', 'Bïkua-ptâ', 'Bïkua-usïö', 'Bïkua-okü', 'Lâpôsö', 'Lâyenga'],
  STANDALONEWEEKDAYS: ['Bikua-ôko', 'Bïkua-ûse', 'Bïkua-ptâ', 'Bïkua-usïö', 'Bïkua-okü', 'Lâpôsö', 'Lâyenga'],
  SHORTWEEKDAYS: ['Bk1', 'Bk2', 'Bk3', 'Bk4', 'Bk5', 'Lâp', 'Lây'],
  STANDALONESHORTWEEKDAYS: ['Bk1', 'Bk2', 'Bk3', 'Bk4', 'Bk5', 'Lâp', 'Lây'],
  NARROWWEEKDAYS: ['K', 'S', 'T', 'S', 'K', 'P', 'Y'],
  STANDALONENARROWWEEKDAYS: ['K', 'S', 'T', 'S', 'K', 'P', 'Y'],
  SHORTQUARTERS: ['F4–1', 'F4–2', 'F4–3', 'F4–4'],
  QUARTERS: ['Fângbisïö ôko', 'Fângbisïö ûse', 'Fângbisïö otâ', 'Fângbisïö usïö'],
  AMPMS: ['ND', 'LK'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sg_CF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sg_CF = goog.i18n.DateTimeSymbols_sg;


/**
 * Date/time formatting symbols for locale shi.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_shi = {
  ERAS: ['ⴷⴰⵄ', 'ⴷⴼⵄ'],
  ERANAMES: ['ⴷⴰⵜ ⵏ ⵄⵉⵙⴰ', 'ⴷⴼⴼⵉⵔ ⵏ ⵄⵉⵙⴰ'],
  NARROWMONTHS: ['ⵉ', 'ⴱ', 'ⵎ', 'ⵉ', 'ⵎ', 'ⵢ', 'ⵢ', 'ⵖ', 'ⵛ', 'ⴽ', 'ⵏ', 'ⴷ'],
  STANDALONENARROWMONTHS: ['ⵉ', 'ⴱ', 'ⵎ', 'ⵉ', 'ⵎ', 'ⵢ', 'ⵢ', 'ⵖ', 'ⵛ', 'ⴽ', 'ⵏ', 'ⴷ'],
  MONTHS: ['ⵉⵏⵏⴰⵢⵔ', 'ⴱⵕⴰⵢⵕ', 'ⵎⴰⵕⵚ', 'ⵉⴱⵔⵉⵔ', 'ⵎⴰⵢⵢⵓ', 'ⵢⵓⵏⵢⵓ', 'ⵢⵓⵍⵢⵓⵣ', 'ⵖⵓⵛⵜ', 'ⵛⵓⵜⴰⵏⴱⵉⵔ', 'ⴽⵜⵓⴱⵔ', 'ⵏⵓⵡⴰⵏⴱⵉⵔ', 'ⴷⵓⵊⴰⵏⴱⵉⵔ'],
  STANDALONEMONTHS: ['ⵉⵏⵏⴰⵢⵔ', 'ⴱⵕⴰⵢⵕ', 'ⵎⴰⵕⵚ', 'ⵉⴱⵔⵉⵔ', 'ⵎⴰⵢⵢⵓ', 'ⵢⵓⵏⵢⵓ', 'ⵢⵓⵍⵢⵓⵣ', 'ⵖⵓⵛⵜ', 'ⵛⵓⵜⴰⵏⴱⵉⵔ', 'ⴽⵜⵓⴱⵔ', 'ⵏⵓⵡⴰⵏⴱⵉⵔ', 'ⴷⵓⵊⴰⵏⴱⵉⵔ'],
  SHORTMONTHS: ['ⵉⵏⵏ', 'ⴱⵕⴰ', 'ⵎⴰⵕ', 'ⵉⴱⵔ', 'ⵎⴰⵢ', 'ⵢⵓⵏ', 'ⵢⵓⵍ', 'ⵖⵓⵛ', 'ⵛⵓⵜ', 'ⴽⵜⵓ', 'ⵏⵓⵡ', 'ⴷⵓⵊ'],
  STANDALONESHORTMONTHS: ['ⵉⵏⵏ', 'ⴱⵕⴰ', 'ⵎⴰⵕ', 'ⵉⴱⵔ', 'ⵎⴰⵢ', 'ⵢⵓⵏ', 'ⵢⵓⵍ', 'ⵖⵓⵛ', 'ⵛⵓⵜ', 'ⴽⵜⵓ', 'ⵏⵓⵡ', 'ⴷⵓⵊ'],
  WEEKDAYS: ['ⴰⵙⴰⵎⴰⵙ', 'ⴰⵢⵏⴰⵙ', 'ⴰⵙⵉⵏⴰⵙ', 'ⴰⴽⵕⴰⵙ', 'ⴰⴽⵡⴰⵙ', 'ⵙⵉⵎⵡⴰⵙ', 'ⴰⵙⵉⴹⵢⴰⵙ'],
  STANDALONEWEEKDAYS: ['ⴰⵙⴰⵎⴰⵙ', 'ⴰⵢⵏⴰⵙ', 'ⴰⵙⵉⵏⴰⵙ', 'ⴰⴽⵕⴰⵙ', 'ⴰⴽⵡⴰⵙ', 'ⵙⵉⵎⵡⴰⵙ', 'ⴰⵙⵉⴹⵢⴰⵙ'],
  SHORTWEEKDAYS: ['ⴰⵙⴰ', 'ⴰⵢⵏ', 'ⴰⵙⵉ', 'ⴰⴽⵕ', 'ⴰⴽⵡ', 'ⴰⵙⵉⵎ', 'ⴰⵙⵉⴹ'],
  STANDALONESHORTWEEKDAYS: ['ⴰⵙⴰ', 'ⴰⵢⵏ', 'ⴰⵙⵉ', 'ⴰⴽⵕ', 'ⴰⴽⵡ', 'ⴰⵙⵉⵎ', 'ⴰⵙⵉⴹ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['ⴰⴽ 1', 'ⴰⴽ 2', 'ⴰⴽ 3', 'ⴰⴽ 4'],
  QUARTERS: ['ⴰⴽⵕⴰⴹⵢⵓⵔ 1', 'ⴰⴽⵕⴰⴹⵢⵓⵔ 2', 'ⴰⴽⵕⴰⴹⵢⵓⵔ 3', 'ⴰⴽⵕⴰⴹⵢⵓⵔ 4'],
  AMPMS: ['ⵜⵉⴼⴰⵡⵜ', 'ⵜⴰⴷⴳⴳⵯⴰⵜ'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale shi_Latn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_shi_Latn = {
  ERAS: ['daɛ', 'dfɛ'],
  ERANAMES: ['dat n ɛisa', 'dffir n ɛisa'],
  NARROWMONTHS: ['i', 'b', 'm', 'i', 'm', 'y', 'y', 'ɣ', 'c', 'k', 'n', 'd'],
  STANDALONENARROWMONTHS: ['i', 'b', 'm', 'i', 'm', 'y', 'y', 'ɣ', 'c', 'k', 'n', 'd'],
  MONTHS: ['innayr', 'bṛayṛ', 'maṛṣ', 'ibrir', 'mayyu', 'yunyu', 'yulyuz', 'ɣuct', 'cutanbir', 'ktubr', 'nuwanbir', 'dujanbir'],
  STANDALONEMONTHS: ['innayr', 'bṛayṛ', 'maṛṣ', 'ibrir', 'mayyu', 'yunyu', 'yulyuz', 'ɣuct', 'cutanbir', 'ktubr', 'nuwanbir', 'dujanbir'],
  SHORTMONTHS: ['inn', 'bṛa', 'maṛ', 'ibr', 'may', 'yun', 'yul', 'ɣuc', 'cut', 'ktu', 'nuw', 'duj'],
  STANDALONESHORTMONTHS: ['inn', 'bṛa', 'maṛ', 'ibr', 'may', 'yun', 'yul', 'ɣuc', 'cut', 'ktu', 'nuw', 'duj'],
  WEEKDAYS: ['asamas', 'aynas', 'asinas', 'akṛas', 'akwas', 'asimwas', 'asiḍyas'],
  STANDALONEWEEKDAYS: ['asamas', 'aynas', 'asinas', 'akṛas', 'akwas', 'asimwas', 'asiḍyas'],
  SHORTWEEKDAYS: ['asa', 'ayn', 'asi', 'akṛ', 'akw', 'asim', 'asiḍ'],
  STANDALONESHORTWEEKDAYS: ['asa', 'ayn', 'asi', 'akṛ', 'akw', 'asim', 'asiḍ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['ak 1', 'ak 2', 'ak 3', 'ak 4'],
  QUARTERS: ['akṛaḍyur 1', 'akṛaḍyur 2', 'akṛaḍyur 3', 'akṛaḍyur 4'],
  AMPMS: ['tifawt', 'tadggʷat'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale shi_Latn_MA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_shi_Latn_MA = {
  ERAS: ['daɛ', 'dfɛ'],
  ERANAMES: ['dat n ɛisa', 'dffir n ɛisa'],
  NARROWMONTHS: ['i', 'b', 'm', 'i', 'm', 'y', 'y', 'ɣ', 'c', 'k', 'n', 'd'],
  STANDALONENARROWMONTHS: ['i', 'b', 'm', 'i', 'm', 'y', 'y', 'ɣ', 'c', 'k', 'n', 'd'],
  MONTHS: ['innayr', 'bṛayṛ', 'maṛṣ', 'ibrir', 'mayyu', 'yunyu', 'yulyuz', 'ɣuct', 'cutanbir', 'ktubr', 'nuwanbir', 'dujanbir'],
  STANDALONEMONTHS: ['innayr', 'bṛayṛ', 'maṛṣ', 'ibrir', 'mayyu', 'yunyu', 'yulyuz', 'ɣuct', 'cutanbir', 'ktubr', 'nuwanbir', 'dujanbir'],
  SHORTMONTHS: ['inn', 'bṛa', 'maṛ', 'ibr', 'may', 'yun', 'yul', 'ɣuc', 'cut', 'ktu', 'nuw', 'duj'],
  STANDALONESHORTMONTHS: ['inn', 'bṛa', 'maṛ', 'ibr', 'may', 'yun', 'yul', 'ɣuc', 'cut', 'ktu', 'nuw', 'duj'],
  WEEKDAYS: ['asamas', 'aynas', 'asinas', 'akṛas', 'akwas', 'asimwas', 'asiḍyas'],
  STANDALONEWEEKDAYS: ['asamas', 'aynas', 'asinas', 'akṛas', 'akwas', 'asimwas', 'asiḍyas'],
  SHORTWEEKDAYS: ['asa', 'ayn', 'asi', 'akṛ', 'akw', 'asim', 'asiḍ'],
  STANDALONESHORTWEEKDAYS: ['asa', 'ayn', 'asi', 'akṛ', 'akw', 'asim', 'asiḍ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['ak 1', 'ak 2', 'ak 3', 'ak 4'],
  QUARTERS: ['akṛaḍyur 1', 'akṛaḍyur 2', 'akṛaḍyur 3', 'akṛaḍyur 4'],
  AMPMS: ['tifawt', 'tadggʷat'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale shi_Tfng.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_shi_Tfng = goog.i18n.DateTimeSymbols_shi;


/**
 * Date/time formatting symbols for locale shi_Tfng_MA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_shi_Tfng_MA = goog.i18n.DateTimeSymbols_shi;


/**
 * Date/time formatting symbols for locale si_LK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_si_LK = goog.i18n.DateTimeSymbols_si;


/**
 * Date/time formatting symbols for locale sk_SK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sk_SK = goog.i18n.DateTimeSymbols_sk;


/**
 * Date/time formatting symbols for locale sl_SI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sl_SI = goog.i18n.DateTimeSymbols_sl;


/**
 * Date/time formatting symbols for locale smn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_smn = {
  ERAS: ['oKr.', 'mKr.'],
  ERANAMES: ['Ovdil Kristus šoddâm', 'maŋa Kristus šoddâm'],
  NARROWMONTHS: ['U', 'K', 'NJ', 'C', 'V', 'K', 'S', 'P', 'Č', 'R', 'S', 'J'],
  STANDALONENARROWMONTHS: ['U', 'K', 'NJ', 'C', 'V', 'K', 'S', 'P', 'Č', 'R', 'S', 'J'],
  MONTHS: ['uđđâivemáánu', 'kuovâmáánu', 'njuhčâmáánu', 'cuáŋuimáánu', 'vyesimáánu', 'kesimáánu', 'syeinimáánu', 'porgemáánu', 'čohčâmáánu', 'roovvâdmáánu', 'skammâmáánu', 'juovlâmáánu'],
  STANDALONEMONTHS: ['uđđâivemáánu', 'kuovâmáánu', 'njuhčâmáánu', 'cuáŋuimáánu', 'vyesimáánu', 'kesimáánu', 'syeinimáánu', 'porgemáánu', 'čohčâmáánu', 'roovvâdmáánu', 'skammâmáánu', 'juovlâmáánu'],
  SHORTMONTHS: ['uđiv', 'kuovâ', 'njuhčâ', 'cuáŋui', 'vyesi', 'kesi', 'syeini', 'porge', 'čohčâ', 'roovvâd', 'skammâ', 'juovlâ'],
  STANDALONESHORTMONTHS: ['uđiv', 'kuovâ', 'njuhčâ', 'cuáŋui', 'vyesi', 'kesi', 'syeini', 'porge', 'čohčâ', 'roovvâd', 'skammâ', 'juovlâ'],
  WEEKDAYS: ['pasepeeivi', 'vuossaargâ', 'majebaargâ', 'koskoho', 'tuorâstuv', 'vástuppeeivi', 'lávurduv'],
  STANDALONEWEEKDAYS: ['pasepeivi', 'vuossargâ', 'majebargâ', 'koskokko', 'tuorâstâh', 'vástuppeivi', 'lávurdâh'],
  SHORTWEEKDAYS: ['pas', 'vuo', 'maj', 'kos', 'tuo', 'vás', 'láv'],
  STANDALONESHORTWEEKDAYS: ['pas', 'vuo', 'maj', 'kos', 'tuo', 'vás', 'láv'],
  NARROWWEEKDAYS: ['p', 'V', 'M', 'K', 'T', 'V', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['1. niälj.', '2. niälj.', '3. niälj.', '4. niälj.'],
  QUARTERS: ['1. niäljádâs', '2. niäljádâs', '3. niäljádâs', '4. niäljádâs'],
  AMPMS: ['ip.', 'ep.'],
  DATEFORMATS: ['cccc, MMMM d. y', 'MMMM d. y', 'MMM d. y', 'd.M.y'],
  TIMEFORMATS: ['H.mm.ss zzzz', 'H.mm.ss z', 'H.mm.ss', 'H.mm'],
  DATETIMEFORMATS: ['{1} \'tme\' {0}', '{1} \'tme\' {0}', '{1} \'tme\' {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale smn_FI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_smn_FI = goog.i18n.DateTimeSymbols_smn;


/**
 * Date/time formatting symbols for locale sn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sn = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['Kristo asati auya', 'mugore ramambo vedu'],
  NARROWMONTHS: ['N', 'K', 'K', 'K', 'C', 'C', 'C', 'N', 'G', 'G', 'M', 'Z'],
  STANDALONENARROWMONTHS: ['N', 'K', 'K', 'K', 'C', 'C', 'C', 'N', 'G', 'G', 'M', 'Z'],
  MONTHS: ['Ndira', 'Kukadzi', 'Kurume', 'Kubvumbi', 'Chivabvu', 'Chikumi', 'Chikunguru', 'Nyamavhuvhu', 'Gunyana', 'Gumiguru', 'Mbudzi', 'Zvita'],
  STANDALONEMONTHS: ['Ndira', 'Kukadzi', 'Kurume', 'Kubvumbi', 'Chivabvu', 'Chikumi', 'Chikunguru', 'Nyamavhuvhu', 'Gunyana', 'Gumiguru', 'Mbudzi', 'Zvita'],
  SHORTMONTHS: ['Ndi', 'Kuk', 'Kur', 'Kub', 'Chv', 'Chk', 'Chg', 'Nya', 'Gun', 'Gum', 'Mbu', 'Zvi'],
  STANDALONESHORTMONTHS: ['Ndi', 'Kuk', 'Kur', 'Kub', 'Chv', 'Chk', 'Chg', 'Nya', 'Gun', 'Gum', 'Mbu', 'Zvi'],
  WEEKDAYS: ['Svondo', 'Muvhuro', 'Chipiri', 'Chitatu', 'China', 'Chishanu', 'Mugovera'],
  STANDALONEWEEKDAYS: ['Svondo', 'Muvhuro', 'Chipiri', 'Chitatu', 'China', 'Chishanu', 'Mugovera'],
  SHORTWEEKDAYS: ['Svo', 'Muv', 'Chp', 'Cht', 'Chn', 'Chs', 'Mug'],
  STANDALONESHORTWEEKDAYS: ['Svo', 'Muv', 'Chp', 'Cht', 'Chn', 'Chs', 'Mug'],
  NARROWWEEKDAYS: ['S', 'M', 'C', 'C', 'C', 'C', 'M'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'C', 'C', 'C', 'C', 'M'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Kota 1', 'Kota 2', 'Kota 3', 'Kota 4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale sn_ZW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sn_ZW = goog.i18n.DateTimeSymbols_sn;


/**
 * Date/time formatting symbols for locale so.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_so = {
  ERAS: ['CH', 'CD'],
  ERANAMES: ['Ciise Hortii', 'Ciise Dabadii'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'],
  MONTHS: ['Bisha Koobaad', 'Bisha Labaad', 'Bisha Saddexaad', 'Bisha Afraad', 'Bisha Shanaad', 'Bisha Lixaad', 'Bisha Todobaad', 'Bisha Sideedaad', 'Bisha Sagaalaad', 'Bisha Tobnaad', 'Bisha Kow iyo Tobnaad', 'Bisha Laba iyo Tobnaad'],
  STANDALONEMONTHS: ['Jannaayo', 'Febraayo', 'Maarso', 'Abriil', 'May', 'Juun', 'Luuliyo', 'Ogost', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Desembar'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Dis'],
  WEEKDAYS: ['Axad', 'Isniin', 'Salaasa', 'Arbaca', 'Khamiis', 'Jimce', 'Sabti'],
  STANDALONEWEEKDAYS: ['Axad', 'Isniin', 'Salaasa', 'Arbaca', 'Khamiis', 'Jimce', 'Sabti'],
  SHORTWEEKDAYS: ['Axd', 'Isn', 'Slsa', 'Arbc', 'Khms', 'Jmc', 'Sbti'],
  STANDALONESHORTWEEKDAYS: ['Axd', 'Isn', 'Slsa', 'Arbc', 'Khms', 'Jmc', 'Sbti'],
  NARROWWEEKDAYS: ['A', 'I', 'S', 'A', 'Kh', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['A', 'I', 'S', 'A', 'Kh', 'J', 'S'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Rubaca 1aad', 'Rubaca 2aad', 'Rubaca 3aad', 'Rubaca 4aad'],
  AMPMS: ['GH', 'GD'],
  DATEFORMATS: ['EEEE, MMMM dd, y', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale so_DJ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_so_DJ = {
  ERAS: ['CH', 'CD'],
  ERANAMES: ['Ciise Hortii', 'Ciise Dabadii'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'],
  MONTHS: ['Bisha Koobaad', 'Bisha Labaad', 'Bisha Saddexaad', 'Bisha Afraad', 'Bisha Shanaad', 'Bisha Lixaad', 'Bisha Todobaad', 'Bisha Sideedaad', 'Bisha Sagaalaad', 'Bisha Tobnaad', 'Bisha Kow iyo Tobnaad', 'Bisha Laba iyo Tobnaad'],
  STANDALONEMONTHS: ['Jannaayo', 'Febraayo', 'Maarso', 'Abriil', 'May', 'Juun', 'Luuliyo', 'Ogost', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Desembar'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Dis'],
  WEEKDAYS: ['Axad', 'Isniin', 'Salaasa', 'Arbaca', 'Khamiis', 'Jimce', 'Sabti'],
  STANDALONEWEEKDAYS: ['Axad', 'Isniin', 'Salaasa', 'Arbaca', 'Khamiis', 'Jimce', 'Sabti'],
  SHORTWEEKDAYS: ['Axd', 'Isn', 'Slsa', 'Arbc', 'Khms', 'Jmc', 'Sbti'],
  STANDALONESHORTWEEKDAYS: ['Axd', 'Isn', 'Slsa', 'Arbc', 'Khms', 'Jmc', 'Sbti'],
  NARROWWEEKDAYS: ['A', 'I', 'S', 'A', 'Kh', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['A', 'I', 'S', 'A', 'Kh', 'J', 'S'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Rubaca 1aad', 'Rubaca 2aad', 'Rubaca 3aad', 'Rubaca 4aad'],
  AMPMS: ['GH', 'GD'],
  DATEFORMATS: ['EEEE, MMMM dd, y', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale so_ET.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_so_ET = {
  ERAS: ['CH', 'CD'],
  ERANAMES: ['Ciise Hortii', 'Ciise Dabadii'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'],
  MONTHS: ['Bisha Koobaad', 'Bisha Labaad', 'Bisha Saddexaad', 'Bisha Afraad', 'Bisha Shanaad', 'Bisha Lixaad', 'Bisha Todobaad', 'Bisha Sideedaad', 'Bisha Sagaalaad', 'Bisha Tobnaad', 'Bisha Kow iyo Tobnaad', 'Bisha Laba iyo Tobnaad'],
  STANDALONEMONTHS: ['Jannaayo', 'Febraayo', 'Maarso', 'Abriil', 'May', 'Juun', 'Luuliyo', 'Ogost', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Desembar'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Dis'],
  WEEKDAYS: ['Axad', 'Isniin', 'Salaasa', 'Arbaca', 'Khamiis', 'Jimce', 'Sabti'],
  STANDALONEWEEKDAYS: ['Axad', 'Isniin', 'Salaasa', 'Arbaca', 'Khamiis', 'Jimce', 'Sabti'],
  SHORTWEEKDAYS: ['Axd', 'Isn', 'Slsa', 'Arbc', 'Khms', 'Jmc', 'Sbti'],
  STANDALONESHORTWEEKDAYS: ['Axd', 'Isn', 'Slsa', 'Arbc', 'Khms', 'Jmc', 'Sbti'],
  NARROWWEEKDAYS: ['A', 'I', 'S', 'A', 'Kh', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['A', 'I', 'S', 'A', 'Kh', 'J', 'S'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Rubaca 1aad', 'Rubaca 2aad', 'Rubaca 3aad', 'Rubaca 4aad'],
  AMPMS: ['GH', 'GD'],
  DATEFORMATS: ['EEEE, MMMM dd, y', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale so_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_so_KE = {
  ERAS: ['CH', 'CD'],
  ERANAMES: ['Ciise Hortii', 'Ciise Dabadii'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'L', 'O', 'S', 'O', 'N', 'D'],
  MONTHS: ['Bisha Koobaad', 'Bisha Labaad', 'Bisha Saddexaad', 'Bisha Afraad', 'Bisha Shanaad', 'Bisha Lixaad', 'Bisha Todobaad', 'Bisha Sideedaad', 'Bisha Sagaalaad', 'Bisha Tobnaad', 'Bisha Kow iyo Tobnaad', 'Bisha Laba iyo Tobnaad'],
  STANDALONEMONTHS: ['Jannaayo', 'Febraayo', 'Maarso', 'Abriil', 'May', 'Juun', 'Luuliyo', 'Ogost', 'Sebtembar', 'Oktoobar', 'Nofembar', 'Desembar'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Lul', 'Ogs', 'Seb', 'Okt', 'Nof', 'Dis'],
  WEEKDAYS: ['Axad', 'Isniin', 'Salaasa', 'Arbaca', 'Khamiis', 'Jimce', 'Sabti'],
  STANDALONEWEEKDAYS: ['Axad', 'Isniin', 'Salaasa', 'Arbaca', 'Khamiis', 'Jimce', 'Sabti'],
  SHORTWEEKDAYS: ['Axd', 'Isn', 'Slsa', 'Arbc', 'Khms', 'Jmc', 'Sbti'],
  STANDALONESHORTWEEKDAYS: ['Axd', 'Isn', 'Slsa', 'Arbc', 'Khms', 'Jmc', 'Sbti'],
  NARROWWEEKDAYS: ['A', 'I', 'S', 'A', 'Kh', 'J', 'S'],
  STANDALONENARROWWEEKDAYS: ['A', 'I', 'S', 'A', 'Kh', 'J', 'S'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Rubaca 1aad', 'Rubaca 2aad', 'Rubaca 3aad', 'Rubaca 4aad'],
  AMPMS: ['GH', 'GD'],
  DATEFORMATS: ['EEEE, MMMM dd, y', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale so_SO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_so_SO = goog.i18n.DateTimeSymbols_so;


/**
 * Date/time formatting symbols for locale sq_AL.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sq_AL = goog.i18n.DateTimeSymbols_sq;


/**
 * Date/time formatting symbols for locale sq_MK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sq_MK = {
  ERAS: ['p.K.', 'mb.K.'],
  ERANAMES: ['para Krishtit', 'mbas Krishtit'],
  NARROWMONTHS: ['j', 'sh', 'm', 'p', 'm', 'q', 'k', 'g', 'sh', 't', 'n', 'dh'],
  STANDALONENARROWMONTHS: ['j', 'sh', 'm', 'p', 'm', 'q', 'k', 'g', 'sh', 't', 'n', 'dh'],
  MONTHS: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
  STANDALONEMONTHS: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
  SHORTMONTHS: ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'korr', 'gush', 'sht', 'tet', 'nën', 'dhj'],
  STANDALONESHORTMONTHS: ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'korr', 'gush', 'sht', 'tet', 'nën', 'dhj'],
  WEEKDAYS: ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'],
  STANDALONEWEEKDAYS: ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'],
  SHORTWEEKDAYS: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
  STANDALONESHORTWEEKDAYS: ['die', 'hën', 'mar', 'mër', 'enj', 'pre', 'sht'],
  NARROWWEEKDAYS: ['d', 'h', 'm', 'm', 'e', 'p', 'sh'],
  STANDALONENARROWWEEKDAYS: ['d', 'h', 'm', 'm', 'e', 'p', 'sh'],
  SHORTQUARTERS: ['tremujori I', 'tremujori II', 'tremujori III', 'tremujori IV'],
  QUARTERS: ['tremujori i parë', 'tremujori i dytë', 'tremujori i tretë', 'tremujori i katërt'],
  AMPMS: ['e paradites', 'e pasdites'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'd.M.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'në\' {0}', '{1} \'në\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sq_XK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sq_XK = {
  ERAS: ['p.K.', 'mb.K.'],
  ERANAMES: ['para Krishtit', 'mbas Krishtit'],
  NARROWMONTHS: ['j', 'sh', 'm', 'p', 'm', 'q', 'k', 'g', 'sh', 't', 'n', 'dh'],
  STANDALONENARROWMONTHS: ['j', 'sh', 'm', 'p', 'm', 'q', 'k', 'g', 'sh', 't', 'n', 'dh'],
  MONTHS: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
  STANDALONEMONTHS: ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'],
  SHORTMONTHS: ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'korr', 'gush', 'sht', 'tet', 'nën', 'dhj'],
  STANDALONESHORTMONTHS: ['jan', 'shk', 'mar', 'pri', 'maj', 'qer', 'korr', 'gush', 'sht', 'tet', 'nën', 'dhj'],
  WEEKDAYS: ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'],
  STANDALONEWEEKDAYS: ['e diel', 'e hënë', 'e martë', 'e mërkurë', 'e enjte', 'e premte', 'e shtunë'],
  SHORTWEEKDAYS: ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'],
  STANDALONESHORTWEEKDAYS: ['die', 'hën', 'mar', 'mër', 'enj', 'pre', 'sht'],
  NARROWWEEKDAYS: ['d', 'h', 'm', 'm', 'e', 'p', 'sh'],
  STANDALONENARROWWEEKDAYS: ['d', 'h', 'm', 'm', 'e', 'p', 'sh'],
  SHORTQUARTERS: ['tremujori I', 'tremujori II', 'tremujori III', 'tremujori IV'],
  QUARTERS: ['tremujori i parë', 'tremujori i dytë', 'tremujori i tretë', 'tremujori i katërt'],
  AMPMS: ['e paradites', 'e pasdites'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'd.M.yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'në\' {0}', '{1} \'në\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sr_Cyrl.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Cyrl = goog.i18n.DateTimeSymbols_sr;


/**
 * Date/time formatting symbols for locale sr_Cyrl_BA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Cyrl_BA = {
  ERAS: ['п. н. е.', 'н. е.'],
  ERANAMES: ['прије нове ере', 'нове ере'],
  NARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  STANDALONENARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  MONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
  STANDALONEMONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
  SHORTMONTHS: ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
  STANDALONESHORTMONTHS: ['јан', 'феб', 'март', 'апр', 'мај', 'јун', 'јул', 'авг', 'септ', 'окт', 'нов', 'дец'],
  WEEKDAYS: ['недјеља', 'понедељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
  STANDALONEWEEKDAYS: ['недјеља', 'понедељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
  SHORTWEEKDAYS: ['нед', 'пон', 'ут', 'ср', 'чет', 'пет', 'суб'],
  STANDALONESHORTWEEKDAYS: ['нед', 'пон', 'ут', 'ср', 'чет', 'пет', 'суб'],
  NARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  STANDALONENARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  SHORTQUARTERS: ['К1', 'К2', 'К3', 'К4'],
  QUARTERS: ['први квартал', 'други квартал', 'трећи квартал', 'четврти квартал'],
  AMPMS: ['прије подне', 'по подне'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sr_Cyrl_ME.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Cyrl_ME = {
  ERAS: ['п. н. е.', 'н. е.'],
  ERANAMES: ['прије нове ере', 'нове ере'],
  NARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  STANDALONENARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  MONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
  STANDALONEMONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
  SHORTMONTHS: ['јан', 'феб', 'март', 'апр', 'мај', 'јун', 'јул', 'авг', 'септ', 'окт', 'нов', 'дец'],
  STANDALONESHORTMONTHS: ['јан', 'феб', 'март', 'апр', 'мај', 'јун', 'јул', 'авг', 'септ', 'окт', 'нов', 'дец'],
  WEEKDAYS: ['недјеља', 'понедељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
  STANDALONEWEEKDAYS: ['недјеља', 'понедељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
  SHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
  STANDALONESHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
  NARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  STANDALONENARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  SHORTQUARTERS: ['К1', 'К2', 'К3', 'К4'],
  QUARTERS: ['први квартал', 'други квартал', 'трећи квартал', 'четврти квартал'],
  AMPMS: ['прије подне', 'по подне'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sr_Cyrl_RS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Cyrl_RS = goog.i18n.DateTimeSymbols_sr;


/**
 * Date/time formatting symbols for locale sr_Cyrl_XK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Cyrl_XK = {
  ERAS: ['п. н. е.', 'н. е.'],
  ERANAMES: ['пре нове ере', 'нове ере'],
  NARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  STANDALONENARROWMONTHS: ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
  MONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
  STANDALONEMONTHS: ['јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар', 'новембар', 'децембар'],
  SHORTMONTHS: ['јан', 'феб', 'март', 'апр', 'мај', 'јун', 'јул', 'авг', 'септ', 'окт', 'нов', 'дец'],
  STANDALONESHORTMONTHS: ['јан', 'феб', 'март', 'апр', 'мај', 'јун', 'јул', 'авг', 'септ', 'окт', 'нов', 'дец'],
  WEEKDAYS: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
  STANDALONEWEEKDAYS: ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
  SHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
  STANDALONESHORTWEEKDAYS: ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
  NARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  STANDALONENARROWWEEKDAYS: ['н', 'п', 'у', 'с', 'ч', 'п', 'с'],
  SHORTQUARTERS: ['К1', 'К2', 'К3', 'К4'],
  QUARTERS: ['први квартал', 'други квартал', 'трећи квартал', 'четврти квартал'],
  AMPMS: ['пре подне', 'по подне'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sr_Latn_BA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Latn_BA = {
  ERAS: ['p. n. e.', 'n. e.'],
  ERANAMES: ['prije nove ere', 'nove ere'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  MONTHS: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  STANDALONEMONTHS: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  SHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mart', 'apr', 'maj', 'jun', 'jul', 'avg', 'sept', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['nedjelja', 'ponedeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
  STANDALONEWEEKDAYS: ['nedjelja', 'ponedeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
  SHORTWEEKDAYS: ['ned', 'pon', 'ut', 'sr', 'čet', 'pet', 'sub'],
  STANDALONESHORTWEEKDAYS: ['ned', 'pon', 'ut', 'sr', 'čet', 'pet', 'sub'],
  NARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  STANDALONENARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['prvi kvartal', 'drugi kvartal', 'treći kvartal', 'četvrti kvartal'],
  AMPMS: ['prije podne', 'po podne'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sr_Latn_ME.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Latn_ME = {
  ERAS: ['p. n. e.', 'n. e.'],
  ERANAMES: ['prije nove ere', 'nove ere'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  MONTHS: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  STANDALONEMONTHS: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  SHORTMONTHS: ['jan.', 'feb.', 'mart', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sept.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mart', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sept.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['nedjelja', 'ponedeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
  STANDALONEWEEKDAYS: ['nedjelja', 'ponedeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'],
  SHORTWEEKDAYS: ['ned.', 'pon.', 'ut.', 'sr.', 'čet.', 'pet.', 'sub.'],
  STANDALONESHORTWEEKDAYS: ['ned.', 'pon.', 'ut.', 'sr.', 'čet.', 'pet.', 'sub.'],
  NARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  STANDALONENARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['prvi kvartal', 'drugi kvartal', 'treći kvartal', 'četvrti kvartal'],
  AMPMS: ['prije podne', 'po podne'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sr_Latn_RS.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Latn_RS = {
  ERAS: ['p. n. e.', 'n. e.'],
  ERANAMES: ['pre nove ere', 'nove ere'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  MONTHS: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  STANDALONEMONTHS: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  SHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'],
  STANDALONESHORTMONTHS: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'],
  WEEKDAYS: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'],
  STANDALONEWEEKDAYS: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'],
  SHORTWEEKDAYS: ['ned', 'pon', 'uto', 'sre', 'čet', 'pet', 'sub'],
  STANDALONESHORTWEEKDAYS: ['ned', 'pon', 'uto', 'sre', 'čet', 'pet', 'sub'],
  NARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  STANDALONENARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['prvi kvartal', 'drugi kvartal', 'treći kvartal', 'četvrti kvartal'],
  AMPMS: ['pre podne', 'po podne'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sr_Latn_XK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sr_Latn_XK = {
  ERAS: ['p. n. e.', 'n. e.'],
  ERANAMES: ['pre nove ere', 'nove ere'],
  NARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  STANDALONENARROWMONTHS: ['j', 'f', 'm', 'a', 'm', 'j', 'j', 'a', 's', 'o', 'n', 'd'],
  MONTHS: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  STANDALONEMONTHS: ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'],
  SHORTMONTHS: ['jan.', 'feb.', 'mart', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sept.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mart', 'apr.', 'maj', 'jun', 'jul', 'avg.', 'sept.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'],
  STANDALONEWEEKDAYS: ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'],
  SHORTWEEKDAYS: ['ned.', 'pon.', 'ut.', 'sr.', 'čet.', 'pet.', 'sub.'],
  STANDALONESHORTWEEKDAYS: ['ned.', 'pon.', 'ut.', 'sr.', 'čet.', 'pet.', 'sub.'],
  NARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  STANDALONENARROWWEEKDAYS: ['n', 'p', 'u', 's', 'č', 'p', 's'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['prvi kvartal', 'drugi kvartal', 'treći kvartal', 'četvrti kvartal'],
  AMPMS: ['pre podne', 'po podne'],
  DATEFORMATS: ['EEEE, dd. MMMM y.', 'dd. MMMM y.', 'dd.MM.y.', 'd.M.yy.'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale sv_AX.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sv_AX = goog.i18n.DateTimeSymbols_sv;


/**
 * Date/time formatting symbols for locale sv_FI.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sv_FI = {
  ERAS: ['f.Kr.', 'e.Kr.'],
  ERANAMES: ['före Kristus', 'efter Kristus'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
  STANDALONEMONTHS: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
  SHORTMONTHS: ['jan.', 'feb.', 'mars', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  STANDALONESHORTMONTHS: ['jan.', 'feb.', 'mars', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
  WEEKDAYS: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
  STANDALONEWEEKDAYS: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
  SHORTWEEKDAYS: ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'],
  STANDALONESHORTWEEKDAYS: ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1:a kvartalet', '2:a kvartalet', '3:e kvartalet', '4:e kvartalet'],
  AMPMS: ['fm', 'em'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'dd-MM-y'],
  TIMEFORMATS: ['\'kl\'. HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale sv_SE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sv_SE = goog.i18n.DateTimeSymbols_sv;


/**
 * Date/time formatting symbols for locale sw_CD.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sw_CD = goog.i18n.DateTimeSymbols_sw;


/**
 * Date/time formatting symbols for locale sw_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sw_KE = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Kristo', 'Baada ya Kristo'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  SHORTWEEKDAYS: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  STANDALONESHORTWEEKDAYS: ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Robo ya 1', 'Robo ya 2', 'Robo ya 3', 'Robo ya 4'],
  QUARTERS: ['Robo ya 1', 'Robo ya 2', 'Robo ya 3', 'Robo ya 4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'saa\' {0}', '{1} \'saa\' {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale sw_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sw_TZ = goog.i18n.DateTimeSymbols_sw;


/**
 * Date/time formatting symbols for locale sw_UG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_sw_UG = goog.i18n.DateTimeSymbols_sw;


/**
 * Date/time formatting symbols for locale ta_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ta_IN = goog.i18n.DateTimeSymbols_ta;


/**
 * Date/time formatting symbols for locale ta_LK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ta_LK = {
  ERAS: ['கி.மு.', 'கி.பி.'],
  ERANAMES: ['கிறிஸ்துவுக்கு முன்', 'அன்னோ டோமினி'],
  NARROWMONTHS: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
  STANDALONENARROWMONTHS: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
  MONTHS: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  STANDALONEMONTHS: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  SHORTMONTHS: ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'],
  STANDALONESHORTMONTHS: ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'],
  WEEKDAYS: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  STANDALONEWEEKDAYS: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  SHORTWEEKDAYS: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
  STANDALONESHORTWEEKDAYS: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
  NARROWWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
  STANDALONENARROWWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
  SHORTQUARTERS: ['காலா.1', 'காலா.2', 'காலா.3', 'காலா.4'],
  QUARTERS: ['ஒன்றாம் காலாண்டு', 'இரண்டாம் காலாண்டு', 'மூன்றாம் காலாண்டு', 'நான்காம் காலாண்டு'],
  AMPMS: ['முற்பகல்', 'பிற்பகல்'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} ’அன்று’ {0}', '{1} ’அன்று’ {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ta_MY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ta_MY = {
  ERAS: ['கி.மு.', 'கி.பி.'],
  ERANAMES: ['கிறிஸ்துவுக்கு முன்', 'அன்னோ டோமினி'],
  NARROWMONTHS: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
  STANDALONENARROWMONTHS: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
  MONTHS: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  STANDALONEMONTHS: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  SHORTMONTHS: ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'],
  STANDALONESHORTMONTHS: ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'],
  WEEKDAYS: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  STANDALONEWEEKDAYS: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  SHORTWEEKDAYS: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
  STANDALONESHORTWEEKDAYS: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
  NARROWWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
  STANDALONENARROWWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
  SHORTQUARTERS: ['காலா.1', 'காலா.2', 'காலா.3', 'காலா.4'],
  QUARTERS: ['ஒன்றாம் காலாண்டு', 'இரண்டாம் காலாண்டு', 'மூன்றாம் காலாண்டு', 'நான்காம் காலாண்டு'],
  AMPMS: ['முற்பகல்', 'பிற்பகல்'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['a h:mm:ss zzzz', 'a h:mm:ss z', 'a h:mm:ss', 'a h:mm'],
  DATETIMEFORMATS: ['{1} ’அன்று’ {0}', '{1} ’அன்று’ {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ta_SG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ta_SG = {
  ERAS: ['கி.மு.', 'கி.பி.'],
  ERANAMES: ['கிறிஸ்துவுக்கு முன்', 'அன்னோ டோமினி'],
  NARROWMONTHS: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
  STANDALONENARROWMONTHS: ['ஜ', 'பி', 'மா', 'ஏ', 'மே', 'ஜூ', 'ஜூ', 'ஆ', 'செ', 'அ', 'ந', 'டி'],
  MONTHS: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  STANDALONEMONTHS: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
  SHORTMONTHS: ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'],
  STANDALONESHORTMONTHS: ['ஜன.', 'பிப்.', 'மார்.', 'ஏப்.', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக.', 'செப்.', 'அக்.', 'நவ.', 'டிச.'],
  WEEKDAYS: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  STANDALONEWEEKDAYS: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
  SHORTWEEKDAYS: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
  STANDALONESHORTWEEKDAYS: ['ஞாயி.', 'திங்.', 'செவ்.', 'புத.', 'வியா.', 'வெள்.', 'சனி'],
  NARROWWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
  STANDALONENARROWWEEKDAYS: ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'],
  SHORTQUARTERS: ['காலா.1', 'காலா.2', 'காலா.3', 'காலா.4'],
  QUARTERS: ['ஒன்றாம் காலாண்டு', 'இரண்டாம் காலாண்டு', 'மூன்றாம் காலாண்டு', 'நான்காம் காலாண்டு'],
  AMPMS: ['முற்பகல்', 'பிற்பகல்'],
  DATEFORMATS: ['EEEE, d MMMM, y', 'd MMMM, y', 'd MMM, y', 'd/M/yy'],
  TIMEFORMATS: ['a h:mm:ss zzzz', 'a h:mm:ss z', 'a h:mm:ss', 'a h:mm'],
  DATETIMEFORMATS: ['{1} ’அன்று’ {0}', '{1} ’அன்று’ {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale te_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_te_IN = goog.i18n.DateTimeSymbols_te;


/**
 * Date/time formatting symbols for locale teo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_teo = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Christo', 'Baada ya Christo'],
  NARROWMONTHS: ['R', 'M', 'K', 'D', 'M', 'M', 'J', 'P', 'S', 'T', 'L', 'P'],
  STANDALONENARROWMONTHS: ['R', 'M', 'K', 'D', 'M', 'M', 'J', 'P', 'S', 'T', 'L', 'P'],
  MONTHS: ['Orara', 'Omuk', 'Okwamg’', 'Odung’el', 'Omaruk', 'Omodok’king’ol', 'Ojola', 'Opedel', 'Osokosokoma', 'Otibar', 'Olabor', 'Opoo'],
  STANDALONEMONTHS: ['Orara', 'Omuk', 'Okwamg’', 'Odung’el', 'Omaruk', 'Omodok’king’ol', 'Ojola', 'Opedel', 'Osokosokoma', 'Otibar', 'Olabor', 'Opoo'],
  SHORTMONTHS: ['Rar', 'Muk', 'Kwa', 'Dun', 'Mar', 'Mod', 'Jol', 'Ped', 'Sok', 'Tib', 'Lab', 'Poo'],
  STANDALONESHORTMONTHS: ['Rar', 'Muk', 'Kwa', 'Dun', 'Mar', 'Mod', 'Jol', 'Ped', 'Sok', 'Tib', 'Lab', 'Poo'],
  WEEKDAYS: ['Nakaejuma', 'Nakaebarasa', 'Nakaare', 'Nakauni', 'Nakaung’on', 'Nakakany', 'Nakasabiti'],
  STANDALONEWEEKDAYS: ['Nakaejuma', 'Nakaebarasa', 'Nakaare', 'Nakauni', 'Nakaung’on', 'Nakakany', 'Nakasabiti'],
  SHORTWEEKDAYS: ['Jum', 'Bar', 'Aar', 'Uni', 'Ung', 'Kan', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Jum', 'Bar', 'Aar', 'Uni', 'Ung', 'Kan', 'Sab'],
  NARROWWEEKDAYS: ['J', 'B', 'A', 'U', 'U', 'K', 'S'],
  STANDALONENARROWWEEKDAYS: ['J', 'B', 'A', 'U', 'U', 'K', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Akwota abe', 'Akwota Aane', 'Akwota auni', 'Akwota Aung’on'],
  AMPMS: ['Taparachu', 'Ebongi'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale teo_KE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_teo_KE = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Christo', 'Baada ya Christo'],
  NARROWMONTHS: ['R', 'M', 'K', 'D', 'M', 'M', 'J', 'P', 'S', 'T', 'L', 'P'],
  STANDALONENARROWMONTHS: ['R', 'M', 'K', 'D', 'M', 'M', 'J', 'P', 'S', 'T', 'L', 'P'],
  MONTHS: ['Orara', 'Omuk', 'Okwamg’', 'Odung’el', 'Omaruk', 'Omodok’king’ol', 'Ojola', 'Opedel', 'Osokosokoma', 'Otibar', 'Olabor', 'Opoo'],
  STANDALONEMONTHS: ['Orara', 'Omuk', 'Okwamg’', 'Odung’el', 'Omaruk', 'Omodok’king’ol', 'Ojola', 'Opedel', 'Osokosokoma', 'Otibar', 'Olabor', 'Opoo'],
  SHORTMONTHS: ['Rar', 'Muk', 'Kwa', 'Dun', 'Mar', 'Mod', 'Jol', 'Ped', 'Sok', 'Tib', 'Lab', 'Poo'],
  STANDALONESHORTMONTHS: ['Rar', 'Muk', 'Kwa', 'Dun', 'Mar', 'Mod', 'Jol', 'Ped', 'Sok', 'Tib', 'Lab', 'Poo'],
  WEEKDAYS: ['Nakaejuma', 'Nakaebarasa', 'Nakaare', 'Nakauni', 'Nakaung’on', 'Nakakany', 'Nakasabiti'],
  STANDALONEWEEKDAYS: ['Nakaejuma', 'Nakaebarasa', 'Nakaare', 'Nakauni', 'Nakaung’on', 'Nakakany', 'Nakasabiti'],
  SHORTWEEKDAYS: ['Jum', 'Bar', 'Aar', 'Uni', 'Ung', 'Kan', 'Sab'],
  STANDALONESHORTWEEKDAYS: ['Jum', 'Bar', 'Aar', 'Uni', 'Ung', 'Kan', 'Sab'],
  NARROWWEEKDAYS: ['J', 'B', 'A', 'U', 'U', 'K', 'S'],
  STANDALONENARROWWEEKDAYS: ['J', 'B', 'A', 'U', 'U', 'K', 'S'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['Akwota abe', 'Akwota Aane', 'Akwota auni', 'Akwota Aung’on'],
  AMPMS: ['Taparachu', 'Ebongi'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale teo_UG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_teo_UG = goog.i18n.DateTimeSymbols_teo;


/**
 * Date/time formatting symbols for locale tg.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tg = {
  ERAS: ['ПеМ', 'ПаМ'],
  ERANAMES: ['Пеш аз милод', 'ПаМ'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
  STANDALONEMONTHS: ['Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн', 'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр'],
  SHORTMONTHS: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  STANDALONESHORTMONTHS: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  WEEKDAYS: ['Якшанбе', 'Душанбе', 'Сешанбе', 'Чоршанбе', 'Панҷшанбе', 'Ҷумъа', 'Шанбе'],
  STANDALONEWEEKDAYS: ['Якшанбе', 'Душанбе', 'Сешанбе', 'Чоршанбе', 'Панҷшанбе', 'Ҷумъа', 'Шанбе'],
  SHORTWEEKDAYS: ['Яшб', 'Дшб', 'Сшб', 'Чшб', 'Пшб', 'Ҷмъ', 'Шнб'],
  STANDALONESHORTWEEKDAYS: ['Яшб', 'Дшб', 'Сшб', 'Чшб', 'Пшб', 'Ҷмъ', 'Шнб'],
  NARROWWEEKDAYS: ['Я', 'Д', 'С', 'Ч', 'П', 'Ҷ', 'Ш'],
  STANDALONENARROWWEEKDAYS: ['Я', 'Д', 'С', 'Ч', 'П', 'Ҷ', 'Ш'],
  SHORTQUARTERS: ['Ч1', 'Ч2', 'Ч3', 'Ч4'],
  QUARTERS: ['Ч1', 'Ч2', 'Ч3', 'Ч4'],
  AMPMS: ['пе. чо.', 'па. чо.'],
  DATEFORMATS: ['EEEE, dd MMMM y', 'dd MMMM y', 'dd MMM y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale tg_TJ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tg_TJ = goog.i18n.DateTimeSymbols_tg;


/**
 * Date/time formatting symbols for locale th_TH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_th_TH = goog.i18n.DateTimeSymbols_th;


/**
 * Date/time formatting symbols for locale ti.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ti = {
  ERAS: ['ዓ/ዓ', 'ዓ/ም'],
  ERANAMES: ['ዓ/ዓ', 'ዓመተ ምህረት'],
  NARROWMONTHS: ['ጥ', 'ለ', 'መ', 'ሚ', 'ግ', 'ሰ', 'ሓ', 'ነ', 'መ', 'ጥ', 'ሕ', 'ታ'],
  STANDALONENARROWMONTHS: ['ጥ', 'ለ', 'መ', 'ሚ', 'ግ', 'ሰ', 'ሓ', 'ነ', 'መ', 'ጥ', 'ሕ', 'ታ'],
  MONTHS: ['ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ'],
  STANDALONEMONTHS: ['ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ'],
  SHORTMONTHS: ['ጥሪ', 'ለካ', 'መጋ', 'ሚያ', 'ግን', 'ሰነ', 'ሓም', 'ነሓ', 'መስ', 'ጥቅ', 'ሕዳ', 'ታሕ'],
  STANDALONESHORTMONTHS: ['ጥሪ', 'ለካ', 'መጋ', 'ሚያ', 'ግን', 'ሰነ', 'ሓም', 'ነሓ', 'መስ', 'ጥቅ', 'ሕዳ', 'ታሕ'],
  WEEKDAYS: ['ሰንበት', 'ሰኑይ', 'ሠሉስ', 'ረቡዕ', 'ኃሙስ', 'ዓርቢ', 'ቀዳም'],
  STANDALONEWEEKDAYS: ['ሰንበት', 'ሰኑይ', 'ሠሉስ', 'ረቡዕ', 'ኃሙስ', 'ዓርቢ', 'ቀዳም'],
  SHORTWEEKDAYS: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
  STANDALONESHORTWEEKDAYS: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
  NARROWWEEKDAYS: ['ሰ', 'ሰ', 'ሰ', 'ረ', 'ሓ', 'ዓ', 'ቀ'],
  STANDALONENARROWWEEKDAYS: ['ሰ', 'ሰ', 'ሠ', 'ረ', 'ሓ', 'ዓ', 'ቀ'],
  SHORTQUARTERS: ['ር1', 'ር2', 'ር3', 'ር4'],
  QUARTERS: ['ቀዳማይ ርብዒ', 'ካልኣይ ርብዒ', 'ሳልሳይ ርብዒ', 'ራብዓይ ርብዒ'],
  AMPMS: ['ንጉሆ ሰዓተ', 'ድሕር ሰዓት'],
  DATEFORMATS: ['EEEE፣ dd MMMM መዓልቲ y G', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ti_ER.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ti_ER = {
  ERAS: ['ዓ/ዓ', 'ዓ/ም'],
  ERANAMES: ['ዓመተ ዓለም', 'ዓመተ ምህረት'],
  NARROWMONTHS: ['ጥ', 'ለ', 'መ', 'ሚ', 'ግ', 'ሰ', 'ሓ', 'ነ', 'መ', 'ጥ', 'ሕ', 'ታ'],
  STANDALONENARROWMONTHS: ['ጥ', 'ለ', 'መ', 'ሚ', 'ግ', 'ሰ', 'ሓ', 'ነ', 'መ', 'ጥ', 'ሕ', 'ታ'],
  MONTHS: ['ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ'],
  STANDALONEMONTHS: ['ጥሪ', 'ለካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰነ', 'ሓምለ', 'ነሓሰ', 'መስከረም', 'ጥቅምቲ', 'ሕዳር', 'ታሕሳስ'],
  SHORTMONTHS: ['ጥሪ', 'ለካ', 'መጋ', 'ሚያ', 'ግን', 'ሰነ', 'ሓም', 'ነሓ', 'መስ', 'ጥቅ', 'ሕዳ', 'ታሕ'],
  STANDALONESHORTMONTHS: ['ጥሪ', 'ለካ', 'መጋ', 'ሚያ', 'ግን', 'ሰነ', 'ሓም', 'ነሓ', 'መስ', 'ጥቅ', 'ሕዳ', 'ታሕ'],
  WEEKDAYS: ['ሰንበት', 'ሰኑይ', 'ሠሉስ', 'ረቡዕ', 'ኃሙስ', 'ዓርቢ', 'ቀዳም'],
  STANDALONEWEEKDAYS: ['ሰንበት', 'ሰኑይ', 'ሠሉስ', 'ረቡዕ', 'ኃሙስ', 'ዓርቢ', 'ቀዳም'],
  SHORTWEEKDAYS: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
  STANDALONESHORTWEEKDAYS: ['ሰን', 'ሰኑ', 'ሰሉ', 'ረቡ', 'ሓሙ', 'ዓር', 'ቀዳ'],
  NARROWWEEKDAYS: ['ሰ', 'ሰ', 'ሰ', 'ረ', 'ሓ', 'ዓ', 'ቀ'],
  STANDALONENARROWWEEKDAYS: ['ሰ', 'ሰ', 'ሰ', 'ረ', 'ሓ', 'ዓ', 'ቀ'],
  SHORTQUARTERS: ['ር1', 'ር2', 'ር3', 'ር4'],
  QUARTERS: ['ቀዳማይ ርብዒ', 'ካልኣይ ርብዒ', 'ሳልሳይ ርብዒ', 'ራብዓይ ርብዒ'],
  AMPMS: ['ንጉሆ ሰዓተ', 'ድሕር ሰዓት'],
  DATEFORMATS: ['EEEE፣ dd MMMM መዓልቲ y G', 'dd MMMM y', 'dd-MMM-y', 'dd/MM/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale ti_ET.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ti_ET = goog.i18n.DateTimeSymbols_ti;


/**
 * Date/time formatting symbols for locale tk.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tk = {
  ERAS: ['B.e.öň', 'B.e.'],
  ERANAMES: ['Isadan öň', 'Isadan soň'],
  NARROWMONTHS: ['Ý', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Ý', 'F', 'M', 'A', 'M', 'I', 'I', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['ýanwar', 'fewral', 'mart', 'aprel', 'maý', 'iýun', 'iýul', 'awgust', 'sentýabr', 'oktýabr', 'noýabr', 'dekabr'],
  STANDALONEMONTHS: ['Ýanwar', 'Fewral', 'Mart', 'Aprel', 'Maý', 'Iýun', 'Iýul', 'Awgust', 'Sentýabr', 'Oktýabr', 'Noýabr', 'Dekabr'],
  SHORTMONTHS: ['ýan', 'few', 'mart', 'apr', 'maý', 'iýun', 'iýul', 'awg', 'sen', 'okt', 'noý', 'dek'],
  STANDALONESHORTMONTHS: ['Ýan', 'Few', 'Mar', 'Apr', 'Maý', 'Iýun', 'Iýul', 'Awg', 'Sen', 'Okt', 'Noý', 'Dek'],
  WEEKDAYS: ['ýekşenbe', 'duşenbe', 'sişenbe', 'çarşenbe', 'penşenbe', 'anna', 'şenbe'],
  STANDALONEWEEKDAYS: ['Ýekşenbe', 'Duşenbe', 'Sişenbe', 'Çarşenbe', 'Penşenbe', 'Anna', 'Şenbe'],
  SHORTWEEKDAYS: ['ýek', 'duş', 'siş', 'çar', 'pen', 'ann', 'şen'],
  STANDALONESHORTWEEKDAYS: ['Ýek', 'Duş', 'Siş', 'Çar', 'Pen', 'Ann', 'Şen'],
  NARROWWEEKDAYS: ['Ý', 'D', 'S', 'Ç', 'P', 'A', 'Ş'],
  STANDALONENARROWWEEKDAYS: ['Ý', 'D', 'S', 'Ç', 'P', 'A', 'Ş'],
  SHORTQUARTERS: ['1Ç', '2Ç', '3Ç', '4Ç'],
  QUARTERS: ['1-nji çärýek', '2-nji çärýek', '3-nji çärýek', '4-nji çärýek'],
  AMPMS: ['günortadan öň', 'günortadan soň'],
  DATEFORMATS: ['d MMMM y EEEE', 'd MMMM y', 'd MMM y', 'dd.MM.y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale tk_TM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tk_TM = goog.i18n.DateTimeSymbols_tk;


/**
 * Date/time formatting symbols for locale to.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_to = {
  ERAS: ['KM', 'TS'],
  ERANAMES: ['ki muʻa', 'taʻu ʻo Sīsū'],
  NARROWMONTHS: ['S', 'F', 'M', 'E', 'M', 'S', 'S', 'A', 'S', 'O', 'N', 'T'],
  STANDALONENARROWMONTHS: ['S', 'F', 'M', 'E', 'M', 'S', 'S', 'A', 'S', 'O', 'N', 'T'],
  MONTHS: ['Sānuali', 'Fēpueli', 'Maʻasi', 'ʻEpeleli', 'Mē', 'Sune', 'Siulai', 'ʻAokosi', 'Sepitema', 'ʻOkatopa', 'Nōvema', 'Tīsema'],
  STANDALONEMONTHS: ['Sānuali', 'Fēpueli', 'Maʻasi', 'ʻEpeleli', 'Mē', 'Sune', 'Siulai', 'ʻAokosi', 'Sepitema', 'ʻOkatopa', 'Nōvema', 'Tīsema'],
  SHORTMONTHS: ['Sān', 'Fēp', 'Maʻa', 'ʻEpe', 'Mē', 'Sun', 'Siu', 'ʻAok', 'Sep', 'ʻOka', 'Nōv', 'Tīs'],
  STANDALONESHORTMONTHS: ['Sān', 'Fēp', 'Maʻa', 'ʻEpe', 'Mē', 'Sun', 'Siu', 'ʻAok', 'Sep', 'ʻOka', 'Nōv', 'Tīs'],
  WEEKDAYS: ['Sāpate', 'Mōnite', 'Tūsite', 'Pulelulu', 'Tuʻapulelulu', 'Falaite', 'Tokonaki'],
  STANDALONEWEEKDAYS: ['Sāpate', 'Mōnite', 'Tūsite', 'Pulelulu', 'Tuʻapulelulu', 'Falaite', 'Tokonaki'],
  SHORTWEEKDAYS: ['Sāp', 'Mōn', 'Tūs', 'Pul', 'Tuʻa', 'Fal', 'Tok'],
  STANDALONESHORTWEEKDAYS: ['Sāp', 'Mōn', 'Tūs', 'Pul', 'Tuʻa', 'Fal', 'Tok'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'P', 'T', 'F', 'T'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'P', 'T', 'F', 'T'],
  SHORTQUARTERS: ['K1', 'K2', 'K3', 'K4'],
  QUARTERS: ['kuata ʻuluaki', 'kuata ua', 'kuata tolu', 'kuata fā'],
  AMPMS: ['hengihengi', 'efiafi'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale to_TO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_to_TO = goog.i18n.DateTimeSymbols_to;


/**
 * Date/time formatting symbols for locale tr_CY.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tr_CY = {
  ERAS: ['MÖ', 'MS'],
  ERANAMES: ['Milattan Önce', 'Milattan Sonra'],
  NARROWMONTHS: ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'],
  STANDALONENARROWMONTHS: ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'],
  MONTHS: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  STANDALONEMONTHS: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  SHORTMONTHS: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  STANDALONESHORTMONTHS: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  WEEKDAYS: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  STANDALONEWEEKDAYS: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  SHORTWEEKDAYS: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  STANDALONESHORTWEEKDAYS: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  NARROWWEEKDAYS: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
  STANDALONENARROWWEEKDAYS: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
  SHORTQUARTERS: ['Ç1', 'Ç2', 'Ç3', 'Ç4'],
  QUARTERS: ['1. çeyrek', '2. çeyrek', '3. çeyrek', '4. çeyrek'],
  AMPMS: ['ÖÖ', 'ÖS'],
  DATEFORMATS: ['d MMMM y EEEE', 'd MMMM y', 'd MMM y', 'd.MM.y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale tr_TR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tr_TR = goog.i18n.DateTimeSymbols_tr;


/**
 * Date/time formatting symbols for locale tt.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tt = {
  ERAS: ['б.э.к.', 'б.э.'],
  ERANAMES: ['безнең эрага кадәр', 'безнең эра'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['гыйнвар', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  STANDALONEMONTHS: ['гыйнвар', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  SHORTMONTHS: ['гыйн.', 'фев.', 'мар.', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  STANDALONESHORTMONTHS: ['гыйн.', 'фев.', 'мар.', 'апр.', 'май', 'июнь', 'июль', 'авг.', 'сент.', 'окт.', 'нояб.', 'дек.'],
  WEEKDAYS: ['якшәмбе', 'дүшәмбе', 'сишәмбе', 'чәршәмбе', 'пәнҗешәмбе', 'җомга', 'шимбә'],
  STANDALONEWEEKDAYS: ['якшәмбе', 'дүшәмбе', 'сишәмбе', 'чәршәмбе', 'пәнҗешәмбе', 'җомга', 'шимбә'],
  SHORTWEEKDAYS: ['якш.', 'дүш.', 'сиш.', 'чәр.', 'пәнҗ.', 'җом.', 'шим.'],
  STANDALONESHORTWEEKDAYS: ['якш.', 'дүш.', 'сиш.', 'чәр.', 'пәнҗ.', 'җом.', 'шим.'],
  NARROWWEEKDAYS: ['Я', 'Д', 'С', 'Ч', 'П', 'Җ', 'Ш'],
  STANDALONENARROWWEEKDAYS: ['Я', 'Д', 'С', 'Ч', 'П', 'Җ', 'Ш'],
  SHORTQUARTERS: ['1 нче кв.', '2 нче кв.', '3 нче кв.', '4 нче кв.'],
  QUARTERS: ['1 нче квартал', '2 нче квартал', '3 нче квартал', '4 нче квартал'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['d MMMM, y \'ел\', EEEE', 'd MMMM, y \'ел\'', 'd MMM, y \'ел\'', 'dd.MM.y'],
  TIMEFORMATS: ['H:mm:ss zzzz', 'H:mm:ss z', 'H:mm:ss', 'H:mm'],
  DATETIMEFORMATS: ['{1}, {0}', '{1}, {0}', '{1}, {0}', '{1}, {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale tt_RU.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tt_RU = goog.i18n.DateTimeSymbols_tt;


/**
 * Date/time formatting symbols for locale twq.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_twq = {
  ERAS: ['IJ', 'IZ'],
  ERANAMES: ['Isaa jine', 'Isaa zamanoo'],
  NARROWMONTHS: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Ž', 'F', 'M', 'A', 'M', 'Ž', 'Ž', 'U', 'S', 'O', 'N', 'D'],
  MONTHS: ['Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur', 'Oktoobur', 'Noowanbur', 'Deesanbur'],
  STANDALONEMONTHS: ['Žanwiye', 'Feewiriye', 'Marsi', 'Awiril', 'Me', 'Žuweŋ', 'Žuyye', 'Ut', 'Sektanbur', 'Oktoobur', 'Noowanbur', 'Deesanbur'],
  SHORTMONTHS: ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
  STANDALONESHORTMONTHS: ['Žan', 'Fee', 'Mar', 'Awi', 'Me', 'Žuw', 'Žuy', 'Ut', 'Sek', 'Okt', 'Noo', 'Dee'],
  WEEKDAYS: ['Alhadi', 'Atinni', 'Atalaata', 'Alarba', 'Alhamiisa', 'Alzuma', 'Asibti'],
  STANDALONEWEEKDAYS: ['Alhadi', 'Atinni', 'Atalaata', 'Alarba', 'Alhamiisa', 'Alzuma', 'Asibti'],
  SHORTWEEKDAYS: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
  STANDALONESHORTWEEKDAYS: ['Alh', 'Ati', 'Ata', 'Ala', 'Alm', 'Alz', 'Asi'],
  NARROWWEEKDAYS: ['H', 'T', 'T', 'L', 'L', 'L', 'S'],
  STANDALONENARROWWEEKDAYS: ['H', 'T', 'T', 'L', 'L', 'L', 'S'],
  SHORTQUARTERS: ['A1', 'A2', 'A3', 'A4'],
  QUARTERS: ['Arrubu 1', 'Arrubu 2', 'Arrubu 3', 'Arrubu 4'],
  AMPMS: ['Subbaahi', 'Zaarikay b'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale twq_NE.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_twq_NE = goog.i18n.DateTimeSymbols_twq;


/**
 * Date/time formatting symbols for locale tzm.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tzm = {
  ERAS: ['ZƐ', 'ḌƐ'],
  ERANAMES: ['Zdat Ɛisa (TAƔ)', 'Ḍeffir Ɛisa (TAƔ)'],
  NARROWMONTHS: ['Y', 'Y', 'M', 'I', 'M', 'Y', 'Y', 'Ɣ', 'C', 'K', 'N', 'D'],
  STANDALONENARROWMONTHS: ['Y', 'Y', 'M', 'I', 'M', 'Y', 'Y', 'Ɣ', 'C', 'K', 'N', 'D'],
  MONTHS: ['Yennayer', 'Yebrayer', 'Mars', 'Ibrir', 'Mayyu', 'Yunyu', 'Yulyuz', 'Ɣuct', 'Cutanbir', 'Kṭuber', 'Nwanbir', 'Dujanbir'],
  STANDALONEMONTHS: ['Yennayer', 'Yebrayer', 'Mars', 'Ibrir', 'Mayyu', 'Yunyu', 'Yulyuz', 'Ɣuct', 'Cutanbir', 'Kṭuber', 'Nwanbir', 'Dujanbir'],
  SHORTMONTHS: ['Yen', 'Yeb', 'Mar', 'Ibr', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cut', 'Kṭu', 'Nwa', 'Duj'],
  STANDALONESHORTMONTHS: ['Yen', 'Yeb', 'Mar', 'Ibr', 'May', 'Yun', 'Yul', 'Ɣuc', 'Cut', 'Kṭu', 'Nwa', 'Duj'],
  WEEKDAYS: ['Asamas', 'Aynas', 'Asinas', 'Akras', 'Akwas', 'Asimwas', 'Asiḍyas'],
  STANDALONEWEEKDAYS: ['Asamas', 'Aynas', 'Asinas', 'Akras', 'Akwas', 'Asimwas', 'Asiḍyas'],
  SHORTWEEKDAYS: ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ'],
  STANDALONESHORTWEEKDAYS: ['Asa', 'Ayn', 'Asn', 'Akr', 'Akw', 'Asm', 'Asḍ'],
  NARROWWEEKDAYS: ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
  STANDALONENARROWWEEKDAYS: ['A', 'A', 'A', 'A', 'A', 'A', 'A'],
  SHORTQUARTERS: ['IA1', 'IA2', 'IA3', 'IA4'],
  QUARTERS: ['Imir adamsan 1', 'Imir adamsan 2', 'Imir adamsan 3', 'Imir adamsan 4'],
  AMPMS: ['Zdat azal', 'Ḍeffir aza'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale tzm_MA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_tzm_MA = goog.i18n.DateTimeSymbols_tzm;


/**
 * Date/time formatting symbols for locale ug.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ug = {
  ERAS: ['BCE', 'مىلادىيە'],
  ERANAMES: ['مىلادىيەدىن بۇرۇن', 'مىلادىيە'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر', 'ئۆكتەبىر', 'نويابىر', 'دېكابىر'],
  STANDALONEMONTHS: ['يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر', 'ئۆكتەبىر', 'نويابىر', 'دېكابىر'],
  SHORTMONTHS: ['يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر', 'ئۆكتەبىر', 'نويابىر', 'دېكابىر'],
  STANDALONESHORTMONTHS: ['يانۋار', 'فېۋرال', 'مارت', 'ئاپرېل', 'ماي', 'ئىيۇن', 'ئىيۇل', 'ئاۋغۇست', 'سېنتەبىر', 'ئۆكتەبىر', 'نويابىر', 'دېكابىر'],
  WEEKDAYS: ['يەكشەنبە', 'دۈشەنبە', 'سەيشەنبە', 'چارشەنبە', 'پەيشەنبە', 'جۈمە', 'شەنبە'],
  STANDALONEWEEKDAYS: ['يەكشەنبە', 'دۈشەنبە', 'سەيشەنبە', 'چارشەنبە', 'پەيشەنبە', 'جۈمە', 'شەنبە'],
  SHORTWEEKDAYS: ['يە', 'دۈ', 'سە', 'چا', 'پە', 'جۈ', 'شە'],
  STANDALONESHORTWEEKDAYS: ['يە', 'دۈ', 'سە', 'چا', 'پە', 'جۈ', 'شە'],
  NARROWWEEKDAYS: ['ي', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
  STANDALONENARROWWEEKDAYS: ['ي', 'د', 'س', 'چ', 'پ', 'ج', 'ش'],
  SHORTQUARTERS: ['1-پەسىل', '2-پەسىل', '3-پەسىل', '4-پەسىل'],
  QUARTERS: ['بىرىنچى پەسىل', 'ئىككىنچى پەسىل', 'ئۈچىنچى پەسىل', 'تۆتىنچى پەسىل'],
  AMPMS: ['چۈشتىن بۇرۇن', 'چۈشتىن كېيىن'],
  DATEFORMATS: ['y d-MMMM، EEEE', 'd-MMMM، y', 'd-MMM، y', 'y-MM-dd'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1}، {0}', '{1}، {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ug_CN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ug_CN = goog.i18n.DateTimeSymbols_ug;


/**
 * Date/time formatting symbols for locale uk_UA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_uk_UA = goog.i18n.DateTimeSymbols_uk;


/**
 * Date/time formatting symbols for locale ur_IN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ur_IN = {
  ZERODIGIT: 0x06F0,
  ERAS: ['قبل مسیح', 'عیسوی'],
  ERANAMES: ['قبل مسیح', 'عیسوی'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONESHORTMONTHS: ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  WEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  STANDALONEWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  SHORTWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  STANDALONESHORTWEEKDAYS: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['پہلی سہ ماہی', 'دوسری سہ ماہی', 'تیسری سہ ماہی', 'چوتهی سہ ماہی'],
  QUARTERS: ['پہلی سہ ماہی', 'دوسری سہ ماہی', 'تیسری سہ ماہی', 'چوتهی سہ ماہی'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE، d MMMM، y', 'd MMMM، y', 'd MMM، y', 'd/M/yy'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [6, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale ur_PK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_ur_PK = goog.i18n.DateTimeSymbols_ur;


/**
 * Date/time formatting symbols for locale uz_Arab.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_uz_Arab = {
  ZERODIGIT: 0x06F0,
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنو', 'فبر', 'مار', 'اپر', 'می', 'جون', 'جول', 'اگس', 'سپت', 'اکت', 'نوم', 'دسم'],
  STANDALONESHORTMONTHS: ['جنو', 'فبر', 'مار', 'اپر', 'می', 'جون', 'جول', 'اگس', 'سپت', 'اکت', 'نوم', 'دسم'],
  WEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  STANDALONEWEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  SHORTWEEKDAYS: ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
  STANDALONESHORTWEEKDAYS: ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [3, 4],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale uz_Arab_AF.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_uz_Arab_AF = {
  ZERODIGIT: 0x06F0,
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  STANDALONEMONTHS: ['جنوری', 'فبروری', 'مارچ', 'اپریل', 'می', 'جون', 'جولای', 'اگست', 'سپتمبر', 'اکتوبر', 'نومبر', 'دسمبر'],
  SHORTMONTHS: ['جنو', 'فبر', 'مار', 'اپر', 'می', 'جون', 'جول', 'اگس', 'سپت', 'اکت', 'نوم', 'دسم'],
  STANDALONESHORTMONTHS: ['جنو', 'فبر', 'مار', 'اپر', 'می', 'جون', 'جول', 'اگس', 'سپت', 'اکت', 'نوم', 'دسم'],
  WEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  STANDALONEWEEKDAYS: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
  SHORTWEEKDAYS: ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
  STANDALONESHORTWEEKDAYS: ['ی.', 'د.', 'س.', 'چ.', 'پ.', 'ج.', 'ش.'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 5,
  WEEKENDRANGE: [3, 4],
  FIRSTWEEKCUTOFFDAY: 4
};


/**
 * Date/time formatting symbols for locale uz_Cyrl.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_uz_Cyrl = {
  ERAS: ['м.а.', 'милодий'],
  ERANAMES: ['милоддан аввалги', 'милодий'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'],
  STANDALONEMONTHS: ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'],
  SHORTMONTHS: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  STANDALONESHORTMONTHS: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  WEEKDAYS: ['якшанба', 'душанба', 'сешанба', 'чоршанба', 'пайшанба', 'жума', 'шанба'],
  STANDALONEWEEKDAYS: ['якшанба', 'душанба', 'сешанба', 'чоршанба', 'пайшанба', 'жума', 'шанба'],
  SHORTWEEKDAYS: ['якш', 'душ', 'сеш', 'чор', 'пай', 'жум', 'шан'],
  STANDALONESHORTWEEKDAYS: ['якш', 'душ', 'сеш', 'чор', 'пай', 'жум', 'шан'],
  NARROWWEEKDAYS: ['Я', 'Д', 'С', 'Ч', 'П', 'Ж', 'Ш'],
  STANDALONENARROWWEEKDAYS: ['Я', 'Д', 'С', 'Ч', 'П', 'Ж', 'Ш'],
  SHORTQUARTERS: ['1-ч', '2-ч', '3-ч', '4-ч'],
  QUARTERS: ['1-чорак', '2-чорак', '3-чорак', '4-чорак'],
  AMPMS: ['ТО', 'ТК'],
  DATEFORMATS: ['EEEE, dd MMMM, y', 'd MMMM, y', 'd MMM, y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss (zzzz)', 'HH:mm:ss (z)', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale uz_Cyrl_UZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_uz_Cyrl_UZ = {
  ERAS: ['м.а.', 'милодий'],
  ERANAMES: ['милоддан аввалги', 'милодий'],
  NARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  STANDALONENARROWMONTHS: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'],
  MONTHS: ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'],
  STANDALONEMONTHS: ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'],
  SHORTMONTHS: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  STANDALONESHORTMONTHS: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  WEEKDAYS: ['якшанба', 'душанба', 'сешанба', 'чоршанба', 'пайшанба', 'жума', 'шанба'],
  STANDALONEWEEKDAYS: ['якшанба', 'душанба', 'сешанба', 'чоршанба', 'пайшанба', 'жума', 'шанба'],
  SHORTWEEKDAYS: ['якш', 'душ', 'сеш', 'чор', 'пай', 'жум', 'шан'],
  STANDALONESHORTWEEKDAYS: ['якш', 'душ', 'сеш', 'чор', 'пай', 'жум', 'шан'],
  NARROWWEEKDAYS: ['Я', 'Д', 'С', 'Ч', 'П', 'Ж', 'Ш'],
  STANDALONENARROWWEEKDAYS: ['Я', 'Д', 'С', 'Ч', 'П', 'Ж', 'Ш'],
  SHORTQUARTERS: ['1-ч', '2-ч', '3-ч', '4-ч'],
  QUARTERS: ['1-чорак', '2-чорак', '3-чорак', '4-чорак'],
  AMPMS: ['ТО', 'ТК'],
  DATEFORMATS: ['EEEE, dd MMMM, y', 'd MMMM, y', 'd MMM, y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss (zzzz)', 'HH:mm:ss (z)', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale uz_Latn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_uz_Latn = goog.i18n.DateTimeSymbols_uz;


/**
 * Date/time formatting symbols for locale uz_Latn_UZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_uz_Latn_UZ = goog.i18n.DateTimeSymbols_uz;


/**
 * Date/time formatting symbols for locale vai.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_vai = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['ꖨꖕ ꕪꕴ ꔞꔀꕮꕊ', 'ꕒꕡꖝꖕ', 'ꕾꖺ', 'ꖢꖕ', 'ꖑꕱ', 'ꖱꘋ', 'ꖱꕞꔤ', 'ꗛꔕ', 'ꕢꕌ', 'ꕭꖃ', 'ꔞꘋꕔꕿ ꕸꖃꗏ', 'ꖨꖕ ꕪꕴ ꗏꖺꕮꕊ'],
  STANDALONEMONTHS: ['ꖨꖕ ꕪꕴ ꔞꔀꕮꕊ', 'ꕒꕡꖝꖕ', 'ꕾꖺ', 'ꖢꖕ', 'ꖑꕱ', 'ꖱꘋ', 'ꖱꕞꔤ', 'ꗛꔕ', 'ꕢꕌ', 'ꕭꖃ', 'ꔞꘋꕔꕿ ꕸꖃꗏ', 'ꖨꖕ ꕪꕴ ꗏꖺꕮꕊ'],
  SHORTMONTHS: ['ꖨꖕꔞ', 'ꕒꕡ', 'ꕾꖺ', 'ꖢꖕ', 'ꖑꕱ', 'ꖱꘋ', 'ꖱꕞ', 'ꗛꔕ', 'ꕢꕌ', 'ꕭꖃ', 'ꔞꘋ', 'ꖨꖕꗏ'],
  STANDALONESHORTMONTHS: ['ꖨꖕꔞ', 'ꕒꕡ', 'ꕾꖺ', 'ꖢꖕ', 'ꖑꕱ', 'ꖱꘋ', 'ꖱꕞ', 'ꗛꔕ', 'ꕢꕌ', 'ꕭꖃ', 'ꔞꘋ', 'ꖨꖕꗏ'],
  WEEKDAYS: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ'],
  STANDALONEWEEKDAYS: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ'],
  SHORTWEEKDAYS: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ'],
  STANDALONESHORTWEEKDAYS: ['ꕞꕌꔵ', 'ꗳꗡꘉ', 'ꕚꕞꕚ', 'ꕉꕞꕒ', 'ꕉꔤꕆꕢ', 'ꕉꔤꕀꕮ', 'ꔻꔬꔳ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale vai_Latn.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_vai_Latn = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['luukao kemã', 'ɓandaɓu', 'vɔɔ', 'fulu', 'goo', '6', '7', 'kɔnde', 'saah', 'galo', 'kenpkato ɓololɔ', 'luukao lɔma'],
  STANDALONEMONTHS: ['luukao kemã', 'ɓandaɓu', 'vɔɔ', 'fulu', 'goo', '6', '7', 'kɔnde', 'saah', 'galo', 'kenpkato ɓololɔ', 'luukao lɔma'],
  SHORTMONTHS: ['luukao kemã', 'ɓandaɓu', 'vɔɔ', 'fulu', 'goo', '6', '7', 'kɔnde', 'saah', 'galo', 'kenpkato ɓololɔ', 'luukao lɔma'],
  STANDALONESHORTMONTHS: ['luukao kemã', 'ɓandaɓu', 'vɔɔ', 'fulu', 'goo', '6', '7', 'kɔnde', 'saah', 'galo', 'kenpkato ɓololɔ', 'luukao lɔma'],
  WEEKDAYS: ['lahadi', 'tɛɛnɛɛ', 'talata', 'alaba', 'aimisa', 'aijima', 'siɓiti'],
  STANDALONEWEEKDAYS: ['lahadi', 'tɛɛnɛɛ', 'talata', 'alaba', 'aimisa', 'aijima', 'siɓiti'],
  SHORTWEEKDAYS: ['lahadi', 'tɛɛnɛɛ', 'talata', 'alaba', 'aimisa', 'aijima', 'siɓiti'],
  STANDALONESHORTWEEKDAYS: ['lahadi', 'tɛɛnɛɛ', 'talata', 'alaba', 'aimisa', 'aijima', 'siɓiti'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale vai_Latn_LR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_vai_Latn_LR = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['luukao kemã', 'ɓandaɓu', 'vɔɔ', 'fulu', 'goo', '6', '7', 'kɔnde', 'saah', 'galo', 'kenpkato ɓololɔ', 'luukao lɔma'],
  STANDALONEMONTHS: ['luukao kemã', 'ɓandaɓu', 'vɔɔ', 'fulu', 'goo', '6', '7', 'kɔnde', 'saah', 'galo', 'kenpkato ɓololɔ', 'luukao lɔma'],
  SHORTMONTHS: ['luukao kemã', 'ɓandaɓu', 'vɔɔ', 'fulu', 'goo', '6', '7', 'kɔnde', 'saah', 'galo', 'kenpkato ɓololɔ', 'luukao lɔma'],
  STANDALONESHORTMONTHS: ['luukao kemã', 'ɓandaɓu', 'vɔɔ', 'fulu', 'goo', '6', '7', 'kɔnde', 'saah', 'galo', 'kenpkato ɓololɔ', 'luukao lɔma'],
  WEEKDAYS: ['lahadi', 'tɛɛnɛɛ', 'talata', 'alaba', 'aimisa', 'aijima', 'siɓiti'],
  STANDALONEWEEKDAYS: ['lahadi', 'tɛɛnɛɛ', 'talata', 'alaba', 'aimisa', 'aijima', 'siɓiti'],
  SHORTWEEKDAYS: ['lahadi', 'tɛɛnɛɛ', 'talata', 'alaba', 'aimisa', 'aijima', 'siɓiti'],
  STANDALONESHORTWEEKDAYS: ['lahadi', 'tɛɛnɛɛ', 'talata', 'alaba', 'aimisa', 'aijima', 'siɓiti'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale vai_Vaii.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_vai_Vaii = goog.i18n.DateTimeSymbols_vai;


/**
 * Date/time formatting symbols for locale vai_Vaii_LR.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_vai_Vaii_LR = goog.i18n.DateTimeSymbols_vai;


/**
 * Date/time formatting symbols for locale vi_VN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_vi_VN = goog.i18n.DateTimeSymbols_vi;


/**
 * Date/time formatting symbols for locale vun.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_vun = {
  ERAS: ['KK', 'BK'],
  ERANAMES: ['Kabla ya Kristu', 'Baada ya Kristu'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Januari', 'Februari', 'Machi', 'Aprilyi', 'Mei', 'Junyi', 'Julyai', 'Agusti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Januari', 'Februari', 'Machi', 'Aprilyi', 'Mei', 'Junyi', 'Julyai', 'Agusti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'],
  WEEKDAYS: ['Jumapilyi', 'Jumatatuu', 'Jumanne', 'Jumatanu', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  STANDALONEWEEKDAYS: ['Jumapilyi', 'Jumatatuu', 'Jumanne', 'Jumatanu', 'Alhamisi', 'Ijumaa', 'Jumamosi'],
  SHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  STANDALONESHORTWEEKDAYS: ['Jpi', 'Jtt', 'Jnn', 'Jtn', 'Alh', 'Iju', 'Jmo'],
  NARROWWEEKDAYS: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
  STANDALONENARROWWEEKDAYS: ['J', 'J', 'J', 'J', 'A', 'I', 'J'],
  SHORTQUARTERS: ['R1', 'R2', 'R3', 'R4'],
  QUARTERS: ['Robo 1', 'Robo 2', 'Robo 3', 'Robo 4'],
  AMPMS: ['utuko', 'kyiukonyi'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale vun_TZ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_vun_TZ = goog.i18n.DateTimeSymbols_vun;


/**
 * Date/time formatting symbols for locale wae.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_wae = {
  ERAS: ['v. Chr.', 'n. Chr'],
  ERANAMES: ['v. Chr.', 'n. Chr'],
  NARROWMONTHS: ['J', 'H', 'M', 'A', 'M', 'B', 'H', 'Ö', 'H', 'W', 'W', 'C'],
  STANDALONENARROWMONTHS: ['J', 'H', 'M', 'A', 'M', 'B', 'H', 'Ö', 'H', 'W', 'W', 'C'],
  MONTHS: ['Jenner', 'Hornig', 'Märze', 'Abrille', 'Meije', 'Bráčet', 'Heiwet', 'Öigšte', 'Herbštmánet', 'Wímánet', 'Wintermánet', 'Chrištmánet'],
  STANDALONEMONTHS: ['Jenner', 'Hornig', 'Märze', 'Abrille', 'Meije', 'Bráčet', 'Heiwet', 'Öigšte', 'Herbštmánet', 'Wímánet', 'Wintermánet', 'Chrištmánet'],
  SHORTMONTHS: ['Jen', 'Hor', 'Mär', 'Abr', 'Mei', 'Brá', 'Hei', 'Öig', 'Her', 'Wím', 'Win', 'Chr'],
  STANDALONESHORTMONTHS: ['Jen', 'Hor', 'Mär', 'Abr', 'Mei', 'Brá', 'Hei', 'Öig', 'Her', 'Wím', 'Win', 'Chr'],
  WEEKDAYS: ['Sunntag', 'Mäntag', 'Zištag', 'Mittwuč', 'Fróntag', 'Fritag', 'Samštag'],
  STANDALONEWEEKDAYS: ['Sunntag', 'Mäntag', 'Zištag', 'Mittwuč', 'Fróntag', 'Fritag', 'Samštag'],
  SHORTWEEKDAYS: ['Sun', 'Män', 'Ziš', 'Mit', 'Fró', 'Fri', 'Sam'],
  STANDALONESHORTWEEKDAYS: ['Sun', 'Män', 'Ziš', 'Mit', 'Fró', 'Fri', 'Sam'],
  NARROWWEEKDAYS: ['S', 'M', 'Z', 'M', 'F', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'Z', 'M', 'F', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1. quartal', '2. quartal', '3. quartal', '4. quartal'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['EEEE, d. MMMM y', 'd. MMMM y', 'd. MMM y', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 3
};


/**
 * Date/time formatting symbols for locale wae_CH.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_wae_CH = goog.i18n.DateTimeSymbols_wae;


/**
 * Date/time formatting symbols for locale wo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_wo = {
  ERAS: ['JC', 'AD'],
  ERANAMES: ['av. JC', 'AD'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Samwiyee', 'Fewriyee', 'Mars', 'Awril', 'Mee', 'Suwe', 'Sulet', 'Ut', 'Sàttumbar', 'Oktoobar', 'Nowàmbar', 'Desàmbar'],
  STANDALONEMONTHS: ['Samwiyee', 'Fewriyee', 'Mars', 'Awril', 'Mee', 'Suwe', 'Sulet', 'Ut', 'Sàttumbar', 'Oktoobar', 'Nowàmbar', 'Desàmbar'],
  SHORTMONTHS: ['Sam', 'Few', 'Mar', 'Awr', 'Mee', 'Suw', 'Sul', 'Ut', 'Sàt', 'Okt', 'Now', 'Des'],
  STANDALONESHORTMONTHS: ['Sam', 'Few', 'Mar', 'Awr', 'Mee', 'Suw', 'Sul', 'Ut', 'Sàt', 'Okt', 'Now', 'Des'],
  WEEKDAYS: ['Dibéer', 'Altine', 'Talaata', 'Àlarba', 'Alxamis', 'Àjjuma', 'Aseer'],
  STANDALONEWEEKDAYS: ['Dibéer', 'Altine', 'Talaata', 'Àlarba', 'Alxamis', 'Àjjuma', 'Aseer'],
  SHORTWEEKDAYS: ['Dib', 'Alt', 'Tal', 'Àla', 'Alx', 'Àjj', 'Ase'],
  STANDALONESHORTWEEKDAYS: ['Dib', 'Alt', 'Tal', 'Àla', 'Alx', 'Àjj', 'Ase'],
  NARROWWEEKDAYS: ['Dib', 'Alt', 'Tal', 'Àla', 'Alx', 'Àjj', 'Ase'],
  STANDALONENARROWWEEKDAYS: ['Dib', 'Alt', 'Tal', 'Àla', 'Alx', 'Àjj', 'Ase'],
  SHORTQUARTERS: ['1er Tri', '2e Tri', '3e Tri', '4e Tri'],
  QUARTERS: ['1er Trimestar', '2e Trimestar', '3e Trimestar', '4e Trimestar'],
  AMPMS: ['Sub', 'Ngo'],
  DATEFORMATS: ['EEEE, d MMM, y', 'd MMMM, y', 'd MMM, y', 'dd-MM-y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} \'ci\' {0}', '{1} \'ci\' {0}', '{1} - {0}', '{1} - {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale wo_SN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_wo_SN = goog.i18n.DateTimeSymbols_wo;


/**
 * Date/time formatting symbols for locale xh.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_xh = {
  ERAS: ['BC', 'AD'],
  ERANAMES: ['BC', 'AD'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['Janyuwari', 'Februwari', 'Matshi', 'Epreli', 'Meyi', 'Juni', 'Julayi', 'Agasti', 'Septemba', 'Okthoba', 'Novemba', 'Disemba'],
  STANDALONEMONTHS: ['Janyuwari', 'Februwari', 'Matshi', 'Epreli', 'Meyi', 'Juni', 'Julayi', 'Agasti', 'Septemba', 'Okthoba', 'Novemba', 'Disemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mat', 'Epr', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mat', 'Epr', 'Mey', 'Jun', 'Jul', 'Aga', 'Sep', 'Okt', 'Nov', 'Dis'],
  WEEKDAYS: ['Cawe', 'Mvulo', 'Lwesibini', 'Lwesithathu', 'Lwesine', 'Lwesihlanu', 'Mgqibelo'],
  STANDALONEWEEKDAYS: ['Cawe', 'Mvulo', 'Lwesibini', 'Lwesithathu', 'Lwesine', 'Lwesihlanu', 'Mgqibelo'],
  SHORTWEEKDAYS: ['Caw', 'Mvu', 'Bin', 'Tha', 'Sin', 'Hla', 'Mgq'],
  STANDALONESHORTWEEKDAYS: ['Caw', 'Mvu', 'Bin', 'Tha', 'Sin', 'Hla', 'Mgq'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['1 unyangantathu', '2 unyangantathu', '3 unyangantathu', '4 unyangantathu'],
  AMPMS: ['AM', 'PM'],
  DATEFORMATS: ['y MMMM d, EEEE', 'y MMMM d', 'y MMM d', 'y-MM-dd'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale xh_ZA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_xh_ZA = goog.i18n.DateTimeSymbols_xh;


/**
 * Date/time formatting symbols for locale xog.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_xog = {
  ERAS: ['AZ', 'AF'],
  ERANAMES: ['Kulisto nga azilawo', 'Kulisto nga affile'],
  NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
  MONTHS: ['Janwaliyo', 'Febwaliyo', 'Marisi', 'Apuli', 'Maayi', 'Juuni', 'Julaayi', 'Agusito', 'Sebuttemba', 'Okitobba', 'Novemba', 'Desemba'],
  STANDALONEMONTHS: ['Janwaliyo', 'Febwaliyo', 'Marisi', 'Apuli', 'Maayi', 'Juuni', 'Julaayi', 'Agusito', 'Sebuttemba', 'Okitobba', 'Novemba', 'Desemba'],
  SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apu', 'Maa', 'Juu', 'Jul', 'Agu', 'Seb', 'Oki', 'Nov', 'Des'],
  STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apu', 'Maa', 'Juu', 'Jul', 'Agu', 'Seb', 'Oki', 'Nov', 'Des'],
  WEEKDAYS: ['Sabiiti', 'Balaza', 'Owokubili', 'Owokusatu', 'Olokuna', 'Olokutaanu', 'Olomukaaga'],
  STANDALONEWEEKDAYS: ['Sabiiti', 'Balaza', 'Owokubili', 'Owokusatu', 'Olokuna', 'Olokutaanu', 'Olomukaaga'],
  SHORTWEEKDAYS: ['Sabi', 'Bala', 'Kubi', 'Kusa', 'Kuna', 'Kuta', 'Muka'],
  STANDALONESHORTWEEKDAYS: ['Sabi', 'Bala', 'Kubi', 'Kusa', 'Kuna', 'Kuta', 'Muka'],
  NARROWWEEKDAYS: ['S', 'B', 'B', 'S', 'K', 'K', 'M'],
  STANDALONENARROWWEEKDAYS: ['S', 'B', 'B', 'S', 'K', 'K', 'M'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Ebisera ebyomwaka ebisoka', 'Ebisera ebyomwaka ebyokubiri', 'Ebisera ebyomwaka ebyokusatu', 'Ebisera ebyomwaka ebyokuna'],
  AMPMS: ['Munkyo', 'Eigulo'],
  DATEFORMATS: ['EEEE, d MMMM y', 'd MMMM y', 'd MMM y', 'dd/MM/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale xog_UG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_xog_UG = goog.i18n.DateTimeSymbols_xog;


/**
 * Date/time formatting symbols for locale yav.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yav = {
  ERAS: ['k.Y.', '+J.C.'],
  ERANAMES: ['katikupíen Yésuse', 'ékélémkúnupíén n'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['pikítíkítie, oólí ú kutúan', 'siɛyɛ́, oóli ú kándíɛ', 'ɔnsúmbɔl, oóli ú kátátúɛ', 'mesiŋ, oóli ú kénie', 'ensil, oóli ú kátánuɛ', 'ɔsɔn', 'efute', 'pisuyú', 'imɛŋ i puɔs', 'imɛŋ i putúk,oóli ú kátíɛ', 'makandikɛ', 'pilɔndɔ́'],
  STANDALONEMONTHS: ['pikítíkítie, oólí ú kutúan', 'siɛyɛ́, oóli ú kándíɛ', 'ɔnsúmbɔl, oóli ú kátátúɛ', 'mesiŋ, oóli ú kénie', 'ensil, oóli ú kátánuɛ', 'ɔsɔn', 'efute', 'pisuyú', 'imɛŋ i puɔs', 'imɛŋ i putúk,oóli ú kátíɛ', 'makandikɛ', 'pilɔndɔ́'],
  SHORTMONTHS: ['o.1', 'o.2', 'o.3', 'o.4', 'o.5', 'o.6', 'o.7', 'o.8', 'o.9', 'o.10', 'o.11', 'o.12'],
  STANDALONESHORTMONTHS: ['o.1', 'o.2', 'o.3', 'o.4', 'o.5', 'o.6', 'o.7', 'o.8', 'o.9', 'o.10', 'o.11', 'o.12'],
  WEEKDAYS: ['sɔ́ndiɛ', 'móndie', 'muányáŋmóndie', 'metúkpíápɛ', 'kúpélimetúkpiapɛ', 'feléte', 'séselé'],
  STANDALONEWEEKDAYS: ['sɔ́ndiɛ', 'móndie', 'muányáŋmóndie', 'metúkpíápɛ', 'kúpélimetúkpiapɛ', 'feléte', 'séselé'],
  SHORTWEEKDAYS: ['sd', 'md', 'mw', 'et', 'kl', 'fl', 'ss'],
  STANDALONESHORTWEEKDAYS: ['sd', 'md', 'mw', 'et', 'kl', 'fl', 'ss'],
  NARROWWEEKDAYS: ['s', 'm', 'm', 'e', 'k', 'f', 's'],
  STANDALONENARROWWEEKDAYS: ['s', 'm', 'm', 'e', 'k', 'f', 's'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['ndátúɛ 1', 'ndátúɛ 2', 'ndátúɛ 3', 'ndátúɛ 4'],
  AMPMS: ['kiɛmɛ́ɛm', 'kisɛ́ndɛ'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale yav_CM.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yav_CM = goog.i18n.DateTimeSymbols_yav;


/**
 * Date/time formatting symbols for locale yi.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yi = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['BCE', 'CE'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני', 'יולי', 'אויגוסט', 'סעפּטעמבער', 'אקטאבער', 'נאוועמבער', 'דעצעמבער'],
  STANDALONEMONTHS: ['יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני', 'יולי', 'אויגוסט', 'סעפּטעמבער', 'אקטאבער', 'נאוועמבער', 'דעצעמבער'],
  SHORTMONTHS: ['יאַנואַר', 'פֿעברואַר', 'מערץ', 'אַפּריל', 'מיי', 'יוני', 'יולי', 'אויגוסט', 'סעפּטעמבער', 'אקטאבער', 'נאוועמבער', 'דעצעמבער'],
  STANDALONESHORTMONTHS: ['יאַנ', 'פֿעב', 'מערץ', 'אַפּר', 'מיי', 'יוני', 'יולי', 'אויג', 'סעפּ', 'אקט', 'נאוו', 'דעצ'],
  WEEKDAYS: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
  STANDALONEWEEKDAYS: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
  SHORTWEEKDAYS: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
  STANDALONESHORTWEEKDAYS: ['זונטיק', 'מאָנטיק', 'דינסטיק', 'מיטוואך', 'דאנערשטיק', 'פֿרײַטיק', 'שבת'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  AMPMS: ['פֿאַרמיטאָג', 'נאָכמיטאָג'],
  DATEFORMATS: ['EEEE, dטן MMMM y', 'dטן MMMM y', 'dטן MMM y', 'dd/MM/yy'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1}, {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale yi_001.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yi_001 = goog.i18n.DateTimeSymbols_yi;


/**
 * Date/time formatting symbols for locale yo.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yo = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['Saju Kristi', 'Lehin Kristi'],
  NARROWMONTHS: ['S', 'È', 'Ẹ', 'Ì', 'Ẹ̀', 'Ò', 'A', 'Ò', 'O', 'Ọ̀', 'B', 'Ọ̀'],
  STANDALONENARROWMONTHS: ['S', 'È', 'Ẹ', 'Ì', 'Ẹ̀', 'Ò', 'A', 'Ò', 'O', 'Ọ̀', 'B', 'Ọ̀'],
  MONTHS: ['Oṣù Ṣẹ́rẹ́', 'Oṣù Èrèlè', 'Oṣù Ẹrẹ̀nà', 'Oṣù Ìgbé', 'Oṣù Ẹ̀bibi', 'Oṣù Òkúdu', 'Oṣù Agẹmọ', 'Oṣù Ògún', 'Oṣù Owewe', 'Oṣù Ọ̀wàrà', 'Oṣù Bélú', 'Oṣù Ọ̀pẹ̀'],
  STANDALONEMONTHS: ['Ṣẹ́rẹ́', 'Èrèlè', 'Ẹrẹ̀nà', 'Ìgbé', 'Ẹ̀bibi', 'Òkúdu', 'Agẹmọ', 'Ògún', 'Owewe', 'Ọ̀wàrà', 'Bélú', 'Ọ̀pẹ̀'],
  SHORTMONTHS: ['Ṣẹ́r', 'Èrèl', 'Ẹrẹ̀n', 'Ìgb', 'Ẹ̀bi', 'Òkú', 'Agẹ', 'Ògú', 'Owe', 'Ọ̀wà', 'Bél', 'Ọ̀pẹ'],
  STANDALONESHORTMONTHS: ['Ṣẹ́', 'Èr', 'Ẹr', 'Ìg', 'Ẹ̀b', 'Òk', 'Ag', 'Òg', 'Ow', 'Ọ̀w', 'Bé', 'Ọ̀p'],
  WEEKDAYS: ['Ọjọ́ Àìkú', 'Ọjọ́ Ajé', 'Ọjọ́ Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ọjọ́ Ẹtì', 'Ọjọ́ Àbámẹ́ta'],
  STANDALONEWEEKDAYS: ['Àìkú', 'Ajé', 'Ìsẹ́gun', 'Ọjọ́rú', 'Ọjọ́bọ', 'Ẹtì', 'Àbámẹ́ta'],
  SHORTWEEKDAYS: ['Àìk', 'Aj', 'Ìsẹ́g', 'Ọjọ́r', 'Ọjọ́b', 'Ẹt', 'Àbám'],
  STANDALONESHORTWEEKDAYS: ['Àìk', 'Aj', 'Ìsẹ́g', 'Ọjọ́r', 'Ọjọ́b', 'Ẹt', 'Àbám'],
  NARROWWEEKDAYS: ['À', 'A', 'Ì', 'Ọ', 'Ọ', 'Ẹ', 'À'],
  STANDALONENARROWWEEKDAYS: ['À', 'A', 'Ì', 'Ọ', 'Ọ', 'Ẹ', 'À'],
  SHORTQUARTERS: ['Ìdámẹ́rin kíní', 'Ìdámẹ́rin Kejì', 'Ìdámẹ́rin Kẹta', 'Ìdámẹ́rin Kẹrin'],
  QUARTERS: ['Ìdámẹ́rin kíní', 'Ìdámẹ́rin Kejì', 'Ìdámẹ́rin Kẹta', 'Ìdámẹ́rin Kẹrin'],
  AMPMS: ['Àárọ̀', 'Ọ̀sán'],
  DATEFORMATS: ['EEEE, d MMM y', 'd MMM y', 'd MM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'H:mm:ss z', 'H:m:s', 'H:m'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale yo_BJ.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yo_BJ = {
  ERAS: ['BCE', 'CE'],
  ERANAMES: ['Saju Kristi', 'Lehin Kristi'],
  NARROWMONTHS: ['S', 'È', 'Ɛ', 'Ì', 'Ɛ̀', 'Ò', 'A', 'Ò', 'O', 'Ɔ̀', 'B', 'Ɔ̀'],
  STANDALONENARROWMONTHS: ['S', 'È', 'Ɛ', 'Ì', 'Ɛ̀', 'Ò', 'A', 'Ò', 'O', 'Ɔ̀', 'B', 'Ɔ̀'],
  MONTHS: ['Oshù Shɛ́rɛ́', 'Oshù Èrèlè', 'Oshù Ɛrɛ̀nà', 'Oshù Ìgbé', 'Oshù Ɛ̀bibi', 'Oshù Òkúdu', 'Oshù Agɛmɔ', 'Oshù Ògún', 'Oshù Owewe', 'Oshù Ɔ̀wàrà', 'Oshù Bélú', 'Oshù Ɔ̀pɛ̀'],
  STANDALONEMONTHS: ['Shɛ́rɛ́', 'Èrèlè', 'Ɛrɛ̀nà', 'Ìgbé', 'Ɛ̀bibi', 'Òkúdu', 'Agɛmɔ', 'Ògún', 'Owewe', 'Ɔ̀wàrà', 'Bélú', 'Ɔ̀pɛ̀'],
  SHORTMONTHS: ['Shɛ́r', 'Èrèl', 'Ɛrɛ̀n', 'Ìgb', 'Ɛ̀bi', 'Òkú', 'Agɛ', 'Ògú', 'Owe', 'Ɔ̀wà', 'Bél', 'Ɔ̀pɛ'],
  STANDALONESHORTMONTHS: ['Shɛ́', 'Èr', 'Ɛr', 'Ìg', 'Ɛ̀b', 'Òk', 'Ag', 'Òg', 'Ow', 'Ɔ̀w', 'Bé', 'Ɔ̀p'],
  WEEKDAYS: ['Ɔjɔ́ Àìkú', 'Ɔjɔ́ Ajé', 'Ɔjɔ́ Ìsɛ́gun', 'Ɔjɔ́rú', 'Ɔjɔ́bɔ', 'Ɔjɔ́ Ɛtì', 'Ɔjɔ́ Àbámɛ́ta'],
  STANDALONEWEEKDAYS: ['Àìkú', 'Ajé', 'Ìsɛ́gun', 'Ɔjɔ́rú', 'Ɔjɔ́bɔ', 'Ɛtì', 'Àbámɛ́ta'],
  SHORTWEEKDAYS: ['Àìk', 'Aj', 'Ìsɛ́g', 'Ɔjɔ́r', 'Ɔjɔ́b', 'Ɛt', 'Àbám'],
  STANDALONESHORTWEEKDAYS: ['Àìk', 'Aj', 'Ìsɛ́g', 'Ɔjɔ́r', 'Ɔjɔ́b', 'Ɛt', 'Àbám'],
  NARROWWEEKDAYS: ['À', 'A', 'Ì', 'Ɔ', 'Ɔ', 'Ɛ', 'À'],
  STANDALONENARROWWEEKDAYS: ['À', 'A', 'Ì', 'Ɔ', 'Ɔ', 'Ɛ', 'À'],
  SHORTQUARTERS: ['Ìdámɛ́rin kíní', 'Ìdámɛ́rin Kejì', 'Ìdámɛ́rin Kɛta', 'Ìdámɛ́rin Kɛrin'],
  QUARTERS: ['Ìdámɛ́rin kíní', 'Ìdámɛ́rin Kejì', 'Ìdámɛ́rin Kɛta', 'Ìdámɛ́rin Kɛrin'],
  AMPMS: ['Àárɔ̀', 'Ɔ̀sán'],
  DATEFORMATS: ['EEEE, d MMM y', 'd MMM y', 'd MM y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'H:mm:ss z', 'H:m:s', 'H:m'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale yo_NG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yo_NG = goog.i18n.DateTimeSymbols_yo;


/**
 * Date/time formatting symbols for locale yue.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yue = {
  ERAS: ['西元前', '西元'],
  ERANAMES: ['西元前', '西元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONESHORTWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日 EEEE', 'y年M月d日', 'y年M月d日', 'y/M/d'],
  TIMEFORMATS: ['ah:mm:ss [zzzz]', 'ah:mm:ss [z]', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale yue_Hans.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yue_Hans = {
  ERAS: ['西元前', '西元'],
  ERANAMES: ['西元前', '西元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  STANDALONEMONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  STANDALONESHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'y年M月d日', 'y/M/d'],
  TIMEFORMATS: ['zzzz ah:mm:ss', 'z ah:mm:ss', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale yue_Hans_CN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yue_Hans_CN = {
  ERAS: ['西元前', '西元'],
  ERANAMES: ['西元前', '西元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  STANDALONEMONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  STANDALONESHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'y年M月d日', 'y/M/d'],
  TIMEFORMATS: ['zzzz ah:mm:ss', 'z ah:mm:ss', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale yue_Hant.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yue_Hant = goog.i18n.DateTimeSymbols_yue;


/**
 * Date/time formatting symbols for locale yue_Hant_HK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_yue_Hant_HK = goog.i18n.DateTimeSymbols_yue;


/**
 * Date/time formatting symbols for locale zgh.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zgh = {
  ERAS: ['ⴷⴰⵄ', 'ⴷⴼⵄ'],
  ERANAMES: ['ⴷⴰⵜ ⵏ ⵄⵉⵙⴰ', 'ⴷⴼⴼⵉⵔ ⵏ ⵄⵉⵙⴰ'],
  NARROWMONTHS: ['ⵉ', 'ⴱ', 'ⵎ', 'ⵉ', 'ⵎ', 'ⵢ', 'ⵢ', 'ⵖ', 'ⵛ', 'ⴽ', 'ⵏ', 'ⴷ'],
  STANDALONENARROWMONTHS: ['ⵉ', 'ⴱ', 'ⵎ', 'ⵉ', 'ⵎ', 'ⵢ', 'ⵢ', 'ⵖ', 'ⵛ', 'ⴽ', 'ⵏ', 'ⴷ'],
  MONTHS: ['ⵉⵏⵏⴰⵢⵔ', 'ⴱⵕⴰⵢⵕ', 'ⵎⴰⵕⵚ', 'ⵉⴱⵔⵉⵔ', 'ⵎⴰⵢⵢⵓ', 'ⵢⵓⵏⵢⵓ', 'ⵢⵓⵍⵢⵓⵣ', 'ⵖⵓⵛⵜ', 'ⵛⵓⵜⴰⵏⴱⵉⵔ', 'ⴽⵜⵓⴱⵔ', 'ⵏⵓⵡⴰⵏⴱⵉⵔ', 'ⴷⵓⵊⴰⵏⴱⵉⵔ'],
  STANDALONEMONTHS: ['ⵉⵏⵏⴰⵢⵔ', 'ⴱⵕⴰⵢⵕ', 'ⵎⴰⵕⵚ', 'ⵉⴱⵔⵉⵔ', 'ⵎⴰⵢⵢⵓ', 'ⵢⵓⵏⵢⵓ', 'ⵢⵓⵍⵢⵓⵣ', 'ⵖⵓⵛⵜ', 'ⵛⵓⵜⴰⵏⴱⵉⵔ', 'ⴽⵜⵓⴱⵔ', 'ⵏⵓⵡⴰⵏⴱⵉⵔ', 'ⴷⵓⵊⴰⵏⴱⵉⵔ'],
  SHORTMONTHS: ['ⵉⵏⵏ', 'ⴱⵕⴰ', 'ⵎⴰⵕ', 'ⵉⴱⵔ', 'ⵎⴰⵢ', 'ⵢⵓⵏ', 'ⵢⵓⵍ', 'ⵖⵓⵛ', 'ⵛⵓⵜ', 'ⴽⵜⵓ', 'ⵏⵓⵡ', 'ⴷⵓⵊ'],
  STANDALONESHORTMONTHS: ['ⵉⵏⵏ', 'ⴱⵕⴰ', 'ⵎⴰⵕ', 'ⵉⴱⵔ', 'ⵎⴰⵢ', 'ⵢⵓⵏ', 'ⵢⵓⵍ', 'ⵖⵓⵛ', 'ⵛⵓⵜ', 'ⴽⵜⵓ', 'ⵏⵓⵡ', 'ⴷⵓⵊ'],
  WEEKDAYS: ['ⴰⵙⴰⵎⴰⵙ', 'ⴰⵢⵏⴰⵙ', 'ⴰⵙⵉⵏⴰⵙ', 'ⴰⴽⵕⴰⵙ', 'ⴰⴽⵡⴰⵙ', 'ⴰⵙⵉⵎⵡⴰⵙ', 'ⴰⵙⵉⴹⵢⴰⵙ'],
  STANDALONEWEEKDAYS: ['ⴰⵙⴰⵎⴰⵙ', 'ⴰⵢⵏⴰⵙ', 'ⴰⵙⵉⵏⴰⵙ', 'ⴰⴽⵕⴰⵙ', 'ⴰⴽⵡⴰⵙ', 'ⴰⵙⵉⵎⵡⴰⵙ', 'ⴰⵙⵉⴹⵢⴰⵙ'],
  SHORTWEEKDAYS: ['ⴰⵙⴰ', 'ⴰⵢⵏ', 'ⴰⵙⵉ', 'ⴰⴽⵕ', 'ⴰⴽⵡ', 'ⴰⵙⵉⵎ', 'ⴰⵙⵉⴹ'],
  STANDALONESHORTWEEKDAYS: ['ⴰⵙⴰ', 'ⴰⵢⵏ', 'ⴰⵙⵉ', 'ⴰⴽⵕ', 'ⴰⴽⵡ', 'ⴰⵙⵉⵎ', 'ⴰⵙⵉⴹ'],
  NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  SHORTQUARTERS: ['ⴰⴽ 1', 'ⴰⴽ 2', 'ⴰⴽ 3', 'ⴰⴽ 4'],
  QUARTERS: ['ⴰⴽⵕⴰⴹⵢⵓⵔ 1', 'ⴰⴽⵕⴰⴹⵢⵓⵔ 2', 'ⴰⴽⵕⴰⴹⵢⵓⵔ 3', 'ⴰⴽⵕⴰⴹⵢⵓⵔ 4'],
  AMPMS: ['ⵜⵉⴼⴰⵡⵜ', 'ⵜⴰⴷⴳⴳⵯⴰⵜ'],
  DATEFORMATS: ['EEEE d MMMM y', 'd MMMM y', 'd MMM, y', 'd/M/y'],
  TIMEFORMATS: ['HH:mm:ss zzzz', 'HH:mm:ss z', 'HH:mm:ss', 'HH:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 0,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 6
};


/**
 * Date/time formatting symbols for locale zgh_MA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zgh_MA = goog.i18n.DateTimeSymbols_zgh;


/**
 * Date/time formatting symbols for locale zh_Hans.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hans = goog.i18n.DateTimeSymbols_zh;


/**
 * Date/time formatting symbols for locale zh_Hans_CN.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hans_CN = goog.i18n.DateTimeSymbols_zh;


/**
 * Date/time formatting symbols for locale zh_Hans_HK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hans_HK = {
  ERAS: ['公元前', '公元'],
  ERANAMES: ['公元前', '公元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  STANDALONEMONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  STANDALONESHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['1季度', '2季度', '3季度', '4季度'],
  QUARTERS: ['第一季度', '第二季度', '第三季度', '第四季度'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'y年M月d日', 'd/M/yy'],
  TIMEFORMATS: ['zzzz ah:mm:ss', 'z ah:mm:ss', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zh_Hans_MO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hans_MO = {
  ERAS: ['公元前', '公元'],
  ERANAMES: ['公元前', '公元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  STANDALONEMONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  STANDALONESHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['1季度', '2季度', '3季度', '4季度'],
  QUARTERS: ['第一季度', '第二季度', '第三季度', '第四季度'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'y年M月d日', 'd/M/yy'],
  TIMEFORMATS: ['zzzz ah:mm:ss', 'z ah:mm:ss', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zh_Hans_SG.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hans_SG = {
  ERAS: ['公元前', '公元'],
  ERANAMES: ['公元前', '公元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  STANDALONEMONTHS: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  STANDALONESHORTWEEKDAYS: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['1季度', '2季度', '3季度', '4季度'],
  QUARTERS: ['第一季度', '第二季度', '第三季度', '第四季度'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'y年M月d日', 'dd/MM/yy'],
  TIMEFORMATS: ['zzzz ah:mm:ss', 'z ah:mm:ss', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zh_Hant.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hant = {
  ERAS: ['西元前', '西元'],
  ERANAMES: ['西元前', '西元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  STANDALONESHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日 EEEE', 'y年M月d日', 'y年M月d日', 'y/M/d'],
  TIMEFORMATS: ['ah:mm:ss [zzzz]', 'ah:mm:ss [z]', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zh_Hant_HK.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hant_HK = {
  ERAS: ['公元前', '公元'],
  ERANAMES: ['公元前', '公元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  STANDALONESHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'y年M月d日', 'd/M/y'],
  TIMEFORMATS: ['ah:mm:ss [zzzz]', 'ah:mm:ss [z]', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zh_Hant_MO.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hant_MO = {
  ERAS: ['公元前', '公元'],
  ERANAMES: ['公元前', '公元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  STANDALONESHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日EEEE', 'y年M月d日', 'y年M月d日', 'd/M/y'],
  TIMEFORMATS: ['ah:mm:ss [zzzz]', 'ah:mm:ss [z]', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zh_Hant_TW.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zh_Hant_TW = {
  ERAS: ['西元前', '西元'],
  ERANAMES: ['西元前', '西元'],
  NARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  STANDALONENARROWMONTHS: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  MONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONEMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  SHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  STANDALONESHORTMONTHS: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  WEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  STANDALONEWEEKDAYS: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  SHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  STANDALONESHORTWEEKDAYS: ['週日', '週一', '週二', '週三', '週四', '週五', '週六'],
  NARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  STANDALONENARROWWEEKDAYS: ['日', '一', '二', '三', '四', '五', '六'],
  SHORTQUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  QUARTERS: ['第1季', '第2季', '第3季', '第4季'],
  AMPMS: ['上午', '下午'],
  DATEFORMATS: ['y年M月d日 EEEE', 'y年M月d日', 'y年M月d日', 'y/M/d'],
  TIMEFORMATS: ['ah:mm:ss [zzzz]', 'ah:mm:ss [z]', 'ah:mm:ss', 'ah:mm'],
  DATETIMEFORMATS: ['{1} {0}', '{1} {0}', '{1} {0}', '{1} {0}'],
  FIRSTDAYOFWEEK: 6,
  WEEKENDRANGE: [5, 6],
  FIRSTWEEKCUTOFFDAY: 5
};


/**
 * Date/time formatting symbols for locale zu_ZA.
 * @const
 * @type {!goog.i18n.DateTimeSymbolsType}
 */
goog.i18n.DateTimeSymbols_zu_ZA = goog.i18n.DateTimeSymbols_zu;


/**
 * Selected date/time formatting symbols by locale.
 */
switch (goog.LOCALE) {
  case 'af_NA':
  case 'af-NA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_af_NA;
    break;
  case 'af_ZA':
  case 'af-ZA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_af_ZA;
    break;
  case 'agq':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_agq;
    break;
  case 'agq_CM':
  case 'agq-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_agq_CM;
    break;
  case 'ak':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ak;
    break;
  case 'ak_GH':
  case 'ak-GH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ak_GH;
    break;
  case 'am_ET':
  case 'am-ET':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_am_ET;
    break;
  case 'ar_001':
  case 'ar-001':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_001;
    break;
  case 'ar_AE':
  case 'ar-AE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_AE;
    break;
  case 'ar_BH':
  case 'ar-BH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_BH;
    break;
  case 'ar_DJ':
  case 'ar-DJ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_DJ;
    break;
  case 'ar_EH':
  case 'ar-EH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_EH;
    break;
  case 'ar_ER':
  case 'ar-ER':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_ER;
    break;
  case 'ar_IL':
  case 'ar-IL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_IL;
    break;
  case 'ar_IQ':
  case 'ar-IQ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_IQ;
    break;
  case 'ar_JO':
  case 'ar-JO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_JO;
    break;
  case 'ar_KM':
  case 'ar-KM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_KM;
    break;
  case 'ar_KW':
  case 'ar-KW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_KW;
    break;
  case 'ar_LB':
  case 'ar-LB':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_LB;
    break;
  case 'ar_LY':
  case 'ar-LY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_LY;
    break;
  case 'ar_MA':
  case 'ar-MA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_MA;
    break;
  case 'ar_MR':
  case 'ar-MR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_MR;
    break;
  case 'ar_OM':
  case 'ar-OM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_OM;
    break;
  case 'ar_PS':
  case 'ar-PS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_PS;
    break;
  case 'ar_QA':
  case 'ar-QA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_QA;
    break;
  case 'ar_SA':
  case 'ar-SA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_SA;
    break;
  case 'ar_SD':
  case 'ar-SD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_SD;
    break;
  case 'ar_SO':
  case 'ar-SO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_SO;
    break;
  case 'ar_SS':
  case 'ar-SS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_SS;
    break;
  case 'ar_SY':
  case 'ar-SY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_SY;
    break;
  case 'ar_TD':
  case 'ar-TD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_TD;
    break;
  case 'ar_TN':
  case 'ar-TN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_TN;
    break;
  case 'ar_XB':
  case 'ar-XB':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_XB;
    break;
  case 'ar_YE':
  case 'ar-YE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ar_YE;
    break;
  case 'as':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_as;
    break;
  case 'as_IN':
  case 'as-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_as_IN;
    break;
  case 'asa':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_asa;
    break;
  case 'asa_TZ':
  case 'asa-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_asa_TZ;
    break;
  case 'ast':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ast;
    break;
  case 'ast_ES':
  case 'ast-ES':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ast_ES;
    break;
  case 'az_Cyrl':
  case 'az-Cyrl':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_az_Cyrl;
    break;
  case 'az_Cyrl_AZ':
  case 'az-Cyrl-AZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_az_Cyrl_AZ;
    break;
  case 'az_Latn':
  case 'az-Latn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_az_Latn;
    break;
  case 'az_Latn_AZ':
  case 'az-Latn-AZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_az_Latn_AZ;
    break;
  case 'bas':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bas;
    break;
  case 'bas_CM':
  case 'bas-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bas_CM;
    break;
  case 'be_BY':
  case 'be-BY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_be_BY;
    break;
  case 'bem':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bem;
    break;
  case 'bem_ZM':
  case 'bem-ZM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bem_ZM;
    break;
  case 'bez':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bez;
    break;
  case 'bez_TZ':
  case 'bez-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bez_TZ;
    break;
  case 'bg_BG':
  case 'bg-BG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bg_BG;
    break;
  case 'bm':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bm;
    break;
  case 'bm_ML':
  case 'bm-ML':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bm_ML;
    break;
  case 'bn_BD':
  case 'bn-BD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bn_BD;
    break;
  case 'bn_IN':
  case 'bn-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bn_IN;
    break;
  case 'bo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bo;
    break;
  case 'bo_CN':
  case 'bo-CN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bo_CN;
    break;
  case 'bo_IN':
  case 'bo-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bo_IN;
    break;
  case 'br_FR':
  case 'br-FR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_br_FR;
    break;
  case 'brx':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_brx;
    break;
  case 'brx_IN':
  case 'brx-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_brx_IN;
    break;
  case 'bs_Cyrl':
  case 'bs-Cyrl':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bs_Cyrl;
    break;
  case 'bs_Cyrl_BA':
  case 'bs-Cyrl-BA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bs_Cyrl_BA;
    break;
  case 'bs_Latn':
  case 'bs-Latn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bs_Latn;
    break;
  case 'bs_Latn_BA':
  case 'bs-Latn-BA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_bs_Latn_BA;
    break;
  case 'ca_AD':
  case 'ca-AD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ca_AD;
    break;
  case 'ca_ES':
  case 'ca-ES':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ca_ES;
    break;
  case 'ca_FR':
  case 'ca-FR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ca_FR;
    break;
  case 'ca_IT':
  case 'ca-IT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ca_IT;
    break;
  case 'ccp':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ccp;
    break;
  case 'ccp_BD':
  case 'ccp-BD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ccp_BD;
    break;
  case 'ccp_IN':
  case 'ccp-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ccp_IN;
    break;
  case 'ce':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ce;
    break;
  case 'ce_RU':
  case 'ce-RU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ce_RU;
    break;
  case 'ceb':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ceb;
    break;
  case 'ceb_PH':
  case 'ceb-PH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ceb_PH;
    break;
  case 'cgg':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_cgg;
    break;
  case 'cgg_UG':
  case 'cgg-UG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_cgg_UG;
    break;
  case 'chr_US':
  case 'chr-US':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_chr_US;
    break;
  case 'ckb':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ckb;
    break;
  case 'ckb_IQ':
  case 'ckb-IQ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ckb_IQ;
    break;
  case 'ckb_IR':
  case 'ckb-IR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ckb_IR;
    break;
  case 'cs_CZ':
  case 'cs-CZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_cs_CZ;
    break;
  case 'cy_GB':
  case 'cy-GB':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_cy_GB;
    break;
  case 'da_DK':
  case 'da-DK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_da_DK;
    break;
  case 'da_GL':
  case 'da-GL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_da_GL;
    break;
  case 'dav':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dav;
    break;
  case 'dav_KE':
  case 'dav-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dav_KE;
    break;
  case 'de_BE':
  case 'de-BE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_de_BE;
    break;
  case 'de_DE':
  case 'de-DE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_de_DE;
    break;
  case 'de_IT':
  case 'de-IT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_de_IT;
    break;
  case 'de_LI':
  case 'de-LI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_de_LI;
    break;
  case 'de_LU':
  case 'de-LU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_de_LU;
    break;
  case 'dje':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dje;
    break;
  case 'dje_NE':
  case 'dje-NE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dje_NE;
    break;
  case 'dsb':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dsb;
    break;
  case 'dsb_DE':
  case 'dsb-DE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dsb_DE;
    break;
  case 'dua':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dua;
    break;
  case 'dua_CM':
  case 'dua-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dua_CM;
    break;
  case 'dyo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dyo;
    break;
  case 'dyo_SN':
  case 'dyo-SN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dyo_SN;
    break;
  case 'dz':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dz;
    break;
  case 'dz_BT':
  case 'dz-BT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_dz_BT;
    break;
  case 'ebu':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ebu;
    break;
  case 'ebu_KE':
  case 'ebu-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ebu_KE;
    break;
  case 'ee':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ee;
    break;
  case 'ee_GH':
  case 'ee-GH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ee_GH;
    break;
  case 'ee_TG':
  case 'ee-TG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ee_TG;
    break;
  case 'el_CY':
  case 'el-CY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_el_CY;
    break;
  case 'el_GR':
  case 'el-GR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_el_GR;
    break;
  case 'en_001':
  case 'en-001':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_001;
    break;
  case 'en_150':
  case 'en-150':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_150;
    break;
  case 'en_AE':
  case 'en-AE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_AE;
    break;
  case 'en_AG':
  case 'en-AG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_AG;
    break;
  case 'en_AI':
  case 'en-AI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_AI;
    break;
  case 'en_AS':
  case 'en-AS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_AS;
    break;
  case 'en_AT':
  case 'en-AT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_AT;
    break;
  case 'en_BB':
  case 'en-BB':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_BB;
    break;
  case 'en_BE':
  case 'en-BE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_BE;
    break;
  case 'en_BI':
  case 'en-BI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_BI;
    break;
  case 'en_BM':
  case 'en-BM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_BM;
    break;
  case 'en_BS':
  case 'en-BS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_BS;
    break;
  case 'en_BW':
  case 'en-BW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_BW;
    break;
  case 'en_BZ':
  case 'en-BZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_BZ;
    break;
  case 'en_CC':
  case 'en-CC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_CC;
    break;
  case 'en_CH':
  case 'en-CH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_CH;
    break;
  case 'en_CK':
  case 'en-CK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_CK;
    break;
  case 'en_CM':
  case 'en-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_CM;
    break;
  case 'en_CX':
  case 'en-CX':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_CX;
    break;
  case 'en_CY':
  case 'en-CY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_CY;
    break;
  case 'en_DE':
  case 'en-DE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_DE;
    break;
  case 'en_DG':
  case 'en-DG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_DG;
    break;
  case 'en_DK':
  case 'en-DK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_DK;
    break;
  case 'en_DM':
  case 'en-DM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_DM;
    break;
  case 'en_ER':
  case 'en-ER':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_ER;
    break;
  case 'en_FI':
  case 'en-FI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_FI;
    break;
  case 'en_FJ':
  case 'en-FJ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_FJ;
    break;
  case 'en_FK':
  case 'en-FK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_FK;
    break;
  case 'en_FM':
  case 'en-FM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_FM;
    break;
  case 'en_GD':
  case 'en-GD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_GD;
    break;
  case 'en_GG':
  case 'en-GG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_GG;
    break;
  case 'en_GH':
  case 'en-GH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_GH;
    break;
  case 'en_GI':
  case 'en-GI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_GI;
    break;
  case 'en_GM':
  case 'en-GM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_GM;
    break;
  case 'en_GU':
  case 'en-GU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_GU;
    break;
  case 'en_GY':
  case 'en-GY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_GY;
    break;
  case 'en_HK':
  case 'en-HK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_HK;
    break;
  case 'en_IL':
  case 'en-IL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_IL;
    break;
  case 'en_IM':
  case 'en-IM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_IM;
    break;
  case 'en_IO':
  case 'en-IO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_IO;
    break;
  case 'en_JE':
  case 'en-JE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_JE;
    break;
  case 'en_JM':
  case 'en-JM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_JM;
    break;
  case 'en_KE':
  case 'en-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_KE;
    break;
  case 'en_KI':
  case 'en-KI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_KI;
    break;
  case 'en_KN':
  case 'en-KN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_KN;
    break;
  case 'en_KY':
  case 'en-KY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_KY;
    break;
  case 'en_LC':
  case 'en-LC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_LC;
    break;
  case 'en_LR':
  case 'en-LR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_LR;
    break;
  case 'en_LS':
  case 'en-LS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_LS;
    break;
  case 'en_MG':
  case 'en-MG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MG;
    break;
  case 'en_MH':
  case 'en-MH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MH;
    break;
  case 'en_MO':
  case 'en-MO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MO;
    break;
  case 'en_MP':
  case 'en-MP':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MP;
    break;
  case 'en_MS':
  case 'en-MS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MS;
    break;
  case 'en_MT':
  case 'en-MT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MT;
    break;
  case 'en_MU':
  case 'en-MU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MU;
    break;
  case 'en_MW':
  case 'en-MW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MW;
    break;
  case 'en_MY':
  case 'en-MY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_MY;
    break;
  case 'en_NA':
  case 'en-NA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_NA;
    break;
  case 'en_NF':
  case 'en-NF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_NF;
    break;
  case 'en_NG':
  case 'en-NG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_NG;
    break;
  case 'en_NL':
  case 'en-NL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_NL;
    break;
  case 'en_NR':
  case 'en-NR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_NR;
    break;
  case 'en_NU':
  case 'en-NU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_NU;
    break;
  case 'en_NZ':
  case 'en-NZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_NZ;
    break;
  case 'en_PG':
  case 'en-PG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_PG;
    break;
  case 'en_PH':
  case 'en-PH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_PH;
    break;
  case 'en_PK':
  case 'en-PK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_PK;
    break;
  case 'en_PN':
  case 'en-PN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_PN;
    break;
  case 'en_PR':
  case 'en-PR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_PR;
    break;
  case 'en_PW':
  case 'en-PW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_PW;
    break;
  case 'en_RW':
  case 'en-RW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_RW;
    break;
  case 'en_SB':
  case 'en-SB':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SB;
    break;
  case 'en_SC':
  case 'en-SC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SC;
    break;
  case 'en_SD':
  case 'en-SD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SD;
    break;
  case 'en_SE':
  case 'en-SE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SE;
    break;
  case 'en_SH':
  case 'en-SH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SH;
    break;
  case 'en_SI':
  case 'en-SI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SI;
    break;
  case 'en_SL':
  case 'en-SL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SL;
    break;
  case 'en_SS':
  case 'en-SS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SS;
    break;
  case 'en_SX':
  case 'en-SX':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SX;
    break;
  case 'en_SZ':
  case 'en-SZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_SZ;
    break;
  case 'en_TC':
  case 'en-TC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_TC;
    break;
  case 'en_TK':
  case 'en-TK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_TK;
    break;
  case 'en_TO':
  case 'en-TO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_TO;
    break;
  case 'en_TT':
  case 'en-TT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_TT;
    break;
  case 'en_TV':
  case 'en-TV':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_TV;
    break;
  case 'en_TZ':
  case 'en-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_TZ;
    break;
  case 'en_UG':
  case 'en-UG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_UG;
    break;
  case 'en_UM':
  case 'en-UM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_UM;
    break;
  case 'en_US_POSIX':
  case 'en-US-POSIX':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_US_POSIX;
    break;
  case 'en_VC':
  case 'en-VC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_VC;
    break;
  case 'en_VG':
  case 'en-VG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_VG;
    break;
  case 'en_VI':
  case 'en-VI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_VI;
    break;
  case 'en_VU':
  case 'en-VU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_VU;
    break;
  case 'en_WS':
  case 'en-WS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_WS;
    break;
  case 'en_XA':
  case 'en-XA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_XA;
    break;
  case 'en_ZM':
  case 'en-ZM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_ZM;
    break;
  case 'en_ZW':
  case 'en-ZW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_en_ZW;
    break;
  case 'eo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_eo;
    break;
  case 'eo_001':
  case 'eo-001':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_eo_001;
    break;
  case 'es_AR':
  case 'es-AR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_AR;
    break;
  case 'es_BO':
  case 'es-BO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_BO;
    break;
  case 'es_BR':
  case 'es-BR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_BR;
    break;
  case 'es_BZ':
  case 'es-BZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_BZ;
    break;
  case 'es_CL':
  case 'es-CL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_CL;
    break;
  case 'es_CO':
  case 'es-CO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_CO;
    break;
  case 'es_CR':
  case 'es-CR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_CR;
    break;
  case 'es_CU':
  case 'es-CU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_CU;
    break;
  case 'es_DO':
  case 'es-DO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_DO;
    break;
  case 'es_EA':
  case 'es-EA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_EA;
    break;
  case 'es_EC':
  case 'es-EC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_EC;
    break;
  case 'es_GQ':
  case 'es-GQ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_GQ;
    break;
  case 'es_GT':
  case 'es-GT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_GT;
    break;
  case 'es_HN':
  case 'es-HN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_HN;
    break;
  case 'es_IC':
  case 'es-IC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_IC;
    break;
  case 'es_NI':
  case 'es-NI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_NI;
    break;
  case 'es_PA':
  case 'es-PA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_PA;
    break;
  case 'es_PE':
  case 'es-PE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_PE;
    break;
  case 'es_PH':
  case 'es-PH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_PH;
    break;
  case 'es_PR':
  case 'es-PR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_PR;
    break;
  case 'es_PY':
  case 'es-PY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_PY;
    break;
  case 'es_SV':
  case 'es-SV':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_SV;
    break;
  case 'es_UY':
  case 'es-UY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_UY;
    break;
  case 'es_VE':
  case 'es-VE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_es_VE;
    break;
  case 'et_EE':
  case 'et-EE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_et_EE;
    break;
  case 'eu_ES':
  case 'eu-ES':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_eu_ES;
    break;
  case 'ewo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ewo;
    break;
  case 'ewo_CM':
  case 'ewo-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ewo_CM;
    break;
  case 'fa_AF':
  case 'fa-AF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fa_AF;
    break;
  case 'fa_IR':
  case 'fa-IR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fa_IR;
    break;
  case 'ff':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff;
    break;
  case 'ff_Latn':
  case 'ff-Latn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn;
    break;
  case 'ff_Latn_BF':
  case 'ff-Latn-BF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_BF;
    break;
  case 'ff_Latn_CM':
  case 'ff-Latn-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_CM;
    break;
  case 'ff_Latn_GH':
  case 'ff-Latn-GH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_GH;
    break;
  case 'ff_Latn_GM':
  case 'ff-Latn-GM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_GM;
    break;
  case 'ff_Latn_GN':
  case 'ff-Latn-GN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_GN;
    break;
  case 'ff_Latn_GW':
  case 'ff-Latn-GW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_GW;
    break;
  case 'ff_Latn_LR':
  case 'ff-Latn-LR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_LR;
    break;
  case 'ff_Latn_MR':
  case 'ff-Latn-MR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_MR;
    break;
  case 'ff_Latn_NE':
  case 'ff-Latn-NE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_NE;
    break;
  case 'ff_Latn_NG':
  case 'ff-Latn-NG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_NG;
    break;
  case 'ff_Latn_SL':
  case 'ff-Latn-SL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_SL;
    break;
  case 'ff_Latn_SN':
  case 'ff-Latn-SN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ff_Latn_SN;
    break;
  case 'fi_FI':
  case 'fi-FI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fi_FI;
    break;
  case 'fil_PH':
  case 'fil-PH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fil_PH;
    break;
  case 'fo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fo;
    break;
  case 'fo_DK':
  case 'fo-DK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fo_DK;
    break;
  case 'fo_FO':
  case 'fo-FO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fo_FO;
    break;
  case 'fr_BE':
  case 'fr-BE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_BE;
    break;
  case 'fr_BF':
  case 'fr-BF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_BF;
    break;
  case 'fr_BI':
  case 'fr-BI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_BI;
    break;
  case 'fr_BJ':
  case 'fr-BJ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_BJ;
    break;
  case 'fr_BL':
  case 'fr-BL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_BL;
    break;
  case 'fr_CD':
  case 'fr-CD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_CD;
    break;
  case 'fr_CF':
  case 'fr-CF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_CF;
    break;
  case 'fr_CG':
  case 'fr-CG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_CG;
    break;
  case 'fr_CH':
  case 'fr-CH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_CH;
    break;
  case 'fr_CI':
  case 'fr-CI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_CI;
    break;
  case 'fr_CM':
  case 'fr-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_CM;
    break;
  case 'fr_DJ':
  case 'fr-DJ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_DJ;
    break;
  case 'fr_DZ':
  case 'fr-DZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_DZ;
    break;
  case 'fr_FR':
  case 'fr-FR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_FR;
    break;
  case 'fr_GA':
  case 'fr-GA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_GA;
    break;
  case 'fr_GF':
  case 'fr-GF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_GF;
    break;
  case 'fr_GN':
  case 'fr-GN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_GN;
    break;
  case 'fr_GP':
  case 'fr-GP':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_GP;
    break;
  case 'fr_GQ':
  case 'fr-GQ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_GQ;
    break;
  case 'fr_HT':
  case 'fr-HT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_HT;
    break;
  case 'fr_KM':
  case 'fr-KM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_KM;
    break;
  case 'fr_LU':
  case 'fr-LU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_LU;
    break;
  case 'fr_MA':
  case 'fr-MA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_MA;
    break;
  case 'fr_MC':
  case 'fr-MC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_MC;
    break;
  case 'fr_MF':
  case 'fr-MF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_MF;
    break;
  case 'fr_MG':
  case 'fr-MG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_MG;
    break;
  case 'fr_ML':
  case 'fr-ML':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_ML;
    break;
  case 'fr_MQ':
  case 'fr-MQ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_MQ;
    break;
  case 'fr_MR':
  case 'fr-MR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_MR;
    break;
  case 'fr_MU':
  case 'fr-MU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_MU;
    break;
  case 'fr_NC':
  case 'fr-NC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_NC;
    break;
  case 'fr_NE':
  case 'fr-NE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_NE;
    break;
  case 'fr_PF':
  case 'fr-PF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_PF;
    break;
  case 'fr_PM':
  case 'fr-PM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_PM;
    break;
  case 'fr_RE':
  case 'fr-RE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_RE;
    break;
  case 'fr_RW':
  case 'fr-RW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_RW;
    break;
  case 'fr_SC':
  case 'fr-SC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_SC;
    break;
  case 'fr_SN':
  case 'fr-SN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_SN;
    break;
  case 'fr_SY':
  case 'fr-SY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_SY;
    break;
  case 'fr_TD':
  case 'fr-TD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_TD;
    break;
  case 'fr_TG':
  case 'fr-TG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_TG;
    break;
  case 'fr_TN':
  case 'fr-TN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_TN;
    break;
  case 'fr_VU':
  case 'fr-VU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_VU;
    break;
  case 'fr_WF':
  case 'fr-WF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_WF;
    break;
  case 'fr_YT':
  case 'fr-YT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fr_YT;
    break;
  case 'fur':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fur;
    break;
  case 'fur_IT':
  case 'fur-IT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fur_IT;
    break;
  case 'fy':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fy;
    break;
  case 'fy_NL':
  case 'fy-NL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_fy_NL;
    break;
  case 'ga_IE':
  case 'ga-IE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ga_IE;
    break;
  case 'gd':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gd;
    break;
  case 'gd_GB':
  case 'gd-GB':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gd_GB;
    break;
  case 'gl_ES':
  case 'gl-ES':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gl_ES;
    break;
  case 'gsw_CH':
  case 'gsw-CH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gsw_CH;
    break;
  case 'gsw_FR':
  case 'gsw-FR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gsw_FR;
    break;
  case 'gsw_LI':
  case 'gsw-LI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gsw_LI;
    break;
  case 'gu_IN':
  case 'gu-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gu_IN;
    break;
  case 'guz':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_guz;
    break;
  case 'guz_KE':
  case 'guz-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_guz_KE;
    break;
  case 'gv':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gv;
    break;
  case 'gv_IM':
  case 'gv-IM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_gv_IM;
    break;
  case 'ha':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ha;
    break;
  case 'ha_GH':
  case 'ha-GH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ha_GH;
    break;
  case 'ha_NE':
  case 'ha-NE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ha_NE;
    break;
  case 'ha_NG':
  case 'ha-NG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ha_NG;
    break;
  case 'haw_US':
  case 'haw-US':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_haw_US;
    break;
  case 'he_IL':
  case 'he-IL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_he_IL;
    break;
  case 'hi_IN':
  case 'hi-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hi_IN;
    break;
  case 'hr_BA':
  case 'hr-BA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hr_BA;
    break;
  case 'hr_HR':
  case 'hr-HR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hr_HR;
    break;
  case 'hsb':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hsb;
    break;
  case 'hsb_DE':
  case 'hsb-DE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hsb_DE;
    break;
  case 'hu_HU':
  case 'hu-HU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hu_HU;
    break;
  case 'hy_AM':
  case 'hy-AM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_hy_AM;
    break;
  case 'ia':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ia;
    break;
  case 'ia_001':
  case 'ia-001':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ia_001;
    break;
  case 'id_ID':
  case 'id-ID':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_id_ID;
    break;
  case 'ig':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ig;
    break;
  case 'ig_NG':
  case 'ig-NG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ig_NG;
    break;
  case 'ii':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ii;
    break;
  case 'ii_CN':
  case 'ii-CN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ii_CN;
    break;
  case 'is_IS':
  case 'is-IS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_is_IS;
    break;
  case 'it_CH':
  case 'it-CH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_it_CH;
    break;
  case 'it_IT':
  case 'it-IT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_it_IT;
    break;
  case 'it_SM':
  case 'it-SM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_it_SM;
    break;
  case 'it_VA':
  case 'it-VA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_it_VA;
    break;
  case 'ja_JP':
  case 'ja-JP':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ja_JP;
    break;
  case 'jgo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_jgo;
    break;
  case 'jgo_CM':
  case 'jgo-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_jgo_CM;
    break;
  case 'jmc':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_jmc;
    break;
  case 'jmc_TZ':
  case 'jmc-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_jmc_TZ;
    break;
  case 'jv':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_jv;
    break;
  case 'jv_ID':
  case 'jv-ID':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_jv_ID;
    break;
  case 'ka_GE':
  case 'ka-GE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ka_GE;
    break;
  case 'kab':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kab;
    break;
  case 'kab_DZ':
  case 'kab-DZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kab_DZ;
    break;
  case 'kam':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kam;
    break;
  case 'kam_KE':
  case 'kam-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kam_KE;
    break;
  case 'kde':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kde;
    break;
  case 'kde_TZ':
  case 'kde-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kde_TZ;
    break;
  case 'kea':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kea;
    break;
  case 'kea_CV':
  case 'kea-CV':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kea_CV;
    break;
  case 'khq':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_khq;
    break;
  case 'khq_ML':
  case 'khq-ML':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_khq_ML;
    break;
  case 'ki':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ki;
    break;
  case 'ki_KE':
  case 'ki-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ki_KE;
    break;
  case 'kk_KZ':
  case 'kk-KZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kk_KZ;
    break;
  case 'kkj':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kkj;
    break;
  case 'kkj_CM':
  case 'kkj-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kkj_CM;
    break;
  case 'kl':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kl;
    break;
  case 'kl_GL':
  case 'kl-GL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kl_GL;
    break;
  case 'kln':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kln;
    break;
  case 'kln_KE':
  case 'kln-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kln_KE;
    break;
  case 'km_KH':
  case 'km-KH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_km_KH;
    break;
  case 'kn_IN':
  case 'kn-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kn_IN;
    break;
  case 'ko_KP':
  case 'ko-KP':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ko_KP;
    break;
  case 'ko_KR':
  case 'ko-KR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ko_KR;
    break;
  case 'kok':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kok;
    break;
  case 'kok_IN':
  case 'kok-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kok_IN;
    break;
  case 'ks':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ks;
    break;
  case 'ks_IN':
  case 'ks-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ks_IN;
    break;
  case 'ksb':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ksb;
    break;
  case 'ksb_TZ':
  case 'ksb-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ksb_TZ;
    break;
  case 'ksf':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ksf;
    break;
  case 'ksf_CM':
  case 'ksf-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ksf_CM;
    break;
  case 'ksh':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ksh;
    break;
  case 'ksh_DE':
  case 'ksh-DE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ksh_DE;
    break;
  case 'ku':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ku;
    break;
  case 'ku_TR':
  case 'ku-TR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ku_TR;
    break;
  case 'kw':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kw;
    break;
  case 'kw_GB':
  case 'kw-GB':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_kw_GB;
    break;
  case 'ky_KG':
  case 'ky-KG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ky_KG;
    break;
  case 'lag':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lag;
    break;
  case 'lag_TZ':
  case 'lag-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lag_TZ;
    break;
  case 'lb':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lb;
    break;
  case 'lb_LU':
  case 'lb-LU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lb_LU;
    break;
  case 'lg':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lg;
    break;
  case 'lg_UG':
  case 'lg-UG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lg_UG;
    break;
  case 'lkt':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lkt;
    break;
  case 'lkt_US':
  case 'lkt-US':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lkt_US;
    break;
  case 'ln_AO':
  case 'ln-AO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ln_AO;
    break;
  case 'ln_CD':
  case 'ln-CD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ln_CD;
    break;
  case 'ln_CF':
  case 'ln-CF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ln_CF;
    break;
  case 'ln_CG':
  case 'ln-CG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ln_CG;
    break;
  case 'lo_LA':
  case 'lo-LA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lo_LA;
    break;
  case 'lrc':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lrc;
    break;
  case 'lrc_IQ':
  case 'lrc-IQ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lrc_IQ;
    break;
  case 'lrc_IR':
  case 'lrc-IR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lrc_IR;
    break;
  case 'lt_LT':
  case 'lt-LT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lt_LT;
    break;
  case 'lu':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lu;
    break;
  case 'lu_CD':
  case 'lu-CD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lu_CD;
    break;
  case 'luo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_luo;
    break;
  case 'luo_KE':
  case 'luo-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_luo_KE;
    break;
  case 'luy':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_luy;
    break;
  case 'luy_KE':
  case 'luy-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_luy_KE;
    break;
  case 'lv_LV':
  case 'lv-LV':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_lv_LV;
    break;
  case 'mas':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mas;
    break;
  case 'mas_KE':
  case 'mas-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mas_KE;
    break;
  case 'mas_TZ':
  case 'mas-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mas_TZ;
    break;
  case 'mer':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mer;
    break;
  case 'mer_KE':
  case 'mer-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mer_KE;
    break;
  case 'mfe':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mfe;
    break;
  case 'mfe_MU':
  case 'mfe-MU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mfe_MU;
    break;
  case 'mg':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mg;
    break;
  case 'mg_MG':
  case 'mg-MG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mg_MG;
    break;
  case 'mgh':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mgh;
    break;
  case 'mgh_MZ':
  case 'mgh-MZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mgh_MZ;
    break;
  case 'mgo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mgo;
    break;
  case 'mgo_CM':
  case 'mgo-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mgo_CM;
    break;
  case 'mi':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mi;
    break;
  case 'mi_NZ':
  case 'mi-NZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mi_NZ;
    break;
  case 'mk_MK':
  case 'mk-MK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mk_MK;
    break;
  case 'ml_IN':
  case 'ml-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ml_IN;
    break;
  case 'mn_MN':
  case 'mn-MN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mn_MN;
    break;
  case 'mr_IN':
  case 'mr-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mr_IN;
    break;
  case 'ms_BN':
  case 'ms-BN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ms_BN;
    break;
  case 'ms_MY':
  case 'ms-MY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ms_MY;
    break;
  case 'ms_SG':
  case 'ms-SG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ms_SG;
    break;
  case 'mt_MT':
  case 'mt-MT':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mt_MT;
    break;
  case 'mua':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mua;
    break;
  case 'mua_CM':
  case 'mua-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mua_CM;
    break;
  case 'my_MM':
  case 'my-MM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_my_MM;
    break;
  case 'mzn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mzn;
    break;
  case 'mzn_IR':
  case 'mzn-IR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_mzn_IR;
    break;
  case 'naq':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_naq;
    break;
  case 'naq_NA':
  case 'naq-NA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_naq_NA;
    break;
  case 'nb_NO':
  case 'nb-NO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nb_NO;
    break;
  case 'nb_SJ':
  case 'nb-SJ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nb_SJ;
    break;
  case 'nd':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nd;
    break;
  case 'nd_ZW':
  case 'nd-ZW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nd_ZW;
    break;
  case 'nds':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nds;
    break;
  case 'nds_DE':
  case 'nds-DE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nds_DE;
    break;
  case 'nds_NL':
  case 'nds-NL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nds_NL;
    break;
  case 'ne_IN':
  case 'ne-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ne_IN;
    break;
  case 'ne_NP':
  case 'ne-NP':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ne_NP;
    break;
  case 'nl_AW':
  case 'nl-AW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nl_AW;
    break;
  case 'nl_BE':
  case 'nl-BE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nl_BE;
    break;
  case 'nl_BQ':
  case 'nl-BQ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nl_BQ;
    break;
  case 'nl_CW':
  case 'nl-CW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nl_CW;
    break;
  case 'nl_NL':
  case 'nl-NL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nl_NL;
    break;
  case 'nl_SR':
  case 'nl-SR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nl_SR;
    break;
  case 'nl_SX':
  case 'nl-SX':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nl_SX;
    break;
  case 'nmg':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nmg;
    break;
  case 'nmg_CM':
  case 'nmg-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nmg_CM;
    break;
  case 'nn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nn;
    break;
  case 'nn_NO':
  case 'nn-NO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nn_NO;
    break;
  case 'nnh':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nnh;
    break;
  case 'nnh_CM':
  case 'nnh-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nnh_CM;
    break;
  case 'nus':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nus;
    break;
  case 'nus_SS':
  case 'nus-SS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nus_SS;
    break;
  case 'nyn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nyn;
    break;
  case 'nyn_UG':
  case 'nyn-UG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_nyn_UG;
    break;
  case 'om':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_om;
    break;
  case 'om_ET':
  case 'om-ET':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_om_ET;
    break;
  case 'om_KE':
  case 'om-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_om_KE;
    break;
  case 'or_IN':
  case 'or-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_or_IN;
    break;
  case 'os':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_os;
    break;
  case 'os_GE':
  case 'os-GE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_os_GE;
    break;
  case 'os_RU':
  case 'os-RU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_os_RU;
    break;
  case 'pa_Arab':
  case 'pa-Arab':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pa_Arab;
    break;
  case 'pa_Arab_PK':
  case 'pa-Arab-PK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pa_Arab_PK;
    break;
  case 'pa_Guru':
  case 'pa-Guru':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pa_Guru;
    break;
  case 'pa_Guru_IN':
  case 'pa-Guru-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pa_Guru_IN;
    break;
  case 'pl_PL':
  case 'pl-PL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pl_PL;
    break;
  case 'ps':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ps;
    break;
  case 'ps_AF':
  case 'ps-AF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ps_AF;
    break;
  case 'ps_PK':
  case 'ps-PK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ps_PK;
    break;
  case 'pt_AO':
  case 'pt-AO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_AO;
    break;
  case 'pt_CH':
  case 'pt-CH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_CH;
    break;
  case 'pt_CV':
  case 'pt-CV':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_CV;
    break;
  case 'pt_GQ':
  case 'pt-GQ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_GQ;
    break;
  case 'pt_GW':
  case 'pt-GW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_GW;
    break;
  case 'pt_LU':
  case 'pt-LU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_LU;
    break;
  case 'pt_MO':
  case 'pt-MO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_MO;
    break;
  case 'pt_MZ':
  case 'pt-MZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_MZ;
    break;
  case 'pt_ST':
  case 'pt-ST':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_ST;
    break;
  case 'pt_TL':
  case 'pt-TL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_pt_TL;
    break;
  case 'qu':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_qu;
    break;
  case 'qu_BO':
  case 'qu-BO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_qu_BO;
    break;
  case 'qu_EC':
  case 'qu-EC':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_qu_EC;
    break;
  case 'qu_PE':
  case 'qu-PE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_qu_PE;
    break;
  case 'rm':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rm;
    break;
  case 'rm_CH':
  case 'rm-CH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rm_CH;
    break;
  case 'rn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rn;
    break;
  case 'rn_BI':
  case 'rn-BI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rn_BI;
    break;
  case 'ro_MD':
  case 'ro-MD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ro_MD;
    break;
  case 'ro_RO':
  case 'ro-RO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ro_RO;
    break;
  case 'rof':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rof;
    break;
  case 'rof_TZ':
  case 'rof-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rof_TZ;
    break;
  case 'ru_BY':
  case 'ru-BY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ru_BY;
    break;
  case 'ru_KG':
  case 'ru-KG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ru_KG;
    break;
  case 'ru_KZ':
  case 'ru-KZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ru_KZ;
    break;
  case 'ru_MD':
  case 'ru-MD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ru_MD;
    break;
  case 'ru_RU':
  case 'ru-RU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ru_RU;
    break;
  case 'ru_UA':
  case 'ru-UA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ru_UA;
    break;
  case 'rw':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rw;
    break;
  case 'rw_RW':
  case 'rw-RW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rw_RW;
    break;
  case 'rwk':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rwk;
    break;
  case 'rwk_TZ':
  case 'rwk-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_rwk_TZ;
    break;
  case 'sah':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sah;
    break;
  case 'sah_RU':
  case 'sah-RU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sah_RU;
    break;
  case 'saq':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_saq;
    break;
  case 'saq_KE':
  case 'saq-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_saq_KE;
    break;
  case 'sbp':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sbp;
    break;
  case 'sbp_TZ':
  case 'sbp-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sbp_TZ;
    break;
  case 'sd':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sd;
    break;
  case 'sd_PK':
  case 'sd-PK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sd_PK;
    break;
  case 'se':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_se;
    break;
  case 'se_FI':
  case 'se-FI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_se_FI;
    break;
  case 'se_NO':
  case 'se-NO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_se_NO;
    break;
  case 'se_SE':
  case 'se-SE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_se_SE;
    break;
  case 'seh':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_seh;
    break;
  case 'seh_MZ':
  case 'seh-MZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_seh_MZ;
    break;
  case 'ses':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ses;
    break;
  case 'ses_ML':
  case 'ses-ML':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ses_ML;
    break;
  case 'sg':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sg;
    break;
  case 'sg_CF':
  case 'sg-CF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sg_CF;
    break;
  case 'shi':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_shi;
    break;
  case 'shi_Latn':
  case 'shi-Latn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_shi_Latn;
    break;
  case 'shi_Latn_MA':
  case 'shi-Latn-MA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_shi_Latn_MA;
    break;
  case 'shi_Tfng':
  case 'shi-Tfng':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_shi_Tfng;
    break;
  case 'shi_Tfng_MA':
  case 'shi-Tfng-MA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_shi_Tfng_MA;
    break;
  case 'si_LK':
  case 'si-LK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_si_LK;
    break;
  case 'sk_SK':
  case 'sk-SK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sk_SK;
    break;
  case 'sl_SI':
  case 'sl-SI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sl_SI;
    break;
  case 'smn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_smn;
    break;
  case 'smn_FI':
  case 'smn-FI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_smn_FI;
    break;
  case 'sn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sn;
    break;
  case 'sn_ZW':
  case 'sn-ZW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sn_ZW;
    break;
  case 'so':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_so;
    break;
  case 'so_DJ':
  case 'so-DJ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_so_DJ;
    break;
  case 'so_ET':
  case 'so-ET':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_so_ET;
    break;
  case 'so_KE':
  case 'so-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_so_KE;
    break;
  case 'so_SO':
  case 'so-SO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_so_SO;
    break;
  case 'sq_AL':
  case 'sq-AL':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sq_AL;
    break;
  case 'sq_MK':
  case 'sq-MK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sq_MK;
    break;
  case 'sq_XK':
  case 'sq-XK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sq_XK;
    break;
  case 'sr_Cyrl':
  case 'sr-Cyrl':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Cyrl;
    break;
  case 'sr_Cyrl_BA':
  case 'sr-Cyrl-BA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Cyrl_BA;
    break;
  case 'sr_Cyrl_ME':
  case 'sr-Cyrl-ME':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Cyrl_ME;
    break;
  case 'sr_Cyrl_RS':
  case 'sr-Cyrl-RS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Cyrl_RS;
    break;
  case 'sr_Cyrl_XK':
  case 'sr-Cyrl-XK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Cyrl_XK;
    break;
  case 'sr_Latn_BA':
  case 'sr-Latn-BA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Latn_BA;
    break;
  case 'sr_Latn_ME':
  case 'sr-Latn-ME':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Latn_ME;
    break;
  case 'sr_Latn_RS':
  case 'sr-Latn-RS':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Latn_RS;
    break;
  case 'sr_Latn_XK':
  case 'sr-Latn-XK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sr_Latn_XK;
    break;
  case 'sv_AX':
  case 'sv-AX':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sv_AX;
    break;
  case 'sv_FI':
  case 'sv-FI':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sv_FI;
    break;
  case 'sv_SE':
  case 'sv-SE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sv_SE;
    break;
  case 'sw_CD':
  case 'sw-CD':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sw_CD;
    break;
  case 'sw_KE':
  case 'sw-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sw_KE;
    break;
  case 'sw_TZ':
  case 'sw-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sw_TZ;
    break;
  case 'sw_UG':
  case 'sw-UG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_sw_UG;
    break;
  case 'ta_IN':
  case 'ta-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ta_IN;
    break;
  case 'ta_LK':
  case 'ta-LK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ta_LK;
    break;
  case 'ta_MY':
  case 'ta-MY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ta_MY;
    break;
  case 'ta_SG':
  case 'ta-SG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ta_SG;
    break;
  case 'te_IN':
  case 'te-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_te_IN;
    break;
  case 'teo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_teo;
    break;
  case 'teo_KE':
  case 'teo-KE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_teo_KE;
    break;
  case 'teo_UG':
  case 'teo-UG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_teo_UG;
    break;
  case 'tg':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tg;
    break;
  case 'tg_TJ':
  case 'tg-TJ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tg_TJ;
    break;
  case 'th_TH':
  case 'th-TH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_th_TH;
    break;
  case 'ti':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ti;
    break;
  case 'ti_ER':
  case 'ti-ER':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ti_ER;
    break;
  case 'ti_ET':
  case 'ti-ET':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ti_ET;
    break;
  case 'tk':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tk;
    break;
  case 'tk_TM':
  case 'tk-TM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tk_TM;
    break;
  case 'to':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_to;
    break;
  case 'to_TO':
  case 'to-TO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_to_TO;
    break;
  case 'tr_CY':
  case 'tr-CY':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tr_CY;
    break;
  case 'tr_TR':
  case 'tr-TR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tr_TR;
    break;
  case 'tt':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tt;
    break;
  case 'tt_RU':
  case 'tt-RU':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tt_RU;
    break;
  case 'twq':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_twq;
    break;
  case 'twq_NE':
  case 'twq-NE':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_twq_NE;
    break;
  case 'tzm':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tzm;
    break;
  case 'tzm_MA':
  case 'tzm-MA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_tzm_MA;
    break;
  case 'ug':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ug;
    break;
  case 'ug_CN':
  case 'ug-CN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ug_CN;
    break;
  case 'uk_UA':
  case 'uk-UA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_uk_UA;
    break;
  case 'ur_IN':
  case 'ur-IN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ur_IN;
    break;
  case 'ur_PK':
  case 'ur-PK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_ur_PK;
    break;
  case 'uz_Arab':
  case 'uz-Arab':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_uz_Arab;
    break;
  case 'uz_Arab_AF':
  case 'uz-Arab-AF':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_uz_Arab_AF;
    break;
  case 'uz_Cyrl':
  case 'uz-Cyrl':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_uz_Cyrl;
    break;
  case 'uz_Cyrl_UZ':
  case 'uz-Cyrl-UZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_uz_Cyrl_UZ;
    break;
  case 'uz_Latn':
  case 'uz-Latn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_uz_Latn;
    break;
  case 'uz_Latn_UZ':
  case 'uz-Latn-UZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_uz_Latn_UZ;
    break;
  case 'vai':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vai;
    break;
  case 'vai_Latn':
  case 'vai-Latn':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vai_Latn;
    break;
  case 'vai_Latn_LR':
  case 'vai-Latn-LR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vai_Latn_LR;
    break;
  case 'vai_Vaii':
  case 'vai-Vaii':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vai_Vaii;
    break;
  case 'vai_Vaii_LR':
  case 'vai-Vaii-LR':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vai_Vaii_LR;
    break;
  case 'vi_VN':
  case 'vi-VN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vi_VN;
    break;
  case 'vun':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vun;
    break;
  case 'vun_TZ':
  case 'vun-TZ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_vun_TZ;
    break;
  case 'wae':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_wae;
    break;
  case 'wae_CH':
  case 'wae-CH':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_wae_CH;
    break;
  case 'wo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_wo;
    break;
  case 'wo_SN':
  case 'wo-SN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_wo_SN;
    break;
  case 'xh':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_xh;
    break;
  case 'xh_ZA':
  case 'xh-ZA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_xh_ZA;
    break;
  case 'xog':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_xog;
    break;
  case 'xog_UG':
  case 'xog-UG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_xog_UG;
    break;
  case 'yav':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yav;
    break;
  case 'yav_CM':
  case 'yav-CM':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yav_CM;
    break;
  case 'yi':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yi;
    break;
  case 'yi_001':
  case 'yi-001':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yi_001;
    break;
  case 'yo':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yo;
    break;
  case 'yo_BJ':
  case 'yo-BJ':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yo_BJ;
    break;
  case 'yo_NG':
  case 'yo-NG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yo_NG;
    break;
  case 'yue':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yue;
    break;
  case 'yue_Hans':
  case 'yue-Hans':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yue_Hans;
    break;
  case 'yue_Hans_CN':
  case 'yue-Hans-CN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yue_Hans_CN;
    break;
  case 'yue_Hant':
  case 'yue-Hant':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yue_Hant;
    break;
  case 'yue_Hant_HK':
  case 'yue-Hant-HK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_yue_Hant_HK;
    break;
  case 'zgh':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zgh;
    break;
  case 'zgh_MA':
  case 'zgh-MA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zgh_MA;
    break;
  case 'zh_Hans':
  case 'zh-Hans':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hans;
    break;
  case 'zh_Hans_CN':
  case 'zh-Hans-CN':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hans_CN;
    break;
  case 'zh_Hans_HK':
  case 'zh-Hans-HK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hans_HK;
    break;
  case 'zh_Hans_MO':
  case 'zh-Hans-MO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hans_MO;
    break;
  case 'zh_Hans_SG':
  case 'zh-Hans-SG':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hans_SG;
    break;
  case 'zh_Hant':
  case 'zh-Hant':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hant;
    break;
  case 'zh_Hant_HK':
  case 'zh-Hant-HK':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hant_HK;
    break;
  case 'zh_Hant_MO':
  case 'zh-Hant-MO':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hant_MO;
    break;
  case 'zh_Hant_TW':
  case 'zh-Hant-TW':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zh_Hant_TW;
    break;
  case 'zu_ZA':
  case 'zu-ZA':
    goog.i18n.DateTimeSymbols = goog.i18n.DateTimeSymbols_zu_ZA;
    break;
}
