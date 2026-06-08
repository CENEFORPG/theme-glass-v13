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
  glassSkipList: {
    name: "추가로 제외할 윈도우 (선택)",
    hint: "기본적으로 서드파티 모듈 윈도우는 자동으로 제외됩니다. 자동 판별이 잘 안 된 경우에만 여기에 키워드를 쉼표로 추가 (예: party-hud).",
    scope: "client",
    config: true,
    type: String,
    default: "",
    onChange: () => requestAnimationFrame(reEvaluateAllSkips),
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

/* ---------- 글래스 효과 자동 스킵 (모듈 간섭 방지) ----------
 * 윈도우의 JS 클래스가 Foundry 코어 클래스를 상속하는지 검사.
 * 상속하면 코어 UI (글래스 적용 대상), 아니면 서드파티 모듈 (스킵).
 * 사용자 수동 목록은 추가 제외/포함 용도로 작동. */

const FOUNDRY_CORE_APP_NAMES = new Set([
  // 사이드바·핫바·네비 등 v13 ApplicationV2 chrome
  "Sidebar", "SidebarTab",
  "ChatLog", "CombatTracker",
  "ActorDirectory", "ItemDirectory", "JournalDirectory",
  "SceneDirectory", "PlaylistDirectory", "MacroDirectory",
  "CompendiumDirectory", "CardsDirectory", "RollTableDirectory",
  "PlayerList", "Players", "Hotbar",
  "SceneControls", "SceneNavigation", "MainNavigation",
  "Notifications",
  // 다이얼로그
  "Dialog", "DialogV2",
  // 도큐먼트 시트 (커스텀 상속도 잡힘)
  "ActorSheet", "ItemSheet",
  "JournalSheet", "JournalEntrySheet",
  "JournalEntryPageSheet", "JournalTextPageSheet", "JournalImagePageSheet",
  "MacroConfig", "PlaylistConfig", "RollTableConfig",
  "SceneConfig", "TokenConfig",
  "PrototypeTokenConfig", "DefaultTokenConfig",
  "CardsConfig", "CardConfig",
  "AmbientLightConfig", "AmbientSoundConfig",
  "DrawingConfig", "MeasuredTemplateConfig",
  "WallConfig", "TileConfig", "NoteConfig",
  "CombatantConfig", "UserConfig",
  // 설정 다이얼로그
  "SettingsConfig", "ClientSettingsConfig",
  "WorldConfig", "PermissionConfig",
  "ModuleManagement", "AVConfig", "AVSettingsConfig",
  "GridConfig", "InvitationLinks", "KeybindingsConfig",
  "DocumentOwnershipConfig",
  // 컴펜디움·파일
  "Compendium", "CompendiumCollection",
  "FilePicker", "ImagePopout",
]);

function isCoreFoundryApp(app) {
  if (!app) return false;
  let ctor = app.constructor;
  // 프로토타입 체인을 따라 올라가며 코어 클래스 이름 매칭
  while (ctor && ctor.name) {
    if (FOUNDRY_CORE_APP_NAMES.has(ctor.name)) return true;
    ctor = Object.getPrototypeOf(ctor);
  }
  return false;
}

function evaluateAndApplySkip(app, html) {
  const root = html?.jquery ? html[0] : html;
  if (!root || !root.classList) return;

  const id = (root.id || "").toLowerCase();
  const cls =
    typeof root.className === "string"
      ? root.className.toLowerCase()
      : (root.classList?.toString?.() || "").toLowerCase();

  // 1) 수동 스킵 목록 — 강제 제외
  const manualSkip = (game.settings?.get?.(MODULE_ID, "glassSkipList") || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (manualSkip.some((t) => id.includes(t) || cls.includes(t))) {
    root.classList.add("glass-skip");
    return;
  }

  // 2) 자동 — 코어 아닌 경우 스킵
  if (!isCoreFoundryApp(app)) {
    root.classList.add("glass-skip");
  } else {
    root.classList.remove("glass-skip");
  }
}

function reEvaluateAllSkips() {
  // V1 windows + V2 instances 모두 처리
  const apps = new Set();
  if (typeof ui !== "undefined" && ui?.windows) {
    for (const a of Object.values(ui.windows)) apps.add(a);
  }
  if (foundry?.applications?.instances) {
    for (const a of foundry.applications.instances.values()) apps.add(a);
  }
  for (const app of apps) {
    const el = app.element?.jquery ? app.element[0] : app.element;
    if (el) evaluateAndApplySkip(app, el);
  }
}

/* ---------- 색상 설정 입력칸에 컬러 피커 끼워넣기 ---------- */
const COLOR_SETTING_KEYS = [
  "bgBaseColor",
  "accentColor",
  "textColor",
  "chatTextColor",
];

function isValidHex(s) {
  return /^#([0-9a-fA-F]{3}){1,2}$/.test((s || "").trim());
}

function injectColorPreviews(htmlOrJq) {
  const root = htmlOrJq?.jquery ? htmlOrJq[0] : htmlOrJq;
  if (!root || !root.querySelector) return;

  for (const key of COLOR_SETTING_KEYS) {
    const input = root.querySelector(`input[name="${MODULE_ID}.${key}"]`);
    if (!input || input.dataset.glassSwatchAttached === "true") continue;
    input.dataset.glassSwatchAttached = "true";

    // 네이티브 컬러 피커 (스와치 + 색상 선택기 역할 겸함)
    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = isValidHex(input.value) ? input.value : "#000000";
    picker.title = "클릭해서 색상 선택";
    picker.style.cssText = [
      "width: 32px",
      "height: 32px",
      "margin-left: 8px",
      "padding: 0",
      "border: 1px solid var(--glass-border-color, rgba(255,255,255,0.2))",
      "border-radius: 4px",
      "background: transparent",
      "cursor: pointer",
      "vertical-align: middle",
      "flex-shrink: 0",
    ].join(";");

    // 양방향 동기화
    picker.addEventListener("input", () => {
      input.value = picker.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    input.addEventListener("input", () => {
      if (isValidHex(input.value)) picker.value = input.value;
    });

    // 입력칸 바로 옆에 삽입
    input.insertAdjacentElement("afterend", picker);
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
  requestAnimationFrame(reEvaluateAllSkips);
  console.log(`${MODULE_ID} | ready, settings applied`);
});

/* 윈도우가 그려질 때마다 그 윈도우만 코어/모듈 판별해서 스킵 결정 */
Hooks.on("renderApplication", (app, html) => evaluateAndApplySkip(app, html));
Hooks.on("renderApplicationV2", (app, html) => evaluateAndApplySkip(app, html));

/* 설정 다이얼로그 열릴 때 컬러 피커 끼워넣기 */
Hooks.on("renderSettingsConfig", (app, html) => {
  requestAnimationFrame(() => injectColorPreviews(html));
});
