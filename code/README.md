功能研发代码实现和单元测试代码目录
公共框架修改2020.03.06
1、
2、
3、
4、

├── build                      // 构建相关  
├── dist                       // 打包的文件  
├── config                     // 配置相关
├── src                        // 源代码
│   ├── api                    // 所有请求
│   ├── assets                 // 主题 字体等静态资源
│   ├── components             // 全局公用组件
│   ├── directive              // 全局指令
│   ├── filtres                // 全局 filter
│   ├── icons                  // 项目所有 svg icons
│   ├── lang                   // 国际化 language
│   ├── router                 // 路由
│   ├── store                  // 全局 store管理
│   ├── styles                 // 全局样式
│   ├── utils                  // 全局公用方法
│   ├── layout                 // 路由组件layout，顶部和侧边栏
│   ├── views                   // view
│   ├── App.vue                // 入口页面
│   ├── main.js                // 入口 加载组件 初始化等
│   └── permission.js          // 权限管理
│   └── settings.js            // defaultSettings 默认配置
├── .babelrc                   // babel-loader 配置
├── eslintrc.js                // eslint 配置项
├── .gitignore                 // git 忽略项
└── .env.staging               // 测试环境
└── .env.production            // 生产环境
└── .env.development           // 开发环境
└──  .editorconfig             // Eslint 和 .editorconfig 并不冲突，同时配合使用可以使代码风格更加优雅
└──  .postcssrc.js             // 兼容各种各样的浏览器的配置
└──  plopfile.js               // 用命令行就可以自动生成代码的工具
└──  .postcssrc.js             // 兼容各种各样的浏览器的配置
