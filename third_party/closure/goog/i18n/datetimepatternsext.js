// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Extended date/time patterns.
 *
 * This file is generated using ICU's implementation of
 * DateTimePatternGenerator. The whole set has two files:
 * datetimepatterns.js and datetimepatternsext.js. The former covers
 * frequently used locales, the latter covers the rest. There won't be any
 * difference in compiled code, but some developing environments have
 * difficulty in dealing large js files. So we do the separation.

 * Only locales that can be enumerated in ICU are supported. For the rest
 * of the locales, it will fallback to 'en'.
 * The code is designed to work with Closure compiler using
 * ADVANCED_OPTIMIZATIONS. We will continue to add popular date/time
 * patterns over time. There is no intention cover all possible
 * usages. If simple pattern works fine, it won't be covered here either.
 * For example, pattern 'MMM' will work well to get short month name for
 * almost all locales thus won't be included here.
 */

goog.provide('goog.i18n.DateTimePatternsExt');

goog.provide('goog.i18n.DateTimePatterns_af');
goog.provide('goog.i18n.DateTimePatterns_af_NA');
goog.provide('goog.i18n.DateTimePatterns_af_ZA');
goog.provide('goog.i18n.DateTimePatterns_ak');
goog.provide('goog.i18n.DateTimePatterns_ak_GH');
goog.provide('goog.i18n.DateTimePatterns_am_ET');
goog.provide('goog.i18n.DateTimePatterns_ar_AE');
goog.provide('goog.i18n.DateTimePatterns_ar_BH');
goog.provide('goog.i18n.DateTimePatterns_ar_DZ');
goog.provide('goog.i18n.DateTimePatterns_ar_EG');
goog.provide('goog.i18n.DateTimePatterns_ar_IQ');
goog.provide('goog.i18n.DateTimePatterns_ar_JO');
goog.provide('goog.i18n.DateTimePatterns_ar_KW');
goog.provide('goog.i18n.DateTimePatterns_ar_LB');
goog.provide('goog.i18n.DateTimePatterns_ar_LY');
goog.provide('goog.i18n.DateTimePatterns_ar_MA');
goog.provide('goog.i18n.DateTimePatterns_ar_OM');
goog.provide('goog.i18n.DateTimePatterns_ar_QA');
goog.provide('goog.i18n.DateTimePatterns_ar_SA');
goog.provide('goog.i18n.DateTimePatterns_ar_SD');
goog.provide('goog.i18n.DateTimePatterns_ar_SY');
goog.provide('goog.i18n.DateTimePatterns_ar_TN');
goog.provide('goog.i18n.DateTimePatterns_ar_YE');
goog.provide('goog.i18n.DateTimePatterns_as');
goog.provide('goog.i18n.DateTimePatterns_as_IN');
goog.provide('goog.i18n.DateTimePatterns_asa');
goog.provide('goog.i18n.DateTimePatterns_asa_TZ');
goog.provide('goog.i18n.DateTimePatterns_az');
goog.provide('goog.i18n.DateTimePatterns_az_Cyrl');
goog.provide('goog.i18n.DateTimePatterns_az_Cyrl_AZ');
goog.provide('goog.i18n.DateTimePatterns_az_Latn');
goog.provide('goog.i18n.DateTimePatterns_az_Latn_AZ');
goog.provide('goog.i18n.DateTimePatterns_be');
goog.provide('goog.i18n.DateTimePatterns_be_BY');
goog.provide('goog.i18n.DateTimePatterns_bem');
goog.provide('goog.i18n.DateTimePatterns_bem_ZM');
goog.provide('goog.i18n.DateTimePatterns_bez');
goog.provide('goog.i18n.DateTimePatterns_bez_TZ');
goog.provide('goog.i18n.DateTimePatterns_bg_BG');
goog.provide('goog.i18n.DateTimePatterns_bm');
goog.provide('goog.i18n.DateTimePatterns_bm_ML');
goog.provide('goog.i18n.DateTimePatterns_bn_BD');
goog.provide('goog.i18n.DateTimePatterns_bn_IN');
goog.provide('goog.i18n.DateTimePatterns_bo');
goog.provide('goog.i18n.DateTimePatterns_bo_CN');
goog.provide('goog.i18n.DateTimePatterns_bo_IN');
goog.provide('goog.i18n.DateTimePatterns_ca_ES');
goog.provide('goog.i18n.DateTimePatterns_cgg');
goog.provide('goog.i18n.DateTimePatterns_cgg_UG');
goog.provide('goog.i18n.DateTimePatterns_chr');
goog.provide('goog.i18n.DateTimePatterns_chr_US');
goog.provide('goog.i18n.DateTimePatterns_cs_CZ');
goog.provide('goog.i18n.DateTimePatterns_cy');
goog.provide('goog.i18n.DateTimePatterns_cy_GB');
goog.provide('goog.i18n.DateTimePatterns_da_DK');
goog.provide('goog.i18n.DateTimePatterns_dav');
goog.provide('goog.i18n.DateTimePatterns_dav_KE');
goog.provide('goog.i18n.DateTimePatterns_de_BE');
goog.provide('goog.i18n.DateTimePatterns_de_DE');
goog.provide('goog.i18n.DateTimePatterns_de_LI');
goog.provide('goog.i18n.DateTimePatterns_de_LU');
goog.provide('goog.i18n.DateTimePatterns_ebu');
goog.provide('goog.i18n.DateTimePatterns_ebu_KE');
goog.provide('goog.i18n.DateTimePatterns_ee');
goog.provide('goog.i18n.DateTimePatterns_ee_GH');
goog.provide('goog.i18n.DateTimePatterns_ee_TG');
goog.provide('goog.i18n.DateTimePatterns_el_CY');
goog.provide('goog.i18n.DateTimePatterns_el_GR');
goog.provide('goog.i18n.DateTimePatterns_en_BE');
goog.provide('goog.i18n.DateTimePatterns_en_BW');
goog.provide('goog.i18n.DateTimePatterns_en_BZ');
goog.provide('goog.i18n.DateTimePatterns_en_CA');
goog.provide('goog.i18n.DateTimePatterns_en_HK');
goog.provide('goog.i18n.DateTimePatterns_en_JM');
goog.provide('goog.i18n.DateTimePatterns_en_MH');
goog.provide('goog.i18n.DateTimePatterns_en_MT');
goog.provide('goog.i18n.DateTimePatterns_en_MU');
goog.provide('goog.i18n.DateTimePatterns_en_NA');
goog.provide('goog.i18n.DateTimePatterns_en_NZ');
goog.provide('goog.i18n.DateTimePatterns_en_PH');
goog.provide('goog.i18n.DateTimePatterns_en_PK');
goog.provide('goog.i18n.DateTimePatterns_en_TT');
goog.provide('goog.i18n.DateTimePatterns_en_US_POSIX');
goog.provide('goog.i18n.DateTimePatterns_en_VI');
goog.provide('goog.i18n.DateTimePatterns_en_ZW');
goog.provide('goog.i18n.DateTimePatterns_eo');
goog.provide('goog.i18n.DateTimePatterns_es_AR');
goog.provide('goog.i18n.DateTimePatterns_es_BO');
goog.provide('goog.i18n.DateTimePatterns_es_CL');
goog.provide('goog.i18n.DateTimePatterns_es_CO');
goog.provide('goog.i18n.DateTimePatterns_es_CR');
goog.provide('goog.i18n.DateTimePatterns_es_DO');
goog.provide('goog.i18n.DateTimePatterns_es_EC');
goog.provide('goog.i18n.DateTimePatterns_es_ES');
goog.provide('goog.i18n.DateTimePatterns_es_GQ');
goog.provide('goog.i18n.DateTimePatterns_es_GT');
goog.provide('goog.i18n.DateTimePatterns_es_HN');
goog.provide('goog.i18n.DateTimePatterns_es_MX');
goog.provide('goog.i18n.DateTimePatterns_es_NI');
goog.provide('goog.i18n.DateTimePatterns_es_PA');
goog.provide('goog.i18n.DateTimePatterns_es_PE');
goog.provide('goog.i18n.DateTimePatterns_es_PR');
goog.provide('goog.i18n.DateTimePatterns_es_PY');
goog.provide('goog.i18n.DateTimePatterns_es_SV');
goog.provide('goog.i18n.DateTimePatterns_es_US');
goog.provide('goog.i18n.DateTimePatterns_es_UY');
goog.provide('goog.i18n.DateTimePatterns_es_VE');
goog.provide('goog.i18n.DateTimePatterns_et_EE');
goog.provide('goog.i18n.DateTimePatterns_eu_ES');
goog.provide('goog.i18n.DateTimePatterns_fa_AF');
goog.provide('goog.i18n.DateTimePatterns_fa_IR');
goog.provide('goog.i18n.DateTimePatterns_ff');
goog.provide('goog.i18n.DateTimePatterns_ff_SN');
goog.provide('goog.i18n.DateTimePatterns_fi_FI');
goog.provide('goog.i18n.DateTimePatterns_fil_PH');
goog.provide('goog.i18n.DateTimePatterns_fo');
goog.provide('goog.i18n.DateTimePatterns_fo_FO');
goog.provide('goog.i18n.DateTimePatterns_fr_BE');
goog.provide('goog.i18n.DateTimePatterns_fr_BL');
goog.provide('goog.i18n.DateTimePatterns_fr_CF');
goog.provide('goog.i18n.DateTimePatterns_fr_CH');
goog.provide('goog.i18n.DateTimePatterns_fr_CI');
goog.provide('goog.i18n.DateTimePatterns_fr_CM');
goog.provide('goog.i18n.DateTimePatterns_fr_FR');
goog.provide('goog.i18n.DateTimePatterns_fr_GN');
goog.provide('goog.i18n.DateTimePatterns_fr_GP');
goog.provide('goog.i18n.DateTimePatterns_fr_LU');
goog.provide('goog.i18n.DateTimePatterns_fr_MC');
goog.provide('goog.i18n.DateTimePatterns_fr_MF');
goog.provide('goog.i18n.DateTimePatterns_fr_MG');
goog.provide('goog.i18n.DateTimePatterns_fr_ML');
goog.provide('goog.i18n.DateTimePatterns_fr_MQ');
goog.provide('goog.i18n.DateTimePatterns_fr_NE');
goog.provide('goog.i18n.DateTimePatterns_fr_RE');
goog.provide('goog.i18n.DateTimePatterns_fr_SN');
goog.provide('goog.i18n.DateTimePatterns_ga');
goog.provide('goog.i18n.DateTimePatterns_ga_IE');
goog.provide('goog.i18n.DateTimePatterns_gl_ES');
goog.provide('goog.i18n.DateTimePatterns_gsw_CH');
goog.provide('goog.i18n.DateTimePatterns_gu_IN');
goog.provide('goog.i18n.DateTimePatterns_guz');
goog.provide('goog.i18n.DateTimePatterns_guz_KE');
goog.provide('goog.i18n.DateTimePatterns_gv');
goog.provide('goog.i18n.DateTimePatterns_gv_GB');
goog.provide('goog.i18n.DateTimePatterns_ha');
goog.provide('goog.i18n.DateTimePatterns_ha_Latn');
goog.provide('goog.i18n.DateTimePatterns_ha_Latn_GH');
goog.provide('goog.i18n.DateTimePatterns_ha_Latn_NE');
goog.provide('goog.i18n.DateTimePatterns_ha_Latn_NG');
goog.provide('goog.i18n.DateTimePatterns_haw');
goog.provide('goog.i18n.DateTimePatterns_haw_US');
goog.provide('goog.i18n.DateTimePatterns_he_IL');
goog.provide('goog.i18n.DateTimePatterns_hi_IN');
goog.provide('goog.i18n.DateTimePatterns_hr_HR');
goog.provide('goog.i18n.DateTimePatterns_hu_HU');
goog.provide('goog.i18n.DateTimePatterns_hy');
goog.provide('goog.i18n.DateTimePatterns_hy_AM');
goog.provide('goog.i18n.DateTimePatterns_id_ID');
goog.provide('goog.i18n.DateTimePatterns_ig');
goog.provide('goog.i18n.DateTimePatterns_ig_NG');
goog.provide('goog.i18n.DateTimePatterns_ii');
goog.provide('goog.i18n.DateTimePatterns_ii_CN');
goog.provide('goog.i18n.DateTimePatterns_is_IS');
goog.provide('goog.i18n.DateTimePatterns_it_CH');
goog.provide('goog.i18n.DateTimePatterns_it_IT');
goog.provide('goog.i18n.DateTimePatterns_ja_JP');
goog.provide('goog.i18n.DateTimePatterns_jmc');
goog.provide('goog.i18n.DateTimePatterns_jmc_TZ');
goog.provide('goog.i18n.DateTimePatterns_ka');
goog.provide('goog.i18n.DateTimePatterns_ka_GE');
goog.provide('goog.i18n.DateTimePatterns_kab');
goog.provide('goog.i18n.DateTimePatterns_kab_DZ');
goog.provide('goog.i18n.DateTimePatterns_kam');
goog.provide('goog.i18n.DateTimePatterns_kam_KE');
goog.provide('goog.i18n.DateTimePatterns_kde');
goog.provide('goog.i18n.DateTimePatterns_kde_TZ');
goog.provide('goog.i18n.DateTimePatterns_kea');
goog.provide('goog.i18n.DateTimePatterns_kea_CV');
goog.provide('goog.i18n.DateTimePatterns_khq');
goog.provide('goog.i18n.DateTimePatterns_khq_ML');
goog.provide('goog.i18n.DateTimePatterns_ki');
goog.provide('goog.i18n.DateTimePatterns_ki_KE');
goog.provide('goog.i18n.DateTimePatterns_kk');
goog.provide('goog.i18n.DateTimePatterns_kk_Cyrl');
goog.provide('goog.i18n.DateTimePatterns_kk_Cyrl_KZ');
goog.provide('goog.i18n.DateTimePatterns_kl');
goog.provide('goog.i18n.DateTimePatterns_kl_GL');
goog.provide('goog.i18n.DateTimePatterns_kln');
goog.provide('goog.i18n.DateTimePatterns_kln_KE');
goog.provide('goog.i18n.DateTimePatterns_km');
goog.provide('goog.i18n.DateTimePatterns_km_KH');
goog.provide('goog.i18n.DateTimePatterns_kn_IN');
goog.provide('goog.i18n.DateTimePatterns_ko_KR');
goog.provide('goog.i18n.DateTimePatterns_kok');
goog.provide('goog.i18n.DateTimePatterns_kok_IN');
goog.provide('goog.i18n.DateTimePatterns_kw');
goog.provide('goog.i18n.DateTimePatterns_kw_GB');
goog.provide('goog.i18n.DateTimePatterns_lag');
goog.provide('goog.i18n.DateTimePatterns_lag_TZ');
goog.provide('goog.i18n.DateTimePatterns_lg');
goog.provide('goog.i18n.DateTimePatterns_lg_UG');
goog.provide('goog.i18n.DateTimePatterns_lt_LT');
goog.provide('goog.i18n.DateTimePatterns_luo');
goog.provide('goog.i18n.DateTimePatterns_luo_KE');
goog.provide('goog.i18n.DateTimePatterns_luy');
goog.provide('goog.i18n.DateTimePatterns_luy_KE');
goog.provide('goog.i18n.DateTimePatterns_lv_LV');
goog.provide('goog.i18n.DateTimePatterns_mas');
goog.provide('goog.i18n.DateTimePatterns_mas_KE');
goog.provide('goog.i18n.DateTimePatterns_mas_TZ');
goog.provide('goog.i18n.DateTimePatterns_mer');
goog.provide('goog.i18n.DateTimePatterns_mer_KE');
goog.provide('goog.i18n.DateTimePatterns_mfe');
goog.provide('goog.i18n.DateTimePatterns_mfe_MU');
goog.provide('goog.i18n.DateTimePatterns_mg');
goog.provide('goog.i18n.DateTimePatterns_mg_MG');
goog.provide('goog.i18n.DateTimePatterns_mk');
goog.provide('goog.i18n.DateTimePatterns_mk_MK');
goog.provide('goog.i18n.DateTimePatterns_ml_IN');
goog.provide('goog.i18n.DateTimePatterns_mr_IN');
goog.provide('goog.i18n.DateTimePatterns_ms_BN');
goog.provide('goog.i18n.DateTimePatterns_ms_MY');
goog.provide('goog.i18n.DateTimePatterns_mt_MT');
goog.provide('goog.i18n.DateTimePatterns_naq');
goog.provide('goog.i18n.DateTimePatterns_naq_NA');
goog.provide('goog.i18n.DateTimePatterns_nb');
goog.provide('goog.i18n.DateTimePatterns_nb_NO');
goog.provide('goog.i18n.DateTimePatterns_nd');
goog.provide('goog.i18n.DateTimePatterns_nd_ZW');
goog.provide('goog.i18n.DateTimePatterns_ne');
goog.provide('goog.i18n.DateTimePatterns_ne_IN');
goog.provide('goog.i18n.DateTimePatterns_ne_NP');
goog.provide('goog.i18n.DateTimePatterns_nl_BE');
goog.provide('goog.i18n.DateTimePatterns_nl_NL');
goog.provide('goog.i18n.DateTimePatterns_nn');
goog.provide('goog.i18n.DateTimePatterns_nn_NO');
goog.provide('goog.i18n.DateTimePatterns_nyn');
goog.provide('goog.i18n.DateTimePatterns_nyn_UG');
goog.provide('goog.i18n.DateTimePatterns_om');
goog.provide('goog.i18n.DateTimePatterns_om_ET');
goog.provide('goog.i18n.DateTimePatterns_om_KE');
goog.provide('goog.i18n.DateTimePatterns_or_IN');
goog.provide('goog.i18n.DateTimePatterns_pa');
goog.provide('goog.i18n.DateTimePatterns_pa_Arab');
goog.provide('goog.i18n.DateTimePatterns_pa_Arab_PK');
goog.provide('goog.i18n.DateTimePatterns_pa_Guru');
goog.provide('goog.i18n.DateTimePatterns_pa_Guru_IN');
goog.provide('goog.i18n.DateTimePatterns_pl_PL');
goog.provide('goog.i18n.DateTimePatterns_ps');
goog.provide('goog.i18n.DateTimePatterns_ps_AF');
goog.provide('goog.i18n.DateTimePatterns_pt_GW');
goog.provide('goog.i18n.DateTimePatterns_pt_MZ');
goog.provide('goog.i18n.DateTimePatterns_rm');
goog.provide('goog.i18n.DateTimePatterns_rm_CH');
goog.provide('goog.i18n.DateTimePatterns_ro_MD');
goog.provide('goog.i18n.DateTimePatterns_ro_RO');
goog.provide('goog.i18n.DateTimePatterns_rof');
goog.provide('goog.i18n.DateTimePatterns_rof_TZ');
goog.provide('goog.i18n.DateTimePatterns_ru_MD');
goog.provide('goog.i18n.DateTimePatterns_ru_RU');
goog.provide('goog.i18n.DateTimePatterns_ru_UA');
goog.provide('goog.i18n.DateTimePatterns_rw');
goog.provide('goog.i18n.DateTimePatterns_rw_RW');
goog.provide('goog.i18n.DateTimePatterns_rwk');
goog.provide('goog.i18n.DateTimePatterns_rwk_TZ');
goog.provide('goog.i18n.DateTimePatterns_saq');
goog.provide('goog.i18n.DateTimePatterns_saq_KE');
goog.provide('goog.i18n.DateTimePatterns_seh');
goog.provide('goog.i18n.DateTimePatterns_seh_MZ');
goog.provide('goog.i18n.DateTimePatterns_ses');
goog.provide('goog.i18n.DateTimePatterns_ses_ML');
goog.provide('goog.i18n.DateTimePatterns_sg');
goog.provide('goog.i18n.DateTimePatterns_sg_CF');
goog.provide('goog.i18n.DateTimePatterns_shi');
goog.provide('goog.i18n.DateTimePatterns_shi_Latn');
goog.provide('goog.i18n.DateTimePatterns_shi_Latn_MA');
goog.provide('goog.i18n.DateTimePatterns_shi_Tfng');
goog.provide('goog.i18n.DateTimePatterns_shi_Tfng_MA');
goog.provide('goog.i18n.DateTimePatterns_si');
goog.provide('goog.i18n.DateTimePatterns_si_LK');
goog.provide('goog.i18n.DateTimePatterns_sk_SK');
goog.provide('goog.i18n.DateTimePatterns_sl_SI');
goog.provide('goog.i18n.DateTimePatterns_sn');
goog.provide('goog.i18n.DateTimePatterns_sn_ZW');
goog.provide('goog.i18n.DateTimePatterns_so');
goog.provide('goog.i18n.DateTimePatterns_so_DJ');
goog.provide('goog.i18n.DateTimePatterns_so_ET');
goog.provide('goog.i18n.DateTimePatterns_so_KE');
goog.provide('goog.i18n.DateTimePatterns_so_SO');
goog.provide('goog.i18n.DateTimePatterns_sq_AL');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl_BA');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl_ME');
goog.provide('goog.i18n.DateTimePatterns_sr_Cyrl_RS');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn_BA');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn_ME');
goog.provide('goog.i18n.DateTimePatterns_sr_Latn_RS');
goog.provide('goog.i18n.DateTimePatterns_sv_FI');
goog.provide('goog.i18n.DateTimePatterns_sv_SE');
goog.provide('goog.i18n.DateTimePatterns_sw_KE');
goog.provide('goog.i18n.DateTimePatterns_sw_TZ');
goog.provide('goog.i18n.DateTimePatterns_ta_IN');
goog.provide('goog.i18n.DateTimePatterns_ta_LK');
goog.provide('goog.i18n.DateTimePatterns_te_IN');
goog.provide('goog.i18n.DateTimePatterns_teo');
goog.provide('goog.i18n.DateTimePatterns_teo_KE');
goog.provide('goog.i18n.DateTimePatterns_teo_UG');
goog.provide('goog.i18n.DateTimePatterns_th_TH');
goog.provide('goog.i18n.DateTimePatterns_ti');
goog.provide('goog.i18n.DateTimePatterns_ti_ER');
goog.provide('goog.i18n.DateTimePatterns_ti_ET');
goog.provide('goog.i18n.DateTimePatterns_tl_PH');
goog.provide('goog.i18n.DateTimePatterns_to');
goog.provide('goog.i18n.DateTimePatterns_to_TO');
goog.provide('goog.i18n.DateTimePatterns_tr_TR');
goog.provide('goog.i18n.DateTimePatterns_tzm');
goog.provide('goog.i18n.DateTimePatterns_tzm_Latn');
goog.provide('goog.i18n.DateTimePatterns_tzm_Latn_MA');
goog.provide('goog.i18n.DateTimePatterns_uk_UA');
goog.provide('goog.i18n.DateTimePatterns_ur_IN');
goog.provide('goog.i18n.DateTimePatterns_ur_PK');
goog.provide('goog.i18n.DateTimePatterns_uz');
goog.provide('goog.i18n.DateTimePatterns_uz_Arab');
goog.provide('goog.i18n.DateTimePatterns_uz_Arab_AF');
goog.provide('goog.i18n.DateTimePatterns_uz_Cyrl');
goog.provide('goog.i18n.DateTimePatterns_uz_Cyrl_UZ');
goog.provide('goog.i18n.DateTimePatterns_uz_Latn');
goog.provide('goog.i18n.DateTimePatterns_uz_Latn_UZ');
goog.provide('goog.i18n.DateTimePatterns_vi_VN');
goog.provide('goog.i18n.DateTimePatterns_vun');
goog.provide('goog.i18n.DateTimePatterns_vun_TZ');
goog.provide('goog.i18n.DateTimePatterns_xog');
goog.provide('goog.i18n.DateTimePatterns_xog_UG');
goog.provide('goog.i18n.DateTimePatterns_yo');
goog.provide('goog.i18n.DateTimePatterns_yo_NG');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans_CN');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans_HK');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans_MO');
goog.provide('goog.i18n.DateTimePatterns_zh_Hans_SG');
goog.provide('goog.i18n.DateTimePatterns_zh_Hant');
goog.provide('goog.i18n.DateTimePatterns_zh_Hant_HK');
goog.provide('goog.i18n.DateTimePatterns_zh_Hant_MO');
goog.provide('goog.i18n.DateTimePatterns_zh_Hant_TW');
goog.provide('goog.i18n.DateTimePatterns_zu');
goog.provide('goog.i18n.DateTimePatterns_zu_ZA');

goog.require('goog.i18n.DateTimePatterns');


/**
 * Extended set of localized date/time patterns for locale af.
 */
goog.i18n.DateTimePatterns_af = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale af_NA.
 */
goog.i18n.DateTimePatterns_af_NA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale af_ZA.
 */
goog.i18n.DateTimePatterns_af_ZA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ak.
 */
goog.i18n.DateTimePatterns_ak = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM yyyy',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ak_GH.
 */
goog.i18n.DateTimePatterns_ak_GH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM yyyy',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale am_ET.
 */
goog.i18n.DateTimePatterns_am_ET = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_AE.
 */
goog.i18n.DateTimePatterns_ar_AE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_BH.
 */
goog.i18n.DateTimePatterns_ar_BH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_DZ.
 */
goog.i18n.DateTimePatterns_ar_DZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_EG.
 */
goog.i18n.DateTimePatterns_ar_EG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_IQ.
 */
goog.i18n.DateTimePatterns_ar_IQ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_JO.
 */
goog.i18n.DateTimePatterns_ar_JO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_KW.
 */
goog.i18n.DateTimePatterns_ar_KW = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_LB.
 */
goog.i18n.DateTimePatterns_ar_LB = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_LY.
 */
goog.i18n.DateTimePatterns_ar_LY = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_MA.
 */
goog.i18n.DateTimePatterns_ar_MA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_OM.
 */
goog.i18n.DateTimePatterns_ar_OM = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_QA.
 */
goog.i18n.DateTimePatterns_ar_QA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_SA.
 */
goog.i18n.DateTimePatterns_ar_SA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_SD.
 */
goog.i18n.DateTimePatterns_ar_SD = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_SY.
 */
goog.i18n.DateTimePatterns_ar_SY = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_TN.
 */
goog.i18n.DateTimePatterns_ar_TN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ar_YE.
 */
goog.i18n.DateTimePatterns_ar_YE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale as.
 */
goog.i18n.DateTimePatterns_as = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale as_IN.
 */
goog.i18n.DateTimePatterns_as_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale asa.
 */
goog.i18n.DateTimePatterns_asa = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale asa_TZ.
 */
goog.i18n.DateTimePatterns_asa_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale az.
 */
goog.i18n.DateTimePatterns_az = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale az_Cyrl.
 */
goog.i18n.DateTimePatterns_az_Cyrl = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale az_Cyrl_AZ.
 */
goog.i18n.DateTimePatterns_az_Cyrl_AZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale az_Latn.
 */
goog.i18n.DateTimePatterns_az_Latn = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale az_Latn_AZ.
 */
goog.i18n.DateTimePatterns_az_Latn_AZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale be.
 */
goog.i18n.DateTimePatterns_be = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale be_BY.
 */
goog.i18n.DateTimePatterns_be_BY = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bem.
 */
goog.i18n.DateTimePatterns_bem = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bem_ZM.
 */
goog.i18n.DateTimePatterns_bem_ZM = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bez.
 */
goog.i18n.DateTimePatterns_bez = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bez_TZ.
 */
goog.i18n.DateTimePatterns_bez_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bg_BG.
 */
goog.i18n.DateTimePatterns_bg_BG = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bm.
 */
goog.i18n.DateTimePatterns_bm = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bm_ML.
 */
goog.i18n.DateTimePatterns_bm_ML = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bn_BD.
 */
goog.i18n.DateTimePatterns_bn_BD = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bn_IN.
 */
goog.i18n.DateTimePatterns_bn_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bo.
 */
goog.i18n.DateTimePatterns_bo = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bo_CN.
 */
goog.i18n.DateTimePatterns_bo_CN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale bo_IN.
 */
goog.i18n.DateTimePatterns_bo_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ca_ES.
 */
goog.i18n.DateTimePatterns_ca_ES = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale cgg.
 */
goog.i18n.DateTimePatterns_cgg = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale cgg_UG.
 */
goog.i18n.DateTimePatterns_cgg_UG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale chr.
 */
goog.i18n.DateTimePatterns_chr = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale chr_US.
 */
goog.i18n.DateTimePatterns_chr_US = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale cs_CZ.
 */
goog.i18n.DateTimePatterns_cs_CZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale cy.
 */
goog.i18n.DateTimePatterns_cy = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale cy_GB.
 */
goog.i18n.DateTimePatterns_cy_GB = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale da_DK.
 */
goog.i18n.DateTimePatterns_da_DK = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd.'
};


/**
 * Extended set of localized date/time patterns for locale dav.
 */
goog.i18n.DateTimePatterns_dav = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale dav_KE.
 */
goog.i18n.DateTimePatterns_dav_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale de_BE.
 */
goog.i18n.DateTimePatterns_de_BE = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale de_DE.
 */
goog.i18n.DateTimePatterns_de_DE = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale de_LI.
 */
goog.i18n.DateTimePatterns_de_LI = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale de_LU.
 */
goog.i18n.DateTimePatterns_de_LU = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ebu.
 */
goog.i18n.DateTimePatterns_ebu = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ebu_KE.
 */
goog.i18n.DateTimePatterns_ebu_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ee.
 */
goog.i18n.DateTimePatterns_ee = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ee_GH.
 */
goog.i18n.DateTimePatterns_ee_GH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ee_TG.
 */
goog.i18n.DateTimePatterns_ee_TG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale el_CY.
 */
goog.i18n.DateTimePatterns_el_CY = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale el_GR.
 */
goog.i18n.DateTimePatterns_el_GR = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_BE.
 */
goog.i18n.DateTimePatterns_en_BE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_BW.
 */
goog.i18n.DateTimePatterns_en_BW = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_BZ.
 */
goog.i18n.DateTimePatterns_en_BZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_CA.
 */
goog.i18n.DateTimePatterns_en_CA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM-y',
  YEAR_MONTH_FULL: 'MMMM-yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_HK.
 */
goog.i18n.DateTimePatterns_en_HK = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_JM.
 */
goog.i18n.DateTimePatterns_en_JM = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_MH.
 */
goog.i18n.DateTimePatterns_en_MH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_MT.
 */
goog.i18n.DateTimePatterns_en_MT = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_MU.
 */
goog.i18n.DateTimePatterns_en_MU = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_NA.
 */
goog.i18n.DateTimePatterns_en_NA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_NZ.
 */
goog.i18n.DateTimePatterns_en_NZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_PH.
 */
goog.i18n.DateTimePatterns_en_PH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_PK.
 */
goog.i18n.DateTimePatterns_en_PK = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_TT.
 */
goog.i18n.DateTimePatterns_en_TT = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_US_POSIX.
 */
goog.i18n.DateTimePatterns_en_US_POSIX = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_VI.
 */
goog.i18n.DateTimePatterns_en_VI = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale en_ZW.
 */
goog.i18n.DateTimePatterns_en_ZW = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale eo.
 */
goog.i18n.DateTimePatterns_eo = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_AR.
 */
goog.i18n.DateTimePatterns_es_AR = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_BO.
 */
goog.i18n.DateTimePatterns_es_BO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_CL.
 */
goog.i18n.DateTimePatterns_es_CL = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_CO.
 */
goog.i18n.DateTimePatterns_es_CO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_CR.
 */
goog.i18n.DateTimePatterns_es_CR = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_DO.
 */
goog.i18n.DateTimePatterns_es_DO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_EC.
 */
goog.i18n.DateTimePatterns_es_EC = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_ES.
 */
goog.i18n.DateTimePatterns_es_ES = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_GQ.
 */
goog.i18n.DateTimePatterns_es_GQ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_GT.
 */
goog.i18n.DateTimePatterns_es_GT = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_HN.
 */
goog.i18n.DateTimePatterns_es_HN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_MX.
 */
goog.i18n.DateTimePatterns_es_MX = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_NI.
 */
goog.i18n.DateTimePatterns_es_NI = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_PA.
 */
goog.i18n.DateTimePatterns_es_PA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_PE.
 */
goog.i18n.DateTimePatterns_es_PE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_PR.
 */
goog.i18n.DateTimePatterns_es_PR = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_PY.
 */
goog.i18n.DateTimePatterns_es_PY = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_SV.
 */
goog.i18n.DateTimePatterns_es_SV = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_US.
 */
goog.i18n.DateTimePatterns_es_US = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_UY.
 */
goog.i18n.DateTimePatterns_es_UY = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale es_VE.
 */
goog.i18n.DateTimePatterns_es_VE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale et_EE.
 */
goog.i18n.DateTimePatterns_et_EE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale eu_ES.
 */
goog.i18n.DateTimePatterns_eu_ES = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fa_AF.
 */
goog.i18n.DateTimePatterns_fa_AF = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd LLL',
  MONTH_DAY_FULL: 'dd LLLL',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fa_IR.
 */
goog.i18n.DateTimePatterns_fa_IR = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd LLL',
  MONTH_DAY_FULL: 'dd LLLL',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ff.
 */
goog.i18n.DateTimePatterns_ff = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ff_SN.
 */
goog.i18n.DateTimePatterns_ff_SN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fi_FI.
 */
goog.i18n.DateTimePatterns_fi_FI = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fil_PH.
 */
goog.i18n.DateTimePatterns_fil_PH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fo.
 */
goog.i18n.DateTimePatterns_fo = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fo_FO.
 */
goog.i18n.DateTimePatterns_fo_FO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_BE.
 */
goog.i18n.DateTimePatterns_fr_BE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_BL.
 */
goog.i18n.DateTimePatterns_fr_BL = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_CF.
 */
goog.i18n.DateTimePatterns_fr_CF = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_CH.
 */
goog.i18n.DateTimePatterns_fr_CH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_CI.
 */
goog.i18n.DateTimePatterns_fr_CI = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_CM.
 */
goog.i18n.DateTimePatterns_fr_CM = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_FR.
 */
goog.i18n.DateTimePatterns_fr_FR = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_GN.
 */
goog.i18n.DateTimePatterns_fr_GN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_GP.
 */
goog.i18n.DateTimePatterns_fr_GP = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_LU.
 */
goog.i18n.DateTimePatterns_fr_LU = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_MC.
 */
goog.i18n.DateTimePatterns_fr_MC = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_MF.
 */
goog.i18n.DateTimePatterns_fr_MF = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_MG.
 */
goog.i18n.DateTimePatterns_fr_MG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_ML.
 */
goog.i18n.DateTimePatterns_fr_ML = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_MQ.
 */
goog.i18n.DateTimePatterns_fr_MQ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_NE.
 */
goog.i18n.DateTimePatterns_fr_NE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_RE.
 */
goog.i18n.DateTimePatterns_fr_RE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale fr_SN.
 */
goog.i18n.DateTimePatterns_fr_SN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ga.
 */
goog.i18n.DateTimePatterns_ga = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ga_IE.
 */
goog.i18n.DateTimePatterns_ga_IE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale gl_ES.
 */
goog.i18n.DateTimePatterns_gl_ES = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale gsw_CH.
 */
goog.i18n.DateTimePatterns_gsw_CH = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale gu_IN.
 */
goog.i18n.DateTimePatterns_gu_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale guz.
 */
goog.i18n.DateTimePatterns_guz = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale guz_KE.
 */
goog.i18n.DateTimePatterns_guz_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale gv.
 */
goog.i18n.DateTimePatterns_gv = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale gv_GB.
 */
goog.i18n.DateTimePatterns_gv_GB = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ha.
 */
goog.i18n.DateTimePatterns_ha = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ha_Latn.
 */
goog.i18n.DateTimePatterns_ha_Latn = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ha_Latn_GH.
 */
goog.i18n.DateTimePatterns_ha_Latn_GH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ha_Latn_NE.
 */
goog.i18n.DateTimePatterns_ha_Latn_NE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ha_Latn_NG.
 */
goog.i18n.DateTimePatterns_ha_Latn_NG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale haw.
 */
goog.i18n.DateTimePatterns_haw = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale haw_US.
 */
goog.i18n.DateTimePatterns_haw_US = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale he_IL.
 */
goog.i18n.DateTimePatterns_he_IL = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd בMMM',
  MONTH_DAY_FULL: 'dd בMMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale hi_IN.
 */
goog.i18n.DateTimePatterns_hi_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale hr_HR.
 */
goog.i18n.DateTimePatterns_hr_HR = {
  YEAR_FULL: 'yyyy.',
  YEAR_MONTH_ABBR: 'MMM.y.',
  YEAR_MONTH_FULL: 'MMMM.yyyy.',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd.'
};


/**
 * Extended set of localized date/time patterns for locale hu_HU.
 */
goog.i18n.DateTimePatterns_hu_HU = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y. MMM',
  YEAR_MONTH_FULL: 'y. MMMM',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale hy.
 */
goog.i18n.DateTimePatterns_hy = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale hy_AM.
 */
goog.i18n.DateTimePatterns_hy_AM = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale id_ID.
 */
goog.i18n.DateTimePatterns_id_ID = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ig.
 */
goog.i18n.DateTimePatterns_ig = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ig_NG.
 */
goog.i18n.DateTimePatterns_ig_NG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ii.
 */
goog.i18n.DateTimePatterns_ii = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ii_CN.
 */
goog.i18n.DateTimePatterns_ii_CN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale is_IS.
 */
goog.i18n.DateTimePatterns_is_IS = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale it_CH.
 */
goog.i18n.DateTimePatterns_it_CH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale it_IT.
 */
goog.i18n.DateTimePatterns_it_IT = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ja_JP.
 */
goog.i18n.DateTimePatterns_ja_JP = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'yyyy年M月',
  MONTH_DAY_ABBR: 'M月d日',
  MONTH_DAY_FULL: 'M月dd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale jmc.
 */
goog.i18n.DateTimePatterns_jmc = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale jmc_TZ.
 */
goog.i18n.DateTimePatterns_jmc_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ka.
 */
goog.i18n.DateTimePatterns_ka = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ka_GE.
 */
goog.i18n.DateTimePatterns_ka_GE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kab.
 */
goog.i18n.DateTimePatterns_kab = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kab_DZ.
 */
goog.i18n.DateTimePatterns_kab_DZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kam.
 */
goog.i18n.DateTimePatterns_kam = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kam_KE.
 */
goog.i18n.DateTimePatterns_kam_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kde.
 */
goog.i18n.DateTimePatterns_kde = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kde_TZ.
 */
goog.i18n.DateTimePatterns_kde_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kea.
 */
goog.i18n.DateTimePatterns_kea = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kea_CV.
 */
goog.i18n.DateTimePatterns_kea_CV = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale khq.
 */
goog.i18n.DateTimePatterns_khq = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale khq_ML.
 */
goog.i18n.DateTimePatterns_khq_ML = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ki.
 */
goog.i18n.DateTimePatterns_ki = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ki_KE.
 */
goog.i18n.DateTimePatterns_ki_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kk.
 */
goog.i18n.DateTimePatterns_kk = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kk_Cyrl.
 */
goog.i18n.DateTimePatterns_kk_Cyrl = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kk_Cyrl_KZ.
 */
goog.i18n.DateTimePatterns_kk_Cyrl_KZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kl.
 */
goog.i18n.DateTimePatterns_kl = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kl_GL.
 */
goog.i18n.DateTimePatterns_kl_GL = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kln.
 */
goog.i18n.DateTimePatterns_kln = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kln_KE.
 */
goog.i18n.DateTimePatterns_kln_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale km.
 */
goog.i18n.DateTimePatterns_km = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale km_KH.
 */
goog.i18n.DateTimePatterns_km_KH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kn_IN.
 */
goog.i18n.DateTimePatterns_kn_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ko_KR.
 */
goog.i18n.DateTimePatterns_ko_KR = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y년 MMM',
  YEAR_MONTH_FULL: 'yyyy년 MMMM',
  MONTH_DAY_ABBR: 'MMM d일',
  MONTH_DAY_FULL: 'MMMM dd일',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kok.
 */
goog.i18n.DateTimePatterns_kok = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kok_IN.
 */
goog.i18n.DateTimePatterns_kok_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kw.
 */
goog.i18n.DateTimePatterns_kw = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale kw_GB.
 */
goog.i18n.DateTimePatterns_kw_GB = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale lag.
 */
goog.i18n.DateTimePatterns_lag = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale lag_TZ.
 */
goog.i18n.DateTimePatterns_lag_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale lg.
 */
goog.i18n.DateTimePatterns_lg = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale lg_UG.
 */
goog.i18n.DateTimePatterns_lg_UG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale lt_LT.
 */
goog.i18n.DateTimePatterns_lt_LT = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM-d',
  MONTH_DAY_FULL: 'MMMM-dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale luo.
 */
goog.i18n.DateTimePatterns_luo = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale luo_KE.
 */
goog.i18n.DateTimePatterns_luo_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale luy.
 */
goog.i18n.DateTimePatterns_luy = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale luy_KE.
 */
goog.i18n.DateTimePatterns_luy_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale lv_LV.
 */
goog.i18n.DateTimePatterns_lv_LV = {
  YEAR_FULL: 'y. \'g\'.',
  YEAR_MONTH_ABBR: 'yyyy. \'g\'. MMM',
  YEAR_MONTH_FULL: 'yyyy. \'g\'. MMMM',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mas.
 */
goog.i18n.DateTimePatterns_mas = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mas_KE.
 */
goog.i18n.DateTimePatterns_mas_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mas_TZ.
 */
goog.i18n.DateTimePatterns_mas_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mer.
 */
goog.i18n.DateTimePatterns_mer = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mer_KE.
 */
goog.i18n.DateTimePatterns_mer_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mfe.
 */
goog.i18n.DateTimePatterns_mfe = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mfe_MU.
 */
goog.i18n.DateTimePatterns_mfe_MU = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mg.
 */
goog.i18n.DateTimePatterns_mg = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mg_MG.
 */
goog.i18n.DateTimePatterns_mg_MG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mk.
 */
goog.i18n.DateTimePatterns_mk = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mk_MK.
 */
goog.i18n.DateTimePatterns_mk_MK = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ml_IN.
 */
goog.i18n.DateTimePatterns_ml_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mr_IN.
 */
goog.i18n.DateTimePatterns_mr_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ms_BN.
 */
goog.i18n.DateTimePatterns_ms_BN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ms_MY.
 */
goog.i18n.DateTimePatterns_ms_MY = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale mt_MT.
 */
goog.i18n.DateTimePatterns_mt_MT = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale naq.
 */
goog.i18n.DateTimePatterns_naq = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale naq_NA.
 */
goog.i18n.DateTimePatterns_naq_NA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale nb.
 */
goog.i18n.DateTimePatterns_nb = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd.'
};


/**
 * Extended set of localized date/time patterns for locale nb_NO.
 */
goog.i18n.DateTimePatterns_nb_NO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd.'
};


/**
 * Extended set of localized date/time patterns for locale nd.
 */
goog.i18n.DateTimePatterns_nd = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale nd_ZW.
 */
goog.i18n.DateTimePatterns_nd_ZW = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ne.
 */
goog.i18n.DateTimePatterns_ne = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ne_IN.
 */
goog.i18n.DateTimePatterns_ne_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ne_NP.
 */
goog.i18n.DateTimePatterns_ne_NP = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale nl_BE.
 */
goog.i18n.DateTimePatterns_nl_BE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale nl_NL.
 */
goog.i18n.DateTimePatterns_nl_NL = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale nn.
 */
goog.i18n.DateTimePatterns_nn = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale nn_NO.
 */
goog.i18n.DateTimePatterns_nn_NO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale nyn.
 */
goog.i18n.DateTimePatterns_nyn = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale nyn_UG.
 */
goog.i18n.DateTimePatterns_nyn_UG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale om.
 */
goog.i18n.DateTimePatterns_om = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale om_ET.
 */
goog.i18n.DateTimePatterns_om_ET = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale om_KE.
 */
goog.i18n.DateTimePatterns_om_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale or_IN.
 */
goog.i18n.DateTimePatterns_or_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale pa.
 */
goog.i18n.DateTimePatterns_pa = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale pa_Arab.
 */
goog.i18n.DateTimePatterns_pa_Arab = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale pa_Arab_PK.
 */
goog.i18n.DateTimePatterns_pa_Arab_PK = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale pa_Guru.
 */
goog.i18n.DateTimePatterns_pa_Guru = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale pa_Guru_IN.
 */
goog.i18n.DateTimePatterns_pa_Guru_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale pl_PL.
 */
goog.i18n.DateTimePatterns_pl_PL = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ps.
 */
goog.i18n.DateTimePatterns_ps = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ps_AF.
 */
goog.i18n.DateTimePatterns_ps_AF = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale pt_GW.
 */
goog.i18n.DateTimePatterns_pt_GW = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale pt_MZ.
 */
goog.i18n.DateTimePatterns_pt_MZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' yyyy',
  MONTH_DAY_ABBR: 'd \'de\' MMM',
  MONTH_DAY_FULL: 'dd \'de\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale rm.
 */
goog.i18n.DateTimePatterns_rm = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale rm_CH.
 */
goog.i18n.DateTimePatterns_rm_CH = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ro_MD.
 */
goog.i18n.DateTimePatterns_ro_MD = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ro_RO.
 */
goog.i18n.DateTimePatterns_ro_RO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale rof.
 */
goog.i18n.DateTimePatterns_rof = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale rof_TZ.
 */
goog.i18n.DateTimePatterns_rof_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ru_MD.
 */
goog.i18n.DateTimePatterns_ru_MD = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ru_RU.
 */
goog.i18n.DateTimePatterns_ru_RU = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ru_UA.
 */
goog.i18n.DateTimePatterns_ru_UA = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale rw.
 */
goog.i18n.DateTimePatterns_rw = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale rw_RW.
 */
goog.i18n.DateTimePatterns_rw_RW = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale rwk.
 */
goog.i18n.DateTimePatterns_rwk = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale rwk_TZ.
 */
goog.i18n.DateTimePatterns_rwk_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale saq.
 */
goog.i18n.DateTimePatterns_saq = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale saq_KE.
 */
goog.i18n.DateTimePatterns_saq_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale seh.
 */
goog.i18n.DateTimePatterns_seh = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale seh_MZ.
 */
goog.i18n.DateTimePatterns_seh_MZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM \'de\' y',
  YEAR_MONTH_FULL: 'MMMM \'de\' yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ses.
 */
goog.i18n.DateTimePatterns_ses = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ses_ML.
 */
goog.i18n.DateTimePatterns_ses_ML = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sg.
 */
goog.i18n.DateTimePatterns_sg = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sg_CF.
 */
goog.i18n.DateTimePatterns_sg_CF = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale shi.
 */
goog.i18n.DateTimePatterns_shi = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale shi_Latn.
 */
goog.i18n.DateTimePatterns_shi_Latn = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale shi_Latn_MA.
 */
goog.i18n.DateTimePatterns_shi_Latn_MA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale shi_Tfng.
 */
goog.i18n.DateTimePatterns_shi_Tfng = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale shi_Tfng_MA.
 */
goog.i18n.DateTimePatterns_shi_Tfng_MA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale si.
 */
goog.i18n.DateTimePatterns_si = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale si_LK.
 */
goog.i18n.DateTimePatterns_si_LK = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sk_SK.
 */
goog.i18n.DateTimePatterns_sk_SK = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL yyyy',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd.'
};


/**
 * Extended set of localized date/time patterns for locale sl_SI.
 */
goog.i18n.DateTimePatterns_sl_SI = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd. MMM',
  MONTH_DAY_FULL: 'dd. MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sn.
 */
goog.i18n.DateTimePatterns_sn = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sn_ZW.
 */
goog.i18n.DateTimePatterns_sn_ZW = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale so.
 */
goog.i18n.DateTimePatterns_so = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale so_DJ.
 */
goog.i18n.DateTimePatterns_so_DJ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale so_ET.
 */
goog.i18n.DateTimePatterns_so_ET = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale so_KE.
 */
goog.i18n.DateTimePatterns_so_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale so_SO.
 */
goog.i18n.DateTimePatterns_so_SO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sq_AL.
 */
goog.i18n.DateTimePatterns_sq_AL = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl.
 */
goog.i18n.DateTimePatterns_sr_Cyrl = {
  YEAR_FULL: 'y.',
  YEAR_MONTH_ABBR: 'MMM. y',
  YEAR_MONTH_FULL: 'MMMM. yyyy',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl_BA.
 */
goog.i18n.DateTimePatterns_sr_Cyrl_BA = {
  YEAR_FULL: 'y.',
  YEAR_MONTH_ABBR: 'MMM. y',
  YEAR_MONTH_FULL: 'MMMM. yyyy',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl_ME.
 */
goog.i18n.DateTimePatterns_sr_Cyrl_ME = {
  YEAR_FULL: 'y.',
  YEAR_MONTH_ABBR: 'MMM. y',
  YEAR_MONTH_FULL: 'MMMM. yyyy',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sr_Cyrl_RS.
 */
goog.i18n.DateTimePatterns_sr_Cyrl_RS = {
  YEAR_FULL: 'y.',
  YEAR_MONTH_ABBR: 'MMM. y',
  YEAR_MONTH_FULL: 'MMMM. yyyy',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sr_Latn.
 */
goog.i18n.DateTimePatterns_sr_Latn = {
  YEAR_FULL: 'y.',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sr_Latn_BA.
 */
goog.i18n.DateTimePatterns_sr_Latn_BA = {
  YEAR_FULL: 'y.',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sr_Latn_ME.
 */
goog.i18n.DateTimePatterns_sr_Latn_ME = {
  YEAR_FULL: 'y.',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sr_Latn_RS.
 */
goog.i18n.DateTimePatterns_sr_Latn_RS = {
  YEAR_FULL: 'y.',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d.',
  MONTH_DAY_FULL: 'MMMM dd.',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sv_FI.
 */
goog.i18n.DateTimePatterns_sv_FI = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'd:\'e\' MMM',
  MONTH_DAY_FULL: 'dd:\'e\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sv_SE.
 */
goog.i18n.DateTimePatterns_sv_SE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'd:\'e\' MMM',
  MONTH_DAY_FULL: 'dd:\'e\' MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sw_KE.
 */
goog.i18n.DateTimePatterns_sw_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale sw_TZ.
 */
goog.i18n.DateTimePatterns_sw_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ta_IN.
 */
goog.i18n.DateTimePatterns_ta_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ta_LK.
 */
goog.i18n.DateTimePatterns_ta_LK = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale te_IN.
 */
goog.i18n.DateTimePatterns_te_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale teo.
 */
goog.i18n.DateTimePatterns_teo = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale teo_KE.
 */
goog.i18n.DateTimePatterns_teo_KE = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale teo_UG.
 */
goog.i18n.DateTimePatterns_teo_UG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale th_TH.
 */
goog.i18n.DateTimePatterns_th_TH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ti.
 */
goog.i18n.DateTimePatterns_ti = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ti_ER.
 */
goog.i18n.DateTimePatterns_ti_ER = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ti_ET.
 */
goog.i18n.DateTimePatterns_ti_ET = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM y',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale tl_PH.
 */
goog.i18n.DateTimePatterns_tl_PH = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale to.
 */
goog.i18n.DateTimePatterns_to = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale to_TO.
 */
goog.i18n.DateTimePatterns_to_TO = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale tr_TR.
 */
goog.i18n.DateTimePatterns_tr_TR = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'dd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale tzm.
 */
goog.i18n.DateTimePatterns_tzm = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale tzm_Latn.
 */
goog.i18n.DateTimePatterns_tzm_Latn = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale tzm_Latn_MA.
 */
goog.i18n.DateTimePatterns_tzm_Latn_MA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale uk_UA.
 */
goog.i18n.DateTimePatterns_uk_UA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'LLL y',
  YEAR_MONTH_FULL: 'LLLL yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ur_IN.
 */
goog.i18n.DateTimePatterns_ur_IN = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale ur_PK.
 */
goog.i18n.DateTimePatterns_ur_PK = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale uz.
 */
goog.i18n.DateTimePatterns_uz = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale uz_Arab.
 */
goog.i18n.DateTimePatterns_uz_Arab = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale uz_Arab_AF.
 */
goog.i18n.DateTimePatterns_uz_Arab_AF = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale uz_Cyrl.
 */
goog.i18n.DateTimePatterns_uz_Cyrl = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale uz_Cyrl_UZ.
 */
goog.i18n.DateTimePatterns_uz_Cyrl_UZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale uz_Latn.
 */
goog.i18n.DateTimePatterns_uz_Latn = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale uz_Latn_UZ.
 */
goog.i18n.DateTimePatterns_uz_Latn_UZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale vi_VN.
 */
goog.i18n.DateTimePatterns_vi_VN = {
  YEAR_FULL: 'y',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'd MMM',
  MONTH_DAY_FULL: 'dd MMMM',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale vun.
 */
goog.i18n.DateTimePatterns_vun = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale vun_TZ.
 */
goog.i18n.DateTimePatterns_vun_TZ = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale xog.
 */
goog.i18n.DateTimePatterns_xog = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale xog_UG.
 */
goog.i18n.DateTimePatterns_xog_UG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale yo.
 */
goog.i18n.DateTimePatterns_yo = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale yo_NG.
 */
goog.i18n.DateTimePatterns_yo_NG = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'MMM y',
  YEAR_MONTH_FULL: 'MMMM yyyy',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hans.
 */
goog.i18n.DateTimePatterns_zh_Hans = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年MMM',
  YEAR_MONTH_FULL: 'yyyy年MMMM',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hans_CN.
 */
goog.i18n.DateTimePatterns_zh_Hans_CN = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年MMM',
  YEAR_MONTH_FULL: 'yyyy年MMMM',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hans_HK.
 */
goog.i18n.DateTimePatterns_zh_Hans_HK = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年MMM',
  YEAR_MONTH_FULL: 'yyyy年MMMM',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hans_MO.
 */
goog.i18n.DateTimePatterns_zh_Hans_MO = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年MMM',
  YEAR_MONTH_FULL: 'yyyy年MMMM',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hans_SG.
 */
goog.i18n.DateTimePatterns_zh_Hans_SG = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年MMM',
  YEAR_MONTH_FULL: 'yyyy年MMMM',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hant.
 */
goog.i18n.DateTimePatterns_zh_Hant = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'yyyy年M月',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hant_HK.
 */
goog.i18n.DateTimePatterns_zh_Hant_HK = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'yyyy年M月',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hant_MO.
 */
goog.i18n.DateTimePatterns_zh_Hant_MO = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'yyyy年M月',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zh_Hant_TW.
 */
goog.i18n.DateTimePatterns_zh_Hant_TW = {
  YEAR_FULL: 'y年',
  YEAR_MONTH_ABBR: 'y年M月',
  YEAR_MONTH_FULL: 'yyyy年M月',
  MONTH_DAY_ABBR: 'MMMd日',
  MONTH_DAY_FULL: 'MMMMdd日',
  DAY_ABBR: 'd日'
};


/**
 * Extended set of localized date/time patterns for locale zu.
 */
goog.i18n.DateTimePatterns_zu = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
 * Extended set of localized date/time patterns for locale zu_ZA.
 */
goog.i18n.DateTimePatterns_zu_ZA = {
  YEAR_FULL: 'yyyy',
  YEAR_MONTH_ABBR: 'y MMM',
  YEAR_MONTH_FULL: 'yyyy MMMM',
  MONTH_DAY_ABBR: 'MMM d',
  MONTH_DAY_FULL: 'MMMM dd',
  DAY_ABBR: 'd'
};


/**
/* Select date/time pattern by locale.
 */
if (goog.LOCALE == 'af') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_af;
}

if (goog.LOCALE == 'af_NA' || goog.LOCALE == 'af-NA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_af_NA;
}

if (goog.LOCALE == 'af_ZA' || goog.LOCALE == 'af-ZA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_af_ZA;
}

if (goog.LOCALE == 'ak') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ak;
}

if (goog.LOCALE == 'ak_GH' || goog.LOCALE == 'ak-GH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ak_GH;
}

if (goog.LOCALE == 'am_ET' || goog.LOCALE == 'am-ET') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_am_ET;
}

if (goog.LOCALE == 'ar_AE' || goog.LOCALE == 'ar-AE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_AE;
}

if (goog.LOCALE == 'ar_BH' || goog.LOCALE == 'ar-BH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_BH;
}

if (goog.LOCALE == 'ar_DZ' || goog.LOCALE == 'ar-DZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_DZ;
}

if (goog.LOCALE == 'ar_EG' || goog.LOCALE == 'ar-EG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_EG;
}

if (goog.LOCALE == 'ar_IQ' || goog.LOCALE == 'ar-IQ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_IQ;
}

if (goog.LOCALE == 'ar_JO' || goog.LOCALE == 'ar-JO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_JO;
}

if (goog.LOCALE == 'ar_KW' || goog.LOCALE == 'ar-KW') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_KW;
}

if (goog.LOCALE == 'ar_LB' || goog.LOCALE == 'ar-LB') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_LB;
}

if (goog.LOCALE == 'ar_LY' || goog.LOCALE == 'ar-LY') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_LY;
}

if (goog.LOCALE == 'ar_MA' || goog.LOCALE == 'ar-MA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_MA;
}

if (goog.LOCALE == 'ar_OM' || goog.LOCALE == 'ar-OM') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_OM;
}

if (goog.LOCALE == 'ar_QA' || goog.LOCALE == 'ar-QA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_QA;
}

if (goog.LOCALE == 'ar_SA' || goog.LOCALE == 'ar-SA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_SA;
}

if (goog.LOCALE == 'ar_SD' || goog.LOCALE == 'ar-SD') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_SD;
}

if (goog.LOCALE == 'ar_SY' || goog.LOCALE == 'ar-SY') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_SY;
}

if (goog.LOCALE == 'ar_TN' || goog.LOCALE == 'ar-TN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_TN;
}

if (goog.LOCALE == 'ar_YE' || goog.LOCALE == 'ar-YE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ar_YE;
}

if (goog.LOCALE == 'as') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_as;
}

if (goog.LOCALE == 'as_IN' || goog.LOCALE == 'as-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_as_IN;
}

if (goog.LOCALE == 'asa') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_asa;
}

if (goog.LOCALE == 'asa_TZ' || goog.LOCALE == 'asa-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_asa_TZ;
}

if (goog.LOCALE == 'az') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az;
}

if (goog.LOCALE == 'az_Cyrl' || goog.LOCALE == 'az-Cyrl') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az_Cyrl;
}

if (goog.LOCALE == 'az_Cyrl_AZ' || goog.LOCALE == 'az-Cyrl-AZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az_Cyrl_AZ;
}

if (goog.LOCALE == 'az_Latn' || goog.LOCALE == 'az-Latn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az_Latn;
}

if (goog.LOCALE == 'az_Latn_AZ' || goog.LOCALE == 'az-Latn-AZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_az_Latn_AZ;
}

if (goog.LOCALE == 'be') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_be;
}

if (goog.LOCALE == 'be_BY' || goog.LOCALE == 'be-BY') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_be_BY;
}

if (goog.LOCALE == 'bem') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bem;
}

if (goog.LOCALE == 'bem_ZM' || goog.LOCALE == 'bem-ZM') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bem_ZM;
}

if (goog.LOCALE == 'bez') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bez;
}

if (goog.LOCALE == 'bez_TZ' || goog.LOCALE == 'bez-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bez_TZ;
}

if (goog.LOCALE == 'bg_BG' || goog.LOCALE == 'bg-BG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bg_BG;
}

if (goog.LOCALE == 'bm') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bm;
}

if (goog.LOCALE == 'bm_ML' || goog.LOCALE == 'bm-ML') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bm_ML;
}

if (goog.LOCALE == 'bn_BD' || goog.LOCALE == 'bn-BD') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bn_BD;
}

if (goog.LOCALE == 'bn_IN' || goog.LOCALE == 'bn-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bn_IN;
}

if (goog.LOCALE == 'bo') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bo;
}

if (goog.LOCALE == 'bo_CN' || goog.LOCALE == 'bo-CN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bo_CN;
}

if (goog.LOCALE == 'bo_IN' || goog.LOCALE == 'bo-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_bo_IN;
}

if (goog.LOCALE == 'ca_ES' || goog.LOCALE == 'ca-ES') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ca_ES;
}

if (goog.LOCALE == 'cgg') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cgg;
}

if (goog.LOCALE == 'cgg_UG' || goog.LOCALE == 'cgg-UG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cgg_UG;
}

if (goog.LOCALE == 'chr') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_chr;
}

if (goog.LOCALE == 'chr_US' || goog.LOCALE == 'chr-US') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_chr_US;
}

if (goog.LOCALE == 'cs_CZ' || goog.LOCALE == 'cs-CZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cs_CZ;
}

if (goog.LOCALE == 'cy') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cy;
}

if (goog.LOCALE == 'cy_GB' || goog.LOCALE == 'cy-GB') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_cy_GB;
}

if (goog.LOCALE == 'da_DK' || goog.LOCALE == 'da-DK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_da_DK;
}

if (goog.LOCALE == 'dav') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dav;
}

if (goog.LOCALE == 'dav_KE' || goog.LOCALE == 'dav-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_dav_KE;
}

if (goog.LOCALE == 'de_BE' || goog.LOCALE == 'de-BE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_BE;
}

if (goog.LOCALE == 'de_DE' || goog.LOCALE == 'de-DE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_DE;
}

if (goog.LOCALE == 'de_LI' || goog.LOCALE == 'de-LI') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_LI;
}

if (goog.LOCALE == 'de_LU' || goog.LOCALE == 'de-LU') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_de_LU;
}

if (goog.LOCALE == 'ebu') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ebu;
}

if (goog.LOCALE == 'ebu_KE' || goog.LOCALE == 'ebu-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ebu_KE;
}

if (goog.LOCALE == 'ee') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ee;
}

if (goog.LOCALE == 'ee_GH' || goog.LOCALE == 'ee-GH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ee_GH;
}

if (goog.LOCALE == 'ee_TG' || goog.LOCALE == 'ee-TG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ee_TG;
}

if (goog.LOCALE == 'el_CY' || goog.LOCALE == 'el-CY') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_el_CY;
}

if (goog.LOCALE == 'el_GR' || goog.LOCALE == 'el-GR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_el_GR;
}

if (goog.LOCALE == 'en_BE' || goog.LOCALE == 'en-BE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BE;
}

if (goog.LOCALE == 'en_BW' || goog.LOCALE == 'en-BW') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BW;
}

if (goog.LOCALE == 'en_BZ' || goog.LOCALE == 'en-BZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_BZ;
}

if (goog.LOCALE == 'en_CA' || goog.LOCALE == 'en-CA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_CA;
}

if (goog.LOCALE == 'en_HK' || goog.LOCALE == 'en-HK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_HK;
}

if (goog.LOCALE == 'en_JM' || goog.LOCALE == 'en-JM') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_JM;
}

if (goog.LOCALE == 'en_MH' || goog.LOCALE == 'en-MH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MH;
}

if (goog.LOCALE == 'en_MT' || goog.LOCALE == 'en-MT') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MT;
}

if (goog.LOCALE == 'en_MU' || goog.LOCALE == 'en-MU') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_MU;
}

if (goog.LOCALE == 'en_NA' || goog.LOCALE == 'en-NA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NA;
}

if (goog.LOCALE == 'en_NZ' || goog.LOCALE == 'en-NZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_NZ;
}

if (goog.LOCALE == 'en_PH' || goog.LOCALE == 'en-PH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_PH;
}

if (goog.LOCALE == 'en_PK' || goog.LOCALE == 'en-PK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_PK;
}

if (goog.LOCALE == 'en_TT' || goog.LOCALE == 'en-TT') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_TT;
}

if (goog.LOCALE == 'en_US_POSIX' || goog.LOCALE == 'en-US-POSIX') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_US_POSIX;
}

if (goog.LOCALE == 'en_VI' || goog.LOCALE == 'en-VI') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_VI;
}

if (goog.LOCALE == 'en_ZW' || goog.LOCALE == 'en-ZW') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_en_ZW;
}

if (goog.LOCALE == 'eo') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_eo;
}

if (goog.LOCALE == 'es_AR' || goog.LOCALE == 'es-AR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_AR;
}

if (goog.LOCALE == 'es_BO' || goog.LOCALE == 'es-BO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_BO;
}

if (goog.LOCALE == 'es_CL' || goog.LOCALE == 'es-CL') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_CL;
}

if (goog.LOCALE == 'es_CO' || goog.LOCALE == 'es-CO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_CO;
}

if (goog.LOCALE == 'es_CR' || goog.LOCALE == 'es-CR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_CR;
}

if (goog.LOCALE == 'es_DO' || goog.LOCALE == 'es-DO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_DO;
}

if (goog.LOCALE == 'es_EC' || goog.LOCALE == 'es-EC') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_EC;
}

if (goog.LOCALE == 'es_ES' || goog.LOCALE == 'es-ES') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_ES;
}

if (goog.LOCALE == 'es_GQ' || goog.LOCALE == 'es-GQ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_GQ;
}

if (goog.LOCALE == 'es_GT' || goog.LOCALE == 'es-GT') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_GT;
}

if (goog.LOCALE == 'es_HN' || goog.LOCALE == 'es-HN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_HN;
}

if (goog.LOCALE == 'es_MX' || goog.LOCALE == 'es-MX') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_MX;
}

if (goog.LOCALE == 'es_NI' || goog.LOCALE == 'es-NI') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_NI;
}

if (goog.LOCALE == 'es_PA' || goog.LOCALE == 'es-PA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PA;
}

if (goog.LOCALE == 'es_PE' || goog.LOCALE == 'es-PE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PE;
}

if (goog.LOCALE == 'es_PR' || goog.LOCALE == 'es-PR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PR;
}

if (goog.LOCALE == 'es_PY' || goog.LOCALE == 'es-PY') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_PY;
}

if (goog.LOCALE == 'es_SV' || goog.LOCALE == 'es-SV') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_SV;
}

if (goog.LOCALE == 'es_US' || goog.LOCALE == 'es-US') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_US;
}

if (goog.LOCALE == 'es_UY' || goog.LOCALE == 'es-UY') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_UY;
}

if (goog.LOCALE == 'es_VE' || goog.LOCALE == 'es-VE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_es_VE;
}

if (goog.LOCALE == 'et_EE' || goog.LOCALE == 'et-EE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_et_EE;
}

if (goog.LOCALE == 'eu_ES' || goog.LOCALE == 'eu-ES') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_eu_ES;
}

if (goog.LOCALE == 'fa_AF' || goog.LOCALE == 'fa-AF') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fa_AF;
}

if (goog.LOCALE == 'fa_IR' || goog.LOCALE == 'fa-IR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fa_IR;
}

if (goog.LOCALE == 'ff') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff;
}

if (goog.LOCALE == 'ff_SN' || goog.LOCALE == 'ff-SN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ff_SN;
}

if (goog.LOCALE == 'fi_FI' || goog.LOCALE == 'fi-FI') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fi_FI;
}

if (goog.LOCALE == 'fil_PH' || goog.LOCALE == 'fil-PH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fil_PH;
}

if (goog.LOCALE == 'fo') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fo;
}

if (goog.LOCALE == 'fo_FO' || goog.LOCALE == 'fo-FO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fo_FO;
}

if (goog.LOCALE == 'fr_BE' || goog.LOCALE == 'fr-BE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_BE;
}

if (goog.LOCALE == 'fr_BL' || goog.LOCALE == 'fr-BL') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_BL;
}

if (goog.LOCALE == 'fr_CF' || goog.LOCALE == 'fr-CF') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CF;
}

if (goog.LOCALE == 'fr_CH' || goog.LOCALE == 'fr-CH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CH;
}

if (goog.LOCALE == 'fr_CI' || goog.LOCALE == 'fr-CI') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CI;
}

if (goog.LOCALE == 'fr_CM' || goog.LOCALE == 'fr-CM') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_CM;
}

if (goog.LOCALE == 'fr_FR' || goog.LOCALE == 'fr-FR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_FR;
}

if (goog.LOCALE == 'fr_GN' || goog.LOCALE == 'fr-GN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_GN;
}

if (goog.LOCALE == 'fr_GP' || goog.LOCALE == 'fr-GP') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_GP;
}

if (goog.LOCALE == 'fr_LU' || goog.LOCALE == 'fr-LU') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_LU;
}

if (goog.LOCALE == 'fr_MC' || goog.LOCALE == 'fr-MC') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MC;
}

if (goog.LOCALE == 'fr_MF' || goog.LOCALE == 'fr-MF') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MF;
}

if (goog.LOCALE == 'fr_MG' || goog.LOCALE == 'fr-MG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MG;
}

if (goog.LOCALE == 'fr_ML' || goog.LOCALE == 'fr-ML') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_ML;
}

if (goog.LOCALE == 'fr_MQ' || goog.LOCALE == 'fr-MQ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_MQ;
}

if (goog.LOCALE == 'fr_NE' || goog.LOCALE == 'fr-NE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_NE;
}

if (goog.LOCALE == 'fr_RE' || goog.LOCALE == 'fr-RE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_RE;
}

if (goog.LOCALE == 'fr_SN' || goog.LOCALE == 'fr-SN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_fr_SN;
}

if (goog.LOCALE == 'ga') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ga;
}

if (goog.LOCALE == 'ga_IE' || goog.LOCALE == 'ga-IE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ga_IE;
}

if (goog.LOCALE == 'gl_ES' || goog.LOCALE == 'gl-ES') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gl_ES;
}

if (goog.LOCALE == 'gsw_CH' || goog.LOCALE == 'gsw-CH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gsw_CH;
}

if (goog.LOCALE == 'gu_IN' || goog.LOCALE == 'gu-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gu_IN;
}

if (goog.LOCALE == 'guz') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_guz;
}

if (goog.LOCALE == 'guz_KE' || goog.LOCALE == 'guz-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_guz_KE;
}

if (goog.LOCALE == 'gv') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gv;
}

if (goog.LOCALE == 'gv_GB' || goog.LOCALE == 'gv-GB') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_gv_GB;
}

if (goog.LOCALE == 'ha') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha;
}

if (goog.LOCALE == 'ha_Latn' || goog.LOCALE == 'ha-Latn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha_Latn;
}

if (goog.LOCALE == 'ha_Latn_GH' || goog.LOCALE == 'ha-Latn-GH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha_Latn_GH;
}

if (goog.LOCALE == 'ha_Latn_NE' || goog.LOCALE == 'ha-Latn-NE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha_Latn_NE;
}

if (goog.LOCALE == 'ha_Latn_NG' || goog.LOCALE == 'ha-Latn-NG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ha_Latn_NG;
}

if (goog.LOCALE == 'haw') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_haw;
}

if (goog.LOCALE == 'haw_US' || goog.LOCALE == 'haw-US') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_haw_US;
}

if (goog.LOCALE == 'he_IL' || goog.LOCALE == 'he-IL') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_he_IL;
}

if (goog.LOCALE == 'hi_IN' || goog.LOCALE == 'hi-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hi_IN;
}

if (goog.LOCALE == 'hr_HR' || goog.LOCALE == 'hr-HR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hr_HR;
}

if (goog.LOCALE == 'hu_HU' || goog.LOCALE == 'hu-HU') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hu_HU;
}

if (goog.LOCALE == 'hy') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hy;
}

if (goog.LOCALE == 'hy_AM' || goog.LOCALE == 'hy-AM') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_hy_AM;
}

if (goog.LOCALE == 'id_ID' || goog.LOCALE == 'id-ID') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_id_ID;
}

if (goog.LOCALE == 'ig') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ig;
}

if (goog.LOCALE == 'ig_NG' || goog.LOCALE == 'ig-NG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ig_NG;
}

if (goog.LOCALE == 'ii') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ii;
}

if (goog.LOCALE == 'ii_CN' || goog.LOCALE == 'ii-CN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ii_CN;
}

if (goog.LOCALE == 'is_IS' || goog.LOCALE == 'is-IS') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_is_IS;
}

if (goog.LOCALE == 'it_CH' || goog.LOCALE == 'it-CH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_it_CH;
}

if (goog.LOCALE == 'it_IT' || goog.LOCALE == 'it-IT') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_it_IT;
}

if (goog.LOCALE == 'ja_JP' || goog.LOCALE == 'ja-JP') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ja_JP;
}

if (goog.LOCALE == 'jmc') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_jmc;
}

if (goog.LOCALE == 'jmc_TZ' || goog.LOCALE == 'jmc-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_jmc_TZ;
}

if (goog.LOCALE == 'ka') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ka;
}

if (goog.LOCALE == 'ka_GE' || goog.LOCALE == 'ka-GE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ka_GE;
}

if (goog.LOCALE == 'kab') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kab;
}

if (goog.LOCALE == 'kab_DZ' || goog.LOCALE == 'kab-DZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kab_DZ;
}

if (goog.LOCALE == 'kam') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kam;
}

if (goog.LOCALE == 'kam_KE' || goog.LOCALE == 'kam-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kam_KE;
}

if (goog.LOCALE == 'kde') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kde;
}

if (goog.LOCALE == 'kde_TZ' || goog.LOCALE == 'kde-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kde_TZ;
}

if (goog.LOCALE == 'kea') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kea;
}

if (goog.LOCALE == 'kea_CV' || goog.LOCALE == 'kea-CV') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kea_CV;
}

if (goog.LOCALE == 'khq') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_khq;
}

if (goog.LOCALE == 'khq_ML' || goog.LOCALE == 'khq-ML') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_khq_ML;
}

if (goog.LOCALE == 'ki') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ki;
}

if (goog.LOCALE == 'ki_KE' || goog.LOCALE == 'ki-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ki_KE;
}

if (goog.LOCALE == 'kk') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kk;
}

if (goog.LOCALE == 'kk_Cyrl' || goog.LOCALE == 'kk-Cyrl') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kk_Cyrl;
}

if (goog.LOCALE == 'kk_Cyrl_KZ' || goog.LOCALE == 'kk-Cyrl-KZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kk_Cyrl_KZ;
}

if (goog.LOCALE == 'kl') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kl;
}

if (goog.LOCALE == 'kl_GL' || goog.LOCALE == 'kl-GL') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kl_GL;
}

if (goog.LOCALE == 'kln') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kln;
}

if (goog.LOCALE == 'kln_KE' || goog.LOCALE == 'kln-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kln_KE;
}

if (goog.LOCALE == 'km') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_km;
}

if (goog.LOCALE == 'km_KH' || goog.LOCALE == 'km-KH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_km_KH;
}

if (goog.LOCALE == 'kn_IN' || goog.LOCALE == 'kn-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kn_IN;
}

if (goog.LOCALE == 'ko_KR' || goog.LOCALE == 'ko-KR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ko_KR;
}

if (goog.LOCALE == 'kok') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kok;
}

if (goog.LOCALE == 'kok_IN' || goog.LOCALE == 'kok-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kok_IN;
}

if (goog.LOCALE == 'kw') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kw;
}

if (goog.LOCALE == 'kw_GB' || goog.LOCALE == 'kw-GB') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_kw_GB;
}

if (goog.LOCALE == 'lag') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lag;
}

if (goog.LOCALE == 'lag_TZ' || goog.LOCALE == 'lag-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lag_TZ;
}

if (goog.LOCALE == 'lg') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lg;
}

if (goog.LOCALE == 'lg_UG' || goog.LOCALE == 'lg-UG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lg_UG;
}

if (goog.LOCALE == 'lt_LT' || goog.LOCALE == 'lt-LT') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lt_LT;
}

if (goog.LOCALE == 'luo') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_luo;
}

if (goog.LOCALE == 'luo_KE' || goog.LOCALE == 'luo-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_luo_KE;
}

if (goog.LOCALE == 'luy') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_luy;
}

if (goog.LOCALE == 'luy_KE' || goog.LOCALE == 'luy-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_luy_KE;
}

if (goog.LOCALE == 'lv_LV' || goog.LOCALE == 'lv-LV') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_lv_LV;
}

if (goog.LOCALE == 'mas') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mas;
}

if (goog.LOCALE == 'mas_KE' || goog.LOCALE == 'mas-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mas_KE;
}

if (goog.LOCALE == 'mas_TZ' || goog.LOCALE == 'mas-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mas_TZ;
}

if (goog.LOCALE == 'mer') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mer;
}

if (goog.LOCALE == 'mer_KE' || goog.LOCALE == 'mer-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mer_KE;
}

if (goog.LOCALE == 'mfe') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mfe;
}

if (goog.LOCALE == 'mfe_MU' || goog.LOCALE == 'mfe-MU') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mfe_MU;
}

if (goog.LOCALE == 'mg') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mg;
}

if (goog.LOCALE == 'mg_MG' || goog.LOCALE == 'mg-MG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mg_MG;
}

if (goog.LOCALE == 'mk') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mk;
}

if (goog.LOCALE == 'mk_MK' || goog.LOCALE == 'mk-MK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mk_MK;
}

if (goog.LOCALE == 'ml_IN' || goog.LOCALE == 'ml-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ml_IN;
}

if (goog.LOCALE == 'mr_IN' || goog.LOCALE == 'mr-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mr_IN;
}

if (goog.LOCALE == 'ms_BN' || goog.LOCALE == 'ms-BN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ms_BN;
}

if (goog.LOCALE == 'ms_MY' || goog.LOCALE == 'ms-MY') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ms_MY;
}

if (goog.LOCALE == 'mt_MT' || goog.LOCALE == 'mt-MT') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_mt_MT;
}

if (goog.LOCALE == 'naq') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_naq;
}

if (goog.LOCALE == 'naq_NA' || goog.LOCALE == 'naq-NA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_naq_NA;
}

if (goog.LOCALE == 'nb') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nb;
}

if (goog.LOCALE == 'nb_NO' || goog.LOCALE == 'nb-NO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nb_NO;
}

if (goog.LOCALE == 'nd') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nd;
}

if (goog.LOCALE == 'nd_ZW' || goog.LOCALE == 'nd-ZW') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nd_ZW;
}

if (goog.LOCALE == 'ne') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ne;
}

if (goog.LOCALE == 'ne_IN' || goog.LOCALE == 'ne-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ne_IN;
}

if (goog.LOCALE == 'ne_NP' || goog.LOCALE == 'ne-NP') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ne_NP;
}

if (goog.LOCALE == 'nl_BE' || goog.LOCALE == 'nl-BE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_BE;
}

if (goog.LOCALE == 'nl_NL' || goog.LOCALE == 'nl-NL') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nl_NL;
}

if (goog.LOCALE == 'nn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nn;
}

if (goog.LOCALE == 'nn_NO' || goog.LOCALE == 'nn-NO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nn_NO;
}

if (goog.LOCALE == 'nyn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nyn;
}

if (goog.LOCALE == 'nyn_UG' || goog.LOCALE == 'nyn-UG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_nyn_UG;
}

if (goog.LOCALE == 'om') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_om;
}

if (goog.LOCALE == 'om_ET' || goog.LOCALE == 'om-ET') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_om_ET;
}

if (goog.LOCALE == 'om_KE' || goog.LOCALE == 'om-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_om_KE;
}

if (goog.LOCALE == 'or_IN' || goog.LOCALE == 'or-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_or_IN;
}

if (goog.LOCALE == 'pa') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa;
}

if (goog.LOCALE == 'pa_Arab' || goog.LOCALE == 'pa-Arab') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa_Arab;
}

if (goog.LOCALE == 'pa_Arab_PK' || goog.LOCALE == 'pa-Arab-PK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa_Arab_PK;
}

if (goog.LOCALE == 'pa_Guru' || goog.LOCALE == 'pa-Guru') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa_Guru;
}

if (goog.LOCALE == 'pa_Guru_IN' || goog.LOCALE == 'pa-Guru-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pa_Guru_IN;
}

if (goog.LOCALE == 'pl_PL' || goog.LOCALE == 'pl-PL') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pl_PL;
}

if (goog.LOCALE == 'ps') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ps;
}

if (goog.LOCALE == 'ps_AF' || goog.LOCALE == 'ps-AF') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ps_AF;
}

if (goog.LOCALE == 'pt_GW' || goog.LOCALE == 'pt-GW') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_GW;
}

if (goog.LOCALE == 'pt_MZ' || goog.LOCALE == 'pt-MZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_pt_MZ;
}

if (goog.LOCALE == 'rm') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rm;
}

if (goog.LOCALE == 'rm_CH' || goog.LOCALE == 'rm-CH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rm_CH;
}

if (goog.LOCALE == 'ro_MD' || goog.LOCALE == 'ro-MD') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ro_MD;
}

if (goog.LOCALE == 'ro_RO' || goog.LOCALE == 'ro-RO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ro_RO;
}

if (goog.LOCALE == 'rof') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rof;
}

if (goog.LOCALE == 'rof_TZ' || goog.LOCALE == 'rof-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rof_TZ;
}

if (goog.LOCALE == 'ru_MD' || goog.LOCALE == 'ru-MD') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_MD;
}

if (goog.LOCALE == 'ru_RU' || goog.LOCALE == 'ru-RU') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_RU;
}

if (goog.LOCALE == 'ru_UA' || goog.LOCALE == 'ru-UA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ru_UA;
}

if (goog.LOCALE == 'rw') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rw;
}

if (goog.LOCALE == 'rw_RW' || goog.LOCALE == 'rw-RW') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rw_RW;
}

if (goog.LOCALE == 'rwk') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rwk;
}

if (goog.LOCALE == 'rwk_TZ' || goog.LOCALE == 'rwk-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_rwk_TZ;
}

if (goog.LOCALE == 'saq') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_saq;
}

if (goog.LOCALE == 'saq_KE' || goog.LOCALE == 'saq-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_saq_KE;
}

if (goog.LOCALE == 'seh') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_seh;
}

if (goog.LOCALE == 'seh_MZ' || goog.LOCALE == 'seh-MZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_seh_MZ;
}

if (goog.LOCALE == 'ses') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ses;
}

if (goog.LOCALE == 'ses_ML' || goog.LOCALE == 'ses-ML') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ses_ML;
}

if (goog.LOCALE == 'sg') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sg;
}

if (goog.LOCALE == 'sg_CF' || goog.LOCALE == 'sg-CF') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sg_CF;
}

if (goog.LOCALE == 'shi') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi;
}

if (goog.LOCALE == 'shi_Latn' || goog.LOCALE == 'shi-Latn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi_Latn;
}

if (goog.LOCALE == 'shi_Latn_MA' || goog.LOCALE == 'shi-Latn-MA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi_Latn_MA;
}

if (goog.LOCALE == 'shi_Tfng' || goog.LOCALE == 'shi-Tfng') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi_Tfng;
}

if (goog.LOCALE == 'shi_Tfng_MA' || goog.LOCALE == 'shi-Tfng-MA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_shi_Tfng_MA;
}

if (goog.LOCALE == 'si') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_si;
}

if (goog.LOCALE == 'si_LK' || goog.LOCALE == 'si-LK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_si_LK;
}

if (goog.LOCALE == 'sk_SK' || goog.LOCALE == 'sk-SK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sk_SK;
}

if (goog.LOCALE == 'sl_SI' || goog.LOCALE == 'sl-SI') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sl_SI;
}

if (goog.LOCALE == 'sn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sn;
}

if (goog.LOCALE == 'sn_ZW' || goog.LOCALE == 'sn-ZW') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sn_ZW;
}

if (goog.LOCALE == 'so') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so;
}

if (goog.LOCALE == 'so_DJ' || goog.LOCALE == 'so-DJ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so_DJ;
}

if (goog.LOCALE == 'so_ET' || goog.LOCALE == 'so-ET') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so_ET;
}

if (goog.LOCALE == 'so_KE' || goog.LOCALE == 'so-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so_KE;
}

if (goog.LOCALE == 'so_SO' || goog.LOCALE == 'so-SO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_so_SO;
}

if (goog.LOCALE == 'sq_AL' || goog.LOCALE == 'sq-AL') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sq_AL;
}

if (goog.LOCALE == 'sr_Cyrl' || goog.LOCALE == 'sr-Cyrl') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl;
}

if (goog.LOCALE == 'sr_Cyrl_BA' || goog.LOCALE == 'sr-Cyrl-BA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl_BA;
}

if (goog.LOCALE == 'sr_Cyrl_ME' || goog.LOCALE == 'sr-Cyrl-ME') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl_ME;
}

if (goog.LOCALE == 'sr_Cyrl_RS' || goog.LOCALE == 'sr-Cyrl-RS') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Cyrl_RS;
}

if (goog.LOCALE == 'sr_Latn' || goog.LOCALE == 'sr-Latn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn;
}

if (goog.LOCALE == 'sr_Latn_BA' || goog.LOCALE == 'sr-Latn-BA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn_BA;
}

if (goog.LOCALE == 'sr_Latn_ME' || goog.LOCALE == 'sr-Latn-ME') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn_ME;
}

if (goog.LOCALE == 'sr_Latn_RS' || goog.LOCALE == 'sr-Latn-RS') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sr_Latn_RS;
}

if (goog.LOCALE == 'sv_FI' || goog.LOCALE == 'sv-FI') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sv_FI;
}

if (goog.LOCALE == 'sv_SE' || goog.LOCALE == 'sv-SE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sv_SE;
}

if (goog.LOCALE == 'sw_KE' || goog.LOCALE == 'sw-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sw_KE;
}

if (goog.LOCALE == 'sw_TZ' || goog.LOCALE == 'sw-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_sw_TZ;
}

if (goog.LOCALE == 'ta_IN' || goog.LOCALE == 'ta-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ta_IN;
}

if (goog.LOCALE == 'ta_LK' || goog.LOCALE == 'ta-LK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ta_LK;
}

if (goog.LOCALE == 'te_IN' || goog.LOCALE == 'te-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_te_IN;
}

if (goog.LOCALE == 'teo') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_teo;
}

if (goog.LOCALE == 'teo_KE' || goog.LOCALE == 'teo-KE') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_teo_KE;
}

if (goog.LOCALE == 'teo_UG' || goog.LOCALE == 'teo-UG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_teo_UG;
}

if (goog.LOCALE == 'th_TH' || goog.LOCALE == 'th-TH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_th_TH;
}

if (goog.LOCALE == 'ti') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ti;
}

if (goog.LOCALE == 'ti_ER' || goog.LOCALE == 'ti-ER') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ti_ER;
}

if (goog.LOCALE == 'ti_ET' || goog.LOCALE == 'ti-ET') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ti_ET;
}

if (goog.LOCALE == 'tl_PH' || goog.LOCALE == 'tl-PH') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tl_PH;
}

if (goog.LOCALE == 'to') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_to;
}

if (goog.LOCALE == 'to_TO' || goog.LOCALE == 'to-TO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_to_TO;
}

if (goog.LOCALE == 'tr_TR' || goog.LOCALE == 'tr-TR') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tr_TR;
}

if (goog.LOCALE == 'tzm') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tzm;
}

if (goog.LOCALE == 'tzm_Latn' || goog.LOCALE == 'tzm-Latn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tzm_Latn;
}

if (goog.LOCALE == 'tzm_Latn_MA' || goog.LOCALE == 'tzm-Latn-MA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_tzm_Latn_MA;
}

if (goog.LOCALE == 'uk_UA' || goog.LOCALE == 'uk-UA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uk_UA;
}

if (goog.LOCALE == 'ur_IN' || goog.LOCALE == 'ur-IN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ur_IN;
}

if (goog.LOCALE == 'ur_PK' || goog.LOCALE == 'ur-PK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_ur_PK;
}

if (goog.LOCALE == 'uz') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz;
}

if (goog.LOCALE == 'uz_Arab' || goog.LOCALE == 'uz-Arab') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Arab;
}

if (goog.LOCALE == 'uz_Arab_AF' || goog.LOCALE == 'uz-Arab-AF') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Arab_AF;
}

if (goog.LOCALE == 'uz_Cyrl' || goog.LOCALE == 'uz-Cyrl') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Cyrl;
}

if (goog.LOCALE == 'uz_Cyrl_UZ' || goog.LOCALE == 'uz-Cyrl-UZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Cyrl_UZ;
}

if (goog.LOCALE == 'uz_Latn' || goog.LOCALE == 'uz-Latn') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Latn;
}

if (goog.LOCALE == 'uz_Latn_UZ' || goog.LOCALE == 'uz-Latn-UZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_uz_Latn_UZ;
}

if (goog.LOCALE == 'vi_VN' || goog.LOCALE == 'vi-VN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vi_VN;
}

if (goog.LOCALE == 'vun') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vun;
}

if (goog.LOCALE == 'vun_TZ' || goog.LOCALE == 'vun-TZ') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_vun_TZ;
}

if (goog.LOCALE == 'xog') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_xog;
}

if (goog.LOCALE == 'xog_UG' || goog.LOCALE == 'xog-UG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_xog_UG;
}

if (goog.LOCALE == 'yo') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yo;
}

if (goog.LOCALE == 'yo_NG' || goog.LOCALE == 'yo-NG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_yo_NG;
}

if (goog.LOCALE == 'zh_Hans' || goog.LOCALE == 'zh-Hans') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans;
}

if (goog.LOCALE == 'zh_Hans_CN' || goog.LOCALE == 'zh-Hans-CN') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans_CN;
}

if (goog.LOCALE == 'zh_Hans_HK' || goog.LOCALE == 'zh-Hans-HK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans_HK;
}

if (goog.LOCALE == 'zh_Hans_MO' || goog.LOCALE == 'zh-Hans-MO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans_MO;
}

if (goog.LOCALE == 'zh_Hans_SG' || goog.LOCALE == 'zh-Hans-SG') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hans_SG;
}

if (goog.LOCALE == 'zh_Hant' || goog.LOCALE == 'zh-Hant') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hant;
}

if (goog.LOCALE == 'zh_Hant_HK' || goog.LOCALE == 'zh-Hant-HK') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hant_HK;
}

if (goog.LOCALE == 'zh_Hant_MO' || goog.LOCALE == 'zh-Hant-MO') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hant_MO;
}

if (goog.LOCALE == 'zh_Hant_TW' || goog.LOCALE == 'zh-Hant-TW') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zh_Hant_TW;
}

if (goog.LOCALE == 'zu') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zu;
}

if (goog.LOCALE == 'zu_ZA' || goog.LOCALE == 'zu-ZA') {
  goog.i18n.DateTimePatterns = goog.i18n.DateTimePatterns_zu_ZA;
}

