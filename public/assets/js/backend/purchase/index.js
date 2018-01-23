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
                        {checkbox: true},
                        {field: 'o_id', title: __('O_id')},
                        {field: 'goods_id', title: __('Goods_id')},
                        {field: 'goods_name', title: __('Goods_name')},
                        {field: 'number', title: __('Number')},
                        {field: 's_price', title: __('S_price')},
                        {field: 'status', title: __('Status'), formatter: this.status},
                        {field: 'p_price', title: __('P_price')},
                        // {field: 's_id', title: __('S_id')},
                        {field: 'supplier_name', title: __('Supplier_name')},
                        // {field: 'p_status', title: __('P_status'), formatter: Table.api.formatter.status},
                        // {field: 'createtime', title: __('Createtime'), formatter: Table.api.formatter.datetime},
                        // {field: 'updatetime', title: __('Updatetime'), formatter: Table.api.formatter.datetime},
                        {field: 'remark', title: __('Remark')},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        status: function (value, row, index) {
            //颜色状态数组,可使用red/yellow/aqua/blue/navy/teal/olive/lime/fuchsia/purple/maroon
            var colorArr = { 1: 'red', 2: 'blue'};

            value = value.toString();
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