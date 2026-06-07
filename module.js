/* Theme: Glass (v13) — module entry point
 * 게임 환경 설정에서 글래스 효과 수치를 실시간으로 조정할 수 있도록 등록 */

const MODULE_ID = "theme-glass-v13";

/* ---------- 설정 정의 ---------- */
const SETTINGS = {
  bgBaseColor: {
    name: "글래스 베이스 색",
    hint: "패널/윈도우의 기본 색조. 보통 어두운 색으로 두는 게 글래스 느낌이 잘 살아요.",
    scope: "client",
    config: true,
    type: String,
    default: "#141923",
  },
  panelOpacity: {
    name: "패널 배경 진하기",
    hint: "사이드바·핫바·컨트롤 등 UI 패널의 배경 불투명도 (낮을수록 더 투명).",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 1, step: 0.05 },
    default: 0.38,
  },
  windowOpacity: {
    name: "윈도우 배경 진하기",
    hint: "시트·다이얼로그·설정 창의 배경 불투명도. 너무 낮추면 텍스트가 안 보일 수 있어요.",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 1, step: 0.05 },
    default: 0.55,
  },
  blurStrength: {
    name: "블러 강도 (px)",
    hint: "글래스 효과의 흐림 정도. 0이면 블러 없음, 높을수록 뒷배경이 더 흐릿.",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 30, step: 1 },
    default: 10,
  },
  saturation: {
    name: "채도 부스트 (%)",
    hint: "글래스 너머로 비치는 배경의 색 채도. 100%면 원본 그대로, 높이면 더 선명.",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 100, max: 200, step: 5 },
    default: 130,
  },
  borderOpacity: {
    name: "보더 밝기",
    hint: "글래스 가장자리 하이라이트의 진하기. 너무 낮추면 패널 경계가 흐릿해짐.",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 0.5, step: 0.02 },
    default: 0.1,
  },
  accentColor: {
    name: "강조 색상",
    hint: "체크박스·슬라이더·포커스 테두리 등에 쓰이는 강조 색. HEX 코드로 입력 (예: #f59f00).",
    scope: "client",
    config: true,
    type: String,
    default: "#f59f00",
  },
  textColor: {
    name: "기본 텍스트 색",
    hint: "본문 텍스트 색. 어두운 글래스 위에서 잘 보이는 밝은 색 권장.",
    scope: "client",
    config: true,
    type: String,
    default: "#f0f2f5",
  },
  chatTextColor: {
    name: "채팅 텍스트 색",
    hint: "채팅창 메시지의 텍스트 색. 기본 텍스트 색과 따로 설정 가능 (HEX 코드).",
    scope: "client",
    config: true,
    type: String,
    default: "#f0f2f5",
  },
  textShadowStrength: {
    name: "텍스트 그림자 강도",
    hint: "UI 텍스트(사이드바·채팅 등)의 그림자 진하기. 0이면 그림자 없음.",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 1, step: 0.05 },
    default: 0.6,
  },
  mergeSameSpeakerChats: {
    name: "같은 화자 채팅 합치기",
    hint: "같은 사람/캐릭터가 연속으로 말할 때 메시지 사이의 구분선을 제거합니다.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => requestAnimationFrame(tagSameSpeaker),
  },
};

/* ---------- 헬퍼: HEX → "r, g, b" ---------- */
function hexToRGB(hex) {
  if (!hex) return "20, 25, 35";
  hex = hex.trim().replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "20, 25, 35";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/* ---------- 설정 → CSS 변수 적용 ---------- */
function applySettings() {
  const root = document.documentElement;
  const get = (key) => game.settings.get(MODULE_ID, key);

  const bgRGB = hexToRGB(get("bgBaseColor"));
  const panelOp = get("panelOpacity");
  const winOp = get("windowOpacity");
  const subtleOp = Math.max(0.08, panelOp - 0.15);

  root.style.setProperty("--glass-bg", `rgba(${bgRGB}, ${panelOp})`);
  root.style.setProperty("--glass-bg-strong", `rgba(${bgRGB}, ${winOp})`);
  root.style.setProperty("--glass-bg-subtle", `rgba(${bgRGB}, ${subtleOp})`);

  root.style.setProperty("--glass-blur", `${get("blurStrength")}px`);
  root.style.setProperty("--glass-saturate", `${get("saturation")}%`);

  root.style.setProperty(
    "--glass-border-color",
    `rgba(255, 255, 255, ${get("borderOpacity")})`
  );

  root.style.setProperty("--glass-accent", get("accentColor"));
  root.style.setProperty("--glass-text", get("textColor"));
  root.style.setProperty("--glass-chat-text", get("chatTextColor"));

  const shadow = get("textShadowStrength");
  root.style.setProperty(
    "--glass-text-shadow",
    `0 1px 2px rgba(0, 0, 0, ${shadow})`
  );
}

/* ---------- 같은 화자 연속 메시지 태깅 ---------- */
function tagSameSpeaker() {
  const log = document.querySelector("#chat-log");
  if (!log) return;

  const enabled =
    game.settings?.get?.(MODULE_ID, "mergeSameSpeakerChats") ?? true;

  const messages = Array.from(log.querySelectorAll(".chat-message"));

  // 1차: 클래스 초기화
  for (const m of messages) {
    m.classList.remove("glass-same-speaker", "glass-has-follower");
  }

  // 비활성화 시 태깅 스킵
  if (!enabled) return;

  // 2차: 화자 비교로 태깅
  let prevSender = null;
  let prevEl = null;
  for (const msg of messages) {
    const senderEl = msg.querySelector(".message-sender");
    const sender = (senderEl?.textContent || msg.dataset.authorId || "").trim();

    if (sender && sender === prevSender && prevEl) {
      msg.classList.add("glass-same-speaker");
      prevEl.classList.add("glass-has-follower");
    }
    prevSender = sender;
    prevEl = msg;
  }
}

/* ---------- Hook 등록 ---------- */
Hooks.once("init", () => {
  console.log(`${MODULE_ID} | initializing settings`);
  for (const [key, config] of Object.entries(SETTINGS)) {
    game.settings.register(MODULE_ID, key, {
      ...config,
      onChange: applySettings,
    });
  }
});

Hooks.once("ready", () => {
  applySettings();
  requestAnimationFrame(tagSameSpeaker);
  console.log(`${MODULE_ID} | ready, settings applied`);
});

/* 채팅 메시지가 새로 들어오거나 삭제될 때 재태깅
 * v13 의 ApplicationV2 채팅은 renderChatMessageHTML, 구버전 호환으로 renderChatMessage 도 함께 처리 */
Hooks.on("renderChatMessageHTML", () => requestAnimationFrame(tagSameSpeaker));
Hooks.on("renderChatMessage", () => requestAnimationFrame(tagSameSpeaker));
Hooks.on("deleteChatMessage", () => requestAnimationFrame(tagSameSpeaker));
Hooks.on("renderChatLog", () => requestAnimationFrame(tagSameSpeaker));
