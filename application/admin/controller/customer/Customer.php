<?php

namespace app\admin\controller\customer;

use app\common\controller\Backend;

use think\Controller;
use think\Request;

/**
 * 客户信息
 *
 * @icon fa fa-circle-o
 */
class Customer extends Backend
{
    
    /**
     * Customer模型对象
     */
    protected $model = null;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('Customer');
        $this->view->assign("statusList", $this->model->getStatusList());
        $this->view->assign("stateList", $this->model->getStateList());
        $this->view->assign("customerTypeList", $this->model->getCustomerTypeList());
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
                ->order($sort, $order)
                ->join('fa_admin','fa_admin.id = fa_customer.admin_id','left')
                ->count();

            $list = $this->model
                ->field('fa_customer.*,fa_admin.nickname')
                ->where($where)
                ->order($sort, $order)
                ->join('fa_admin','fa_admin.id = fa_customer.admin_id','left')
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
                    $result = $this->model->allowField(true)->save($params);
                    if ($result !== false)
                    {
                        $this->success();
                    }
                    else
                    {
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
                    $result = $row->allowField(true)->save($params);
                    if ($result !== false)
                    {
                        $this->success();
                    }
                    else
                    {
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
        return $this->view->fetch();
    }

    /**
     * 删除
     */
    public function del($ids = "")
    {
        if ($ids)
        {
            $pk = $this->model->getPk();
            $adminIds = $this->getDataLimitAdminIds();
            if (is_array($adminIds))
            {
                $count = $this->model->where($this->dataLimitField, 'in', $adminIds);
            }
            $list = $this->model->where($pk, 'in', $ids)->select();
            $count = 0;
            foreach ($list as $k => $v)
            {
                $count += $v->delete();
            }
            if ($count)
            {
                $this->success();
            }
            else
            {
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
    

}
