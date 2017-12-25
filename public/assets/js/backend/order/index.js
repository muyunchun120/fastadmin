define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'order/index/index',
                    add_url: 'order/index/add',
                    edit_url: 'order/index/edit',
                    del_url: 'order/index/del',
                    multi_url: 'order/index/multi',
                    table: 'order',
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
                        {field: 'id', title: __('Id')},
                        {field: 'order_id', title: __('Order_id')},
                        {field: 'customer_name', title: __('Customer_name')},
                        {field: 'goods_ids', title: __('Goods_ids')},
                        {field: 'bill_text', title: __('Bill'), operate:false},
                        {field: 'order_adds', title: __('Order_adds')},
                        {field: 'delivery_time', title: __('Delivery_time'), formatter: Table.api.formatter.datetime},
                        {field: 'payment_method_text', title: __('Payment_method'), operate:false},
                        {field: 'freight_single_number', title: __('Freight_single_number')},
                        {field: 'invoice_carrier_number', title: __('Invoice_carrier_number')},
                        {field: 'order_status', title: __('Order_status'), formatter: Table.api.formatter.status},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
            $.ajax({
                'url': 'order/index/get_id',
                'data': {},
                'dataType': 'json',
                'success': function (data) {
                    $('#c-order_id').val(data.val)
                },
                'error': function () {

                }
            });

        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"), function(data, ret){
                    console.log(data,ret);
                }, function(data, ret){
                    console.log(data,ret);
                });
            }

        }
    };

    return Controller;
});