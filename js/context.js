/** Created on 2018年4月16日 星期一 11:20.*/
!(function ($) {
    var that;
    function CCContext(option) {
        that=this;
        this.container=option.container||$('body');
        this.container.css({position:'relative'});
        this.template=$('<context-menu></context-menu>');
        this.template.css({'z-index':getMaxZIndex()});
        this.attachEvent();
        this.container.append(this.template);
    };
    function clonePropertiesFrom(o,ps){
        var co={};
        for(var i=0;i<ps.length;i++){
            co[ps[i]]=o[ps[i]];
        }
        return co;
    }
    function e2oe(e){
        return clonePropertiesFrom(e.originalEvent?e.originalEvent:e,[
            'altKey','ctrlKey','shiftKey','which',
            'clientX','clientY','layerX','layerY',
            'pageX','pageY','screenX','screenY',
            'x','y'
        ]);
    }
    function elementPosition(ele){
        return ele[0].getBoundingClientRect();
    }
    function deRect(ele){
        return clonePropertiesFrom(ele[0],[
            'offsetWidth','offsetHeight'
        ]);
    }
    function uuid(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
            .split('');
        var uuid = [], i;
        radix = radix || chars.length;
        if (len) {
            // Compact form
            for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
        } else {
            // rfc4122, version 4 form
            var r;
            // rfc4122 requires these characters
            uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
            uuid[14] = '4';
            // Fill in random data.  At i==19 set the high bits of clock sequence as
            // per rfc4122, sec. 4.1.5
            for (i = 0; i < 36; i++) {
                if (!uuid[i]) {
                    r = 0 | Math.random()*16;
                    uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
                }
            }
        }
        return uuid.join('');
    }
    function getMaxZIndex() {
        var mz=-1;
        var a=document.querySelectorAll('body *');
        for(var i=0,zi;i<a.length;i++){
            zi=window.getComputedStyle(a[i]).zIndex;
            if('auto'!=zi){
                mz=Math.max(mz,zi);
            }
        }
        return mz;
    }
    CCContext.prototype={
        attachEvent:function () {
            this.template.on({
                mouseover:$.proxy(this.hover,this)
            });
            $(document).on({
                click:$.proxy(this.click,this)
            });
        },
        click:function(e){
            if(e.originalEvent.which==1){
                var target=$(e.target);
                if(!target.is('context-menu,context-menu *')){
                    this.clearMenu();
                }else if(target.is('menu-item[action]')){
                    var action=this.actions[target.attr('action')];
                    this.clearMenu();
                    action&&action();
                }
            }
        },
        hover:function(e){
            var target=$(e.target);
            var submenu=target.find('sub-menu');
            if(target.is('menu-item')&&submenu.length){
                // var dc=deRect(this.container);
                // var cp=elementPosition(this.container);
                // var dSub=deRect(submenu);
                // var dt=deRect(this.template);
                // var tp=elementPosition(this.template);
                // if((dSub.offsetWidth+dt.offsetWidth+(tp.left-cp.left))>dc.offsetWidth){
                //     submenu.attr('direction','left');
                // }
                // if((dSub.offsetHeight+dt.offsetHeight+(tp.top-cp.top))>dc.offsetHeight){
                //     submenu.parent('menu-item').attr('direction','reverse');
                // }

                var dc=deRect(this.container);
                var cp=elementPosition(this.container);
                var dSub=deRect(submenu);
                var subP=elementPosition(submenu);
                if((dSub.offsetWidth+(subP.left-cp.left))>dc.offsetWidth){
                    submenu.attr('direction','left');
                }
                if((dSub.offsetHeight+(subP.top-cp.top))>dc.offsetHeight){
                    submenu.parent('menu-item').attr('direction','reverse');
                }
            }
        },
        clearMenu:function(){
            this.template&&this.template.hide();
        },
        showMenu:function(e,menu){
            e.preventDefault();
            e.stopPropagation();
            this.actions={};
            this.oe=e2oe(e);
            this.template.html(this.menuHtml(menu)).show();

            var dt=deRect(this.template);
            var cp=elementPosition(this.container);
            var dc=deRect(this.container);

            var tLeft=e.clientX-cp.left;
            var tTop=e.clientY-cp.top;

            var left=(tLeft+dt.offsetWidth)>dc.offsetWidth?
                (dc.offsetWidth-dt.offsetWidth-1):tLeft;
            var top=(tTop+dt.offsetHeight)>dc.offsetHeight?
                (dc.offsetHeight-dt.offsetHeight-1):tTop;


            this.template.css({'left':left,'top':top});
            this.template.find('sub-menu')
                .attr('direction','right');
            this.template.find('sub-menu')
                .parent('menu-item')
                .attr('direction','normal');
        },
        createSubMenu:function (menu) {
            return '<sub-menu>'+this.menuHtml(menu)+ '</sub-menu>';
        },
        menuHtml:function (menu) {
            var mn='';
            for(var p in menu){
                var v=menu[p];
                if(v instanceof Array){
                    mn+='<menu-item>' +
                        '<menu-item>'+p+'</menu-item><sub-menu>';
                    for(var i=0;i<v.length;i++){
                        mn+='<menu-item>'+v[i]+'</menu-item>';
                    }
                    mn+='</sub-menu></menu-item>';
                }else if(typeof v=='function'){
                    var actionid=uuid(32);
                    mn+='<menu-item action="'+actionid+'">' +p+ '</menu-item>';
                    this.actions[actionid]=v;
                }else {
                    mn+='<menu-item>' +
                        '<menu-item>'+p+'</menu-item>'+
                        this.createSubMenu(v)+
                        '</menu-item>';
                }
            }
            return mn;
        }
    };
    window.CCContext=function (option) {
        return new CCContext(option);
    }
})(window.jQuery);
