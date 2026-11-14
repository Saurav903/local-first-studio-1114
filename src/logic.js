export const STORAGE_KEY = "studio-1114-state-v1";

export const initialStudio = {
  profile: { name: "Saurav", intention: "Make space for the work only you can do." },
  focusedId: "northstar",
  activeView: "studio",
  tasks: [
    {
      id: "northstar",
      title: "Sketch the onboarding story",
      project: "Northstar",
      note: "Turn research into a 5-frame narrative.",
      duration: 52,
      energy: "Deep",
      status: "in-progress",
      accent: "violet",
      due: "Today · 11:30",
      createdAt: 1
    },
    {
      id: "voice",
      title: "Record voice notes from customer calls",
      project: "Northstar",
      note: "Pull out the phrases worth keeping.",
      duration: 28,
      energy: "Light",
      status: "next",
      accent: "peach",
      due: "Today · 14:00",
      createdAt: 2
    },
    {
      id: "systems",
      title: "Name the decision log sections",
      project: "Studio systems",
      note: "Keep it useful in six months.",
      duration: 20,
      energy: "Light",
      status: "next",
      accent: "mint",
      due: "Today · 16:00",
      createdAt: 3
    },
    {
      id: "reply",
      title: "Send the gentle launch update",
      project: "Field notes",
      note: "Three sentences, no status theater.",
      duration: 12,
      energy: "Admin",
      status: "parked",
      accent: "sky",
      due: "Tomorrow",
      createdAt: 4
    },
    {
      id: "review",
      title: "Review last week’s experiments",
      project: "Studio systems",
      note: "Keep one. Stop one. Try one.",
      duration: 25,
      energy: "Reflect",
      status: "done",
      accent: "rose",
      due: "Completed · 09:20",
      createdAt: 5
    }
  ],
  projects: [
    { id: "northstar", name: "Northstar", color: "violet", progress: 62, pulse: "Writing the first usable story" },
    { id: "systems", name: "Studio systems", color: "mint", progress: 38, pulse: "Making repeatable work feel lighter" },
    { id: "field", name: "Field notes", color: "peach", progress: 78, pulse: "A small dispatch for curious people" }
  ],
  reflections: [
    { time: "09:12", text: "Opened the research doc. The hard part was deciding what to leave out.", kind: "note" },
    { time: "09:48", text: "A quiet 24-minute block — stronger than trying to solve it all at once.", kind: "focus" },
    { time: "10:06", text: "Captured an idea for the decision log while it was still warm.", kind: "spark" }
  ]
};

export function cloneInitial() {
  return JSON.parse(JSON.stringify(initialStudio));
}

export function loadStudio(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return cloneInitial();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.tasks) || !Array.isArray(parsed.projects)) throw new Error("Invalid studio data");
    return { ...cloneInitial(), ...parsed };
  } catch {
    return cloneInitial();
  }
}

export function studioProgress(tasks) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.status === "done").length / tasks.length) * 100);
}

export function nextStatus(status) {
  return ({ "in-progress": "done", next: "in-progress", parked: "next", done: "next" })[status] || "next";
}

export function createCapture(text, project = "Studio systems") {
  const title = text.trim().replace(/\s+/g, " ");
  return {
    id: `capture-${Date.now()}`,
    title: title || "Untitled thought",
    project,
    note: "Captured from the studio — shape it when the timing is right.",
    duration: 15,
    energy: "Light",
    status: "next",
    accent: "sky",
    due: "When ready",
    createdAt: Date.now()
  };
}

export function makeNudge(tasks) {
  const next = tasks.find((task) => task.status === "next");
  if (!next) return "Your runway is clear. Let the white space do its job.";
  if (next.energy === "Light") return `A low-friction opening: spend ${next.duration} minutes on “${next.title}” before asking more of yourself.`;
  return `Protect the next ${next.duration} minutes for “${next.title}.” Put the first visible step on the canvas.`;
}
