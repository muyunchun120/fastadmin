define(['jquery', 'bootstrap', 'backend', 'table', 'form','selectpage'], function ($, undefined, Backend, Table, Form, selectPage) {

    var Controller = {
        index: function () {
            $(".btn-add").data("area", ["98%","98%"]);
            $(".btn-edit").data("area", ["98%","98%"]);
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
                        {field: 'bill_text', title: __('Bill'), operate:false},
                        // {field: 'order_adds', title: __('Order_adds')},
                        {field: 'delivery_time', title: __('Delivery_time'), formatter: Table.api.formatter.datetime},
                        {field: 'payment_method_text', title: __('Payment_method'), operate:false},
                        {field: 'freight_single_number', title: __('Freight_single_number')},
                        {field: 'invoice_carrier_number', title: __('Invoice_carrier_number')},
                        {field: 'order_status', title: __('Order_status'), formatter: this.status},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ],
                onLoadSuccess:function(){
                    $(".btn-editone").data("area", ["98%","98%"]);
                }
            });
            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        status: function (value, row, index) {
            //颜色状态数组,可使用red/yellow/aqua/blue/navy/teal/olive/lime/fuchsia/purple/maroon
            var colorArr = {3: 'success', 1: 'info', 2: 'danger'};

            value = value.toString();
            var color = value && typeof colorArr[value] !== 'undefined' ? colorArr[value] : 'primary';
            value = value.charAt(0).toUpperCase() + value.slice(1);
            //渲染状态
            var html = '<span class="text-' + color + '"><i class="fa fa-circle"></i> ' + __('Order_status '+value) + '</span>';
            return html;
        },
        add: function () {
            Controller.api.bindevent();
            $.ajax({
                'url': 'order/index/get_id',
                'data': {},
                'dataType': 'json',
                'success': function (data) {
                    $('.order_id_dis').val(data.val);
                    $('#c-order_id').val(data.val);
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
                eSelect : function(params){
                    $.ajax({
                        'url': 'order/index/get_adds',
                        'data': {'ids':params.id},
                        'dataType': 'json',
                        'success': function (data) {
                            $('#c-order_adds_text').html(' 收货人: '+ data.consignee +'  联系电话: '+ data.mobile +'  收货地址: '+ data.delivery_adds);
                            $('#c-order_adds').val(data.id);
                            $('.open_view').attr('c_id',params.id).show();
                            $(".open_view").on('click', function () {
                                var that = $(this);
                                var c_id = that.attr('c_id');
                                var add_id = $('#c-order_adds').val();
                                var href = "address/index/get_add_info?c_id="+c_id+"&add_id="+add_id;
                                parent.Fast.api.open(href, '修改收货地址', {
                                    callback: function (param) {
                                        $('#c-order_adds_text').html(' 收货人: '+ param.consignee +'  联系电话: '+ param.mobile +'  收货地址: '+ param.delivery_adds);
                                        $('#c-order_adds').val(param.add_id);
                                    }
                                });
                                return false;
                            });
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
                $("#clone_obj").find('.goods_info').attr('name','goods_order['+i+'][goods_name]');
                $("#clone_obj").find('.remark').attr('name','goods_order['+i+'][remark]');
                $('#append_table').append($("#clone_obj").clone('click,change').show().attr('id','append_obj_'+i));
                Controller.commonSelectPage($('#append_obj_'+i),i);
            });
            $('.remove_demo').bind('click',function(){
                $(this).parent().parent().remove();
                Controller.getSumPrice();
            });
            Controller.commonSelectPage($('#append_obj_1'),1);
        },
        commonSelectPage:function(obj,j){
            obj.find('.goods_info').selectPage({
                showField : 'goods_name',
                keyField : 'id',
                data : 'order/index/get_goods_info',
                //选中项目后的回调处理
                //入参：data：选中行的原始数据对象
                eSelect : function(data){
                    obj.find('.goods_id').html(data.goods_id);
                    Controller.appendHiddenInput(obj.find('.goods_id'),'goods_order['+j+'][goods_id]',data.goods_id);
                    obj.find('.goods_cas').html(data.goods_cas);
                    Controller.appendHiddenInput(obj.find('.goods_cas'),'goods_order['+j+'][goods_cas]',data.goods_cas);
                    obj.find('.spec').html(data.spec);
                    Controller.appendHiddenInput(obj.find('.spec'),'goods_order['+j+'][spec]',data.spec);
                    obj.find('.s_price').html('<i class="fa fa-minus s_price_minus btn btn-default btn-xs" style="cursor:pointer"></i>  <input  class="form-control" name="goods_order['+j+'][s_price]" style="max-width:100px;" type="text" value="'+data.s_price+'">   <i class="fa fa-plus s_price_plus btn btn-default btn-xs" style="cursor:pointer"></i>');
                    obj.find('.num_sum').html(data.s_price);
                    obj.find('.number').html('<i class="fa fa-minus number_minus btn btn-default btn-xs" style="cursor:pointer"></i>   <input class="form-control" type="text" name="goods_order['+j+'][number]" value="1" style="max-width:45px;">  <i class="fa fa-plus number_plus btn btn-default btn-xs" style="cursor:pointer"></i>');
                    Controller.MinuxPlus(obj,'number_minus',false,true); //减
                    Controller.MinuxPlus(obj,'number_plus',true,true);//加
                    Controller.MinuxPlus(obj,'s_price_minus',false,false);//减
                    Controller.MinuxPlus(obj,'s_price_plus',true,false);//加
                    obj.find("input[name='s_price']").keyup(function(){
                        var s_price = parseFloat($(this).val());
                        if(s_price <= 0){
                            $(this).val(0);
                            s_price = 0;
                        }
                        var number = obj.find('.number').find('input').val();
                        var result = parseFloat(number * s_price);
                        obj.find('.num_sum').html(result);
                    });
                    Controller.getSumPrice();
                },

                eClear : function(){
                    obj.find('.goods_id').html('');
                    obj.find('.goods_cas').html('');
                    obj.find('.spec').html('');
                    obj.find('.s_price').html('');
                    obj.find('.num_sum').html('');
                    obj.find('.number').html('');
                    Controller.getSumPrice();
                }
            });
        },
        MinuxPlus:function(obj,lll,Minux,res){
            obj.find('.'+lll).unbind('click').click(function () {
                if(res){
                    if(Minux){
                        var number = parseInt(obj.find('.number').find('input').val()) + 1;//数量
                    }else{
                        var number = parseInt(obj.find('.number').find('input').val()) - 1 <=1 ?1:parseInt(obj.find('.number').find('input').val()) - 1;//数量
                    }
                    obj.find('.number').find('input').val(number);
                    var sprice = parseFloat(obj.find('.s_price').find('input').val());//单价
                }else{
                    if(Minux){
                        var sprice = parseFloat(obj.find('.s_price').find('input').val()) + 1;//单价
                    }else{
                        var sprice = parseFloat(obj.find('.s_price').find('input').val()) -1 <= 0 ? 0 : parseFloat(obj.find('.s_price').find('input').val()) -1;//单价
                    }
                    obj.find('.s_price').find('input').val(sprice);
                    var number = obj.find('.number').find('input').val();
                }
                var result = parseFloat(number * sprice);
                obj.find('.num_sum').html(result);
                Controller.getSumPrice();
            });
        },
        getSumPrice:function(){
           var tr_all =  $('#append_table').find('tbody').children('tr');
           var sum = 0;
           $.each(tr_all,function(index,obj){
               if(index >= 2){
                   if(parseFloat(jQuery(obj).find('.num_sum').text())){
                       sum += parseFloat(jQuery(obj).find('.num_sum').text());
                   }
               }
           });
           $('.sum_price').html(sum);
           $('#c-order_total_money').val(sum);
        },
        appendHiddenInput:function(obj,input_name,input_value)
        {
            var html = '<input type="hidden" name="'+input_name+'" value="'+input_value+'">';
            obj.append(html);
        },
        edit: function () {
            Controller.api.bindevent();
            Controller.get_add();
            var count = parseInt($('#arr_count').text());
            i = count;
            $('.append').on('click',function(){
                i++;
                $("#clone_obj").find('.goods_info').attr('name','goods_order['+i+'][goods_name]');
                $("#clone_obj").find('.remark').attr('name','goods_order['+i+'][remark]');
                $('#append_table').append($("#clone_obj").clone('click,change').show().attr('id','append_obj_'+i));
                Controller.commonSelectPage($('#append_obj_'+i),i);
            });
            r = 0;
            $('.remove_demo').bind('click',function(){
                var that = $(this).parent().parent();
                var delete_id = that.find('.delete_id').val();
                $('#append_table').append("<input type='hidden' name='delete[]' value='"+delete_id+"'>");
                that.remove();
                Controller.getSumPrice();
            });
            Controller.EditMinuxPlus('.number_minus',false,true);
            Controller.EditMinuxPlus('.number_plus',true,true);
            Controller.EditMinuxPlus('.s_price_minus',false,false);
            Controller.EditMinuxPlus('.s_price_plus',true,false);

        },
        EditMinuxPlus:function(lll,Minux,res){
            $(lll).unbind('click').click(function () {
                var obj = $(this).parent().parent();
                if(res){
                    if(Minux){
                        var number = parseInt(obj.find('.number').find('input').val()) + 1;//数量
                    }else{
                        var number = parseInt(obj.find('.number').find('input').val()) - 1 <=1 ?1:parseInt(obj.find('.number').find('input').val()) - 1;//数量
                    }
                    obj.find('.number').find('input').val(number);
                    var sprice = parseFloat(obj.find('.s_price').find('input').val());//单价
                }else{
                    if(Minux){
                        var sprice = parseFloat(obj.find('.s_price').find('input').val()) + 1;//单价
                    }else{
                        var sprice = parseFloat(obj.find('.s_price').find('input').val()) -1 <= 0 ? 0 : parseFloat(obj.find('.s_price').find('input').val()) -1;//单价
                    }
                    obj.find('.s_price').find('input').val(sprice);
                    var number = obj.find('.number').find('input').val();
                }
                var result = parseFloat(number * sprice);
                obj.find('.num_sum').html(result);
                Controller.getSumPrice();
            });
        },
        get_add:function(){
            $('.open_view_edit').unbind();
            $(".open_view_edit").on('click', function () {
                var that = $(this);
                var c_id = that.attr('c_id');
                var add_id = $('#c-order_adds').val();
                var href = "address/index/get_add_info?c_id="+c_id+"&add_id="+add_id;
                parent.Fast.api.open(href, '修改收货地址', {
                    callback: function (param) {
                        $('#c-order_adds_text').html(' 收货人: '+ param.consignee +'  联系电话: '+ param.mobile +'  收货地址: '+ param.delivery_adds);
                        $('#c-order_adds').val(param.add_id);
                    }
                });
                return false;
            });
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