---
title: DevOps问题记录
date: 2021-06-04
categories:
 - devops
author: jyc
---

# Nginx

## Nginx遇到无法创建或打开nginx.pid

使用如下命令重新创建/logs/nginx.pid文件

```shell
cd /user/local/nginx
../nginx -c conf/nginx.conf
```



