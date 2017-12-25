define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'customer/customer/index',
                    add_url: 'customer/customer/add',
                    edit_url: 'customer/customer/edit',
                    del_url: 'customer/customer/del',
                    multi_url: 'customer/customer/multi',
                    table: 'customer',
                }
            });

            var table = $("#table");

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'fa_customer.id',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'customer_name', title: __('Customer_name')},
                        {field: 'user_name', title: __('User_name')},
//                        {field: 'address', title: __('Address'),width:'100%'},
                        {field: 'customer_type', title: __('Customer_type')},
//                        {field: 'createtime', title: __('Createtime'), formatter: Table.api.formatter.datetime},
//                        {field: 'updatetime', title: __('Updatetime'), formatter: Table.api.formatter.datetime},
                        {field: 'buy_num', title: __('Buy_num')},
                        {field: 'last_buy_time', title: __('Last_buy_time'), formatter: Table.api.formatter.datetime},
                        {field: 'last_buy_money', title: __('Last_buy_money')},
                        {field: 'total_money', title: __('Total_money')},
                        {field: 'total_integral', title: __('Total_integral')},
                        {field: 'exchange_integral', title: __('Exchange_integral')},
                        {field: 'surplus_integral', title: __('Surplus_integral')},
                        {field: 'nickname', title: __('Nickname')},

                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            // 为表格绑定事件
            Table.api.bindevent(table);
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