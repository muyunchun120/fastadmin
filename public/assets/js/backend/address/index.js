define(['jquery', 'bootstrap', 'backend', 'table','toastr', 'form','selectpage','layer'], function ($, undefined, Backend, Table, Toastr,Form, selectPage,Layer) {

    var Controller = {
        index: function () {

        },
        add: function () {

        },

        edit: function () {
            Controller.api.bindevent();
        },
        get_add_info:function(res){
            $('#add_address').on('click',function(){
                var c_id = $(this).attr('c_id');
                var that = $(this);
                parent.Fast.api.open("address/index/add_address?c_id="+c_id, '新增收货地址', {
                    callback: function (data) {
                        window.location.reload();
                    }
                });
                return false;
            });

            $('.address_info').on('click',function(){
                var that = $(this).parent().parent().parent();
                var consignee = $(this).parent().text();
                var add_id = $(this).val();
                var mobile = that.find('.mobile').text();
                var delivery_adds = that.find('.delivery_adds').text();
                Fast.api.close({consignee: consignee, add_id: add_id,mobile:mobile,delivery_adds:delivery_adds});
            });
        },
        add_address:function(){
            $('#submit_address').on('click',function(){
                var form_data = $('#address_form').serialize();
                $.ajax({
                    'url': 'address/index/add_address',
                    'type':'POST',
                    'data': form_data,
                    'dataType': 'json',
                    'success': function (data) {
                        if(data.code === 0){
                            Toastr.error(data.msg);
                        }else{
                            Toastr.success(data.msg);
                            setTimeout(function(){
                                Fast.api.close();
                            },1000);
                        }
                    },
                    'error': function () {

                    }
                });
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