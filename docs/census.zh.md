# 常用对象普查：建模优先级参考

样本：8 个世界、248 个地点（城镇 139、开局点 8、野外 101）。每个地点统计整片已加载区域（约 132×132 格，所有楼层，看不见的也算）。

“出现率”= 出现在多少比例的地点；“累计占比”= 按数量从高到低做到这一行时覆盖了该类多少数量；“已有模型”= 该 id 或其 looks_like 已在 cdda-cubeclysm-3d/meshset.json 中。

数据来源：Cataclysm-Vox 的 `tools/census`，在 Node 里无头运行真实 CDDA 引擎，开默认场景，把玩家瞬移到随机的城镇或野外地点后统计。采样日期 2026-11-18。

更新（在 Cataclysm-Vox 目录下）：

```sh
CENSUS_GAMES=4 CENSUS_SAMPLES=60 CENSUS_OUT=build/census npx vitest run -c tools/census/vitest.config.ts
CENSUS_MD=../cdda-cubeclysm-3d/docs/census.zh.md CENSUS_CSV_DIR=../cdda-cubeclysm-3d/docs/census \
  python3 tools/census/report.py build/census
```


## 总览

“覆盖 N%”= 按数量从高到低做，做到第几种时累计覆盖该类 N% 的数量。

| 类别 | 种数 | 覆盖 50% | 覆盖 80% | 覆盖 90% | 已有模型 |
|---|---:|---:|---:|---:|---:|
| 地形（不含墙门窗围栏屋顶） | 192 | 3 | 9 | 15 | 0 |
| 建筑·墙 | 65 | 3 | 11 | 18 | 0 |
| 建筑·门 | 55 | 3 | 9 | 15 | 0 |
| 建筑·窗 | 34 | 3 | 8 | 11 | 0 |
| 建筑·围栏 | 14 | 2 | 5 | 7 | 0 |
| 建筑·屋顶 | 15 | 1 | 2 | 2 | 0 |
| 植物（地形） | 61 | 4 | 10 | 15 | 0 |
| 植物（家具层） | 33 | 1 | 9 | 14 | 0 |
| 家具（不含门窗围栏） | 246 | 14 | 41 | 62 | 0 |
| 物品道具（地上可见） | 3043 | 26 | 164 | 332 | 761 |
| 物品道具（含容器内） | 3786 | 12 | 87 | 235 | 867 |
| 生物 | 298 | 6 | 34 | 68 | 29 |
| 尸体 | 13 | 1 | 2 | 4 | 0 |
| 载具 | 150 | 5 | 45 | 74 | 0 |
| 载具部件 | 184 | 6 | 25 | 40 | 3 |
| 陷阱 | 16 | 1 | 2 | 4 | 0 |
| 场（烟火血等） | 15 | 1 | 1 | 2 | 0 |

## 地形（不含墙门窗围栏屋顶）

共 192 种，已有模型 0 种。完整表：[terrain.csv](census/terrain.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | t_grass | grass | 草丛 | 1619592 | 100% | 35.4% | 35.4% | t_natural_floor_abstract |  |  |
| 2 | t_pavement | pavement | 路面 | 606248 | 73% | 13.3% | 48.7% |  |  |  |
| 3 | t_forestfloor | forest floor | 林地地面 | 345555 | 75% | 7.6% | 56.2% | t_moss |  |  |
| 4 | t_grass_dead | dead grass | 枯草 | 298642 | 100% | 6.5% | 62.8% | t_dirt |  |  |
| 5 | t_dirt | dirt | 泥土地 | 265645 | 100% | 5.8% | 68.6% | t_natural_floor_abstract |  |  |
| 6 | t_sidewalk | sidewalk | 人行道 | 231091 | 60% | 5.1% | 73.6% | t_concrete |  |  |
| 7 | t_floor | floor | 地板 | 137266 | 61% | 3.0% | 76.6% |  |  |  |
| 8 | t_nether_glass_floor | black glass | 黑玻璃 | 124922 | 4% | 2.7% | 79.4% |  |  |  |
| 9 | t_thconc_floor | concrete floor | 混凝土地板 | 102497 | 57% | 2.2% | 81.6% |  |  |  |
| 10 | t_treetop | treetop | 树冠 | 100317 | 94% | 2.2% | 83.8% |  |  |  |
| 11 | t_water_moving_dp | flowing deep water | 流动深水 | 77536 | 6% | 1.7% | 85.5% | t_water_dp |  |  |
| 12 | t_grass_long | long grass | 长草 | 73561 | 94% | 1.6% | 87.1% | t_grass |  |  |
| 13 | t_gutter | rain gutter | 雨水槽 | 66175 | 63% | 1.4% | 88.5% | t_metal_floor |  |  |
| 14 | t_pavement_y | yellow pavement | 黄线路面 | 57131 | 73% | 1.2% | 89.8% |  |  |  |
| 15 | t_concrete | concrete | 混凝土 | 54427 | 56% | 1.2% | 91.0% | t_pavement |  |  |
| 16 | t_moss | moss | 苔藓 | 41639 | 78% | 0.9% | 91.9% | t_grass |  |  |
| 17 | t_rock_floor | rock floor | 石地板 | 38445 | 15% | 0.8% | 92.7% |  |  |  |
| 18 | t_railroad_rubble | gravel | 碎石 | 27059 | 26% | 0.6% | 93.3% |  |  |  |
| 19 | t_linoleum_white | linoleum tile | 油毡地砖 | 23095 | 52% | 0.5% | 93.8% |  |  |  |
| 20 | t_strconc_floor | reinforced concrete floor | 强化混凝土地板 | 18926 | 5% | 0.4% | 94.2% |  |  |  |
| 21 | t_linoleum_gray | linoleum tile | 油毡地砖 | 18327 | 51% | 0.4% | 94.6% |  |  |  |
| 22 | t_floor_burnt | burnt floor | 烧焦地板 | 17185 | 33% | 0.4% | 95.0% | t_dirtfloor |  |  |
| 23 | t_sewage | sewage | 污水 | 15519 | 20% | 0.3% | 95.4% | t_water_murky |  |  |
| 24 | t_sewage_pipe | high gauge pipe | 高压管 | 14953 | 31% | 0.3% | 95.7% |  |  |  |
| 25 | t_dirtmound | upturned dirt | 翻耕泥土地 | 13391 | 73% | 0.3% | 96.0% |  |  |  |
| 26 | t_bridge | walkway | 栈道 | 12769 | 21% | 0.3% | 96.3% | t_pavement |  |  |
| 27 | t_railroad_tie | railroad tie | 铁轨枕木 | 10995 | 12% | 0.2% | 96.5% |  |  |  |
| 28 | t_treetop_evergreen | treetop | 树冠 | 10890 | 71% | 0.2% | 96.7% |  |  |  |
| 29 | t_grass_tall | tall grass | 茂密草丛 | 10434 | 27% | 0.2% | 97.0% | t_shrub |  |  |
| 30 | t_railroad_track | railroad track | 铁轨轨道 | 9552 | 12% | 0.2% | 97.2% |  |  |  |
| 31 | t_water_murky | murky shallow water | 浑浊浅水 | 9449 | 15% | 0.2% | 97.4% | t_water_sh |  |  |
| 32 | t_water_sh | shallow water | 浅水 | 7704 | 29% | 0.2% | 97.6% |  |  |  |
| 33 | t_treetop_dead | dead treetop | 枯树冠 | 7009 | 88% | 0.2% | 97.7% |  |  |  |
| 34 | t_open_air_rooved | open air | 空中 | 6727 | 6% | 0.1% | 97.9% |  |  |  |
| 35 | t_wall_burnt | burnt wall | 烧焦的墙 | 6030 | 31% | 0.1% | 98.0% | t_wall_wood_broken |  |  |
| 36 | t_water_pool | pool water | 池水 | 5420 | 13% | 0.1% | 98.1% | t_water_dp |  |  |
| 37 | t_floor_waxed | waxed floor | 打蜡地板 | 5288 | 10% | 0.1% | 98.2% |  |  |  |
| 38 | t_zebra | pedestrian crossing | 人行横道 | 5032 | 44% | 0.1% | 98.3% |  |  |  |
| 39 | t_water_moving_sh | flowing shallow water | 流动浅水 | 4910 | 7% | 0.1% | 98.4% | t_water_sh |  |  |
| 40 | t_railroad_track_on_tie | railroad track | 铁轨轨道 | 4622 | 12% | 0.1% | 98.5% |  |  |  |

## 建筑·墙

共 65 种，已有模型 0 种。完整表：[walls.csv](census/walls.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | t_concrete_wall | concrete wall | 混凝土墙 | 54858 | 58% | 28.5% | 28.5% | t_rock |  |  |
| 2 | t_nether_glass_wall | black glass | 黑玻璃 | 23791 | 4% | 12.4% | 40.8% |  |  |  |
| 3 | t_wall_w | white wall | 白色的墙 | 18648 | 50% | 9.7% | 50.5% | t_wall |  |  |
| 4 | t_brick_wall | brick wall | 砖墙 | 14914 | 43% | 7.7% | 58.3% | t_abstract_wall_brick |  |  |
| 5 | t_strconc_wall_w | reinforced white concrete wall | 白色强化混凝土墙 | 11427 | 24% | 5.9% | 64.2% | t_wall_w |  |  |
| 6 | t_concrete_wall_w | white concrete wall | 白色混凝土墙 | 8893 | 31% | 4.6% | 68.8% | t_wall_w |  |  |
| 7 | t_wall_gray | gray wall | 灰色墙壁 | 6420 | 33% | 3.3% | 72.1% | t_wall |  |  |
| 8 | t_wall_g | green wall | 绿色的墙 | 4804 | 26% | 2.5% | 74.6% | t_wall |  |  |
| 9 | t_sconc_wall_w | simple white concrete wall | 白色简易混凝土墙 | 4506 | 19% | 2.3% | 77.0% | t_wall_w |  |  |
| 10 | t_wall_wood | wooden wall | 木墙 | 4191 | 32% | 2.2% | 79.1% | t_wall |  |  |
| 11 | t_concrete_wall_gray | gray concrete wall | 灰色混凝土墙 | 4161 | 24% | 2.2% | 81.3% | t_wall_gray |  |  |
| 12 | t_strconc_wall_gray | reinforced gray concrete wall | 灰色强化混凝土墙 | 3318 | 14% | 1.7% | 83.0% | t_wall_gray |  |  |
| 13 | t_wall_glass | glass wall | 玻璃墙 | 2687 | 47% | 1.4% | 84.4% | t_window |  |  |
| 14 | t_wall_y | yellow wall | 黄色的墙 | 2668 | 24% | 1.4% | 85.8% | t_wall |  |  |
| 15 | t_wall_b | blue wall | 蓝色的墙 | 2510 | 26% | 1.3% | 87.1% | t_wall |  |  |
| 16 | t_sconc_wall_gray | simple gray concrete wall | 灰色简易混凝土墙 | 2259 | 12% | 1.2% | 88.3% | t_wall_gray |  |  |
| 17 | t_wall_black | black wall | 黑色的墙 | 2147 | 17% | 1.1% | 89.4% | t_wall |  |  |
| 18 | t_strconc_wall | reinforced concrete wall | 强化混凝土墙 | 2043 | 11% | 1.1% | 90.5% | t_concrete_wall |  |  |
| 19 | t_wall_brown | brown wall | 棕色的墙 | 1937 | 18% | 1.0% | 91.5% | t_wall |  |  |
| 20 | t_concrete_wall_flesh | overgrown wall | 血肉覆盖的墙 | 1748 | 2% | 0.9% | 92.4% |  |  |  |
| 21 | t_wall_r | red wall | 红色的墙 | 1744 | 17% | 0.9% | 93.3% | t_wall |  |  |
| 22 | t_wall_orange | orange wall | 橙色的墙 | 1565 | 17% | 0.8% | 94.1% | t_wall |  |  |
| 23 | t_sconc_wall | simple concrete wall | 简易混凝土墙 | 1493 | 8% | 0.8% | 94.9% | t_concrete_wall |  |  |
| 24 | t_rock_wall | stone wall | 石墙 | 1287 | 3% | 0.7% | 95.5% | t_rock |  |  |
| 25 | t_laminated_glass | laminated glass | 夹层玻璃墙 | 1153 | 12% | 0.6% | 96.1% | t_reinforced_glass |  |  |
| 26 | t_wall | wall | 墙 | 968 | 6% | 0.5% | 96.6% | t_abstract_wall_wood |  |  |
| 27 | t_wall_log | log wall | 原木墙 | 854 | 9% | 0.4% | 97.1% | t_wall_wood |  |  |
| 28 | t_reinforced_glass_lab | reinforced glass | 强化玻璃 | 624 | 3% | 0.3% | 97.4% | t_reinforced_glass |  |  |
| 29 | t_wall_P | pink wall | 粉色的墙 | 569 | 6% | 0.3% | 97.7% | t_wall |  |  |
| 30 | t_paper | paper wall | 纸墙 | 522 | 3% | 0.3% | 98.0% |  |  |  |
| 31 | t_wall_p | purple wall | 紫色的墙 | 481 | 3% | 0.2% | 98.2% | t_wall |  |  |
| 32 | t_wall_glass_lab | glass wall | 玻璃墙 | 463 | 2% | 0.2% | 98.5% | t_wall_glass |  |  |
| 33 | t_wall_metal | metal wall | 金属墙 | 387 | 6% | 0.2% | 98.7% | t_abstract_wall_metal |  |  |
| 34 | t_wall_metal_corrugated | corrugated metal wall | 波纹钢板墙 | 354 | 6% | 0.2% | 98.8% | t_wall_metal |  |  |
| 35 | t_wall_cyan | cyan wall | 青色的墙 | 293 | 3% | 0.2% | 99.0% | t_wall |  |  |
| 36 | t_wall_glass_alarm | glass wall | 玻璃墙 | 250 | 8% | 0.1% | 99.1% | t_wall_glass |  |  |
| 37 | t_strconc_wall_b | reinforced blue concrete wall | 蓝色强化混凝土墙 | 210 | 0% | 0.1% | 99.2% | t_wall_b |  |  |
| 38 | t_scrap_wall | simple metal wall | 简易金属墙 | 201 | 3% | 0.1% | 99.3% | t_wall_metal |  |  |
| 39 | t_column | column | 支柱 | 200 | 20% | 0.1% | 99.4% | t_rock_wall |  |  |
| 40 | t_wall_dirt | smooth dirt wall | 光滑泥墙 | 171 | 1% | 0.1% | 99.5% | t_wall_rammed_earth |  |  |

## 建筑·门

共 55 种，已有模型 0 种。完整表：[doors.csv](census/doors.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | t_door_c | closed wood door | 木门（关） | 3272 | 61% | 27.1% | 27.1% |  |  |  |
| 2 | t_door_o | open wood door | 木门（开） | 2074 | 54% | 17.2% | 44.3% |  |  |  |
| 3 | t_door_metal_locked | closed metal door | 金属门（关） | 1081 | 40% | 9.0% | 53.3% | t_door_metal_c |  |  |
| 4 | t_door_glass_frosted_lab_c | closed frosted glass door | 毛玻璃门（关） | 772 | 4% | 6.4% | 59.7% | t_door_glass_frosted_c |  |  |
| 5 | t_door_locked_interior | closed wood door | 木门（关） | 673 | 46% | 5.6% | 65.2% | t_door_locked |  |  |
| 6 | t_door_glass_c | closed glass door | 玻璃门（关） | 625 | 44% | 5.2% | 70.4% | t_door_c |  |  |
| 7 | t_door_locked | closed wood door | 木门（关） | 471 | 46% | 3.9% | 74.3% | t_door_c |  |  |
| 8 | t_door_frame | empty door frame | 空门框 | 415 | 40% | 3.4% | 77.8% | t_floor |  |  |
| 9 | t_door_b | damaged wood door | 木门（损坏） | 382 | 39% | 3.2% | 80.9% | t_door_c |  |  |
| 10 | t_chaingate_c | closed wire gate | 铁丝大门（关） | 288 | 28% | 2.4% | 83.3% |  |  |  |
| 11 | t_door_locked_alarm | closed wood door | 木门（关） | 193 | 33% | 1.6% | 84.9% | t_door_locked |  |  |
| 12 | t_door_metal_pickable | closed metal door | 金属门（关） | 188 | 11% | 1.6% | 86.5% | t_door_metal_locked |  |  |
| 13 | t_door_elocked | closed wood door with an electronic lock | 带电子锁的木门（关） | 179 | 32% | 1.5% | 88.0% | t_door_c |  |  |
| 14 | t_door_metal_c | closed metal door | 金属门（关） | 173 | 16% | 1.4% | 89.4% | t_door_c |  |  |
| 15 | t_door_locked_peep | closed wood door | 木门（关） | 146 | 30% | 1.2% | 90.6% | t_door_c_peep |  |  |
| 16 | t_laminated_door_glass_c | closed laminated glass door | 夹层玻璃门（关） | 114 | 10% | 0.9% | 91.5% | t_reinforced_door_glass_c |  |  |
| 17 | t_door_elocked_alarm | closed wood door | 木门（关） | 112 | 27% | 0.9% | 92.5% | t_door_locked |  |  |
| 18 | t_door_elocked_peep | closed wood door | 木门（关） | 112 | 27% | 0.9% | 93.4% | t_door_c_peep |  |  |
| 19 | t_reinforced_door_glass_c | closed reinforced glass door | 强化玻璃门（关） | 88 | 12% | 0.7% | 94.1% | t_door_glass_c |  |  |
| 20 | t_screen_door_c | closed screen door | 纱门（关） | 83 | 20% | 0.7% | 94.8% | t_chickenwire_gate_c |  |  |
| 21 | t_fencegate_c | closed wooden gate | 木制大门（关） | 73 | 7% | 0.6% | 95.4% |  |  |  |
| 22 | t_door_boarded | boarded up door | 门（木板封死） | 63 | 8% | 0.5% | 95.9% | t_door_locked |  |  |
| 23 | t_door_glass_lab_c | closed glass door | 玻璃门（关） | 53 | 2% | 0.4% | 96.4% | t_door_glass_c |  |  |
| 24 | t_privacy_fencegate_c | closed wooden privacy gate | 木制隐私大门（关） | 53 | 16% | 0.4% | 96.8% | t_fencegate_c |  |  |
| 25 | f_counter_gate_c | closed counter gate | 柜台门（关） | 49 | 14% | 0.4% | 97.2% | f_counter |  |  |
| 26 | f_beaded_door | beaded curtain | 珠帘 | 43 | 11% | 0.4% | 97.6% | f_canvas_door |  |  |
| 27 | t_gate_metal_c | closed metal gate | 金属门（关） | 31 | 3% | 0.3% | 97.8% | t_fencegate_c |  |  |
| 28 | t_door_bar_locked | closed bar door | 栏杆门（关） | 27 | 4% | 0.2% | 98.1% | t_door_metal_locked |  |  |
| 29 | t_door_curtain_c | closed door curtain | 门帘（关） | 23 | 3% | 0.2% | 98.3% | t_curtains |  |  |
| 30 | t_chaingate_o | open wire gate | 铁丝大门（开） | 21 | 3% | 0.2% | 98.4% |  |  |  |
| 31 | t_door_metal_corrugated_c | closed corrugated metal door | 金属卷帘门（关） | 19 | 4% | 0.2% | 98.6% | t_door_c |  |  |
| 32 | t_door_lab_c | closed wood door | 木门（关） | 18 | 2% | 0.1% | 98.7% | t_door_c |  |  |
| 33 | t_door_metal_c_peep | closed metal door with peephole | 猫眼金属门（关） | 17 | 2% | 0.1% | 98.9% | t_door_metal_c |  |  |
| 34 | f_canvas_door_o | open canvas flap | 帆布门帘（开） | 16 | 2% | 0.1% | 99.0% |  |  |  |
| 35 | t_door_b_peep | damaged wood door with peephole | 猫眼木门（损坏） | 15 | 5% | 0.1% | 99.1% | t_door_b |  |  |
| 36 | t_splitrail_fencegate_c | closed wooden split rail gate | 木制分离式围栏门（关） | 14 | 3% | 0.1% | 99.2% | t_fencegate_c |  |  |
| 37 | t_door_metal_o | open metal door | 金属门（开） | 13 | 3% | 0.1% | 99.4% | t_door_o |  |  |
| 38 | f_large_canvas_door | canvas flap | 帆布门帘 | 12 | 1% | 0.1% | 99.5% |  |  |  |
| 39 | t_door_boarded_damaged | boarded up damaged door | 门（木板封死）（损坏） | 11 | 4% | 0.1% | 99.5% | t_door_b |  |  |
| 40 | t_retractable_gate_l | locked retractable gate | 卷帘门（锁） | 9 | 0% | 0.1% | 99.6% |  |  |  |

## 建筑·窗

共 34 种，已有模型 0 种。完整表：[windows.csv](census/windows.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | t_window_domestic | window with curtains | 带帘窗 | 3537 | 52% | 28.5% | 28.5% |  |  |  |
| 2 | t_curtains | window with closed curtains | 带帘窗（拉上窗帘） | 1875 | 52% | 15.1% | 43.6% |  |  |  |
| 3 | t_window | window | 窗户 | 1472 | 33% | 11.9% | 55.5% |  |  |  |
| 4 | t_window_domestic_alarm | window with curtains | 带帘窗 | 1102 | 39% | 8.9% | 64.3% | t_window_domestic |  |  |
| 5 | t_window_frame | window frame | 窗框 | 759 | 52% | 6.1% | 70.4% |  |  |  |
| 6 | t_curtains_alarm | window with closed curtains | 带帘窗（拉上窗帘） | 624 | 38% | 5.0% | 75.5% | t_curtains |  |  |
| 7 | t_window_empty | empty window | 空窗框 | 498 | 42% | 4.0% | 79.5% | t_window_empty_no_roof |  |  |
| 8 | t_window_no_curtains | window without curtains | 无帘窗 | 450 | 39% | 3.6% | 83.1% |  |  |  |
| 9 | t_window_open | open window with curtains | 带帘窗（开） | 336 | 40% | 2.7% | 85.8% |  |  |  |
| 10 | t_window_no_curtains_open | open window without curtains | 无帘窗（开） | 308 | 42% | 2.5% | 88.3% |  |  |  |
| 11 | t_reinforced_glass_shutter_open | reinforced glass with open shutters | 强化玻璃百叶窗（开） | 240 | 8% | 1.9% | 90.2% | t_reinforced_glass |  |  |
| 12 | t_window_boarded | boarded up window | 窗户（木板封死） | 147 | 9% | 1.2% | 91.4% |  |  |  |
| 13 | t_window_alarm | window | 窗户 | 134 | 8% | 1.1% | 92.5% |  |  |  |
| 14 | t_window_no_curtains_open_alarm | open window without curtains | 无帘窗（开） | 113 | 25% | 0.9% | 93.4% | t_window_no_curtains_open |  |  |
| 15 | t_reinforced_glass_shutter | reinforced glass with closed shutters | 强化玻璃百叶窗（关） | 111 | 8% | 0.9% | 94.3% | t_wall_metal |  |  |
| 16 | t_window_no_curtains_alarm | window without curtains | 无帘窗 | 109 | 24% | 0.9% | 95.2% | t_window_no_curtains |  |  |
| 17 | t_window_open_alarm | open window with curtains | 带帘窗（开） | 99 | 21% | 0.8% | 96.0% | t_window_open |  |  |
| 18 | t_window_bars_alarm | window with metal bars | 铁条窗 | 63 | 2% | 0.5% | 96.5% | t_window_bars |  |  |
| 19 | t_window_boarded_noglass | boarded up window | 窗户（木板封死） | 52 | 6% | 0.4% | 96.9% | t_window_boarded |  |  |
| 20 | t_window_stained_blue | high stained glass window | 镶花玻璃窗 | 44 | 2% | 0.4% | 97.3% |  |  |  |
| 21 | t_window_bars_curtains | window with metal bars and curtains | 带帘铁条窗 | 42 | 3% | 0.3% | 97.6% | t_curtains |  |  |
| 22 | t_window_stained_red | stone wall with high stained glass window | 镶花玻璃窗石墙 | 41 | 1% | 0.3% | 97.9% |  |  |  |
| 23 | t_window_domestic_taped | taped window | 窗户（胶带封死） | 40 | 3% | 0.3% | 98.2% |  |  |  |
| 24 | t_window_reinforced | reinforced boarded up window | 窗户（强化板封死） | 35 | 4% | 0.3% | 98.5% | t_window_boarded |  |  |
| 25 | t_window_stained_green | stone wall with high stained glass window | 镶花玻璃窗石墙 | 35 | 1% | 0.3% | 98.8% |  |  |  |
| 26 | t_window_bars_domestic | window with metal bars and curtains | 带帘铁条窗 | 34 | 3% | 0.3% | 99.1% | t_window_bars |  |  |
| 27 | t_window_taped | taped window | 窗户（胶带封死） | 27 | 1% | 0.2% | 99.3% |  |  |  |
| 28 | t_double_pane_glass_with_curtain_open_window_closed | double glazed window with curtains | 带帘双层玻璃窗 | 22 | 0% | 0.2% | 99.5% | t_window_domestic |  |  |
| 29 | t_window_empty_no_roof | empty window | 空窗框 | 16 | 1% | 0.1% | 99.6% | t_window_empty |  |  |
| 30 | t_double_pane_glass_with_curtain | double glazed window with closed curtains | 双层玻璃窗（拉上窗帘） | 13 | 0% | 0.1% | 99.7% | t_curtains |  |  |
| 31 | t_window_reinforced_noglass | reinforced boarded up window | 窗户（强化板封死） | 13 | 3% | 0.1% | 99.8% | t_window_reinforced |  |  |
| 32 | t_window_bars | window with metal bars | 铁条窗 | 11 | 2% | 0.1% | 99.9% | t_bars |  |  |
| 33 | t_metal_ventilation_shutter | ventilation shutters | 通风百叶窗 | 10 | 0% | 0.1% | 100.0% | t_chainfence |  |  |
| 34 | t_window_bars_noglass | window frame with metal bars | 铁条窗框 | 2 | 1% | 0.0% | 100.0% | t_bars |  |  |

## 建筑·围栏

共 14 种，已有模型 0 种。完整表：[fences.csv](census/fences.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | t_chainfence | chain link fence | 勾花围栏 | 9086 | 42% | 41.5% | 41.5% |  |  |  |
| 2 | t_privacy_fence | wooden privacy fence | 木制隐私围栏 | 2777 | 23% | 12.7% | 54.2% | t_fence |  |  |
| 3 | t_concrete_railing | concrete railing | 混凝土栏杆 | 2550 | 8% | 11.6% | 65.8% | t_ponywall |  |  |
| 4 | t_railing | railing | 栏杆 | 2160 | 30% | 9.9% | 75.7% |  |  |  |
| 5 | t_fence | picket fence | 尖桩围栏 | 1493 | 13% | 6.8% | 82.5% |  |  |  |
| 6 | t_metal_railing | metal railing | 金属栏杆 | 1355 | 21% | 6.2% | 88.7% |  |  |  |
| 7 | t_splitrail_fence | split rail fence | 分离式围栏 | 1223 | 10% | 5.6% | 94.3% | t_fence |  |  |
| 8 | t_glass_railing | glass railing | 玻璃栏杆 | 597 | 5% | 2.7% | 97.0% |  |  |  |
| 9 | t_fence_barbed | barbed wire fence | 带刺铁丝网 | 235 | 2% | 1.1% | 98.1% |  |  |  |
| 10 | t_fence_post | fence post | 围栏桩 | 201 | 29% | 0.9% | 99.0% |  |  |  |
| 11 | t_fence_rope | rope fence | 绳索围栏 | 147 | 6% | 0.7% | 99.7% |  |  |  |
| 12 | t_chickenwire_fence | chickenwire fence | 铁丝网围栏 | 38 | 1% | 0.2% | 99.8% | t_chainfence |  |  |
| 13 | t_fence_metal | metal fence | 金属栅栏 | 22 | 2% | 0.1% | 99.9% | t_metal_railing |  |  |
| 14 | t_chainfence_posts | metal post | 金属桩 | 11 | 4% | 0.1% | 100.0% |  |  |  |

## 建筑·屋顶

共 15 种，已有模型 0 种。完整表：[roofs.csv](census/roofs.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | t_shingle_flat_roof | shingle flat roof | 木瓦屋顶 | 130768 | 56% | 51.6% | 51.6% | t_flat_roof |  |  |
| 2 | t_flat_roof | flat roof | 屋顶平台 | 98982 | 55% | 39.1% | 90.7% | t_concrete |  |  |
| 3 | t_tar_flat_roof | tar paper flat roof | 沥青纸屋顶 | 7913 | 15% | 3.1% | 93.8% | t_flat_roof |  |  |
| 4 | t_glass_roof | skylight | 天窗 | 7630 | 34% | 3.0% | 96.8% | t_linoleum_white |  |  |
| 5 | t_tile_flat_roof | tile flat roof | 瓦片屋顶 | 4199 | 11% | 1.7% | 98.5% | t_flat_roof |  |  |
| 6 | t_canvas_roof | canvas roof | 帆布屋顶 | 898 | 2% | 0.4% | 98.8% |  |  |  |
| 7 | f_roof_turbine_vent | roof turbine vent | 屋顶涡轮通风口 | 766 | 54% | 0.3% | 99.1% |  |  |  |
| 8 | t_roof_paper | flat roof | 屋顶平台 | 760 | 2% | 0.3% | 99.4% | t_paper |  |  |
| 9 | t_sidewalk_roof_canvas | sidewalk | 人行道 | 739 | 2% | 0.3% | 99.7% | t_sidewalk |  |  |
| 10 | t_metal_roof | metal roof | 金属屋顶 | 441 | 0% | 0.2% | 99.9% | t_scrap_floor |  |  |
| 11 | t_concrete_roof | concrete roof | 混凝土屋顶 | 132 | 2% | 0.1% | 100.0% | t_thconc_floor |  |  |
| 12 | t_metal_flat_roof | metal flat roof | 金属屋顶 | 61 | 0% | 0.0% | 100.0% | t_flat_roof |  |  |
| 13 | t_wood_roof | wooden roof | 木顶板 | 36 | 1% | 0.0% | 100.0% | t_floor |  |  |
| 14 | t_rock_roof | rock roof | 石头屋顶 | 12 | 0% | 0.0% | 100.0% | t_rock_floor |  |  |
| 15 | t_thatch_roof | thatched roof | 茅草屋顶 | 3 | 0% | 0.0% | 100.0% | t_flat_roof |  |  |

## 植物（地形）

共 61 种，已有模型 0 种。完整表：[plants_terrain.csv](census/plants_terrain.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | t_underbrush | underbrush | 灌木丛 | 60829 | 83% | 25.5% | 25.5% | t_shrub |  |  |
| 2 | t_shrub | shrub | 灌木 | 22002 | 94% | 9.2% | 34.7% | t_shrub_abstract |  |  |
| 3 | t_tree | oak tree | 橡树 | 21699 | 85% | 9.1% | 43.7% | t_tree_abstract |  |  |
| 4 | t_tree_hickory | hickory tree | 山核桃树 | 21586 | 79% | 9.0% | 52.8% | t_tree |  |  |
| 5 | t_tree_young | young tree | 小树 | 14789 | 90% | 6.2% | 59.0% | t_tree |  |  |
| 6 | t_tree_blackjack | blackjack oak | 马利兰德栎树 | 11909 | 67% | 5.0% | 63.9% | t_tree_abstract |  |  |
| 7 | t_tree_pine | pine tree | 松树 | 10872 | 71% | 4.5% | 68.5% | t_tree |  |  |
| 8 | t_fern | fern | 蕨类 | 10686 | 82% | 4.5% | 73.0% | t_underbrush |  |  |
| 9 | t_tree_birch | birch tree | 桦树 | 8748 | 69% | 3.7% | 76.6% | t_tree |  |  |
| 10 | t_tree_maple | maple tree | 枫树 | 8680 | 74% | 3.6% | 80.3% | t_tree |  |  |
| 11 | t_tree_beech | beech tree | 榉树 | 8194 | 61% | 3.4% | 83.7% | t_tree_hickory |  |  |
| 12 | t_tree_cottonwood | cottonwood tree | 棉白杨树 | 4837 | 64% | 2.0% | 85.7% | t_tree_abstract |  |  |
| 13 | t_tree_elm | elm tree | 榆树 | 4818 | 69% | 2.0% | 87.7% | t_tree_cottonwood |  |  |
| 14 | t_tree_hickory_dead | dead hickory tree | 枯山核桃树 | 2745 | 79% | 1.1% | 88.9% | t_tree_dead |  |  |
| 15 | t_tree_dead | dead tree | 枯树 | 2744 | 77% | 1.1% | 90.0% | t_tree_abstract |  |  |
| 16 | t_tree_willow | willow tree | 柳树 | 1541 | 74% | 0.6% | 90.7% | t_tree |  |  |
| 17 | t_tree_alder | alder tree | 桤木 | 1512 | 70% | 0.6% | 91.3% | t_tree_hickory |  |  |
| 18 | t_tree_sassafras | sassafras tree | 黄樟树 | 1391 | 52% | 0.6% | 91.9% | t_tree_mulberry |  |  |
| 19 | t_shrub_rose | rose bush | 玫瑰丛 | 1326 | 75% | 0.6% | 92.4% | t_shrub_abstract |  |  |
| 20 | t_shrub_blueberry | blueberry bush | 蓝莓丛 | 1299 | 75% | 0.5% | 93.0% | t_shrub_abstract |  |  |
| 21 | t_shrub_lilac | lilac bush | 丁香花丛 | 1173 | 57% | 0.5% | 93.5% | t_shrub_abstract |  |  |
| 22 | t_shrub_hobblebush | hobblebush | 绊步丛 | 1159 | 79% | 0.5% | 94.0% | t_shrub_blueberry |  |  |
| 23 | t_shrub_strawberry | strawberry bush | 草莓丛 | 1076 | 77% | 0.5% | 94.4% | t_shrub_abstract |  |  |
| 24 | t_tree_chestnut | chestnut tree | 栗树 | 1043 | 66% | 0.4% | 94.9% | t_tree_hickory |  |  |
| 25 | t_shrub_hydrangea | hydrangea bush | 绣球花丛 | 1033 | 58% | 0.4% | 95.3% | t_shrub_abstract |  |  |
| 26 | t_shrub_chokeberry | black chokeberry bush | 野樱莓丛 | 1007 | 63% | 0.4% | 95.7% | t_shrub_blueberry |  |  |
| 27 | t_tree_nannyberry | nannyberry tree | 荚蒾树 | 993 | 77% | 0.4% | 96.1% | t_tree_plum |  |  |
| 28 | t_tree_basswood | basswood tree | 椴树 | 954 | 61% | 0.4% | 96.5% | t_tree_abstract |  |  |
| 29 | t_shrub_raspberry | raspberry bush | 树莓丛 | 940 | 72% | 0.4% | 96.9% | t_shrub_strawberry |  |  |
| 30 | t_tree_deadpine | dead pine tree | 枯松树 | 892 | 49% | 0.4% | 97.3% | t_tree_dead |  |  |
| 31 | t_tree_hazelnut | hazelnut tree | 榛树 | 872 | 54% | 0.4% | 97.7% | t_tree_hickory |  |  |
| 32 | t_tree_juniper | juniper tree | 杜松子树 | 717 | 53% | 0.3% | 98.0% | t_tree_pine |  |  |
| 33 | t_shrub_huckleberry | huckleberry bush | 越橘丛 | 706 | 69% | 0.3% | 98.2% | t_shrub_blueberry |  |  |
| 34 | t_shrub_grape | grape bush | 葡萄丛 | 645 | 65% | 0.3% | 98.5% | t_shrub_blueberry |  |  |
| 35 | t_shrub_blackberry | blackberry bush | 黑莓丛 | 579 | 67% | 0.2% | 98.8% | t_shrub_blueberry |  |  |
| 36 | t_tree_apple | apple tree | 苹果树 | 416 | 23% | 0.2% | 98.9% | t_tree_fruit_abstract |  |  |
| 37 | t_tree_deadpine_warped | warped dead pine tree | 扭曲枯萎松树 | 328 | 36% | 0.1% | 99.1% | t_tree_deadpine |  |  |
| 38 | t_tree_dead_warped | warped dead tree | 扭曲枯树 | 301 | 33% | 0.1% | 99.2% | t_tree_dead |  |  |
| 39 | t_tree_elderberry | elderberry tree | 接骨木 | 297 | 57% | 0.1% | 99.3% | t_tree_plum |  |  |
| 40 | t_tree_mulberry | mulberry tree | 桑树 | 277 | 49% | 0.1% | 99.4% | t_tree_apple |  |  |

## 植物（家具层）

共 33 种，已有模型 0 种。完整表：[plants_furniture.csv](census/plants_furniture.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | f_plant_seedling | seedling | 幼苗 | 20274 | 7% | 58.2% | 58.2% |  |  |  |
| 2 | f_purple_loosestrife | purple loosestrife | 千屈菜 | 1577 | 23% | 4.5% | 62.7% | f_dahlia |  |  |
| 3 | f_planter_seedling | planter with seedling | 种植箱（发芽） | 1472 | 14% | 4.2% | 66.9% | f_plant_seedling |  |  |
| 4 | f_lily | lily | 百合花 | 1021 | 64% | 2.9% | 69.8% | f_flower_tulip |  |  |
| 5 | f_dandelion | dandelion | 蒲公英 | 817 | 78% | 2.3% | 72.2% |  |  |  |
| 6 | f_flower_tulip | tulip | 郁金香花 | 794 | 55% | 2.3% | 74.5% | f_mutpoppy |  |  |
| 7 | f_lotus | lotus | 荷花 | 794 | 21% | 2.3% | 76.7% | f_lily |  |  |
| 8 | f_japanese_knotweed | Japanese knotweed | 日本虎杖 | 787 | 48% | 2.3% | 79.0% | f_cattails |  |  |
| 9 | f_black_eyed_susan | black eyed Susan | 黑眼菊 | 683 | 55% | 2.0% | 80.9% | f_dandelion |  |  |
| 10 | f_flower_spurge | spurge flower | 大戟花 | 672 | 71% | 1.9% | 82.9% | f_dandelion |  |  |
| 11 | f_bluebell | bluebell | 蓝铃花 | 658 | 50% | 1.9% | 84.8% | f_dandelion |  |  |
| 12 | f_chamomile | chamomile | 洋甘菊 | 658 | 69% | 1.9% | 86.6% | f_dandelion |  |  |
| 13 | f_dahlia | dahlia | 大丽花 | 617 | 65% | 1.8% | 88.4% | f_dandelion |  |  |
| 14 | f_planter_mature | planter with mature plant | 种植箱（作物） | 539 | 7% | 1.5% | 90.0% | f_plant_mature |  |  |
| 15 | f_sunflower | sunflower | 向日葵 | 442 | 55% | 1.3% | 91.2% | f_dandelion |  |  |
| 16 | f_burdock | burdock | 牛蒡 | 333 | 27% | 1.0% | 92.2% | f_dandelion |  |  |
| 17 | f_maianthemum_stellatum | starry false Solomon's seal | 多花黄精 | 327 | 42% | 0.9% | 93.1% | f_lily |  |  |
| 18 | f_salsify | salsify | 婆罗门参 | 279 | 53% | 0.8% | 93.9% | f_dahlia |  |  |
| 19 | f_fireweed | fireweed | 柳兰 | 235 | 38% | 0.7% | 94.6% | f_dahlia |  |  |
| 20 | f_carrot_wild | wild carrot | 野生胡萝卜 | 224 | 46% | 0.6% | 95.2% | f_lily |  |  |
| 21 | f_thistle | thistle | 野蓟 | 217 | 47% | 0.6% | 95.9% | f_burdock |  |  |
| 22 | f_asparagus_wild | wild asparagus | 野生芦笋 | 207 | 44% | 0.6% | 96.5% | t_shrub |  |  |
| 23 | f_mutpoppy | mutated poppy flower | 变异罂粟花 | 194 | 34% | 0.6% | 97.0% | f_dandelion |  |  |
| 24 | f_planter_harvest | planter with harvestable plant | 种植箱（待收获） | 190 | 9% | 0.5% | 97.6% | f_plant_harvest |  |  |
| 25 | f_lilypad | lilypad | 百合花 | 164 | 12% | 0.5% | 98.0% |  |  |  |
| 26 | f_chicory | chicory | 菊苣菜 | 161 | 29% | 0.5% | 98.5% | f_bluebell |  |  |
| 27 | f_wild_rice | wild rice |  | 130 | 9% | 0.4% | 98.9% | f_cattails |  |  |
| 28 | f_flower_fungal | fungal flower | 真菌花 | 105 | 0% | 0.3% | 99.2% |  |  |  |
| 29 | f_mustard | mustard | 芥菜 | 93 | 27% | 0.3% | 99.4% | f_dandelion |  |  |
| 30 | f_selfheal | common selfheal | 夏枯草 | 70 | 22% | 0.2% | 99.6% | f_dahlia |  |  |
| 31 | f_jerusalem_artichoke | Jerusalem artichoke plant | 洋姜 | 64 | 20% | 0.2% | 99.8% | f_sunflower |  |  |
| 32 | f_dogbane | spreading dogbane | 披散罗布麻 | 42 | 8% | 0.1% | 99.9% | f_chamomile |  |  |
| 33 | f_plant_harvest | harvestable plant | 可收获作物 | 21 | 0% | 0.1% | 100.0% |  |  |  |

## 家具（不含门窗围栏）

共 246 种，已有模型 0 种。完整表：[furniture.csv](census/furniture.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | f_table | table | 桌子 | 8001 | 59% | 6.3% | 6.3% |  |  |  |
| 2 | f_counter | counter | 柜台 | 6801 | 58% | 5.4% | 11.6% |  |  |  |
| 3 | f_rack | display rack | 展架 | 6356 | 53% | 5.0% | 16.6% |  |  |  |
| 4 | f_chair | wooden chair | 木椅 | 5987 | 58% | 4.7% | 21.4% |  |  |  |
| 5 | f_hedge_short | short hedge | 矮树篱 | 5303 | 23% | 4.2% | 25.5% | t_shrub |  |  |
| 6 | f_bed | bed | 床铺 | 4890 | 56% | 3.8% | 29.4% |  |  |  |
| 7 | f_bench | bench | 长椅 | 4751 | 58% | 3.7% | 33.1% |  |  |  |
| 8 | f_desk | desk | 书桌 | 4370 | 56% | 3.4% | 36.5% |  |  |  |
| 9 | f_sofa | sofa | 沙发 | 3958 | 55% | 3.1% | 39.7% |  |  |  |
| 10 | f_cupboard | cupboard | 橱柜 | 3706 | 55% | 2.9% | 42.6% |  |  |  |
| 11 | f_bookcase | bookcase | 书架 | 3135 | 55% | 2.5% | 45.0% |  |  |  |
| 12 | f_sink | sink | 水槽 | 2502 | 60% | 2.0% | 47.0% |  |  |  |
| 13 | f_cattails | cattails | 香蒲草 | 2461 | 22% | 1.9% | 49.0% |  |  |  |
| 14 | f_indoor_plant | indoor plant | 室内植物 | 2451 | 55% | 1.9% | 50.9% |  |  |  |
| 15 | f_metal_bench | metal bench | 金属凳 | 2369 | 3% | 1.9% | 52.7% | f_bench |  |  |
| 16 | f_utility_shelf | utility shelf | 实用货架 | 2202 | 56% | 1.7% | 54.5% | f_rack |  |  |
| 17 | f_street_light | street light | 路灯 | 2195 | 56% | 1.7% | 56.2% | f_utility_pole |  |  |
| 18 | f_rack_wood | wooden rack | 木架 | 1947 | 52% | 1.5% | 57.7% | f_bookcase |  |  |
| 19 | f_boulder_small | small boulder | 小圆石 | 1836 | 84% | 1.4% | 59.2% |  |  |  |
| 20 | f_solar_unit | mounted polycrystalline solar panel | 多晶硅太阳能板（已安装） | 1797 | 30% | 1.4% | 60.6% |  |  |  |
| 21 | f_armchair | armchair | 扶手椅 | 1676 | 55% | 1.3% | 61.9% |  |  |  |
| 22 | f_indoor_plant_y | yellow indoor plant | 黄色室内植物 | 1639 | 55% | 1.3% | 63.2% |  |  |  |
| 23 | f_rubble | pile of rubble | 瓦砾 | 1627 | 13% | 1.3% | 64.5% |  |  |  |
| 24 | f_dresser | dresser | 衣柜 | 1590 | 55% | 1.3% | 65.7% |  |  |  |
| 25 | f_toilet | toilet | 坐便器 | 1574 | 60% | 1.2% | 67.0% |  |  |  |
| 26 | f_locker | locker | 锁柜 | 1363 | 45% | 1.1% | 68.0% |  |  |  |
| 27 | f_stool | wooden stool | 木凳 | 1259 | 51% | 1.0% | 69.0% | f_chair |  |  |
| 28 | f_wardrobe | wardrobe | 大衣柜 | 1256 | 52% | 1.0% | 70.0% | f_dresser |  |  |
| 29 | f_floor_lamp | standing lamp | 立灯 | 1228 | 54% | 1.0% | 71.0% | f_rack_coat |  |  |
| 30 | f_bathtub | bathtub | 浴缸 | 1224 | 48% | 1.0% | 71.9% |  |  |  |
| 31 | f_trashcan | trash can | 垃圾桶 | 1207 | 60% | 0.9% | 72.9% |  |  |  |
| 32 | f_grave_stone | gravestone | 墓碑 | 1172 | 9% | 0.9% | 73.8% |  |  |  |
| 33 | f_rubble_rock | pile of rocky rubble | 石砾 | 1161 | 47% | 0.9% | 74.7% |  |  |  |
| 34 | f_entertainment_center | entertainment center | 家娱中心 | 1112 | 48% | 0.9% | 75.6% | f_bookcase |  |  |
| 35 | f_coffee_table | coffee table | 咖啡桌 | 1106 | 51% | 0.9% | 76.5% | f_table |  |  |
| 36 | f_fridge | refrigerator | 冰箱 | 989 | 57% | 0.8% | 77.3% |  |  |  |
| 37 | f_console_broken | broken console | 电脑（损坏） | 851 | 31% | 0.7% | 77.9% | t_console_broken |  |  |
| 38 | f_hedge_tall | tall hedge | 茂密树篱 | 826 | 1% | 0.6% | 78.6% | t_shrub |  |  |
| 39 | f_cardboard_box | large cardboard box | 大纸板箱 | 821 | 42% | 0.6% | 79.2% |  |  |  |
| 40 | f_tatami | tatami mat | 榻榻米 | 771 | 4% | 0.6% | 79.8% |  |  |  |

## 物品道具（地上可见）

共 3043 种，已有模型 761 种。按精确 ID 匹配 485 种，占采样件数 89.8%。完整表：[items_visible.csv](census/items_visible.csv)

| # | id | 名称 | 中文名 | 件数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | leaves | handful of leaves | 树叶 | 178958 | 85% | 16.2% | 16.2% | withered | other | ✓ |
| 2 | glass_shard | glass shard | 玻璃碎片 | 90396 | 60% | 8.2% | 24.4% |  | other | ✓ |
| 3 | pipe_cpvc | PVC pipe | PVC管 | 35756 | 17% | 3.2% | 27.6% | pipe | spare_parts | ✓ |
| 4 | twig | twig | 小树枝 | 33298 | 89% | 3.0% | 30.6% | stick | other | ✓ |
| 5 | stick_common | stick | 木棍 | 24233 | 69% | 2.2% | 32.8% | stick | spare_parts | ✓ |
| 6 | lead | lead | 铅块 | 20816 | 5% | 1.9% | 34.7% |  | spare_parts | ✓ |
| 7 | seed_corn | corn seeds | 玉米种子 | 15794 | 11% | 1.4% | 36.1% | dry_corn | seeds | ✓ |
| 8 | splinter | splintered wood | 碎木 | 13968 | 64% | 1.3% | 37.4% |  | other | ✓ |
| 9 | socks | socks (pair) | 袜子（一对） | 13389 | 56% | 1.2% | 38.6% | socks_wool | clothing | ✓ |
| 10 | rock | rock | 石头 | 13144 | 98% | 1.2% | 39.8% |  | spare_parts | ✓ |
| 11 | box_small | small cardboard box | 小纸板盒 | 12013 | 65% | 1.1% | 40.8% |  | container | ✓ |
| 12 | socks_ankle | ankle socks (pair) | 船袜（一对） | 9434 | 55% | 0.9% | 41.7% | socks | clothing | ✓ |
| 13 | file | file | 文件 | 8789 | 52% | 0.8% | 42.5% |  | books | ✓ |
| 14 | material_sand | sand | 黄沙 | 8612 | 3% | 0.8% | 43.3% |  | spare_parts | ✓ |
| 15 | spoon | spoon | 勺子 | 7686 | 54% | 0.7% | 44.0% |  | other | ✓ |
| 16 | bag_plastic_small | small plastic bag | 塑料袋（小） | 7434 | 58% | 0.7% | 44.6% | bag_plastic | container | ✓ |
| 17 | bottle_plastic_small | very small plastic bottle | 塑料瓶（小） | 7314 | 64% | 0.7% | 45.3% | bottle_plastic | container | ✓ |
| 18 | cotton_patchwork | cotton patch | 棉布片 | 6765 | 59% | 0.6% | 45.9% |  | spare_parts | ✓ |
| 19 | scrap | scrap metal | 金属废料 | 6513 | 54% | 0.6% | 46.5% |  | spare_parts | ✓ |
| 20 | bag_zipper | zipper bag | 拉链袋 | 6449 | 52% | 0.6% | 47.1% | bag_plastic | container | ✓ |
| 21 | bottle_plastic | plastic bottle | 塑料瓶（中） | 6402 | 84% | 0.6% | 47.7% |  | container | ✓ |
| 22 | knife_butter | butter knife | 黄油刀 | 6360 | 54% | 0.6% | 48.2% |  | other | ✓ |
| 23 | fork | fork | 叉子 | 6064 | 54% | 0.5% | 48.8% |  | other | ✓ |
| 24 | nuts_bolts | nut and bolt | 螺栓螺母 | 6059 | 47% | 0.5% | 49.3% |  | spare_parts | ✓ |
| 25 | knife_small | small kitchen knife | 小菜刀 | 5838 | 54% | 0.5% | 49.9% |  | weapons | ✓ |
| 26 | socks_wool | wool socks (pair) | 羊毛袜（一对） | 5705 | 56% | 0.5% | 50.4% | socks | clothing | ✓ |
| 27 | pine_bough | pine bough | 松枝 | 5483 | 61% | 0.5% | 50.9% |  | other | ✓ |
| 28 | bag_garbage | garbage bag | 垃圾袋 | 5021 | 59% | 0.5% | 51.3% | bag_canvas | container | ✓ |
| 29 | wood_block | small wood block | 小木块 | 5015 | 42% | 0.5% | 51.8% |  | spare_parts | ✓ |
| 30 | pen | pen | 圆珠笔 | 4989 | 53% | 0.5% | 52.2% |  | tools | ✓ |
| 31 | black_pen | black pen | 黑色圆珠笔 | 4842 | 54% | 0.4% | 52.7% | pen | tools | ✓ |
| 32 | blue_pen | blue pen | 蓝色圆珠笔 | 4840 | 54% | 0.4% | 53.1% | pen | tools | ✓ |
| 33 | 2x4 | plank | 木板 | 4803 | 57% | 0.4% | 53.5% |  | spare_parts | ✓ |
| 34 | cardboard | piece of cardboard | 硬纸板 | 4783 | 10% | 0.4% | 54.0% | paper | spare_parts | ✓ |
| 35 | book_pieces | pieces of books | 书籍碎片 | 4737 | 5% | 0.4% | 54.4% |  | books | ✓ |
| 36 | undershirt | undershirt | 汗衫 | 4716 | 55% | 0.4% | 54.8% | tshirt | clothing | ✓ |
| 37 | plastic_straw | plastic straw | 塑料吸管 | 4590 | 53% | 0.4% | 55.2% |  | other | ✓ |
| 38 | seed_wheat | wheat seeds | 小麦种子 | 4393 | 5% | 0.4% | 55.6% | wheat | seeds | ✓ |
| 39 | novel_drama | drama novel | 戏剧小说 | 4337 | 53% | 0.4% | 56.0% | story_book | books | ✓ |
| 40 | bag_zipper_gallon | gallon-sized zipper bag | 一加仑拉链袋 | 4327 | 56% | 0.4% | 56.4% | bag_zipper | container | ✓ |

## 物品道具（含容器内）

共 3786 种，已有模型 867 种。按精确 ID 匹配 540 种，占采样件数 49.3%。完整表：[items_all.csv](census/items_all.csv)

| # | id | 名称 | 中文名 | 件数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | brazing_rod_bronze | brazing rod | 钎焊焊条 | 264148 | 9% | 6.5% | 6.5% |  | spare_parts |  |
| 2 | chem_borax | borax powder | 硼砂粉 | 220000 | 51% | 5.4% | 12.0% | detergent | chems |  |
| 3 | welding_rod_steel | welding rod | 焊条 | 218703 | 9% | 5.4% | 17.4% |  | spare_parts |  |
| 4 | material_cement | cement powder | 水泥粉 | 194744 | 6% | 4.8% | 22.2% |  | spare_parts |  |
| 5 | welding_wire_steel | welding wire | 焊丝 | 187320 | 8% | 4.6% | 26.8% |  | spare_parts |  |
| 6 | salt | salt | 盐 | 182521 | 52% | 4.5% | 31.3% |  | food | ✓ |
| 7 | leaves | handful of leaves | 树叶 | 178958 | 85% | 4.4% | 35.7% | withered | other | ✓ |
| 8 | brazing_rod_alloy | aluminum brazing rod | 铝钎焊条 | 148609 | 7% | 3.7% | 39.4% |  | spare_parts |  |
| 9 | material_quicklime | quicklime powder | 生石灰粉 | 146900 | 10% | 3.6% | 43.0% |  | chems |  |
| 10 | glass_shard | glass shard | 玻璃碎片 | 119213 | 61% | 2.9% | 45.9% |  | other | ✓ |
| 11 | material_sand | sand | 黄沙 | 107843 | 10% | 2.7% | 48.6% |  | spare_parts | ✓ |
| 12 | welding_wire_alloy | aluminum welding wire | 铝焊丝 | 101216 | 6% | 2.5% | 51.1% |  | spare_parts |  |
| 13 | welding_rod_alloy | aluminum welding rod | 铝焊条 | 98736 | 6% | 2.4% | 53.5% |  | spare_parts |  |
| 14 | solder_wire | solder | 焊料 | 78742 | 43% | 1.9% | 55.5% |  | spare_parts | ✓ |
| 15 | sugar | sugar | 糖 | 37110 | 49% | 0.9% | 56.4% |  | food | ✓ |
| 16 | detergent | detergent powder | 洗衣粉 | 36651 | 49% | 0.9% | 57.3% |  | chems |  |
| 17 | material_gravel | gravel | 碎石 | 36454 | 6% | 0.9% | 58.2% |  | spare_parts |  |
| 18 | pipe_cpvc | PVC pipe | PVC管 | 35756 | 17% | 0.9% | 59.1% | pipe | spare_parts | ✓ |
| 19 | pepper | black pepper | 黑胡椒 | 35277 | 49% | 0.9% | 60.0% |  | food | ✓ |
| 20 | twig | twig | 小树枝 | 33298 | 89% | 0.8% | 60.8% | stick | other | ✓ |
| 21 | splinter | splintered wood | 碎木 | 33280 | 65% | 0.8% | 61.6% |  | other | ✓ |
| 22 | nuts_bolts | nut and bolt | 螺栓螺母 | 27675 | 49% | 0.7% | 62.3% |  | spare_parts | ✓ |
| 23 | graphite | graphite powder | 石墨粉 | 27034 | 26% | 0.7% | 63.0% | charcoal | chems |  |
| 24 | stick_common | stick | 木棍 | 24233 | 69% | 0.6% | 63.6% | stick | spare_parts | ✓ |
| 25 | tea_raw | black tea leaves | 红茶叶 | 24124 | 42% | 0.6% | 64.1% |  | food |  |
| 26 | seasoning_salt | seasoned salt | 调味盐 | 23997 | 47% | 0.6% | 64.7% | salt | food | ✓ |
| 27 | bag_garbage | garbage bag | 垃圾袋 | 23885 | 60% | 0.6% | 65.3% | bag_canvas | container | ✓ |
| 28 | seasoning_italian | Italian seasoning | 意大利香料 | 23416 | 48% | 0.6% | 65.9% |  | food | ✓ |
| 29 | alcohol_wipes | alcohol wipe | 酒精湿巾 | 22499 | 52% | 0.6% | 66.5% |  | drugs | ✓ |
| 30 | lead | lead | 铅块 | 20816 | 5% | 0.5% | 67.0% |  | spare_parts | ✓ |
| 31 | cinnamon | cinnamon | 肉桂 | 18714 | 47% | 0.5% | 67.4% |  | food | ✓ |
| 32 | butter | butter | 黄油 | 17602 | 50% | 0.4% | 67.9% |  | food | ✓ |
| 33 | chilly-p | chili powder | 辣椒粉 | 17411 | 46% | 0.4% | 68.3% |  | food | ✓ |
| 34 | bottle_plastic_small | very small plastic bottle | 塑料瓶（小） | 16833 | 68% | 0.4% | 68.7% | bottle_plastic | container | ✓ |
| 35 | tea_green_raw | green tea leaves | 绿茶叶 | 16786 | 34% | 0.4% | 69.1% | tea_raw | food |  |
| 36 | seed_corn | corn seeds | 玉米种子 | 15794 | 11% | 0.4% | 69.5% | dry_corn | seeds | ✓ |
| 37 | box_small | small cardboard box | 小纸板盒 | 15684 | 67% | 0.4% | 69.9% |  | container | ✓ |
| 38 | cig_butt | cigarette butt | 烟蒂 | 15140 | 84% | 0.4% | 70.3% |  | other | ✓ |
| 39 | socks | socks (pair) | 袜子（一对） | 15035 | 59% | 0.4% | 70.7% | socks_wool | clothing | ✓ |
| 40 | candle_small | small candle | 细蜡烛 | 13698 | 46% | 0.3% | 71.0% |  | tools |  |

## 生物

共 298 种，已有模型 29 种。完整表：[monsters.csv](census/monsters.csv)

| # | id | 名称 | 中文名 | 只数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | mon_zombie | zombie | 丧尸 | 4734 | 60% | 30.1% | 30.1% | mon_zombie_base | 大 | ✓ |
| 2 | mon_zombie_fat | fat zombie | 肥胖丧尸 | 1076 | 55% | 6.8% | 37.0% | mon_zombie_base | 大 | ✓ |
| 3 | mon_zombie_child | zombie child | 儿童丧尸 | 787 | 53% | 5.0% | 42.0% | mon_zombie_base | 中 | ✓ |
| 4 | mon_zombie_tough | tough zombie | 健壮丧尸 | 730 | 50% | 4.6% | 46.6% | mon_zombie_base | 大 | ✓ |
| 5 | mon_zombie_brainless | brainless zombie | 无脑丧尸 | 478 | 48% | 3.0% | 49.7% | mon_zombie_base | 大 |  |
| 6 | mon_zombie_rot | decayed zombie | 腐朽丧尸 | 455 | 50% | 2.9% | 52.6% | mon_zombie_base | 大 |  |
| 7 | mon_zombie_dog | zombie dog | 丧尸犬 | 388 | 41% | 2.5% | 55.0% |  | 中 |  |
| 8 | mon_zombie_runner | zombie runner | 追猎者丧尸 | 374 | 34% | 2.4% | 57.4% | mon_zombie_base | 大 | ✓ |
| 9 | mon_zombie_living_wall | flesh wall | 肉山 | 373 | 2% | 2.4% | 59.8% |  |  |  |
| 10 | mon_civilian_panic | panicked person | 歇斯底里的路人 | 304 | 23% | 1.9% | 61.7% | mon_dementia | 大 |  |
| 11 | mon_zombie_crawler | crawling zombie | 爬行丧尸 | 239 | 42% | 1.5% | 63.3% | mon_zombie_base | 大 | ✓ |
| 12 | mon_zombie_gasbag_immobile | gangrenous flesh | 坏疽肉块 | 219 | 1% | 1.4% | 64.6% |  | 大 |  |
| 13 | pseudo_dormant_mon_zombie_fat | fat zombie | 肥胖丧尸 | 160 | 27% | 1.0% | 65.7% | corpse_mon_zombie_fat | 大 |  |
| 14 | mon_zombie_cop | zombie cop | 警察丧尸 | 158 | 29% | 1.0% | 66.7% | mon_zombie_base | 大 | ✓ |
| 15 | mon_zombie_swimmer_base | swimmer zombie | 泳装丧尸 | 157 | 26% | 1.0% | 67.7% | mon_zombie_base | 大 |  |
| 16 | mon_crow | American crow | 美洲乌鸦 | 150 | 12% | 1.0% | 68.6% | mon_bird_flying_base | 小 |  |
| 17 | mon_pseudo_dormant_zombie | zombie | 丧尸 | 149 | 25% | 0.9% | 69.6% | corpse_mon_zombie | 大 |  |
| 18 | mon_feral_human_pipe | feral human | 野性疯人 | 147 | 20% | 0.9% | 70.5% | chud | 大 |  |
| 19 | mon_feral_human_crowbar | feral human | 野性疯人 | 126 | 16% | 0.8% | 71.3% | chud | 大 |  |
| 20 | mon_zombie_gasbag_crawler | gangrenous crawler | 坏疽爬行者 | 107 | 1% | 0.7% | 72.0% |  | 大 |  |
| 21 | mon_ant_acid_small | oversized acidic ant | 大型酸蚁 | 106 | 2% | 0.7% | 72.7% | mon_ant_acid | 中 |  |
| 22 | mon_zombie_static | zapper zombie | 静电丧尸 | 106 | 25% | 0.7% | 73.3% | mon_zombie_base | 大 | ✓ |
| 23 | mon_zombie_soldier | zombie soldier | 士兵丧尸 | 100 | 22% | 0.6% | 74.0% | mon_zombie_base | 大 | ✓ |
| 24 | mon_zombie_hazmat | hazmat zombie | 防化员丧尸 | 96 | 21% | 0.6% | 74.6% | mon_zombie_base | 大 | ✓ |
| 25 | mon_civilian_stationary | petrified person | 僵滞伫立的路人 | 95 | 25% | 0.6% | 75.2% | mon_dementia | 大 |  |
| 26 | mon_turkey | wild turkey | 野生火鸡 | 95 | 5% | 0.6% | 75.8% | mon_bird_flying_base | 中 |  |
| 27 | mon_blob | slime | 变形怪 | 94 | 2% | 0.6% | 76.4% |  | 大 |  |
| 28 | mon_civilian_parent | terrified parent | 惊恐的父母 | 92 | 21% | 0.6% | 77.0% | mon_dementia | 大 |  |
| 29 | mon_silverfish_small | oversized silverfish | 大型衣魚 | 91 | 10% | 0.6% | 77.6% | mon_silverfish | 中 |  |
| 30 | mon_zombie_swat | SWAT zombie | SWAT丧尸 | 90 | 21% | 0.6% | 78.1% | mon_zombie_base | 大 | ✓ |
| 31 | mon_ant_small | oversized ant | 大型蚂蚁 | 85 | 2% | 0.5% | 78.7% | mon_ant | 中 |  |
| 32 | mon_sparrow | house sparrow | 家雀 | 76 | 4% | 0.5% | 79.2% | mon_bird_flying_base | 小 |  |
| 33 | mon_zombie_fireman | firefighter zombie | 消防员丧尸 | 73 | 20% | 0.5% | 79.6% | mon_zombie_base | 大 | ✓ |
| 34 | mon_zombie_medical | zombie medic | 医生丧尸 | 73 | 19% | 0.5% | 80.1% | mon_zombie | 大 | ✓ |
| 35 | mon_raven | raven | 乌鸦 | 71 | 7% | 0.5% | 80.5% | mon_bird_flying_base | 小 |  |
| 36 | mon_robin | American robin | 美洲知更鸟 | 70 | 5% | 0.4% | 81.0% | mon_bird_flying_base | 小 |  |
| 37 | mon_dog_zombie_rot | rot-weiler | 腐烂犬尸 | 65 | 17% | 0.4% | 81.4% | mon_zombie_dog | 中 |  |
| 38 | mon_wood_tadpole | tadpole | 蝌蚪 | 65 | 4% | 0.4% | 81.8% | mon_proxy_tadpole | 小 |  |
| 39 | mon_lemming | lemming | 旅鼠 | 62 | 5% | 0.4% | 82.2% |  | 小 |  |
| 40 | mon_civilian_zombiefighter | futile fighter | 徒劳抵抗的路人 | 61 | 15% | 0.4% | 82.6% | mon_dementia | 大 |  |

## 尸体

共 13 种，已有模型 0 种。完整表：[corpses.csv](census/corpses.csv)

| # | id | 名称 | 中文名 | 具数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | mon_null | human | 人类 | 216 | 42% | 75.5% | 75.5% |  | 大 |  |
| 2 | mon_child | child | 儿童 | 26 | 9% | 9.1% | 84.6% | mon_zombie_base | 中 |  |
| 3 | pseudo_dormant_mon_zombie_fat | fat zombie | 肥胖丧尸 | 11 | 4% | 3.8% | 88.5% | corpse_mon_zombie_fat | 大 |  |
| 4 | mon_pseudo_dormant_zombie | zombie | 丧尸 | 9 | 2% | 3.1% | 91.6% | corpse_mon_zombie | 大 |  |
| 5 | pseudo_dormant_mon_zombie_child | zombie child | 儿童丧尸 | 6 | 2% | 2.1% | 93.7% | corpse_mon_zombie_child | 中 |  |
| 6 | mon_human_scorched | charred human | 烧焦的人类 | 4 | 1% | 1.4% | 95.1% | mon_zombie_base | 大 |  |
| 7 | pseudo_dormant_mon_zombie_crawler | crawling zombie | 爬行丧尸 | 4 | 1% | 1.4% | 96.5% | corpse_mon_zombie_crawler | 大 |  |
| 8 | pseudo_dormant_mon_zombie_rot | decayed zombie | 腐朽丧尸 | 3 | 1% | 1.0% | 97.6% | corpse_mon_zombie_rot | 大 |  |
| 9 | pseudo_dormant_mon_zombie_tough | tough zombie | 健壮丧尸 | 3 | 1% | 1.0% | 98.6% | corpse_mon_zombie_tough | 大 |  |
| 10 | mon_cat_siamese | Siamese cat | 暹罗猫 | 1 | 0% | 0.3% | 99.0% | mon_cat | 小 |  |
| 11 | mon_wolf | wolf | 狼 | 1 | 0% | 0.3% | 99.3% |  | 中 |  |
| 12 | mon_wolf_pup | wolf puppy | 狼崽 | 1 | 0% | 0.3% | 99.7% | mon_dog_auscattle_pup | 小 |  |
| 13 | pseudo_dormant_mon_zombie_brainless | brainless zombie | 无脑丧尸 | 1 | 0% | 0.3% | 100.0% | corpse_mon_zombie_brainless | 大 |  |

## 载具

共 150 种，已有模型 0 种。完整表：[vehicles.csv](census/vehicles.csv)

| # | id | 名称 | 中文名 | 辆数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | rolling_trash_can | Rolling Trash Can | 手推垃圾箱 | 429 | 51% | 21.9% | 21.9% |  |  |  |
| 2 | shopping_cart | Shopping Cart | 购物车 | 390 | 15% | 19.9% | 41.7% |  |  |  |
| 3 | none | empty prototype | 空样板 | 97 | 20% | 4.9% | 46.7% |  |  |  |
| 4 | bicycle | Bicycle | 自行车 | 49 | 17% | 2.5% | 49.2% |  |  |  |
| 5 | swivel_chair | Swivel Chair | 转椅 | 48 | 6% | 2.4% | 51.6% |  |  |  |
| 6 | car | Station Wagon | 旅行车 | 32 | 11% | 1.6% | 53.2% |  |  |  |
| 7 | pickup | Pickup Truck | 皮卡 | 29 | 9% | 1.5% | 54.7% |  |  |  |
| 8 | canoe | canoe | 独木舟 | 27 | 7% | 1.4% | 56.1% |  |  |  |
| 9 | car_mini | City Car | 都市车 | 23 | 8% | 1.2% | 57.3% |  |  |  |
| 10 | suv | SUV | SUV | 23 | 7% | 1.2% | 58.4% |  |  |  |
| 11 | beetle | Beetle | 甲壳虫汽车 | 22 | 7% | 1.1% | 59.6% |  |  |  |
| 12 | van_mini | Minivan | 小型面包车 | 21 | 8% | 1.1% | 60.6% |  |  |  |
| 13 | bicycle_dirt | Mountain bike | 山地自行车 | 20 | 8% | 1.0% | 61.6% |  |  |  |
| 14 | motorcycle | Motorcycle | 摩托车 | 19 | 7% | 1.0% | 62.6% |  |  |  |
| 15 | van_cargo | Cargo Van | 箱式面包车 | 19 | 7% | 1.0% | 63.6% |  |  |  |
| 16 | car_hybrid | Hybrid Car | 混动汽车 | 18 | 6% | 0.9% | 64.5% |  |  |  |
| 17 | cube_van_cheap | Low-End Cube Van | 低档箱式货车 | 16 | 6% | 0.8% | 65.3% |  |  |  |
| 18 | ambulance | Ambulance | 救护车 | 14 | 5% | 0.7% | 66.0% |  |  |  |
| 19 | medical_cart | Medical Cart | 医疗手推车 | 14 | 2% | 0.7% | 66.7% |  |  |  |
| 20 | policesuv | Police SUV | 警用SUV | 14 | 4% | 0.7% | 67.4% |  |  |  |
| 21 | electric_car | Electric Car | 电动车 | 13 | 5% | 0.7% | 68.1% |  |  |  |
| 22 | flatbed_truck | Flatbed Truck | 平板卡车 | 13 | 5% | 0.7% | 68.8% |  |  |  |
| 23 | car_micro_hybrid | Hybrid Microcar | 混动微型车 | 12 | 4% | 0.6% | 69.4% |  |  |  |
| 24 | car_sedan | Sedan | 轿跑 | 12 | 4% | 0.6% | 70.0% |  |  |  |
| 25 | car_diesel | Station Wagon | 旅行车 | 11 | 4% | 0.6% | 70.6% |  |  |  |
| 26 | car_hatch | Hatchback | 掀背车 | 11 | 4% | 0.6% | 71.1% |  |  |  |
| 27 | policecar | Police Car | 警车 | 11 | 4% | 0.6% | 71.7% |  |  |  |
| 28 | rv | RV | 房车 | 11 | 4% | 0.6% | 72.2% |  |  |  |
| 29 | truck_trailer | Truck Trailer | 挂车 | 11 | 4% | 0.6% | 72.8% |  |  |  |
| 30 | welding_cart | Welding Cart | 电焊推车 | 11 | 3% | 0.6% | 73.4% |  |  |  |
| 31 | car_micro | Microcar | 微型车 | 10 | 4% | 0.5% | 73.9% |  |  |  |
| 32 | car_micro_electric | Electric Microcar | 电动微型车 | 10 | 4% | 0.5% | 74.4% |  |  |  |
| 33 | van_full-size | Full-size Van | 全尺寸面包车 | 10 | 4% | 0.5% | 74.9% |  |  |  |
| 34 | car_coupe_diesel_v6 | Coupe | 双门轿跑车 | 9 | 4% | 0.5% | 75.3% |  |  |  |
| 35 | cube_van | Cube Van | 箱式货车 | 9 | 4% | 0.5% | 75.8% |  |  |  |
| 36 | hippie_van | Hippie Van | 嬉皮士面包车 | 9 | 4% | 0.5% | 76.3% |  |  |  |
| 37 | humvee | Humvee | 悍马 | 9 | 4% | 0.5% | 76.7% |  |  |  |
| 38 | scompact_hybrid | Hybrid Supercompact Car | 混动超微型汽车 | 9 | 4% | 0.5% | 77.2% |  |  |  |
| 39 | security_van | Security Van | 押运车 | 9 | 3% | 0.5% | 77.6% |  |  |  |
| 40 | semi_truck | Semi Truck | 半挂卡车 | 9 | 3% | 0.5% | 78.1% |  |  |  |

## 载具部件

共 184 种，已有模型 3 种。完整表：[vehicle_parts.csv](census/vehicle_parts.csv)

| # | id | 名称 | 中文名 | 个数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | frame | steel unibody frame | 钢制一体式车架 | 14685 | 59% | 20.4% | 20.4% | frame_abstract |  |  |
| 2 | roof | roof | 车顶盖 | 6327 | 59% | 8.8% | 29.1% |  |  |  |
| 3 | hdframe | heavy-duty frame | 重型车架 | 4529 | 24% | 6.3% | 35.4% | frame_abstract |  |  |
| 4 | halfboard | quarterpanel | 半隔板 | 4528 | 58% | 6.3% | 41.7% | base_board_abstract |  |  |
| 5 | windshield | windshield | 挡风玻璃 | 3775 | 58% | 5.2% | 46.9% | t_wall_glass |  |  |
| 6 | seatbelt | seat belt | 安全带 | 2182 | 58% | 3.0% | 50.0% |  |  |  |
| 7 | wheel | wheel | 车轮 | 1940 | 54% | 2.7% | 52.6% |  |  |  |
| 8 | door | door | 车门 | 1897 | 58% | 2.6% | 55.3% | t_door_metal_c |  |  |
| 9 | xlframe | extra-light unibody frame | 超轻一体式车架 | 1722 | 53% | 2.4% | 57.7% | frame_abstract |  |  |
| 10 | wheel_mount_medium | medium wheel hub assembly | 轮毂总成 | 1623 | 59% | 2.3% | 59.9% |  |  |  |
| 11 | board | board | 隔板 | 1609 | 33% | 2.2% | 62.1% | base_board_abstract |  |  |
| 12 | wheel_mount_medium_steerable | medium wheel hub assembly (steerable) | 中型轮轴（可转向） | 1401 | 58% | 1.9% | 64.1% | wheel_mount_medium |  |  |
| 13 | headlight | car headlight | 车头灯 | 1394 | 59% | 1.9% | 66.0% |  |  |  |
| 14 | seat | bucket seat | 斗式座椅 | 1336 | 56% | 1.9% | 67.9% | reclining_seat |  |  |
| 15 | wheel_wide | wide wheel | 宽车轮 | 981 | 40% | 1.4% | 69.2% | wheel |  |  |
| 16 | trunk | trunk | 后备箱 | 867 | 45% | 1.2% | 70.4% | f_locker |  |  |
| 17 | cargo_space | cargo space | 货舱 | 862 | 30% | 1.2% | 71.6% | box |  |  |
| 18 | wheel_caster_large | set of medium casters | 中型脚轮组 | 828 | 52% | 1.1% | 72.8% |  |  |  |
| 19 | controls | vehicle controls | 载具中控台 | 803 | 60% | 1.1% | 73.9% |  |  |  |
| 20 | tank | vehicle tank (60 L) | 油箱（60升） | 779 | 55% | 1.1% | 75.0% |  |  |  |
| 21 | hdroof | heavy-duty roof | 重型车顶盖 | 769 | 11% | 1.1% | 76.0% |  |  |  |
| 22 | dashboard | dashboard | 仪表板 | 757 | 59% | 1.0% | 77.1% |  |  |  |
| 23 | vehicle_alarm | security system | 安防系统 | 753 | 59% | 1.0% | 78.1% |  |  |  |
| 24 | horn_car | car horn | 汽车喇叭 | 730 | 57% | 1.0% | 79.1% |  |  |  |
| 25 | stereo | stereo system | 音响系统 | 677 | 58% | 0.9% | 80.1% |  |  |  |
| 26 | integrated_heater_small | small integrated heater | 小型集成加热器 | 665 | 56% | 0.9% | 81.0% | mountable_heater_small |  |  |
| 27 | aisle | aisle | 过道 | 664 | 34% | 0.9% | 81.9% | t_metal_floor |  |  |
| 28 | plating_steel | steel plating | 钢制装甲板 | 636 | 8% | 0.9% | 82.8% |  |  |  |
| 29 | muffler | muffler | 引擎消音器 | 620 | 54% | 0.9% | 83.7% |  |  |  |
| 30 | battery_car | car battery | 汽车电池 | 568 | 56% | 0.8% | 84.5% |  |  |  |
| 31 | reclining_seat | reclining bucket seat | 可躺斗式座椅 | 521 | 40% | 0.7% | 85.2% | seat |  |  |
| 32 | door_trunk | trunk door | 后备箱门 | 444 | 40% | 0.6% | 85.8% | hatch |  |  |
| 33 | seat_back | bench seat | 长座椅 | 430 | 40% | 0.6% | 86.4% | seat |  |  |
| 34 | integrated_trashcan | industrial trash can | 工业垃圾箱 | 429 | 51% | 0.6% | 87.0% | f_recycle_bin |  |  |
| 35 | hdboard | heavy-duty board | 重型隔板 | 411 | 11% | 0.6% | 87.6% | base_board_abstract |  |  |
| 36 | basketlg | wire basket | 篮筐 | 390 | 15% | 0.5% | 88.1% | basketsm |  |  |
| 37 | alternator_car | car alternator | 轿车发电机 | 384 | 50% | 0.5% | 88.6% | vehicle_alternator |  |  |
| 38 | integrated_cooler | small integrated cooler | 小型集成冷却器 | 366 | 50% | 0.5% | 89.1% | mountable_cooler |  |  |
| 39 | trunk_sedan | sedan trunk | 轿车后备箱 | 336 | 34% | 0.5% | 89.6% | trunk |  |  |
| 40 | plating_military | military composite plating | 军用复合装甲板 | 328 | 5% | 0.5% | 90.1% |  |  |  |

## 陷阱

共 16 种，已有模型 0 种。完整表：[traps.csv](census/traps.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | tr_downspout_funnel |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 1407 | 60% | 71.6% | 71.6% |  |  |  |
| 2 | tr_glimmer_floor |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 241 | 0% | 12.3% | 83.9% |  |  |  |
| 3 | tr_pit |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 74 | 12% | 3.8% | 87.7% |  |  |  |
| 4 | tr_spike_pit |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 70 | 0% | 3.6% | 91.2% |  |  |  |
| 5 | tr_rollmat |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 55 | 7% | 2.8% | 94.0% |  |  |  |
| 6 | tr_cot |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 37 | 4% | 1.9% | 95.9% |  |  |  |
| 7 | tr_dormant_corpse |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 28 | 6% | 1.4% | 97.4% |  |  |  |
| 8 | tr_glass_pit |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 18 | 2% | 0.9% | 98.3% |  |  |  |
| 9 | tr_spider |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 9 | 1% | 0.5% | 98.7% |  |  |  |
| 10 | tr_beartrap |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 8 | 1% | 0.4% | 99.1% |  |  |  |
| 11 | tr_nailboard |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 5 | 1% | 0.3% | 99.4% |  |  |  |
| 12 | tr_funnel |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 4 | 2% | 0.2% | 99.6% |  |  |  |
| 13 | tr_shotgun_2 |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 4 | 1% | 0.2% | 99.8% |  |  |  |
| 14 | tr_shotgun_1 |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 2 | 1% | 0.1% | 99.9% |  |  |  |
| 15 | tr_fur_rollmat |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 1 | 0% | 0.1% | 99.9% |  |  |  |
| 16 | tr_portal |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 1 | 0% | 0.1% | 100.0% |  |  |  |

## 场（烟火血等）

共 15 种，已有模型 0 种。完整表：[fields.csv](census/fields.csv)

| # | id | 名称 | 中文名 | 格数 | 出现率 | 占比 | 累计占比 | looks_like | 备注 | 已有模型 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | fd_blood |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 56629 | 63% | 83.5% | 83.5% |  |  |  |
| 2 | fd_dust |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 9235 | 58% | 13.6% | 97.2% |  |  |  |
| 3 | fd_splinters |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 885 | 56% | 1.3% | 98.5% |  |  |  |
| 4 | fd_web |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 370 | 1% | 0.5% | 99.0% |  |  |  |
| 5 | fd_gibs_flesh |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 208 | 20% | 0.3% | 99.3% |  |  |  |
| 6 | fd_bile |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 153 | 31% | 0.2% | 99.5% |  |  |  |
| 7 | fd_dirty_water |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 93 | 25% | 0.1% | 99.7% |  |  |  |
| 8 | fd_fire |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 89 | 25% | 0.1% | 99.8% |  |  |  |
| 9 | fd_acid |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 45 | 4% | 0.1% | 99.9% |  |  |  |
| 10 | fd_blood_insect |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 35 | 4% | 0.1% | 99.9% |  |  |  |
| 11 | fd_web_nostick |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 23 | 0% | 0.0% | 100.0% |  |  |  |
| 12 | fd_blood_invertebrate |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 20 | 3% | 0.0% | 100.0% |  |  |  |
| 13 | fd_fatigue |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 1 | 0% | 0.0% | 100.0% |  |  |  |
| 14 | fd_mechanical_fluid |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 1 | 0% | 0.0% | 100.0% |  |  |  |
| 15 | fd_spores |  | Project-Id-Version: cataclysm-dda 0.J
PO-Revision-Date: 2018-04-26 14:47+0000
Last-Translator: cainiao <cainiaowu@hotmail.com>, 2026
Language-Team: Chinese (China) (https://app.transifex.com/cataclysm-dda-translators/teams/2217/zh_CN/)
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Language: zh_CN
Plural-Forms: nplurals=1; plural=0;
 | 1 | 0% | 0.0% | 100.0% |  |  |  |
