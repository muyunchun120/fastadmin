define(['jquery', 'bootstrap', 'backend', 'addtabs', 'table', 'echarts', 'echarts-theme', 'template'], function ($, undefined, Backend, Datatable, Table, Echarts, undefined, Template) {

    var Controller = {
        index: function () {
            // 基于准备好的dom，初始化echarts实例
            var myChart = Echarts.init(document.getElementById('echart'), 'walden');

            // 指定图表的配置项和数据
            var option = {
                title: {
                    text: '',
                    subtext: ''
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: [__('Sales'), __('Orders')]
                },
                toolbox: {
                    show: false,
                    feature: {
                        magicType: {show: true, type: ['stack', 'tiled']},
                        saveAsImage: {show: true}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: Orderdata.column
                },
                yAxis: {

                },
                grid: [{
                        left: 'left',
                        top: 'top',
                        right: '10',
                        bottom: 30
                    }],
                series: [{
                        name: __('Sales'),
                        type: 'line',
                        smooth: true,
                        areaStyle: {
                            normal: {
                            }
                        },
                        lineStyle: {
                            normal: {
                                width: 1.5
                            }
                        },
                        data: Orderdata.paydata
                    },
                    {
                        name: __('Orders'),
                        type: 'line',
                        smooth: true,
                        areaStyle: {
                            normal: {
                            }
                        },
                        lineStyle: {
                            normal: {
                                width: 1.5
                            }
                        },
                        data: Orderdata.createdata
                    }]
            };

            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);

            //动态添加数据，可以通过Ajax获取数据然后填充
            setInterval(function () {
                Orderdata.column.push((new Date()).toLocaleTimeString().replace(/^\D*/, ''));
                var amount = Math.floor(Math.random() * 200) + 20;
                Orderdata.createdata.push(amount);
                Orderdata.paydata.push(Math.floor(Math.random() * amount) + 1);

                //按自己需求可以取消这个限制
                if (Orderdata.column.length >= 20) {
                    //移除最开始的一条数据
                    Orderdata.column.shift();
                    Orderdata.paydata.shift();
                    Orderdata.createdata.shift();
                }
                myChart.setOption({
                    xAxis: {
                        data: Orderdata.column
                    },
                    series: [{
                            name: __('Sales'),
                            data: Orderdata.paydata
                        },
                        {
                            name: __('Orders'),
                            data: Orderdata.createdata
                        }]
                });
            }, 2000);
            $(window).resize(function () {
                myChart.resize();
            });

            //读取FastAdmin的更新信息
            var newslist = {"newslist":[{"id":"8","title":"admin插件开发教程之目录文件介绍","content":"<p>admin插件开发教程之目录文件介绍<br><\/p>","url":"http:\/\/forum.admin.net\/d\/282","createtime":"1505395180","updatetime":"1505395180","weigh":"8","status":"normal","status_text":"Normal"},{"id":"7","title":"admin插件开发教程之简明开发教程","content":"<p>admin插件开发教程之简明开发教程<br><\/p>","url":"http:\/\/forum.admin.net\/d\/324","createtime":"1505395159","updatetime":"1505395159","weigh":"7","status":"normal","status_text":"Normal"},{"id":"6","title":"admin的HTML版和ThinkPHP版有什么区别","content":"<p>admin的HTML版和ThinkPHP版有什么区别<br><\/p>","url":"http:\/\/forum.admin.net\/d\/244","createtime":"1505395111","updatetime":"1505395111","weigh":"6","status":"normal","status_text":"Normal"},{"id":"5","title":"提示“未知的数据格式或网络错误”时该如何排查错误？","content":"<p>提示“未知的数据格式或网络错误”时该如何排查错误？<br><\/p>","url":"http:\/\/forum.admin.net\/d\/56","createtime":"1505395088","updatetime":"1505395088","weigh":"5","status":"normal","status_text":"Normal"},{"id":"4","title":"一张图解析admin中的表格列表的功能","content":"<p>一张图解析admin中的表格列表的功能<br><\/p>","url":"http:\/\/forum.admin.net\/d\/323","createtime":"1505395069","updatetime":"1505395069","weigh":"4","status":"normal","status_text":"Normal"},{"id":"3","title":"官方增值服务正式上线！","content":"<p>官网增值服务正式上线！<br><\/p>","url":"http:\/\/www.admin.net\/service.html","createtime":"1503641537","updatetime":"1503641548","weigh":"3","status":"normal","status_text":"Normal"},{"id":"2","title":"admin插件市场正式上线！","content":"<p>admin插件市场正式上线！<br><\/p>","url":"http:\/\/www.admin.net\/store.html","createtime":"1503641508","updatetime":"1503641508","weigh":"2","status":"normal","status_text":"Normal"},{"id":"1","title":"admin全新官网上线！","content":"<p>经过近半个月时间的开发，admin全新官网正式上线<\/p>","url":"http:\/\/www.admin.net","createtime":"1503641464","updatetime":"1503641464","weigh":"1","status":"normal","status_text":"Normal"}],"new":8,"url":"http:\/\/www.admin.net?ref=news"};
            var discussionlist = {"discussionlist":[{"id":"894","title":"自己写的插件，安装后没有菜单生成","comments_count":"4","start_time":"2017-12-22 06:25:07","last_time":"2017-12-22 07:16:29","url":"http:\/\/forum.admin.net\/d\/894"},{"id":"893","title":"怎么去掉自带的input框验证？？","comments_count":"2","start_time":"2017-12-22 01:55:47","last_time":"2017-12-22 04:05:42","url":"http:\/\/forum.admin.net\/d\/893"},{"id":"892","title":"采用文档一对一关联查询，搜索时无结果","comments_count":"6","start_time":"2017-12-22 00:59:04","last_time":"2017-12-22 03:20:15","url":"http:\/\/forum.admin.net\/d\/892"},{"id":"883","title":"返回的json多带的参数,如何在js或者模板文件中调用?","comments_count":"3","start_time":"2017-12-19 06:55:41","last_time":"2017-12-21 14:51:34","url":"http:\/\/forum.admin.net\/d\/883"},{"id":"329","title":"关于跨库关联的解决方案(菜鸟篇)","comments_count":"2","start_time":"2017-08-30 08:29:05","last_time":"2017-12-21 14:46:06","url":"http:\/\/forum.admin.net\/d\/329"},{"id":"891","title":"需要展示多表数据的table应该如何合理的处理","comments_count":"1","start_time":"2017-12-21 11:42:49","last_time":"2017-12-21 11:42:49","url":"http:\/\/forum.admin.net\/d\/891"},{"id":"890","title":"admin 怎么在复制一个项目","comments_count":"1","start_time":"2017-12-21 07:49:35","last_time":"2017-12-21 07:49:35","url":"http:\/\/forum.admin.net\/d\/890"},{"id":"541","title":"前台怎么样套用后台的多文件上传以及富文本编辑器","comments_count":"5","start_time":"2017-10-26 10:24:42","last_time":"2017-12-21 06:10:20","url":"http:\/\/forum.admin.net\/d\/541"},{"id":"889","title":"怎么实现多个ID查询？","comments_count":"4","start_time":"2017-12-20 09:34:17","last_time":"2017-12-20 10:09:11","url":"http:\/\/forum.admin.net\/d\/889"},{"id":"887","title":"admin如何调用存储过程。","comments_count":"2","start_time":"2017-12-20 08:11:12","last_time":"2017-12-20 09:19:33","url":"http:\/\/forum.admin.net\/d\/887"}]};
            $("#news-list").html(Template("newstpl", {news: newslist.newslist}));
            $("#discussion-list").html(Template("discussiontpl", {news: discussionlist.discussionlist.slice(0,6)}));
            /*$.ajax({
                url: Config.fastadmin.api_url + '/news/index',
                type: 'post',
                dataType: 'jsonp',
                success: function (ret) {
                    $("#news-list").html(Template("newstpl", {news: ret.newslist}));
                }
            });*/
            /*$.ajax({
                url: Config.fastadmin.api_url + '/forum/discussion',
                type: 'post',
                dataType: 'jsonp',
                success: function (ret) {
                    $("#discussion-list").html(Template("discussiontpl", {news: ret.discussionlist.slice(0,6)}));
                }
            });*/
        }
    };

    return Controller;
});