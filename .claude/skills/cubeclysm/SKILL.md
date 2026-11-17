---
name: cubeclysm
description: Cubeclysm 风格（Unturned 式方块低模）的 CDDA 怪物与角色 3D 建模与绘制流程：按 CDDA 官方描述和体积写配方（体型、服装贴图、3D 穿戴物、奇异特征、面部部件、发型、独立于骨骼的特效），构建 glb，绑定进 cdda-cubeclysm-3d 的 meshset.json，并在 cdda-voxel-studio 里渲染检查。凡是在 cdda-cubeclysm-3d 里新建或修改丧尸/怪物/人物模型、扩充 Cubeclysm 覆盖、给模型加穿戴物/表情/发型/特效、核对模型的大小或外观是否符合 CDDA、或者问覆盖进度时，都要使用这个技能——即使用户只说"下一批""再做几个僵尸""这个看着不像"。
---

# Cubeclysm：风格与绘制

Cubeclysm 是 cdda-cubeclysm-3d 的主风格：**Unturned 式方块低模**。每个 CDDA id 一个模型，外观照着这个 id 的官方描述做，大小照着官方体积做。所有代码在 `tools/cubeclysm/`，产物绑定进库根的 `meshset.json`（名为 "Cubeclysm"，`"match": "exact"`）。

先读这两份，按需：
- `docs/standard.zh.md`（库根目录下）：《Cubeclysm 设计与约束》，是现行标准，包括技术规范、体积与体型对照、风格、必须做成 3D 的东西、特效、授权。**动手画之前读。**
- `references/toolkit.md`：现有的体型、姿势、穿戴物（GEAR）、特效（FX）、贴图画笔、服装/磨损字段、面部部件和发型清单，以及新增部件的写法。**写配方时查。**

## 用户的固定要求（都是用户亲口提过的）

- **严格映射**：只绑定最合适的 id，不泛化、不借用 looks_like。一个 id 一个模型；描述几乎相同的两个 id 也各建一个（只在徽章/配色等细节上区分）。
- **生成前先核对官方数据**：描述 + 体积/大小等级（见第 1 步）。体积决定模型体量，名字里带"兽 brute"不代表官方体积就大（锈拳丧尸兽官方只有 62.5 L）。
- **穿戴物和奇异造型必须是 3D**，不能只改贴图。帽子、面罩、背心、手铐、骨刺、肉管……都是独立方块。
- **特效独立于骨骼**：只能动 `fx_*` 节点，绝不动关节。
- **全部放在 Cubeclysm 一个集里**，不要另建"新建/备选"之类的集。
- **中文名用官方译名**（`names.zh_CN.json`，`cdda_check.py` 会打印），回复用户用中文。
- **提交 git 只在用户要求时做**。

## 流程

### 1. 核对官方数据（每个 id 都做）

```bash
python3 .claude/skills/cubeclysm/scripts/cdda_check.py mon_zombie_spitter mon_zombie_corrosive
python3 .claude/skills/cubeclysm/scripts/cdda_check.py --coverage   # 覆盖进度、剩余清单
```

输出：官方英文名/中文名、copy-from 链、描述、体积/重量/大小等级、相对 `mon_zombie` 的目标倍数；已构建的模型还会给出实际体积倍数和最低部件。

- 体积 → 体型：1.0×（62.5 L）用 standard；约 1.15× 用 tough；1.5× fat；1.6× brute；1.75× bloated；14× giant；0.5× child。具体见 `docs/standard.zh.md` 第 3 节的表。
- 描述里的每个具体特征都要在模型上找得到（衣服、配件、伤口、变异部位、姿态）。描述为空的 id，按 id 和所在文件推断，并在 `desc` 里注明"(no description in CDDA …)"。

### 2. 写配方

配方写在 `tools/cubeclysm/page/recipes.js`。基础型直接写对象；变体用 `variant(baseId, {...})` 继承，只写描述里不同的部分：
- `outfit` / `wear` / `face` 合并到基础型上；
- `newOutfit` 整套换装；
- `gear` / `fx` 整体替换，`more` / `moreFx` 追加，`drop` 去掉。

`desc` 引用官方描述原文。体积有讲究的写一行注释说明为什么选这个体型。

缺部件就在 `humanoid.js` 的 `GEAR` / `FX`、`paint.js` 的画笔、`fx.js` 的动画里加，写法见 `references/toolkit.md`。新部件写成通用的（参数从 recipe/outfit 读），方便后面复用。

### 3. 构建、量体积、贴地检查

```bash
node tools/cubeclysm/build.mjs --only id1,id2          # 产物在 sources/cubeclysm/，并合并 index.json
python3 .claude/skills/cubeclysm/scripts/cdda_check.py id1 id2
```

- 体积比（模型 ÷ 目标）在约 0.75–1.45 之间算合格。穿戴物会把比例推高到 1.4 左右；骷髅类本来就有空隙，会偏低。超出范围就调体型或部件尺寸，不要硬塞。
- `lowest:` 里脚（四足时还有手、爪；拖地的武器）应该在 y≈0，误差不超过几厘米。负很多说明穿进地面，正很多说明悬空。改姿势或长度后重建。

### 4. 绑定

```bash
node tools/deadwood/select.mjs     # 把 sources/cubeclysm 里构建好的配方自动绑定到 meshset.json
```

### 5. 渲染检查（自己先看，再交给用户）

```bash
node .claude/skills/cubeclysm/scripts/preview.mjs --out /tmp/…/sheet.png id1 id2 …      # 3/4 正面
node .claude/skills/cubeclysm/scripts/preview.mjs --heads --out /tmp/…/heads.png id1 …  # 头部特写
```

模型按标准朝北（−Z），而工作室的"正面"相机看的是 +Z，所以脚本会临时转 150°。如果直接在工作室里看到的是后脑勺，不是模型错了。图片放在 scratchpad 里，用 Read 查看。逐个对照描述检查：
- 特征看不看得清；
- 部件有没有穿模或悬空；
- 表情和描述是否相符；
- 同一批之间是否太雷同。

看不清的特征（太小、颜色太暗）要放大或提亮后重建。

### 6. 汇报

用中文，按批次列表格：id、官方中文名、官方体积、做了哪些 3D 部件和特效。另外说清楚以下几点，不要含糊：
- 核对中发现并修正的问题；
- 偏离官方的地方及原因；
- 做不到的部分，例如需要骨骼动画的"抽搐"；
- 覆盖进度（`--coverage`）；
- git 有没有提交。

## 路径

脚本默认目录结构：库、工作室、游戏三个仓库放在同一个父目录下。不在默认位置时，用环境变量 `LIB`、`STUDIO`、`CDDA` 覆盖。
- 库：`cdda-cubeclysm-3d`（当前仓库）
- 工作室：`../cdda-voxel-studio`
- CDDA 数据：`../Cataclysm-Vox/vendor/cdda/data/json`

官方数据以工作室的 `public/data/cdda/<version>/catalog.json` 为准（记录了 commit）。描述取自 CDDA JSON；如果两者版本不一致，以工作室版本为准，并告诉用户。
