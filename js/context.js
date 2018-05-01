/** Created on 2018年4月16日 星期一 11:20.*/
!(function ($) {
    var that;
    function CCContext(option) {
        that=this;
        this.container=option.container||$('body');
        this.attachEvent(this.container);
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
        return clonePropertiesFrom(ele[0],[
            'offsetWidth','offsetHeight','offsetTop','offsetLeft',
            'scrollWidth','scrollHeight','scrollTop','scrollLeft',
            'scrollLeftMax','scrollTopMax'
        ]);
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
    CCContext.prototype={
        attachEvent:function (container) {
            container.on({
                contextmenu:$.proxy(this.contextmenu,this),
                click:$.proxy(this.click,this),
                mouseover:$.proxy(this.hover,this)
            });
        },
        click:function(e){
            var target=$(e.target);
            if(!target.is('context-menu,context-menu *')){
                this.template.remove();
            }else if(target.is('menu-item[action]')){
                var action=this.actions[target.attr('action')];
                this.template.remove();
                action&&action();
            }
        },
        hover:function(e){
            var target=$(e.target);
            var submenu=target.find('sub-menu');
            if(target.is('menu-item')&&submenu.length){
                var de=deRect(this.container);
                var ep=elementPosition(target.parent('context-menu'));
                var sbep=elementPosition(submenu);
                if((sbep.offsetWidth+ep.offsetLeft+ep.offsetWidth)>de.offsetWidth){
                    submenu.attr('direction','left');
                }
                if((sbep.offsetHeight+ep.offsetTop+ep.offsetHeight)>de.offsetHeight){
                    submenu.parent('menu-item').attr('direction','reverse');
                }
            }
        },
        contextmenu:function (e) {
            e.preventDefault();
            var target=$(e.target);
            if(!target.is('context-menu,context-menu *')){
                // this.oe=e2oe(e);
                // this.container.append(this.template);
                // var ep=elementPosition(this.template);
                // var de=deRect(this.container);
                //
                // var left=(oe.layerX+ep.offsetWidth)>de.offsetWidth?(de.offsetWidth-ep.offsetWidth-1):oe.layerX;
                // var top=(oe.layerY+ep.offsetHeight)>de.offsetHeight?(oe.layerY-ep.offsetHeight):oe.layerY;
                // this.template.css({'left':left,'top':top});
                // this.template.find('sub-menu')
                //     .attr('direction','right');
                // this.template.find('sub-menu')
                //     .parent('menu-item')
                //     .attr('direction','normal');
            }
        },
        showMenu:function(e,menu){
            this.actions={};
            this.template&&this.template.remove();
            this.oe=e2oe(e);
            this.template=$(this.createMenu(menu));
            this.container.append(this.template);
            var ep=elementPosition(this.template);
            var de=deRect(this.container);
            var left=(this.oe.layerX+ep.offsetWidth)>de.offsetWidth?
                (de.offsetWidth-ep.offsetWidth-1):this.oe.layerX;
            var top=(this.oe.layerY+ep.offsetHeight)>de.offsetHeight?
                (this.oe.layerY-ep.offsetHeight):this.oe.layerY;
            this.template.css({'left':left,'top':top});
            this.template.find('sub-menu')
                .attr('direction','right');
            this.template.find('sub-menu')
                .parent('menu-item')
                .attr('direction','normal');
        },
        createMenu:function (menu) {
            return '<context-menu>'+this.menuHtml(menu)+'</context-menu>';
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