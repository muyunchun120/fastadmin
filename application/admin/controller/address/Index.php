<?php

namespace app\admin\controller\address;

use app\common\controller\Backend;

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

    public function _initialize()
    {
        parent::_initialize();
        $this->addsmodel = model('Adds');
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
                ->count();

            $list = $this->model
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            $result = array("total" => $total, "rows" => $list);

            return json($result);
        }
        return $this->view->fetch();
    }

    public function add_address()
    {
        $c_id = $this->request->request('c_id');
        if(empty($c_id)){
            $this->error('客户ID不为空');
        }
        if ($this->request->isAjax()){
            $this->request->filter(['strip_tags', 'htmlspecialchars']);
            $postData = $this->request->post();
            if(empty($postData['consignee'])){
                $this->error('收货人不能为空');
            }
            if(empty($postData['mobile'])){
                $this->error('电话不为空');
            }
            if(empty($postData['delivery_adds'])){
                $this->error('详细地址不为空');
            }
            $postData['status'] = 'hidden';
            $result = $this->addsmodel->allowField(true)->save($postData);
            if($result){
                $this->success('添加成功');
            }else{
                $this->error('添加失败');
            }
        }
        $this->view->assign('c_id',$c_id);
        return $this->view->fetch('add');
    }

    /**
     * 获取地址信息
     */
    public function get_add_info()
    {
        $this->request->filter(['strip_tags', 'htmlspecialchars']);
        $c_id = $this->request->get('c_id');
        $add_id = $this->request->get('add_id');
        $where = array('c_id'=>$c_id);

        $list = $this->addsmodel->where($where)
            ->field('id,consignee,mobile,delivery_adds,status')
            ->order('createtime desc')
            ->select();
        $this->view->assign("list", $list);
        $this->view->assign("add_id", $add_id);
        $this->view->assign("c_id", $c_id);
        return $this->view->fetch('info');
    }

}
