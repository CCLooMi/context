# context
perfect context js
完美简洁的contextjs

用法

        var context=new CCContext({
            container:$('#net-1')
        });

        context.showMenu(params.event,
                {'hello':function () {swal("Select Node is",selectNode&&selectNode.label||'');},
                 '编辑':["注册","修改","删除"],
                 '搜索':function () {}
                });
