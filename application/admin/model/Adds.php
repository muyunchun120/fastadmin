<?php
/**
 * Created by PhpStorm.
 * User: wyl
 * Date: 17-12-26
 * Time: 上午9:14
 */

namespace app\admin\model;


use think\Model;

class Adds extends Model
{
    // 表名
    protected $name = 'adds';

    // 自动写入时间戳字段
    protected $autoWriteTimestamp = 'int';

    // 定义时间戳字段名
    protected $createTime = 'createtime';
    protected $updateTime = 'updatetime';
}