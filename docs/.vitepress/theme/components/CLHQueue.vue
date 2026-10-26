<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

// 三个固定槽位 [哨兵, 线程二, 线程三]：位置不变，靠显隐、换装和指针平移表达队列变化。
interface NodeState {
  present: boolean
  kind: 'dummy' | 'wait' | 'holder' | 'ghost'
  label: string
  sub: string[]
  parked?: boolean
}

interface Step {
  title: string
  desc: string
  nodes: NodeState[]
  head: number | null
  tail: number | null
  state: number
  holder: string | null
  queueNote: string
}

const NODE_W = 170
const NODE_H = 72
const NODE_Y = 76
const GAP = 56
const MARGIN = 69

function nodeX(i: number) {
  return MARGIN + i * (NODE_W + GAP)
}

const hidden: NodeState = { present: false, kind: 'wait', label: '', sub: [] }
const dummyN = (ws: string): NodeState => ({
  present: true,
  kind: 'dummy',
  label: '哨兵节点',
  sub: ['thread = null', `waitStatus = ${ws}`],
})
const ghostN = (): NodeState => ({
  present: true,
  kind: 'ghost',
  label: '哨兵节点',
  sub: ['已从队列断开', '等待 GC'],
})
const waitN = (name: string, ws: string): NodeState => ({
  present: true,
  kind: 'wait',
  label: name,
  sub: [`waitStatus = ${ws}`],
  parked: true,
})
const holderN = (name: string): NodeState => ({
  present: true,
  kind: 'holder',
  label: name,
  sub: ['waitStatus = 0'],
  parked: false,
})

const steps: Step[] = [
  {
    title: '初始状态：线程一抢到锁',
    desc: '线程一 CAS 把 state 从 0 改成 1，抢到锁。此刻 CLH 队列还没被创建：head = null，tail = null。',
    nodes: [hidden, hidden, hidden],
    head: null,
    tail: null,
    state: 1,
    holder: '线程一',
    queueNote: '未初始化',
  },
  {
    title: '线程二抢锁失败：队列懒初始化',
    desc: '线程二 tryAcquire 失败，进入 enq() 自旋。队列第一次使用要先初始化：new Node() 造出一个哨兵头节点（不对应任何线程），head 和 tail 同时指向它。',
    nodes: [dummyN('0'), hidden, hidden],
    head: 0,
    tail: 0,
    state: 1,
    holder: '线程一',
    queueNote: '仅哨兵节点',
  },
  {
    title: '线程二 CAS 入队并挂起',
    desc: '线程二执行 node.prev = 哨兵，再用 compareAndSetTail 把自己 CAS 到队尾。shouldParkAfterFailedAcquire 随后把哨兵的 waitStatus 改成 -1（SIGNAL，意为「释放锁时记得唤醒我的后继」），然后线程二 park() 挂起。',
    nodes: [dummyN('-1'), waitN('线程二', '0'), hidden],
    head: 0,
    tail: 1,
    state: 1,
    holder: '线程一',
    queueNote: '1 个等待节点',
  },
  {
    title: '线程三 CAS 入队并挂起',
    desc: '线程三同样抢锁失败，CAS 入队成为新 tail。入队前它把线程二的 waitStatus 也标记为 -1——在 CLH 队列里，每个线程的唤醒都由前驱负责，所以排队期间大家安心 park。',
    nodes: [dummyN('-1'), waitN('线程二', '-1'), waitN('线程三', '0')],
    head: 0,
    tail: 2,
    state: 1,
    holder: '线程一',
    queueNote: '2 个等待节点',
  },
  {
    title: '线程一释放锁',
    desc: '线程一执行 unlock()：state 1 → 0。release() 检查到 head.waitStatus = -1 ≠ 0，调用 unparkSuccessor(head)，唤醒 head.next 对应的线程——线程二。',
    nodes: [dummyN('-1'), waitN('线程二', '-1'), waitN('线程三', '0')],
    head: 0,
    tail: 2,
    state: 0,
    holder: null,
    queueNote: '2 个等待节点',
  },
  {
    title: '线程二接棒，成为新 head',
    desc: '线程二被 unpark 唤醒，在 acquireQueued 的 for 循环里再次 tryAcquire 成功：setHead(node) 让自己成为新 head，旧哨兵断开引用、等待 GC。注意 head 之后挂着的才是真正的等待队列，此刻只剩线程三。',
    nodes: [ghostN(), holderN('线程二'), waitN('线程三', '0')],
    head: 1,
    tail: 2,
    state: 1,
    holder: '线程二',
    queueNote: '1 个等待节点',
  },
]

const current = ref(0)
const playing = ref(false)
const step = computed(() => steps[current.value])
const last = steps.length - 1

let timer: ReturnType<typeof setInterval> | undefined
function clearTimer() {
  if (timer !== undefined) {
    clearInterval(timer)
    timer = undefined
  }
}

function pause() {
  playing.value = false
  clearTimer()
}

function play() {
  if (current.value >= last) current.value = 0
  playing.value = true
  clearTimer()
  timer = setInterval(() => {
    if (current.value >= last) pause()
    else current.value += 1
  }, 2800)
}

function toggle() {
  playing.value ? pause() : play()
}
function next() {
  pause()
  if (current.value < last) current.value += 1
}
function prev() {
  pause()
  if (current.value > 0) current.value -= 1
}
function reset() {
  pause()
  current.value = 0
}
function jump(i: number) {
  pause()
  current.value = i
}
onBeforeUnmount(clearTimer)

function pointerX(slot: number | null) {
  return slot === null ? MARGIN + NODE_W / 2 : nodeX(slot) + NODE_W / 2
}
const anyPresent = computed(() => step.value.nodes.some((n) => n.present))
function gapVisible(i: number) {
  const a = step.value.nodes[i]
  const b = step.value.nodes[i + 1]
  return a.present && b.present && a.kind !== 'ghost' && b.kind !== 'ghost'
}
function subY(node: NodeState, j: number) {
  return node.sub.length === 1 ? 45 : 40 + j * 17
}
const playLabel = computed(() =>
  playing.value ? '⏸ 暂停' : current.value >= last ? '↻ 重新播放' : '▶ 自动播放',
)
</script>

<template>
  <div class="clh-queue">
    <div class="clh-status">
      <span class="chip">state = <b>{{ step.state }}</b></span>
      <span class="chip">持锁：{{ step.holder ?? '无（刚释放，等待移交）' }}</span>
      <span class="chip">队列：{{ step.queueNote }}</span>
    </div>

    <div class="clh-svg-wrap">
      <svg viewBox="0 0 760 190" role="img" aria-label="CLH 队列入队与出队动画">
        <!-- head / tail 指针 -->
        <g
          class="ptr"
          :class="{ 'is-hidden': step.head === null }"
          :style="{ transform: `translate(${pointerX(step.head)}px, 0)` }"
        >
          <text class="p-label" text-anchor="end" x="-10" y="24">head</text>
          <line class="p-line" x1="0" y1="30" x2="0" y2="62" />
          <polygon class="p-tip" points="-5,60 5,60 0,70" />
        </g>
        <g
          class="ptr"
          :class="{ 'is-hidden': step.tail === null }"
          :style="{ transform: `translate(${pointerX(step.tail)}px, 0)` }"
        >
          <text class="p-label" text-anchor="start" x="10" y="24">tail</text>
          <line class="p-line" x1="0" y1="30" x2="0" y2="62" />
          <polygon class="p-tip" points="-5,60 5,60 0,70" />
        </g>

        <!-- 相邻节点之间的 prev / next 双向箭头 -->
        <g class="gap" :class="{ 'is-hidden': !gapVisible(0) }">
          <line class="gap-line" x1="247" y1="112" x2="287" y2="112" />
          <polygon class="gap-tip" points="241,112 249,108 249,116" />
          <polygon class="gap-tip" points="293,112 285,108 285,116" />
          <text class="gap-label" x="267" y="100" text-anchor="middle">next</text>
          <text class="gap-label" x="267" y="132" text-anchor="middle">prev</text>
        </g>
        <g class="gap" :class="{ 'is-hidden': !gapVisible(1) }">
          <line class="gap-line" x1="473" y1="112" x2="513" y2="112" />
          <polygon class="gap-tip" points="467,112 475,108 475,116" />
          <polygon class="gap-tip" points="519,112 511,108 511,116" />
          <text class="gap-label" x="493" y="100" text-anchor="middle">next</text>
          <text class="gap-label" x="493" y="132" text-anchor="middle">prev</text>
        </g>

        <!-- 队列为空时的占位提示 -->
        <g class="placeholder" :class="{ 'is-hidden': anyPresent }">
          <rect class="ph-frame" :x="MARGIN" :y="NODE_Y" :width="NODE_W * 3 + GAP * 2" :height="NODE_H" rx="10" />
          <text class="ph-text" :x="MARGIN + (NODE_W * 3 + GAP * 2) / 2" :y="NODE_Y + NODE_H / 2 + 5" text-anchor="middle">
            队列尚未创建：head = null，tail = null
          </text>
        </g>

        <!-- 队列节点 -->
        <g
          v-for="(node, i) in step.nodes"
          :key="i"
          class="qnode"
          :class="{ 'is-hidden': !node.present, 'is-ghost': node.kind === 'ghost' }"
          :style="{ transform: `translate(${nodeX(i)}px, ${NODE_Y}px)` }"
        >
          <rect class="frame" :class="`frame-${node.kind}`" :width="NODE_W" :height="NODE_H" rx="10" />
          <text class="n-label" :x="NODE_W / 2" y="22" text-anchor="middle">{{ node.label }}</text>
          <text
            v-for="(line, j) in node.sub"
            :key="j"
            class="n-sub"
            :x="NODE_W / 2"
            :y="subY(node, j)"
            text-anchor="middle"
          >
            {{ line }}
          </text>
          <g v-if="node.kind === 'holder'" class="holder-tag">
            <rect class="tag-frame" :x="NODE_W - 46" y="-12" width="46" height="22" rx="6" />
            <text class="tag-text" :x="NODE_W - 23" y="3" text-anchor="middle">持锁</text>
          </g>
          <g class="park-badge" :class="{ off: !node.parked }">
            <rect class="park-frame" :x="NODE_W / 2 - 32" :y="NODE_H + 8" width="64" height="22" rx="6" />
            <text class="park-text" :x="NODE_W / 2" :y="NODE_H + 23" text-anchor="middle">park()</text>
          </g>
        </g>
      </svg>
    </div>

    <div class="clh-controls">
      <button class="btn" type="button" :disabled="current === 0" @click="prev">‹ 上一步</button>
      <button class="btn btn-play" type="button" @click="toggle">{{ playLabel }}</button>
      <button class="btn" type="button" :disabled="current === last" @click="next">下一步 ›</button>
      <button class="btn" type="button" aria-label="重置" @click="reset">↺</button>
      <span class="step-indicator">{{ current + 1 }} / {{ steps.length }}</span>
    </div>

    <div class="clh-dots">
      <button
        v-for="(s, i) in steps"
        :key="i"
        class="dot"
        :class="{ active: i === current, done: i < current }"
        type="button"
        :aria-label="`跳到第 ${i + 1} 步：${s.title}`"
        @click="jump(i)"
      />
    </div>

    <div class="clh-desc">
      <b>{{ step.title }}</b>
      <p>{{ step.desc }}</p>
    </div>
  </div>
</template>

<style scoped>
.clh-queue {
  margin: 20px 0;
  padding: 16px 16px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
}

.clh-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.chip {
  padding: 2px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  color: var(--vp-c-text-2);
}

.chip b {
  color: var(--vp-c-brand-1);
}

.clh-svg-wrap {
  overflow-x: auto;
}

.clh-svg-wrap svg {
  display: block;
  width: 100%;
  min-width: 640px;
  height: auto;
}

/* 指针与节点都靠 CSS transform 过渡，tail 滑动、节点淡入 */
.ptr {
  transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.4s;
}
.ptr.is-hidden {
  opacity: 0;
}
.p-label {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 700;
  font-style: italic;
  fill: var(--vp-c-brand-1);
}
.p-line {
  stroke: var(--vp-c-brand-1);
  stroke-width: 1.5;
}
.p-tip {
  fill: var(--vp-c-brand-1);
}

.placeholder {
  transition: opacity 0.5s;
}
.placeholder.is-hidden {
  opacity: 0;
}
.ph-frame {
  stroke: var(--vp-c-text-3);
  stroke-width: 1;
  stroke-dasharray: 8 6;
  fill: transparent;
}
.ph-text {
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  fill: var(--vp-c-text-3);
}

.gap {
  transition: opacity 0.5s;
}
.gap.is-hidden {
  opacity: 0;
}
.gap-line {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.2;
}
.gap-tip {
  fill: var(--vp-c-text-3);
}
.gap-label {
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  fill: var(--vp-c-text-3);
}

.qnode {
  transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.5s;
}
.qnode.is-hidden {
  opacity: 0;
}
.qnode.is-ghost {
  opacity: 0.4;
}
.frame {
  transition: stroke 0.5s, fill 0.5s;
}
.frame-dummy {
  stroke: var(--vp-c-text-3);
  stroke-width: 1.5;
  stroke-dasharray: 6 4;
  fill: var(--vp-c-bg-soft);
}
.frame-wait {
  stroke: var(--vp-c-text-2);
  stroke-width: 1.5;
  fill: var(--vp-c-bg);
}
.frame-holder {
  stroke: var(--vp-c-brand-1);
  stroke-width: 2;
  fill: var(--vp-c-brand-soft);
}
.frame-ghost {
  stroke: var(--vp-c-text-3);
  stroke-width: 1;
  stroke-dasharray: 3 5;
  fill: transparent;
}
.n-label {
  font-size: 15px;
  font-weight: 600;
  fill: var(--vp-c-text-1);
}
.n-sub {
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  fill: var(--vp-c-text-2);
}

.holder-tag {
  transition: opacity 0.5s;
}
.tag-frame {
  fill: var(--vp-c-brand-1);
}
.tag-text {
  font-size: 11px;
  font-weight: 600;
  fill: var(--vp-c-white);
}

.park-badge {
  transition: opacity 0.5s;
}
.park-badge.off {
  opacity: 0;
}
.park-frame {
  fill: transparent;
  stroke: var(--vp-c-text-3);
  stroke-dasharray: 3 3;
}
.park-text {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  fill: var(--vp-c-text-3);
}

.clh-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 4px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 13px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: border-color 0.3s, color 0.3s;
}
.btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-play {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
.btn-play:hover:not(:disabled) {
  color: var(--vp-c-white);
  opacity: 0.9;
}

.step-indicator {
  margin-left: auto;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-3);
}

.clh-dots {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--vp-c-divider);
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
}
.dot.done {
  background: var(--vp-c-text-3);
}
.dot.active {
  background: var(--vp-c-brand-1);
  transform: scale(1.25);
}

.clh-desc {
  margin-top: 12px;
  padding: 10px 14px;
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: 0 8px 8px 0;
  background: var(--vp-c-bg-soft);
}
.clh-desc b {
  font-size: 13.5px;
  color: var(--vp-c-brand-1);
}
.clh-desc p {
  margin: 4px 0 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}

@media (prefers-reduced-motion: reduce) {
  .ptr,
  .qnode,
  .frame,
  .park-badge,
  .holder-tag,
  .gap,
  .dot {
    transition: none;
  }
}
</style>
