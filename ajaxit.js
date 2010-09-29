(function($) {
    var ajaxItMain={
        ajaxItArea: null,
        basePath: null,
        readyList: null,
        isInit: false,
        onReady: null,
        onError: null,
        onCall:null,
        protocol:(window.document || window).location.protocol,
      
 
        // auto redirect
        redirect: function(){
            var win = window.document;
            var baseURL = ajaxItMain.protocol + "//"+ (win || window).location.host + ajaxItMain.basePath;
            var page    = (win || window).location.href;
            var pathName = (win || window).location.pathname;
            var query='';
            if(page.indexOf('?')!= -1){
                query = page.substring(page.indexOf('?'), page.length);
            }
            if ((page).replace(/#.*/, '') != baseURL){ // redirect
                (win || window).location.href = baseURL + "#"+ pathName.replace(ajaxItMain.basePath,"") + query;
            }
        },

        // ajax ready list
        getReadyList: function()
        {
            if($.readyList != null)
                this.myreadylist =  $.readyList.slice();
            return this.myreadylist;
        },

        goToHash:function (){
            var hash=window.location.hash;
            hash=hash.substring(hash.indexOf('#')+1, hash.length);
            if(hash.indexOf('#') != -1){
                anchor = hash.substring(hash.indexOf('#')+1, hash.length);
                if($('a[name='+anchor+']').length){
                    $(document).scrollTop($('a[name='+anchor+']').offset().top);
                }else if($('#'+anchor).length){
                    $(document).scrollTop($('#'+anchor).offset().top);
                }
            }

        },

        // get page function
        getPage: function(hash) {
            if (hash && hash != '#'){
                $.ajax({
                    type: "GET",
                    url: hash,
                    async:true,
                    error:function (event, request, options, error) {
                        if (ajaxItMain.onError){
                            ajaxItMain.onError(event,request,options,error);
                        }
                    },
                    success:  function (data) {
                        // ----------------- < data >
                        // clearing CDATA
                        data=data.replace(/\<\!\[CDATA\[\/\/\>\<\!\-\-/gi,'');
                        data=data.replace(/\/\/\-\-\>\<\!\]\]\>/gi,'');
		      
                        // extracting the the head and body tags
                        var dataHead = data.match(/<\s*head.*>[\s\S]*<\s*\/head\s*>/ig).join("");
                        var dataBody = data.match(/<\s*body.*>[\s\S]*<\s*\/body\s*>/ig).join("");
                        var dataTitle = data.match(/<\s*title.*>[\s\S]*<\s*\/title\s*>/ig).join("");

                        dataHead  = dataHead.replace(/<\s*head/gi,"<div");
                        dataHead  = dataHead.replace(/<\s*\/head/gi,"</div");

                        dataBody  = dataBody.replace(/<\s*body/gi,"<div");
                        dataBody  = dataBody.replace(/<\s*\/body/gi,"</div");

                        dataTitle = dataTitle.replace(/<\s*title/gi,"<div");
                        dataTitle = dataTitle.replace(/<\s*\/title/gi,"</div");
		      

                        // comments
                        var commentPattern = /\<\!\-\-([\s\S]*?)\-\-\>/ig;
		      
                        // replacing head comment tags
                        var headComments = dataHead.match(commentPattern);
                        if (headComments){
                            $.each(headComments,function(){
                                var comment= $.trim(this);
                                $("head").append(comment);
                            })
                        }
                        dataHead = dataHead.replace(commentPattern,"");

                        // replacing body comment tags
                        var bodyComments = dataBody.match(commentPattern);
                        if (bodyComments){
                            $.each(bodyComments,function(){
                                var comment= $.trim(this);
                                $("body").append(comment);
                            })
                        }
                        dataBody = dataBody.replace(commentPattern,"");

                        // head - body - ajax area
                        var $dataHead    = $(dataHead);
                        var $dataTitle   = $(dataTitle);
                        var $dataBody    = $(dataBody);
                        // --------------------------- < head >
                        // apply new title
                        document.title = $dataTitle.html();

                        // disable current css
                        $("link,style").each(function(){
                            var href = $(this).attr("href");
                            if (!href || $dataHead.find("link[href='"+href+"']").length == 0){
                                $(this).remove();
                            }
                        });

                        // apply new css
                        $dataHead.find("link,style").each(function(){
                            var href = $(this).attr("href");
                            if (!href || $("link[href='"+href+"']").length == 0){
                                $("head").append(this);
                            }
                        });

                        // apply new javascript
                        $dataHead.find("script").each(function(){
                            var src = $(this).attr("src");
                            if (!src || $("script[src='"+src+"']").length == 0){
                                $("head").append(this);
                            }
			  
                        });

                        // --------------------------- < body >
                        // apply body new class and id
                        $("body").attr("class",$dataBody.attr("class"));
                        $("body").attr("id",$dataBody.attr("id"));

                        // apply new javascript
                        $dataBody.find("script").not(":contains('google-analytics.com/ga.js')").each(function(){
                            var src = $(this).attr("src");
                            if (!src || $("script[src='"+src+"']").length == 0){
                                $("body").append(this);
                            }
                        });
                        // --------------------------- < ajaxArea >
                        $("script",$dataBody).remove();
                        var $ajaxArea     = $dataBody.find(ajaxItMain.ajaxItArea);
                        var ajaxItSuccess = 0;
                        $ajaxArea.each(function(){
                            var thisSelector  = this.tagName;                              // adding the tagName
                            thisSelector += ($(this).attr("id"))?"#"+$(this).attr("id"):""; // adding id
                            thisSelector += ($(this).attr("class"))?"."+$(this).attr("class").split(" ").join("."):""; // adding id
                            if ($(thisSelector).length){
                                $(thisSelector).html($(this).html());
                                ajaxItSuccess++;
                            }
                        });

                        if (ajaxItSuccess == 0){
                            $("body").html($dataBody.html());
                        }
                        //----------------------------------- ready list
                        $(ajaxItMain.readyList).each(function(){
                            this();
                        });
                        if (ajaxItMain.onReady){
                            ajaxItMain.onReady();
                        }
                        ajaxItMain.initLinks("a");
                        ajaxItMain.goToHash();
                    }
                });
            }
	  
            if (ajaxItMain.onCall){
                ajaxItMain.onCall();
            }
        },

        goTo: function(ajaxURL){
            $.history.load(ajaxURL);
        },

        initLinks: function(Selector){
            $(Selector).live("click",function(evt){
                var ajaxLink = $(this).attr('href');
                if($(this).attr('href')){
                    if((($(this).attr('href').search('http://') > -1 && ajaxItMain.protocol == 'http:') || ($(this).attr('href').search('https://') > -1) && ajaxItMain.protocol == 'https:') && $(this).attr('href').match(document.domain)){
                        var href=$(this).attr('href').split('/');
                        ajaxLink = '/' + href.slice(3).join('/');
                    }
                    else if ($(this).attr('href').search('http://') > -1 || $(this).attr('href').search('https://') > -1){
                        return true;
                    } else if ($(this).attr('href').search('/') != 0) {
                      var hash=window.location.hash;
                      hash=hash.substring(hash.indexOf('#')+1, hash.length);
                      hash = hash.split('#');
                      hash = hash[0];
                      ajaxLink = ajaxItMain.basePath + hash + $(this).attr('href');
                    }
                    
                    if (!evt.isDefaultPrevented()) {
                        ajaxItMain.goTo(ajaxLink);
                    }
                }
                return false;
            });
        },
        // this should be added last so it gets all the ready event
        init: function () {
            ajaxItMain.redirect();
            $(document).ready(function() {
                if(!ajaxItMain.isInit){
                    ajaxItMain.isInit=true;
                    ajaxItMain.initLinks("a");
                    $.history.init($.ajaxIt.getPage);
                }
            });
            ajaxItMain.readyList = ajaxItMain.getReadyList();
	 
        }
    };

    $.ajaxIt = ajaxItMain;
})(jQuery);