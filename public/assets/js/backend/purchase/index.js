define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'purchase/index/index',
                    add_url: 'purchase/index/add',
                    edit_url: 'purchase/index/edit',
                    del_url: 'purchase/index/del',
                    multi_url: 'purchase/index/multi',
                    table: 'purchase',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        {checkbox: true, colspan: 1,rowspan: 2},
                        {field: 'o_id', title: __('O_id'), colspan: 1,rowspan: 2},
                        {field: 'goods_id', title: __('Goods_id'), colspan: 1,rowspan: 2},
                        {field: 'goods_name', title: __('Goods_name'), colspan: 1,rowspan: 2},
                        {field: 'number', title: __('Number'), colspan: 1,rowspan: 2},
                        {field: 's_price', title: __('S_price'), colspan: 1,rowspan: 2},
                        {field: 'status', title: __('Status'), formatter: this.status, colspan: 1,rowspan: 2},
                        {field: 'p_price', title: __('P_price'), colspan: 1,rowspan: 2},
                        // {field: 's_id', title: __('S_id'), colspan: 1,rowspan: 2},
                        {field: 'supplier_name', title: __('Supplier_name'), colspan: 1,rowspan: 2},
                        {title: __('P_status'), colspan: 3,rowspan: 1},
                        // {field: 'createtime', title: __('Createtime'), formatter: Table.api.formatter.datetime},
                        // {field: 'updatetime', title: __('Updatetime'), formatter: Table.api.formatter.datetime},
                        {field: 'remark', title: __('Remark'), colspan: 1,rowspan: 2},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate, colspan: 1,rowspan: 2}
                    ],
                    [
                        {field: 'p_status', title: '北京'},
                        {field: 'p_status', title: '河南'},
                        {field: 'p_status', title: '客户'}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        status: function (value, row, index) {
            //颜色状态数组,可使用red/yellow/aqua/blue/navy/teal/olive/lime/fuchsia/purple/maroon
            var colorArr = { 1: 'red', 2: 'blue'};

            value = value ? value.toString() : 1;
            var color = value && typeof colorArr[value] !== 'undefined' ? colorArr[value] : 'primary';
            value = value.charAt(0).toUpperCase() + value.slice(1);
            //渲染状态
            var html = '<span class="text-' + color + '"><i class="fa fa-circle"></i> ' + __('status '+value) + '</span>';
            return html;
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});