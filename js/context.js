/** Created on 2018年4月16日 星期一 11:20.*/
!(function ($) {
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
    var itemName='menu-item', label='label', span='span',
        input='input', sub_menu='sub-menu', ui_sref='ui-sref',
        app_sref='app-sref', divider='divider';
    function randomName() {
        return Math.random()
            .toString(32)
            .substring(2);
    }
    function cDom(name,c,a){
        var d=document.createElement(name);
        c&&(typeof c=='string'?d.innerHTML=c:d.appendChild(c));
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
    function radioOrCheckbox(o) {
        var mn=[];
        for(var p in o.values){
            var inp=cDom(input);
            inp.type=o.type;
            inp.value=o.values[p];
            inp.name=o.name||randomName();
            inp.style.display='none';
            if(o.checked){
                inp.checked=(typeof o.checked=='string')?
                    (inp.value==o.checked):
                    (o.checked.indexOf(inp.value)>-1);
            }
            var b=cDom(label,inp,o.action);
            b.appendChild(cDom(span,p));
            mn.push(cDom(itemName,b));
        }
        return mn;
    }
    function cLabel(c,a) {
        return cDom(label,cDom(span,c),a);
    }
    //string label
    function sLabel(c,v) {
        var b=cLabel(c);
        //系统路由
        if('#'==v.charAt(0)){
            b.setAttribute(ui_sref,v.substring(1));
        }else if('@'==v.charAt(0)){//app路由
            b.setAttribute(app_sref,v.substring(1));
        }
        return b;
    }
    function o2Menu(o,menuType) {
        var mn=[];
        var p,v;
        for(p in o){
            v=o[p];
            if(v instanceof Array){
                mn.push(ccDom(itemName,cLabel(p),ccDom(menuType||sub_menu,a2Menu(v))));
                continue;
            }
            if(typeof v=='function'){
                mn.push(ccDom(itemName,cLabel(p,v)));
                continue;
            }
            if(typeof v=='string'){
                mn.push(ccDom(itemName,sLabel(p,v)));
                continue;
            }
            if(typeof v=='object'){
                if(v.type=='radio'||v.type=='checkbox'){
                    mn.push(ccDom(itemName,cLabel(p),ccDom(menuType||sub_menu,radioOrCheckbox(v))));
                    continue;
                }
                mn.push(ccDom(itemName,cLabel(p),ccDom(menuType||sub_menu,o2Menu(v))));
                continue;
            }
        }
        return mn;
    }
    function a2Menu(a,menuType) {
        var mn=[];
        for(var i=0,v;v=a[i];i++){
            if(v instanceof Array){
                i&&mn.push(cDom(divider));
                mn.push.apply(mn,a2Menu(v,menuType));
                continue;
            }
            if(typeof v=='string'){
                if('|'!=v.charAt(0)){
                    if(v.indexOf('#')>0){
                        v=v.split('#');
                        var b=cLabel(v[0]);
                        b.setAttribute(ui_sref,v[1]);
                        mn.push(ccDom(itemName,b));
                    }else if(v.indexOf('@')>0){
                        v=v.split('@');
                        var b=cLabel(v[0]);
                        b.setAttribute(app_sref,v[1]);
                        mn.push(ccDom(itemName,b));
                    }else{
                        mn.push(ccDom(itemName,cLabel(v)));
                    }
                }else{
                    mn.push(cDom(divider));
                }
                continue;
            }
            if(typeof v=='object'){
                if(v.type=='radio'||v.type=='checkbox'){
                    mn.push.apply(mn,radioOrCheckbox(v));
                }else{
                    i&&mn.push(cDom(divider));
                    mn.push.apply(mn,o2Menu(v,menuType));
                }
                continue;
            }
            if(typeof v=='function'){
                mn.push(ccDom(itemName,cLabel(v.name,v)));
                continue;
            }
        }
        return mn;
    }
    function contextMenu(m) {
        if(m instanceof Array){
            return a2Menu(m);
        }
        return o2Menu(m);
    }
    function menubarMenu(m) {
        if(m instanceof Array){
            return a2Menu(m,'dropdown-menu');
        }
        return o2Menu(m,'dropdown-menu');
    }

    function CCContext(option) {
        this.container=option.container||$('body');
        this.container.css({position:'relative'});
        this.template=$('<context-menu></context-menu>');
        this.attachEvent();
        this.container.append(this.template);
    };
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
            if(target.is('menu-item>label')){
                target=target.parents('menu-item');
                var submenu=target.find('sub-menu');
                if(!submenu.length){return;}
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
            //TODO 有待优化，需要移除label绑定的action
            this.template.unbind('mouseover');
            this.container.unbind('click');
            this.template.remove();
        },
        showMenu:function(e,menu){
            e.preventDefault();
            e.stopPropagation();
            if(!this.container[0].contains(this.template[0])){
                this.container.append(this.template);
            }
            this.oe=e2oe(e);
            this.template.html('');
            this.template.append(contextMenu(menu)).show();

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
        }
    };
    function CCMenubar(option){
        this.container=option.container||$('body');
        this.container.css({position:'relative'});
        this.attachEvent();
    }
    CCMenubar.prototype={
        attachEvent:function () {
            this.container.on({
                mouseover:$.proxy(this.hover,this)
            });
            this.container.on({
                click:$.proxy(this.click,this)
            });
        },
        click:function(e){
            e.originalEvent.which==1&&(e.target.action||(()=>0))(e);
        },
        hover:function(e){
            var target=$(e.target);
            if(target.is('menu-item>label')){
                target=target.parents('menu-item');
                var submenu=target.find('sub-menu');
                if(!submenu.length){return;}
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
            this.container&&this.container.hide();
        },
        destroy:function(){
            this.container.unbind('mouseover');
            this.container.unbind('click');
            this.template.remove();
        },
        showMenu:function(menu){
            this.container.html('');
            this.container.append(menubarMenu(menu)).show();

            this.container.find('sub-menu')
                .attr('direction','right');
            this.container.find('sub-menu')
                .parent('menu-item')
                .attr('direction','normal');
        }
    }

    window.CCContext=CCContext;
    window.CCMenubar=CCMenubar;
})(window.jQuery);
