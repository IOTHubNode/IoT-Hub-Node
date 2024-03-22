export const asnycRoute = [
  // 管理页面
  {
    path: '/admin',
    name: 'admin',
    meta: {
      title: '系统管理',
      hidden: false,
      icon: 'Setting',
    },
    redirect: '/admin/organization',
    children: [
      {
        path: '/admin/organization',
        name: 'organization',
        meta: {
          title: '组织管理',
          hidden: false,
          icon: 'OfficeBuilding',
        },
      },
      {
        path: '/admin/account',
        name: 'account',
        meta: {
          title: '账户管理',
          hidden: false,
          icon: 'User',
        },
      },
      {
        path: '/admin/role',
        name: 'role',
        meta: {
          title: '角色管理',
          hidden: false,
          icon: 'UserFilled',
        },
      },
      {
        path: '/admin/menu',
        name: 'menu',
        meta: {
          title: '菜单管理',
          hidden: false,
          icon: 'Grid',
        },
      },
      {
        path: '/admin/function',
        name: 'function',
        meta: {
          title: '功能管理',
          hidden: false,
          icon: 'TurnOff',
        },
      },
    ],
  },
  // 功能页面
  {
    path: '/functions',
    name: 'functions',
    meta: {
      title: '功能',
      hidden: false,
      icon: 'Operation',
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
          icon: 'PieChart',
        },
        redirect: '/functions/echarts/bar',
        children: [
          {
            path: '/functions/echarts/bar',
            name: 'bar',
            meta: {
              title: '柱状图',
              hidden: false,
              icon: 'Histogram',
            },
          },
          {
            path: '/functions/echarts/line',
            name: 'line',
            meta: {
              title: '折线图',
              hidden: false,
              icon: 'DataLine',
            },
          },
          {
            path: '/functions/echarts/pie',
            name: 'pie',
            meta: {
              title: '饼图',
              hidden: false,
              icon: 'PieChart',
            },
          },
          {
            path: '/functions/echarts/radar',
            name: 'radar',
            meta: {
              title: '雷达图',
              hidden: false,
              icon: 'PieChart',
            },
          },
          {
            path: '/functions/echarts/map',
            name: 'map',
            meta: {
              title: '地图',
              hidden: false,
              icon: 'PieChart',
            },
          },
        ],
      },

      // MQTT客户端
      {
        path: '/functions/mqttclient',
        name: 'mqttclient',
        meta: {
          title: 'MQTT客户端',
          hidden: false,
          icon: 'Phone',
        },
      },
      // 打印功能
      {
        path: '/functions/print',
        name: 'print',
        meta: {
          title: '打印功能',
          hidden: false,
          icon: 'Printer',
        },
      },
    ],
  },
];
