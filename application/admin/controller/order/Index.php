<?php

namespace app\admin\controller\order;

use app\common\controller\Backend;

use think\Controller;
use think\Request;

/**
 * 
 *
 * @icon fa fa-circle-o
 */
class Index extends Backend
{
    
    /**
     * Order模型对象
     */
    protected $model = null;
    protected $addsmodel = null;
    protected $goodsModel = null;
    protected $ordergoodsModel = null;
    protected $customerModel = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('Order');
        $this->addsmodel = model('Adds');
        $this->goodsModel = model('goods');
        $this->ordergoodsModel = model('OrderGoods');
        $this->customerModel = model('customer');
        $this->view->assign("billList", $this->model->getBillList());
        $this->view->assign("paymentMethodList", $this->model->getPaymentMethodList());
        $this->view->assign("orderStatusList", $this->model->getOrderStatusList());
    }
    
    /**
     * 默认生成的控制器所继承的父类中有index/add/edit/del/multi五个方法
     * 因此在当前控制器中可不用编写增删改查的代码,如果需要自己控制这部分逻辑
     * 需要将application/admin/library/traits/Backend.php中对应的方法复制到当前控制器,然后进行修改
     */
    /**
     * 查看
     */
    public function index()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags']);
        if ($this->request->isAjax())
        {
            //如果发送的来源是Selectpage，则转发到Selectpage
            if ($this->request->request('pkey_name'))
            {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $total = $this->model
                ->where($where)
                ->where(array('status'=>1))
                ->order($sort, $order)
                ->count();

            $list = $this->model
                ->field('o.*,c.customer_name')
                ->alias('o')
                ->where($where)
                ->where(array('o.status'=>1))
                ->order($sort, $order)
                ->join('fa_customer c', 'c.id = o.customer_name')
                ->limit($offset, $limit)
                ->select();

            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 回收站
     */
    public function recyclebin()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags']);
        if ($this->request->isAjax())
        {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $total = $this->model
                ->onlyTrashed()
                ->where($where)
                ->order($sort, $order)
                ->count();

            $list = $this->model
                ->onlyTrashed()
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 添加
     */
    public function add()
    {
        if ($this->request->isPost())
        {
            $params = $this->request->post('row/a');
            $goodsparams = $this->request->post('goods_order/a');
            if ($params)
            {
                /*
                 * 已经弃用,如果为了兼容老版可取消注释
                  foreach ($params as $k => &$v)
                  {
                  $v = is_array($v) ? implode(',', $v) : $v;
                  }
                 */
                if (!$this->dataLimit)
                {
                    $params[$this->dataLimitField] = $this->auth->id;
                }
                try
                {
                    //是否采用模型验证
                    if ($this->modelValidate)
                    {
                        $name = basename(str_replace('\\', '/', get_class($this->model)));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.add' : true) : $this->modelValidate;
                        $this->model->validate($validate);
                    }

                    $this->model->startTrans();
                    $result = $this->model->allowField(true)->save($params);
                    $order_id = $this->model->id;
                    $goods_order_data = array();
                    if($goodsparams){
                        foreach($goodsparams as &$item){
                            $item['good_id'] = $item['goods_name'];
                            $item['goods_name'] = $item['goods_name_text'][0];
                            $item['order_id'] = $order_id;
                            unset($item['goods_name_text']);
                            $goods_order_data[] =$item;
                        }
                        unset($item);
                    }
                    $goods_order_result = $this->ordergoodsModel->allowField(true)->saveAll($goods_order_data);
                    $customerInfo = $this->customerModel->where(array('id'=>$params['customer_name']))->find();
                    $customerSaveData = array(
                        'buy_num'=>$customerInfo['buy_num']+1,
                        'last_buy_time'=>time(),
                        'last_buy_money'=>$params['total_money'],
                        'total_money'=>$customerInfo['total_money']+(int)$params['total_money'],
                        'total_integral'=>$customerInfo['total_integral']+(int)$params['total_money'],
                        'surplus_integral'=>$customerInfo['surplus_integral']+(int)$params['total_money']
                    );
                    $customer = $this->customerModel->where(array('id'=>$params['customer_name']))->update($customerSaveData);
                    if($result && $goods_order_result && $customer){
                        $this->model->commit();
                        $this->success();
                    }else{
                        $this->model->rollback();
                        $this->error($this->model->getError());
                    }
                }
                catch (\think\exception\PDOException $e)
                {
                    $this->error($e->getMessage());
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        return $this->view->fetch();
    }

    /**
     * 编辑
     */
    public function edit($ids = NULL)
    {
        $row = $this->model->get($ids);
        $good_order = $this->ordergoodsModel->where(array('order_id'=>$ids,'status'=>1))->select();
        $customer = $this->customerModel->field('customer_name')->where(array('id'=>$row['customer_name']))->find();
        $address_info = $this->addsmodel->field('id,consignee,mobile,delivery_adds')->where(array('id'=>$row['order_adds']))->find();
        if (!$row)
            $this->error(__('No Results were found'));
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds))
        {
            if (!in_array($row[$this->dataLimitField], $adminIds))
            {
                $this->error(__('You have no permission'));
            }
        }
        if ($this->request->isPost())
        {
            $params = $this->request->post("row/a");
            if ($params)
            {
                /*
                 * 已经弃用,如果为了兼容老版可取消注释
                  foreach ($params as $k => &$v)
                  {
                  $v = is_array($v) ? implode(',', $v) : $v;
                  }
                 */
                try
                {
                    //是否采用模型验证
                    if ($this->modelValidate)
                    {
                        $name = basename(str_replace('\\', '/', get_class($this->model)));
                        $validate = is_bool($this->modelValidate) ? ($this->modelSceneValidate ? $name . '.edit' : true) : $this->modelValidate;
                        $row->validate($validate);
                    }
                    $this->model->startTrans();
                    $result = $row->allowField(true)->save($params);
                    $postData = $this->request->post("goods_order/a");
                    $saveData = array(); $addData = array();
                    if($postData){
                        foreach($postData as &$item){
                            if(isset($item['id']) && !empty($item['id'])){
                                $saveData[] = $item;
                            }else{
                                $item['good_id'] = $item['goods_name'];
                                $item['goods_name'] = $item['goods_name_text'][0];
                                unset($item['goods_name_text']);
                                $item['order_id'] = $params['id'];
                                $addData[] = $item;
                            }
                        }
                        unset($item);
                        $save_goods_order_result = $this->ordergoodsModel->allowField(true)->isUpdate(true)->saveAll($saveData);
                        $add_goods_order_result = $this->ordergoodsModel->allowField(true)->saveAll($addData);
                        $deleteData = $this->request->post('delete/a');
                        if($deleteData){
                            $delData = array();
                            foreach ($deleteData as $key=>$v){
                                $delData[$key] = array('id'=>$v,'status'=>2);
                            }
                            $del_goods_order_result = $this->ordergoodsModel->allowField(true)->isUpdate(true)->saveAll($delData);
                        }
                        if ($result !== false && $save_goods_order_result !== false && $add_goods_order_result !== false)
                        {
                            $this->model->commit();
                            $this->success();
                        }
                        else
                        {
                            $this->model->rollback();
                            $this->error($row->getError());
                        }
                    }
                    if ($result !== false)
                    {
                        $this->model->commit();
                        $this->success();
                    }
                    else
                    {
                        $this->model->rollback();
                        $this->error($row->getError());
                    }
                }
                catch (\think\exception\PDOException $e)
                {
                    $this->error($e->getMessage());
                }
            }
            $this->error(__('Parameter %s can not be empty', ''));
        }
        $this->view->assign("row", $row);
        $this->view->assign("good_order", $good_order);
        $this->view->assign("customer", $customer);
        $this->view->assign("address_info", $address_info);
        return $this->view->fetch();
    }

    /**
     * 删除
     */
    public function del($ids = "")
    {
        if ($ids)
        {
            $ids = !empty($ids) ? explode(',',$ids) : array();
            $order_saveData = array(); $orderGoodsData = array();
            foreach($ids as $key=>$order_id){
                $order_saveData[$key] = array('id'=>$order_id,'status'=>3);
                $orderGoodsData[$key] = array('order_id'=>$order_id);
            }
            $this->model->startTrans();
            $order_result = $this->model->allowField(true)->isUpdate(true)->saveAll($order_saveData);
            $goods_order_result = true;
            if($orderGoodsData){
                foreach($orderGoodsData as $val){
                    $goods_order_result = $this->ordergoodsModel->where(array('order_id'=>$val['order_id']))->update(array('status'=>3));
                    if($goods_order_result === false){
                        break;
                    }
                }
            }
            if ($order_result !== false && $goods_order_result !== false)
            {
                $this->model->commit();
                $this->success();
            }
            else
            {
                $this->model->rollback();
                $this->error(__('No rows were deleted'));
            }
        }
        $this->error(__('Parameter %s can not be empty', 'ids'));
    }

    /**
     * 真实删除
     */
    public function destroy($ids = "")
    {
        $pk = $this->model->getPk();
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds))
        {
            $count = $this->model->where($this->dataLimitField, 'in', $adminIds);
        }
        if ($ids)
        {
            $this->model->where($pk, 'in', $ids);
        }
        $count = 0;
        $list = $this->model->onlyTrashed()->select();
        foreach ($list as $k => $v)
        {
            $count += $v->delete(true);
        }
        if ($count)
        {
            $this->success();
        }
        else
        {
            $this->error(__('No rows were deleted'));
        }
        $this->error(__('Parameter %s can not be empty', 'ids'));
    }

    /**
     * 还原
     */
    public function restore($ids = "")
    {
        $pk = $this->model->getPk();
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds))
        {
            $this->model->where($this->dataLimitField, 'in', $adminIds);
        }
        if ($ids)
        {
            $this->model->where($pk, 'in', $ids);
        }
        $count = $this->model->restore('1=1');
        if ($count)
        {
            $this->success();
        }
        $this->error(__('No rows were updated'));
    }

    /**
     * 批量更新
     */
    public function multi($ids = "")
    {
        $ids = $ids ? $ids : $this->request->param("ids");
        if ($ids)
        {
            if ($this->request->has('params'))
            {
                parse_str($this->request->post("params"), $values);
                $values = array_intersect_key($values, array_flip(is_array($this->multiFields) ? $this->multiFields : explode(',', $this->multiFields)));
                if ($values)
                {
                    $adminIds = $this->getDataLimitAdminIds();
                    if (is_array($adminIds))
                    {
                        $this->model->where($this->dataLimitField, 'in', $adminIds);
                    }
                    $count = $this->model->where($this->model->getPk(), 'in', $ids)->update($values);
                    if ($count)
                    {
                        $this->success();
                    }
                    else
                    {
                        $this->error(__('No rows were updated'));
                    }
                }
                else
                {
                    $this->error(__('You have no permission'));
                }
            }
        }
        $this->error(__('Parameter %s can not be empty', 'ids'));
    }

    /**
     * 导入
     */
    protected function import()
    {
        $file = $this->request->request('file');
        if (!$file)
        {
            $this->error(__('Parameter %s can not be empty', 'file'));
        }
        $filePath = ROOT_PATH . DS . 'public' . DS . $file;
        if (!is_file($filePath))
        {
            $this->error(__('No results were found'));
        }
        $PHPReader = new \PHPExcel_Reader_Excel2007();
        if (!$PHPReader->canRead($filePath))
        {
            $PHPReader = new \PHPExcel_Reader_Excel5();
            if (!$PHPReader->canRead($filePath))
            {
                $PHPReader = new \PHPExcel_Reader_CSV();
                if (!$PHPReader->canRead($filePath))
                {
                    $this->error(__('Unknown data format'));
                }
            }
        }

        $table = $this->model->getQuery()->getTable();
        $database = \think\Config::get('database.database');
        $fieldArr = [];
        $list = db()->query("SELECT COLUMN_NAME,COLUMN_COMMENT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?", [$table, $database]);
        foreach ($list as $k => $v)
        {
            $fieldArr[$v['COLUMN_COMMENT']] = $v['COLUMN_NAME'];
        }

        $PHPExcel = $PHPReader->load($filePath); //加载文件
        $currentSheet = $PHPExcel->getSheet(0);  //读取文件中的第一个工作表
        $allColumn = $currentSheet->getHighestColumn(); //取得最大的列号
        $allRow = $currentSheet->getHighestRow(); //取得一共有多少行

        for ($currentRow = 1; $currentRow <= 1; $currentRow++)
        {
            for ($currentColumn = 'A'; $currentColumn <= $allColumn; $currentColumn++)
            {
                $val = $currentSheet->getCellByColumnAndRow(ord($currentColumn) - 65, $currentRow)->getValue();
                $fields[] = $val;
            }
        }
        $insert = [];
        for ($currentRow = 2; $currentRow <= $allRow; $currentRow++)
        {
            $values = [];
            for ($currentColumn = 'A'; $currentColumn <= $allColumn; $currentColumn++)
            {
                $val = $currentSheet->getCellByColumnAndRow(ord($currentColumn) - 65, $currentRow)->getValue(); /*                 * ord()将字符转为十进制数 */
                $values[] = is_null($val) ? '' : $val;
                //echo iconv('utf-8','gb2312', $val)."\t";
            }
            $row = [];
            $temp = array_combine($fields, $values);
            foreach ($temp as $k => $v)
            {
                if (isset($fieldArr[$k]) && $k !== '')
                {
                    $row[$fieldArr[$k]] = $v;
                }
            }
            if ($row)
            {
                $insert[] = $row;
            }
        }
        if (!$insert)
        {
            $this->error(__('No rows were updated'));
        }
        try
        {
            $this->model->saveAll($insert);
        }
        catch (\think\exception\PDOException $exception)
        {
            $this->error($exception->getMessage());
        }

        $this->success();
    }

    public function get_id()
    {
        $date = date('ymd');
        $str = 'ZK'.$date;
        $result = $this->model->where('order_id','like',"$str%")->order('id','desc')->value('order_id');
        if($result){
            $num = (int)(substr($result,-3,3))+1;
            if($num>=100){
                $strnum = $num;
            }elseif ($num>=10){
                $strnum = '0'.$num;
            }else{
                $strnum = '00'.$num;
            }
            $strjson = $str.$strnum;
        }else{
            $strjson =  $str.'001';
        }

        return json(['val'=>$strjson]);
    }

    public function get_adds($ids = ""){

        $pk = 'c_id';
        $adminIds = $this->getDataLimitAdminIds();
        if (is_array($adminIds))
        {
            $this->addsmodel->where($this->dataLimitField, 'in', $adminIds);
        }

        if ($ids)
        {
            $list = $this->addsmodel->where($pk,$ids)->where('status','normal')->find();
        }

        if ($list)
        {
            return json($list);
        }
        $this->error(__('No rows were updated'));
    }

    /**
     * 获取商品
     */
    public function get_goods_info()
    {
        //设置过滤方法
        $this->request->filter(['strip_tags', 'htmlspecialchars']);
        $goods_name = $this->request->request("goods_name");
        $where = '';
        if(!empty($goods_name)){
            $where = " goods_name like '%{$goods_name}%' ";
        }
        //分页大小
        $list = $this->goodsModel->where($where)
            ->order('createtime desc')
            ->field('*')
            ->select();
        //这里一定要返回有list这个字段,total是可选的,如果total<=list的数量,则会隐藏分页按钮
        return json(['list' => $list, 'total' => count($list)]);
    }


}
