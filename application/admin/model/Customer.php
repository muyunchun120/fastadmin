<?php

namespace app\admin\model;

use think\Model;

class Customer extends Model
{
    // 表名
    protected $name = 'customer';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    
    // 追加属性
    protected $append = [
        'status_text',
        'state_text',
        'last_buy_time_text',
        'customer_type_text'
    ];
    

    
    public function getStatusList()
    {
        return ['normal' => __('Normal'),'hidden' => __('Hidden')];
    }     

    public function getStateList()
    {
        return ['0' => __('State 0'),'1' => __('State 1'),'2' => __('State 2')];
    }     

    public function getCustomerTypeList()
    {
        return ['0' => __('Customer_type 0'),'1' => __('Customer_type 1')];
    }

    public function getCustomerTypeAttr($value, $data)
    {
        $value = $value ? $value : $data['customer_type'];
        $list = $this->getCustomerTypeList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    public function getStatusTextAttr($value, $data)
    {        
        $value = $value ? $value : $data['status'];
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }


    public function getStateTextAttr($value, $data)
    {        
        $value = $value ? $value : $data['state'];
        $list = $this->getStateList();
        return isset($list[$value]) ? $list[$value] : '';
    }


    public function getLastBuyTimeTextAttr($value, $data)
    {
        $value = $value ? $value : $data['last_buy_time'];
        return is_numeric($value) ? date("Y-m-d H:i:s", $value) : $value;
    }


    public function getCustomerTypeTextAttr($value, $data)
    {        
        $value = $value ? $value : $data['customer_type'];
        $list = $this->getCustomerTypeList();
        return isset($list[$value]) ? $list[$value] : '';
    }

    protected function setLastBuyTimeAttr($value)
    {
        return $value && !is_numeric($value) ? strtotime($value) : $value;
    }


}
