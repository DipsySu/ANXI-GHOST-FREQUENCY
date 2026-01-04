# 部署指南 / Deployment Guide

我们提供两种部署方案，请根据您的喜好选择。

## 方案 A：在 NAS 上构建 (Source Code Transfer)
*适合：带宽大，NAS 性能尚可，想方便修改配置*

1. **传输代码**: 使用 `rsync` 或直接复制文件到 NAS。
2. **构建 & 启动**:
   ```bash
   cd <项目目录>
   docker-compose up --build -d
   ```

---

## 方案 B：本地构建镜像并传输 (Image Transfer)
*适合：NAS 只有运行环境，或者您不想在 NAS 上下载依赖*

### 1. 本地构建
在电脑上运行：
```bash
# 如果您的 NAS 架构与电脑不同（如电脑是 x86，NAS 是 ARM/树莓派），请使用 buildx
# docker buildx build --platform linux/amd64 -t anxi-ghost .
docker build -t anxi-ghost .
```

### 2. 导出镜像
将镜像打包成 tar 文件：
```bash
docker save -o anxi-ghost.tar anxi-ghost
```

### 3. 传输文件
**[在您的电脑/WSL 上执行]**
将以下三个文件传到 NAS 的同一个目录 (例如您刚刚创建的 `/volume3/docker/anxi`)：

```bash
# 请将 update_to_your_nas_path 替换为实际路径
scp anxi-ghost.tar docker-compose.yml .env root@<NAS_IP>:/volume3/docker/anxi/
```

### 4. NAS 上加载 & 启动
SSH 登录到 NAS，进入该目录：

```bash
# 导入镜像
docker load -i anxi-ghost.tar

# 启动 (因为镜像已存在，它不会尝试去 build)
docker-compose up -d
```

---

## 访问
服务启动后，打开浏览器访问：`http://[NAS_IP]:8000`

## 常见问题
- **端口冲突**: 如果 8000 被占用，请修改 `docker-compose.yml` 中的 props (例如 `"8080:8000"`).
- **架构不兼容**: 如果在 NAS 上看到 `exec format error`，说明电脑和 NAS CPU 架构不一致（x86 vs ARM），请用 `buildx` 指定平台重新构建。
