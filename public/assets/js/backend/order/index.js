define(['jquery', 'bootstrap', 'backend', 'table', 'form','selectpage'], function ($, undefined, Backend, Table, Form, selectPage) {

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

            $('#c-customer_name').selectPage({
                showField : 'customer_name',
                keyField : 'id',
                data : 'customer/customer/get_customer',
                //选中项目后的回调处理
                //入参：data：选中行的原始数据对象
                eSelect : function(data){
                    $.ajax({
                        'url': 'order/index/get_adds',
                        'data': {'ids':data.id},
                        'dataType': 'json',
                        'success': function (data) {
                            $('#c-order_adds').val('收货人: '+ data.consignee +'  联系电话: '+ data.mobile +'  收货地址: '+ data.delivery_adds)
                        }
                    });
                },
                eClear : function(){
                    $('#c-order_adds').val('');
                }
            });
            i = 1;
            $('.append').on('click',function(){
                i++;
                $('#append_table').append($("#clone_obj").clone('click,change').show().attr('id','append_obj_'+i));
                Controller.commonSelectPage($('#append_obj_'+i));
            });
            $('.remove_demo').bind('click',function(){
                $(this).parent().parent().remove();
            });


        },
        commonSelectPage:function(obj){
            obj.find('.goods_info').selectPage({
                showField : 'goods_name',
                keyField : 'id',
                data : 'order/index/get_goods_info',
                //选中项目后的回调处理
                //入参：data：选中行的原始数据对象
                eSelect : function(data){
                    obj.find('.goods_id').html(data.goods_id);
                    obj.find('.goods_cas').html(data.goods_cas);
                    obj.find('.spec').html(data.spec);
                    obj.find('.s_price').html('<input  class="form-control" name="s_price" style="max-width:100px;" type="number" value="'+data.s_price+'">');
                    obj.find('.num_sum').html(data.s_price);
                    obj.find('.number').html('<i class="fa fa-minus" style="cursor:pointer"></i>   <input class="form-control" type="text" name="number" value="1" style="max-width:45px;">  <i class="fa fa-plus" style="cursor:pointer"></i>');
                },
                eClear : function(){
                    console.log(111);
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
    Controller.commonSelectPage($('#append_obj_1'));
    return Controller;
});