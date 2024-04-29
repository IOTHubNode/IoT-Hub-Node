// 异步路由
export const asnycRoute = [
  // 数据可视化
  {
    path: '/dataview',
    name: 'dataview',
    meta: {
      title: '数据可视化',
      hidden: false,
      icon: 'DataLine'
    },
    redirect: '/dataview/dataDisplay',
    children: [
      // 数据大屏
      {
        path: '/dataview/datascreen',
        name: 'datascreen',

        meta: {
          title: '数据大屏',
          hidden: false,
          icon: 'Odometer'
        }
      },
      // 数据看板
      {
        path: '/dataview/dashboard',
        name: 'dashboard',

        meta: {
          title: '数据看板',
          hidden: false,
          icon: 'PieChart'
        }
      }
    ]
  },
  //设备管理
  {
    path: '/device',
    name: 'device',

    meta: {
      title: '设备管理',
      hidden: false,
      icon: 'Iphone'
    },
    redirect: '/device/deviceModel',
    children: [
      // 物模型列表
      {
        path: '/device/deviceModel',
        name: 'deviceModel',
        meta: {
          title: '物模型',
          hidden: false,
          icon: 'MessageBox'
        },
        children: [
          {
            path: '/device/deviceModel/detail',
            name: 'deviceModelDetail',
            meta: {
              title: '物模型详情',
              hidden: true,
              icon: 'MessageBox'
            }
          },
          {
            path: '/device/deviceModel/addmodel',
            name: 'addDeviceModel',

            meta: {
              title: '添加物模型',
              hidden: true,
              icon: 'MessageBox'
            }
          }
        ]
      },
      // 设备
      {
        path: '/device/deviceAdmin',
        name: 'deviceAdmin',

        meta: {
          title: '设备',
          hidden: false,
          icon: 'Monitor'
        }
      }
    ]
  },
  //监控运维
  {
    path: '/operations',
    name: 'operations',

    meta: {
      title: '监控运维',
      hidden: false,
      icon: 'DataLine'
    },
    redirect: '/operations/ota',
    children: [
      // 物模型
      {
        path: '/operations/ota',
        name: 'ota',

        meta: {
          title: 'OTA升级',
          hidden: false,
          icon: 'MessageBox'
        }
      },
      // 设备
      {
        path: '/about/about',
        name: 'deviceAdmin1',

        meta: {
          title: '设备',
          hidden: false,
          icon: 'Monitor'
        }
      }
    ]
  },
  // 管理页面
  {
    path: '/admin',
    name: 'admin',

    meta: {
      title: '系统管理',
      hidden: false,
      icon: 'Setting'
    },
    redirect: '/admin/organization',
    children: [
      {
        path: '/admin/organization',
        name: 'organization',

        meta: {
          title: '组织管理',
          hidden: false,
          icon: 'OfficeBuilding'
        }
      },
      {
        path: '/admin/account',
        name: 'account',

        meta: {
          title: '账户管理',
          hidden: false,
          icon: 'User'
        }
      },
      {
        path: '/admin/role',
        name: 'role',

        meta: {
          title: '角色管理',
          hidden: false,
          icon: 'UserFilled'
        }
      },
      {
        path: '/admin/menu',
        name: 'menu',

        meta: {
          title: '菜单管理',
          hidden: false,
          icon: 'Grid'
        }
      },
      {
        path: '/admin/function',
        name: 'function',

        meta: {
          title: '功能管理',
          hidden: false,
          icon: 'TurnOff'
        }
      }
    ]
  },
  // 功能页面
  {
    path: '/functions',
    name: 'functions',

    meta: {
      title: '功能',
      hidden: false,
      icon: 'Operation'
    },
    redirect: '/functions/echarts',
    children: [
      // echarts
      {
        path: '/functions/echarts',
        name: 'echarts',
        meta: {
          title: 'Echarts',
          hidden: false,
          icon: 'PieChart'
        },
        redirect: '/functions/echarts/bar',
        children: [
          {
            path: '/functions/echarts/bar',
            name: 'bar',

            meta: {
              title: '柱状图',
              hidden: false,
              icon: 'Histogram'
            }
          },
          {
            path: '/functions/echarts/line',
            name: 'line',

            meta: {
              title: '折线图',
              hidden: false,
              icon: 'DataLine'
            }
          },
          {
            path: '/functions/echarts/pie',
            name: 'pie',

            meta: {
              title: '饼图',
              hidden: false,
              icon: 'PieChart'
            }
          },
          {
            path: '/functions/echarts/radar',
            name: 'radar',

            meta: {
              title: '雷达图',
              hidden: false,
              icon: 'PieChart'
            }
          },
          {
            path: '/functions/echarts/map',
            name: 'map',

            meta: {
              title: '地图',
              hidden: false,
              icon: 'PieChart'
            }
          }
        ]
      },

      // MQTT客户端
      {
        path: '/functions/mqttclient',
        name: 'mqttclient',

        meta: {
          title: 'MQTT客户端',
          hidden: false,
          icon: 'Phone'
        }
      },
      // 打印功能
      {
        path: '/functions/print',
        name: 'print',
        meta: {
          title: '打印功能',
          hidden: false,
          icon: 'Printer'
        }
      }
    ]
  },
  //关于页面
  {
    path: '/about',
    name: 'about',
    meta: {
      title: 'about',
      hidden: false,
      icon: 'Link'
    },
    redirect: '/about/about',
    children: [
      // 关于系统
      {
        path: '/about/about',
        name: 'about',
        meta: {
          title: '关于系统',
          hidden: false,
          icon: 'Link'
        }
      }
    ]
  }
];
