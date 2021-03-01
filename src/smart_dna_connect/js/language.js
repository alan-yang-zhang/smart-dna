var getUrlParam = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); 
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

let i18nLanguage = "en";

var webLanguage = ['sc', 'tc', 'en'];
 
/**
 * 执行页面i18n方法
 * @return
 */ 
var execI18n = function(){
    /*
    获取一下资源文件名
     */
    // var optionEle = $("#i18n_pagename");

    // if (optionEle.length < 1) {
    //     console.log("未找到页面名称元素，请在页面写入\n <meta id=\"i18n_pagename\" content=\"页面名(对应语言包的语言文件名)\">");
    //     return false;
    // };

    // var sourceName = optionEle.attr('content');
    // sourceName = sourceName.split('-');

    const lang = getUrlParam('lang');

    if (webLanguage.includes(lang)) {
        i18nLanguage = lang;
    }

    const filePath = "./assets/i18n/";
 
    $("[i18n]").i18n({
        defaultLang: i18nLanguage,
        filePath: filePath,
        forever: true,
        callback: function() {
        }
    });

    const langClass =  lang === 'en' ? 'en' : 'tc';

    $(".container").addClass(langClass);
}
 
 
 
 
 
$(function(){
    execI18n();
});