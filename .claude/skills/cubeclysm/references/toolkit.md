# Cubeclysm 工具箱

清单可能落后于代码。拿不准时到源码里查最新的：

```bash
grep -oE "^  [a-zA-Z]+\(H\)" tools/cubeclysm/page/humanoid.js
```

## 文件

| 文件 | 内容 |
|---|---|
| `page/recipes.js` | 丧尸配方：`RECIPES`、`variant()`，按批次追加 |
| `page/archetypes.js` / `humans.js` | 未绑定的候选原型、人类和幸存者 |
| `page/humanoid.js` | `BODIES`、`buildHumanoid`、`pose`、`headPainter`、`GEAR`、`FX` |
| `page/paint.js` | 画笔、`baseColor`、`garment`（服装贴图） |
| `page/faces.js` / `faces/` | 面部部件和 `composeFace` |
| `page/hair.js` | `HAIR` 发型 |
| `page/fx.js` | `effects()`：`drip` / `flake` / `puff` / `pulse` / `jitter` / `sway` / `node` |
| `page/atlas.js` | `block()`（一个方块 + 它的画笔）、`bake()`（贴图集） |
| `page/build.js` | 页面端构建，输出 glb、png、index（包括 `size`、`bottom`、`low`） |
| `build.mjs` | `node tools/cubeclysm/build.mjs --only a,b`；`--seed-faces` 会重画面部部件 |
| `tools/deadwood/select.mjs` | 把构建好的配方自动绑定进 meshset.json |

## 配方字段

```js
{
  id, desc,                 // desc 用官方描述原文
  body, bulk,               // bulk：整体加厚（米），用于宽大的衣服或护甲
  pose,
  skin, hair, eye,          // 颜色（hex）
  hairStyle,
  face: { eyes, brows, mouth, marks: [], lift: { eyes: -0.2 } },
  outfit: { … },
  wear: { … },
  gear: [ … ],
  fx: [ … ],
  skull, boneScale,         // 骷髅类专用
}
```

继承写法：

```js
variant(baseId, { …, newOutfit, more, moreFx, drop })
```

**体型（BODIES）**：standard、fat、tough、bloated、female、teen、child、lanky、elongated、brute、giant。另外 `crawler` 是特殊处理的爬行体型。

**姿势**：stand、reach、hunched、crooked、crawl、prowl（四足）、drag（手臂后摆）。

**outfit 字段**：

- `style`：shirt、tshirt、tank、hoodie、uniform、coat、suit、coveralls、formal、cardigan、gown、scrubs、leather、labcoat、dress
- 颜色：`top`、`pants`、`shoes`、`gloves`、`belt`
- 款式：`sleeves`（none/short/long）、`shorts`
- 图案：`camo: [4 色]`、`plaid: [a, b]`、`stripes`（反光条）、`prison`（黑白条纹）、`sequins`
- 附加：`straps`、`tie`、`overalls`、`dogtags`、`tapedHands`、`shirt`（实验服、礼服里露出的衬衫）
- 标识：`patch`（袖章）、`text` + `textFront`（背心上的字）、`logo`（胸标 + 名牌）、`insignia`（胸前徽章）
- 部件配色：`vest`、`helmet`、`cap`、`drape`、`skirt`、`skirtColor`

**wear 字段**：`tears`、`blood`、`bloodyHands`、`wounds`、`veins`（颜色）、`stitches`、`scab`、`bone`、`soot`、`tattoos`、`meld`、`acid`、`shards`、`rust`、`shadow`。数值大多是"每个部位出现的概率"。

## 面部部件（`tools/cubeclysm/faces/`）

- **eyes**：cloudy、empty、glow、hungry、narrow、oily、one_eyed、squint_angry、uneven、wide；人类：h_almond、h_dot、h_happy、h_heavy_lids、h_iris、h_lashes、h_narrow、h_tired、h_wide、h_wink
- **brows**：angry、flat、furrowed、none、raised、sad、uneven；人类：h_arched、h_bushy、h_stern、h_thick、h_thin、h_unibrow、h_worried
- **mouth**：drool、frown_teeth、gape、gnaw、grimace、grin、jawless、small_open、snarl、stitched；人类：h_grin、h_gritted、h_lips、h_neutral、h_sad、h_smile、h_smirk、h_talk
- **marks**：bandage、blood_forehead、blood_mouth、bruise、coal_dust、rot、scar_cheek、scar_eye、stubble、veins；人类：h_blush、h_dimples、h_eyeliner、h_freckles、h_full_beard、h_goatee、h_mole、h_mustache、h_nose、h_scar_lip、h_wrinkles

新部件的加法：
1. 在 `faces.js` 的部件表里加画法（`seedPart`）。
2. 运行 `build.mjs`，它会自动生成缺少的 PNG，已有的不会覆盖。
3. 需要时手工修改 PNG。

## 发型（HAIR）

bald、buzz、short、messy、spiky、long、ponytail、bob、mohawk、afro、bun、pigtails、braid、sidePart、slicked、undercut、curtains、dreadlocks、topknot、wild、receding、balding

## 3D 部件（GEAR）

| 类别 | 部件 |
|---|---|
| 警察 / 消防 / 军人 | policeCap、badge、dutyBelt、radio、fireHelmet、fireMask、airTank、combatHelmet、tacticalVest（读取 vest/text/insignia）、kneePads、patrolCap、sailorCap、officerCap、balaclava、nvg、swatMask、flightHelmet、exoSuit |
| 防护 / 职业 | hazmatHood、minerHelmet、lampBattery、coatTails、stethoscope、idBadge、maskDown、surgicalCap、surgicalMask、glasses、visorCap |
| 原型道具 | skirt、beard、veil、strawHat、headphones、crackedSkull、topHat、seaweed、bouquet、beret、shawl、cane、truckerCap、bandanaNeck、missingForearm、faceBandana、earrings、backpack、cuffs |
| 体型特征 | belly、hump、muscles、lumps、chestSwell、jawStumps、fatRolls、tornChest、puckerMouth、translucentBelly |
| 变异 | drips、cysts（存入 `H.cysts`）、scabPlates、bonePlates、skeletalBody、calcified、boneSpikes、kevlarPlates、kevlarHide、meldLumps、hammerFists、metalShards、cudgelHands、boneClubs（配 drag 姿势）、claws、splitSkin、boneTeeth、gearScraps、shadowWisps、glassShards、fusedGasMask（存入 `H.tip`）、meltedPlates、acidTubes（存入 `H.tubes`）、drapedScrubs、trash、acidGel（存入 `H.cysts`） |

## 特效（FX）

| 特效 | 作用 | 依赖 |
|---|---|---|
| sludge | 粉色淤泥从嘴里滴落 | — |
| stench | 恶臭气体升起 | — |
| heave | 肚子起伏 | `H.belly` |
| cystPulse | 囊肿轮流鼓动 | `H.cysts` |
| gasLeak | 囊肿漏气 | `H.cysts` |
| scabFlakes | 痂片剥落 | — |
| goo | 关节渗出黑色粘液 | — |
| blackOoze | 黑色淤泥从嘴里滴落 | — |
| proboscisAcid | 肉管口滴酸、冒蒸汽 | `H.tip` |
| tubeDrip | 管子鼓动、滴酸 | `H.tubes` |
| acidHands | 手上滴酸 | — |
| shadowSmoke | 皮肤冒出阴影烟雾 | — |
| wispSway | 阴影丝摆动 | `H.wisps` |
| shardJitter | 碎片抖动 | `H.shards` |
| gelDrip | 酸液块滴落 | `H.cysts` |
| stomachPulse | 胃部鼓动 | `H.belly` |

## 画笔（paint.js）

- 基础：`fill`、`blobs`、`band`、`rng`（固定种子：同一个 key 每次结果一样）
- 磨损：`blood`、`tears`、`veins`、`wounds`、`stitches`、`scabs`
- 材质：`bone`、`muscle`、`skull`、`rust`、`meld`、`shadow`、`shards`
- 图案：`camo`、`plaid`、`tattoos`

## 新增一个 3D 部件

```js
// humanoid.js → GEAR
/** 说明它是什么、出自哪个描述。 */
myThing(H) {
  const { b, body, head, hs, arms, legs, legH, torsoTop, add, remove, skin, recipe, fx } = H;
  const w = b.torsoW / 2, d = b.torsoD / 2;   // 躯干半宽、半深；正面在 z = −d
  add(body, 'my-thing', B(x0, y0, z0, x1, y1, z1), solid(0x334455, (ctx, x, y, ww, hh, side) => {
    if (side === 'front') fill(ctx, x, y, ww * 0.5, hh * 0.5, 0xffffff);
  }));
},
```

- 坐标系：`body` 的坐标从脚底起算（躯干在 `legH`…`torsoTop`）；`head` 的坐标从下巴起算（0…`hs`，脸在 `z = −hs/2`）；手臂、腿的部件挂在对应关节上，向 −y 延伸。
- `C(w, y0, y1, d, x, z)` 生成以 x、z 为中心的方块；`B(...)` 用两个角点生成方块。
- `remove(n => /^hand\./.test(n))` 可以删掉原有部位，再换成新造型（锤子、骨棒）。
- 需要特效的部件，先用 `fx.node(parent, 'name', at)` 建节点，把方块挂在节点上，再在 `H` 上记下这个节点，供 FX 使用。
- 画笔里一律用 `rng(\`${recipe.id}|key|${side}\`)` 生成随机数，这样每次构建结果一样。
- 部件要从 `recipe.outfit` 读取颜色和参数，写成通用的，方便下一批复用。
