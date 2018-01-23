<?php

namespace app\admin\model;

use think\Model;

class Purchase extends Model
{
    // 表名
    protected $name = 'purchase';
    
    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
    
    // 追加属性
    protected $append = [
        'status_text',
        'p_status_text'
    ];
    

    
    public function getStatusList()
    {
        return ['1' => __('Status 1'),'2' => __('Status 2')];
    }     

    public function getPStatusList()
    {
        return ['1' => __('P_status 1'),'2' => __('P_status 2')];
    }     


    public function getStatusTextAttr($value, $data)
    {        
        $value = $value ? $value : $data['status'];
        $list = $this->getStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }


    public function getPStatusTextAttr($value, $data)
    {        
        $value = $value ? $value : $data['p_status'];
        $list = $this->getPStatusList();
        return isset($list[$value]) ? $list[$value] : '';
    }




}
