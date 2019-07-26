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
    function cDom(name,c,a){
        var d=document.createElement(name);
        typeof c=='string'?d.innerHTML=c:d.appendChild(c);
        a&&(d.action=a);
        return d;
    }
    function ccDom(name,...cs){
        var d=document.createElement(name);
        cs.forEach(i=>{
            if(i instanceof Array){
                i.forEach(ii=>d.appendChild(ii));
            }else{
                d.appendChild(i);
            }
        });
        return d;
    }
    CCContext.prototype={
        attachEvent:function () {
            this.template.on({
                mouseover:$.proxy(this.hover,this)
            });
            this.container.on({
                click:$.proxy(this.click,this)
            });
        },
        click:function(e){
            if(e.originalEvent.which==1){
                (e.target.action||(()=>0))(e),this.clearMenu();
            }
        },
        hover:function(e){
            var target=$(e.target);
            var submenu=target.find('sub-menu');
            if(target.is('menu-item')&&submenu.length){
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
        destroy:function(){
            this.template.unbind('mouseover');
            this.container.unbind('click');
            this.template.remove();
        },
        showMenu:function(e,menu){
            e.preventDefault();
            e.stopPropagation();
            this.oe=e2oe(e);
            this.template.html('');
            this.template.append(this.domMenu(menu)).show();

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
        subMenu:function (menu) {
            return ccDom('sub-menu',this.domMenu(menu));
        },
        domMenu:function (menu) {
            var mn=[],p,v,subM;
            for(p in menu){
                v=menu[p];
                if(v instanceof Array){
                    subM=cDom('sub-menu');
                    v.forEach(i=>subM.appendChild(cDom('menu-item',i)));
                    mn.push(ccDom('menu-item',cDom('menu-item',p),subM));
                }else if(typeof v=='function'){
                    mn.push(cDom('menu-item',cDom('span',p,v),v));
                }else {
                    mn.push(ccDom('menu-item',cDom('menu-item',cDom('span',p)),this.subMenu(v)));
                }
            }
            return mn;
        }
    };
    window.CCContext=function (option) {
        return new CCContext(option);
    }
})(window.jQuery);
