import { Component, useEffect, useMemo, useState } from "react";
import { createCapture, loadStudio, makeNudge, nextStatus, STORAGE_KEY, studioProgress } from "./logic";

const dateLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());

function Icon({ name, size = 18, stroke = 1.8 }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    flow: <><path d="M4 18c4-10 6-10 9-4s5 5 7-2" /><path d="M4 7h.01" /><path d="M20 18h.01" /></>,
    library: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    spark: <path d="m12 2 1.65 6.35L20 10l-6.35 1.65L12 18l-1.65-6.35L4 10l6.35-1.65L12 2Z" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    command: <><path d="M18 8a3 3 0 1 0-3-3" /><path d="M6 16a3 3 0 1 0 3 3" /><path d="m8.6 17.5 6.8-11" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
    pause: <><path d="M8 5v14" /><path d="M16 5v14" /></>,
    check: <path d="m5 12 4.2 4.2L19 6.8" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.3 2" /></>,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></>,
    bolt: <path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z" />,
    leaf: <><path d="M20 4C11 4 5 8.5 5 15c0 2.6 1.7 4.5 4.2 4.5C15.5 19.5 19 12.4 20 4Z" /><path d="M4 20c3.5-4.4 7.3-7.4 12-9.5" /></>,
    target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.8-4L3 10" /><path d="M3 5v5h5" /><path d="M4 13a8 8 0 0 0 14.8 4L21 14" /><path d="M21 19v-5h-5" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>
  };
  return <svg {...props}>{paths[name] || paths.spark}</svg>;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function Avatar({ small = false }) {
  return <div className={`avatar ${small ? "avatar-small" : ""}`} aria-label="Saurav's profile">S</div>;
}

function TaskRow({ task, focused, onFocus, onCycle, compact = false }) {
  const isDone = task.status === "done";
  return (
    <article className={`task-row ${focused ? "is-focused" : ""} ${compact ? "is-compact" : ""}`}>
      <button className={`task-check ${isDone ? "is-done" : ""}`} onClick={() => onCycle(task.id)} aria-label={`${isDone ? "Reopen" : "Advance"} ${task.title}`}>
        {isDone && <Icon name="check" size={14} stroke={2.5} />}
      </button>
      <div className="task-accent" data-accent={task.accent} />
      <div className="task-copy">
        <div className="task-title-line"><h3>{task.title}</h3>{focused && <span className="now-badge">NOW</span>}</div>
        {!compact && <p>{task.note}</p>}
        <div className="task-meta"><span>{task.project}</span><span className="dot-separator" /> <span>{task.energy}</span><span className="dot-separator" /><span>{task.due}</span></div>
      </div>
      <div className="task-actions">
        <span className="duration"><Icon name="clock" size={14} />{task.duration}m</span>
        {!isDone && <button className="icon-button task-open" onClick={() => onFocus(task)} aria-label={`Focus on ${task.title}`}><Icon name="arrow" size={16} /></button>}
      </div>
    </article>
  );
}

function FocusCard({ task, remaining, active, onToggle, onComplete, onNudge }) {
  if (!task) return null;
  const progress = Math.min(100, Math.round(((task.duration * 60 - remaining) / (task.duration * 60)) * 100));
  return (
    <section className="focus-card" aria-label="Current focus session">
      <div className="focus-topline"><span className="live-dot" /> <span>{active ? "FOCUS IN PROGRESS" : "YOUR NEXT FOCUS BLOCK"}</span><button onClick={onNudge} className="text-button"><Icon name="spark" size={14} />Shape this block</button></div>
      <div className="focus-body">
        <div className="focus-copy">
          <div className="project-line"><span className="color-orb violet" />{task.project}</div>
          <h2>{task.title}</h2>
          <p>{task.note}</p>
          <div className="focus-controls">
            <button className="primary-button" onClick={onToggle}><Icon name={active ? "pause" : "play"} size={16} />{active ? "Pause session" : "Begin with intention"}</button>
            <button className="quiet-button" onClick={onComplete}><Icon name="check" size={16} />Mark complete</button>
          </div>
        </div>
        <div className="timer-wrap">
          <div className="timer-orbit" style={{ "--progress": `${progress * 3.6}deg` }}>
            <div className="timer-inner"><strong>{formatTime(remaining)}</strong><span>remaining</span></div>
          </div>
          <span className="timer-caption"><Icon name="leaf" size={14} /> {task.energy} energy</span>
        </div>
      </div>
    </section>
  );
}

function StudioView({ tasks, focusedId, remaining, focusActive, onFocus, onCycle, onToggle, onComplete, onCapture, onNudge, nudge, onOpenFlow }) {
  const runway = tasks.filter((task) => task.status !== "done");
  const focused = tasks.find((task) => task.id === focusedId) || runway[0];
  const done = tasks.filter((task) => task.status === "done").length;
  return <>
    <section className="welcome-row">
      <div><p className="eyebrow">{dateLabel} <span>·</span> Studio is ready</p><h1>Make a little room<br />for <em>real work.</em></h1></div>
      <div className="day-score"><span>DAY SHAPE</span><strong>{done}<i>/</i>{tasks.length}</strong><p>threads resolved</p></div>
    </section>
    <FocusCard task={focused} remaining={remaining} active={focusActive} onToggle={onToggle} onComplete={onComplete} onNudge={onNudge} />
    {nudge && <section className="nudge"><Icon name="spark" size={16} /><p>{nudge}</p><button aria-label="Dismiss guidance" onClick={() => onNudge(true)}><Icon name="close" size={15} /></button></section>}
    <div className="studio-grid">
      <section className="panel runway-panel">
        <div className="panel-head"><div><p className="section-kicker">THE RUNWAY</p><h2>What deserves a turn</h2></div><button className="link-button" onClick={onOpenFlow}>See flow <Icon name="arrow" size={15} /></button></div>
        <div className="runway-count"><span>{runway.length} open threads</span><span>Choose one, then make it smaller.</span></div>
        <div className="task-list">
          {runway.length ? runway.map((task) => <TaskRow key={task.id} task={task} focused={task.id === focusedId} onFocus={onFocus} onCycle={onCycle} />) : <EmptyRunway onCapture={onCapture} />}
        </div>
        <button className="capture-strip" onClick={onCapture}><span className="capture-plus"><Icon name="plus" size={16} /></span><span>Catch a thought before it disappears</span><kbd>C</kbd></button>
      </section>
      <aside className="right-column">
        <section className="panel signal-panel">
          <div className="panel-head compact-head"><div><p className="section-kicker">TODAY’S SIGNAL</p><h2>Energy, not urgency</h2></div><Icon name="sun" size={19} /></div>
          <div className="energy-arc" aria-label="Energy forecast: gentle start, deep focus mid morning, reset afternoon"><span className="arc-point soft">08</span><span className="arc-point high">10</span><span className="arc-point high two">12</span><span className="arc-point medium">14</span><span className="arc-point soft end">16</span></div>
          <div className="signal-callout"><Icon name="bolt" size={17} /><p><strong>Deep work window</strong><br />You’ve got a clear lane until noon.</p></div>
        </section>
        <section className="panel trace-panel">
          <div className="panel-head compact-head"><div><p className="section-kicker">STUDIO TRACE</p><h2>Small evidence</h2></div><button className="icon-button" aria-label="View all reflections"><Icon name="chevron" size={17} /></button></div>
          <div className="trace-list"><Trace time="09:12" icon="spark" text="Opened the research doc." /><Trace time="09:48" icon="target" text="Held a quiet focus block." /><Trace time="10:06" icon="plus" text="Caught an idea while it was warm." /></div>
        </section>
      </aside>
    </div>
  </>;
}

function Trace({ time, icon, text }) {
  return <div className="trace-item"><time>{time}</time><span className="trace-icon"><Icon name={icon} size={13} /></span><p>{text}</p></div>;
}

function EmptyRunway({ onCapture }) {
  return <div className="empty-state"><div className="empty-mark"><Icon name="leaf" size={25} /></div><h3>The runway is clear.</h3><p>That’s a real accomplishment. Capture a future thread only if it deserves your attention.</p><button className="quiet-button" onClick={onCapture}><Icon name="plus" size={15} />Capture a thread</button></div>;
}

function FlowView({ tasks, focusedId, onFocus, onCycle, onCapture }) {
  const groups = [
    { label: "In motion", hint: "Keep this deliberately small.", statuses: ["in-progress"], color: "violet" },
    { label: "On deck", hint: "Visible, not demanding attention yet.", statuses: ["next"], color: "peach" },
    { label: "Parking lot", hint: "Safe to ignore until its moment arrives.", statuses: ["parked"], color: "mint" }
  ];
  return <section className="flow-view">
    <div className="view-intro"><p className="eyebrow">YOUR ATTENTION, ARRANGED</p><h1>A runway with<br /><em>breathing room.</em></h1><p>Move work forward one honest state at a time. Nothing here is a backlog in disguise.</p></div>
    <div className="flow-board">{groups.map((group) => {
      const cards = tasks.filter((task) => group.statuses.includes(task.status));
      return <section className="flow-lane" key={group.label}><div className="lane-head"><span className={`lane-dot ${group.color}`} /><div><h2>{group.label}</h2><p>{group.hint}</p></div><strong>{cards.length}</strong></div><div className="lane-cards">{cards.length ? cards.map((task) => <TaskRow key={task.id} task={task} focused={focusedId === task.id} onFocus={onFocus} onCycle={onCycle} compact />) : <div className="lane-empty">No threads here yet.</div>}</div></section>;
    })}</div>
    <button className="wide-capture" onClick={onCapture}><Icon name="plus" size={17} />Add a thread to the runway <span>Press C</span></button>
  </section>;
}

function LibraryView({ projects, tasks, onFocus }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => tasks.filter((task) => `${task.title} ${task.project}`.toLowerCase().includes(query.toLowerCase())), [tasks, query]);
  return <section className="library-view">
    <div className="view-intro library-intro"><p className="eyebrow">THE LONGER ARC</p><h1>Projects are promises<br /><em>with a pulse.</em></h1><p>Enough context to come back kindly. No elaborate system required.</p></div>
    <section className="projects-grid">{projects.map((project) => <article className="project-card" key={project.id}><div className="project-card-top"><span className={`project-ring ${project.color}`} /><span>{project.progress}% shaped</span><button className="icon-button" aria-label={`Project options for ${project.name}`}><Icon name="dots" size={17} /></button></div><h2>{project.name}</h2><p>{project.pulse}</p><div className="project-progress"><i style={{ width: `${project.progress}%` }} /></div><footer><span>{tasks.filter((task) => task.project === project.name && task.status !== "done").length} open threads</span><button onClick={() => { const task = tasks.find((item) => item.project === project.name && item.status !== "done"); if (task) onFocus(task); }}>Open <Icon name="arrow" size={14} /></button></footer></article>)}</section>
    <section className="panel library-list"><div className="panel-head"><div><p className="section-kicker">THREAD INDEX</p><h2>Everything, still findable</h2></div><label className="search-field"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search threads" aria-label="Search project threads" /></label></div><div className="index-list">{filtered.length ? filtered.map((task) => <div className="index-row" key={task.id}><span className={`status-pill ${task.status}`}>{task.status.replace("-", " ")}</span><strong>{task.title}</strong><span>{task.project}</span><button className="text-arrow" onClick={() => onFocus(task)} aria-label={`Open ${task.title}`}><Icon name="arrow" size={16} /></button></div>) : <div className="empty-inline"><Icon name="search" size={19} /><p>No threads match “{query}”. Try a project name or a simpler phrase.</p></div>}</div></section>
  </section>;
}

function QuickCapture({ projects, onClose, onSave }) {
  const [text, setText] = useState("");
  const [project, setProject] = useState(projects[1]?.name || "Studio systems");
  const [error, setError] = useState("");
  const save = () => {
    if (!text.trim()) return setError("Give this thought a few words before you set it down.");
    onSave(text, project);
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal capture-modal" role="dialog" aria-modal="true" aria-labelledby="capture-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Close quick capture"><Icon name="close" size={18} /></button><div className="modal-icon"><Icon name="spark" size={20} /></div><p className="eyebrow">QUICK CAPTURE</p><h2 id="capture-title">Catch it while it’s alive.</h2><p className="modal-lede">We’ll put it on your runway without making you organize your life first.</p><label className="capture-label" htmlFor="capture-text">The thought</label><textarea id="capture-text" autoFocus value={text} onChange={(event) => { setText(event.target.value); setError(""); }} placeholder="A question, a task, a tiny promise…" rows="4" onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") save(); }} />{error && <p className="input-error" role="alert"><Icon name="info" size={14} />{error}</p>}<div className="capture-footer"><label>Place it near<select value={project} onChange={(event) => setProject(event.target.value)}>{projects.map((item) => <option key={item.id}>{item.name}</option>)}</select></label><button className="primary-button" onClick={save}>Add to runway <Icon name="arrow" size={16} /></button></div><p className="modal-hint"><kbd>⌘</kbd> <kbd>↵</kbd> to save</p></section></div>;
}

function CommandPalette({ onClose, commands }) {
  const [query, setQuery] = useState("");
  const visible = commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()));
  return <div className="modal-backdrop command-backdrop" role="presentation" onMouseDown={onClose}><section className="command-menu" role="dialog" aria-modal="true" aria-labelledby="command-title" onMouseDown={(event) => event.stopPropagation()}><div className="command-search"><Icon name="search" size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a studio action…" aria-label="Find a studio action" /><kbd>ESC</kbd></div><p className="command-label" id="command-title">STUDIO ACTIONS</p><div className="command-results">{visible.length ? visible.map((command) => <button key={command.label} onClick={command.action}><span className="command-glyph"><Icon name={command.icon} size={17} /></span><span>{command.label}<small>{command.description}</small></span>{command.key && <kbd>{command.key}</kbd>}</button>) : <div className="command-empty">No matching action. The studio is still listening.</div>}</div></section></div>;
}

function BootScreen() {
  return <main className="boot-screen"><div className="boot-mark"><span /><span /><span /></div><p>Opening your local studio</p></main>;
}

class StudioErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <main className="fatal-state"><div className="fatal-mark"><Icon name="spark" size={27} /></div><p className="eyebrow">A SMALL INTERRUPTION</p><h1>The studio needs a fresh start.</h1><p>Your saved data is still in this browser. Reload to return to it.</p><button className="primary-button" onClick={() => window.location.reload()}><Icon name="refresh" size={16} />Reload Studio</button></main>;
    return this.props.children;
  }
}

function App() {
  const [studio, setStudio] = useState(() => loadStudio());
  const [booting, setBooting] = useState(true);
  const [focusActive, setFocusActive] = useState(false);
  const [remaining, setRemaining] = useState(52 * 60);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [nudge, setNudge] = useState("");

  useEffect(() => { const timer = window.setTimeout(() => setBooting(false), 440); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(studio)); } catch { setToast("Your browser is keeping this session, but could not save it locally."); } }, [studio]);
  useEffect(() => { if (!focusActive) return undefined; if (remaining <= 0) { setFocusActive(false); setToast("Focus block complete. Take a breath before choosing what’s next."); return undefined; } const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [focusActive, remaining]);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(""), 3600); return () => window.clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const keydown = (event) => {
      const editable = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen(true); return; }
      if (event.key === "Escape") { setCaptureOpen(false); setCommandOpen(false); return; }
      if (editable || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.toLowerCase() === "c") { event.preventDefault(); setCaptureOpen(true); }
      if (event.key.toLowerCase() === "f") { event.preventDefault(); setFocusActive((value) => !value); }
    };
    window.addEventListener("keydown", keydown); return () => window.removeEventListener("keydown", keydown);
  }, []);

  const focusedTask = studio.tasks.find((task) => task.id === studio.focusedId) || studio.tasks.find((task) => task.status !== "done");
  const progress = studioProgress(studio.tasks);
  const setView = (activeView) => setStudio((current) => ({ ...current, activeView }));
  const focusTask = (task) => { setStudio((current) => ({ ...current, focusedId: task.id, tasks: current.tasks.map((item) => item.id === task.id && item.status !== "done" ? { ...item, status: "in-progress" } : item) })); setRemaining(task.duration * 60); setFocusActive(true); setToast(`A ${task.duration}-minute lane is open for “${task.title}”.`); };
  const cycleTask = (id) => { setStudio((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, status: nextStatus(task.status) } : task) })); };
  const completeFocus = () => { if (!focusedTask) return; setStudio((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === focusedTask.id ? { ...task, status: "done" } : task) })); setFocusActive(false); setToast("Thread resolved. Let that count."); };
  const saveCapture = (text, project) => { const capture = createCapture(text, project); setStudio((current) => ({ ...current, focusedId: current.focusedId || capture.id, tasks: [capture, ...current.tasks] })); setCaptureOpen(false); setToast("Captured locally. It’s on the runway when you’re ready."); };
  const revealNudge = (dismiss = false) => setNudge(dismiss ? "" : makeNudge(studio.tasks));
  const resetDemo = () => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); };
  const commands = [
    { label: "Capture a new thread", description: "Put a thought on the runway", icon: "plus", key: "C", action: () => { setCommandOpen(false); setCaptureOpen(true); } },
    { label: "Start the focus block", description: focusedTask ? focusedTask.title : "Choose a thread first", icon: "play", key: "F", action: () => { setCommandOpen(false); setFocusActive(true); } },
    { label: "Ask Studio to shape the next hour", description: "A local, judgment-free nudge", icon: "spark", action: () => { setCommandOpen(false); revealNudge(); setView("studio"); } },
    { label: "Open the focus runway", description: "Arrange work by attention", icon: "flow", action: () => { setCommandOpen(false); setView("flow"); } },
    { label: "Restore the original demo", description: "Replace saved local data", icon: "refresh", action: resetDemo }
  ];

  if (booting) return <BootScreen />;
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span /><span /><span /></div><div><strong>local-first</strong><small>Studio 1114</small></div></div>
      <nav className="primary-nav" aria-label="Studio navigation">
        <button className={studio.activeView === "studio" ? "active" : ""} onClick={() => setView("studio")}><Icon name="grid" size={18} /><span>Studio</span></button>
        <button className={studio.activeView === "flow" ? "active" : ""} onClick={() => setView("flow")}><Icon name="flow" size={18} /><span>Flow</span><i>3</i></button>
        <button className={studio.activeView === "library" ? "active" : ""} onClick={() => setView("library")}><Icon name="library" size={18} /><span>Library</span></button>
      </nav>
      <div className="sidebar-spacer" />
      <section className="local-card"><div className="local-card-icon"><Icon name="leaf" size={17} /></div><p><strong>Here, not elsewhere.</strong><br />Your studio lives in this browser.</p><span><i />Saved locally</span></section>
      <div className="sidebar-bottom"><button onClick={() => setCommandOpen(true)}><Icon name="command" size={17} /><span>Studio actions</span><kbd>⌘ K</kbd></button><div className="profile-row"><Avatar small /><div><strong>{studio.profile.name}</strong><span>Thoughtful builder</span></div><button className="icon-button" aria-label="Account options"><Icon name="dots" size={17} /></button></div></div>
    </aside>
    <main className="main-canvas">
      <header className="topbar"><div className="breadcrumb"><span className="mobile-word">Studio</span><span className="desktop-word">{studio.activeView === "studio" ? "Your studio" : studio.activeView === "flow" ? "Focus runway" : "Project library"}</span><span className="saved-pill"><i />All changes saved</span></div><div className="header-actions"><button className="command-button" onClick={() => setCommandOpen(true)} aria-label="Open studio actions"><Icon name="command" size={16} /><span>Actions</span><kbd>⌘ K</kbd></button><button className="capture-button" onClick={() => setCaptureOpen(true)}><Icon name="plus" size={17} /><span>Capture</span></button><Avatar small /></div></header>
      <div className="content-wrap">{studio.activeView === "studio" && <StudioView tasks={studio.tasks} focusedId={studio.focusedId} remaining={remaining} focusActive={focusActive} onFocus={focusTask} onCycle={cycleTask} onToggle={() => setFocusActive((value) => !value)} onComplete={completeFocus} onCapture={() => setCaptureOpen(true)} onNudge={revealNudge} nudge={nudge} onOpenFlow={() => setView("flow")} />}{studio.activeView === "flow" && <FlowView tasks={studio.tasks} focusedId={studio.focusedId} onFocus={focusTask} onCycle={cycleTask} onCapture={() => setCaptureOpen(true)} />}{studio.activeView === "library" && <LibraryView projects={studio.projects} tasks={studio.tasks} onFocus={focusTask} />}</div>
      <footer className="canvas-footer"><span>STUDIO 1114 <i /> {progress}% of visible threads resolved</span><button onClick={resetDemo}>Restore demo data</button></footer>
    </main>
    {captureOpen && <QuickCapture projects={studio.projects} onClose={() => setCaptureOpen(false)} onSave={saveCapture} />}
    {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} commands={commands} />}
    {toast && <div className="toast" role="status"><Icon name="check" size={15} />{toast}</div>}
  </div>;
}

export default function StudioApp() { return <StudioErrorBoundary><App /></StudioErrorBoundary>; }
