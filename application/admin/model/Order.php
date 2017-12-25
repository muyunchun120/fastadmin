<?php

namespace app\admin\model;

use think\Model;

class Order extends Model
{
    // 表名
    protected $name = 'order';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = false;

    // 定义时间戳字段名
    protected $createTime = false;
    protected $updateTime = false;
    
    // 追加属性
    protected $append = [
        'bill_text',
        'delivery_time_text',
        'payment_method_text',
        'order_status_text'
    ];
    

    
    public function getBillList()
    {
        return ['0' => __('Bill 0'),'1' => __('Bill 1'),'2' => __('Bill 2'),'3' => __('Bill 3'),'4' => __('Bill 4')];
    }     

    public function getPaymentMethodList()
    {
        return ['1' => __('Payment_method 1'),'2' => __('Payment_method 2'),'3' => __('Payment_method 3'),'4' => __('Payment_method 4'),'5' => __('Payment_method 5'),'6' => __('Payment_method 6'),'7' => __('Payment_method 7'),'8' => __('Payment_method 8'),'9' => __('Payment_method 9'),'10' => __('Payment_method 10'),'11' => __('Payment_method 11'),'12' => __('Payment_method 12'),'13' => __('Payment_method 13')];
    }     

    public function getOrderStatusList()
    {
        return ['1' => __('Order_status 1'),'2' => __('Order_status 2'),'3' => __('Order_status 3')];
    }     


    public function getBillTextAttr($value, $data)
    {        
        $value = $value ? $value : $data['bill'];
        $list = $this->getBillList();
        return isset($list[$value]) ? $list[$value] : '';
    }


    public function getDeliveryTimeTextAttr($value, $data)
    {
        $value = $value ? $value : $data['delivery_time'];
        return is_numeric($value) ? date("Y-m-d H:i:s", $value) : $value;
    }


    public function getPaymentMethodTextAttr($value, $data)
    {        
        $value = $value ? $value : $data['payment_method'];
        $list = $this->getPaymentMethodList();
        return isset($list[$value]) ? $list[$value] : '';
    }


    public function getOrderStatusTextAttr($value, $data)
    {        
        $value = $value ? $value : $data['order_status'];
        $list = $this->getOrderStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    protected function setDeliveryTimeAttr($value)
    {
        return $value && !is_numeric($value) ? strtotime($value) : $value;
    }


}
