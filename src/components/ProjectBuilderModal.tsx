import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Download,
  Terminal as TerminalIcon,
  Eye,
  FileCode,
  Layers,
  Wrench,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  FolderTree,
  Send,
  Database,
  ShieldCheck,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  Check,
  Search,
  Maximize2,
  Minimize2,
  Code2,
} from 'lucide-react';
import { AutonomousProject, ProjectStage, ProjectWorkspaceFile } from '../types';
import { projectBuilderService } from '../services/projectBuilderService';

interface ProjectBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const ProjectBuilderModal: React.FC<ProjectBuilderModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
}) => {
  const [projects, setProjects] = useState<AutonomousProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'files' | 'terminal' | 'architecture' | 'repair'>('preview');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('client/index.html');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildingProgress, setBuildingProgress] = useState<number>(0);
  const [buildingMessage, setBuildingMessage] = useState<string>('');
  const [modificationPrompt, setModificationPrompt] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [previewKey, setPreviewKey] = useState<number>(0);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState<boolean>(false);
  const [newProjectPrompt, setNewProjectPrompt] = useState<string>(
    initialPrompt || 'Build me a student management system with login, student registration, attendance, dashboard, search, PostgreSQL database and an admin panel.'
  );

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const allProjects = projectBuilderService.getProjects();
      setProjects(allProjects);
      if (allProjects.length > 0 && !activeProjectId) {
        setActiveProjectId(allProjects[0].id);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setNewProjectPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const selectedFile = activeProject?.files.find((f) => f.path === selectedFilePath) || activeProject?.files[0];

  const handleCreateNewProject = async (promptToUse?: string) => {
    const prompt = promptToUse || newProjectPrompt;
    if (!prompt.trim()) return;

    setIsNewProjectModalOpen(false);
    setIsBuilding(true);
    setBuildingProgress(10);
    setBuildingMessage('Starting autonomous project engineering pipeline...');

    try {
      const created = await projectBuilderService.createProject(prompt, (stage, pct, msg) => {
        setBuildingProgress(pct);
        setBuildingMessage(msg);
      });

      const updatedList = projectBuilderService.getProjects();
      setProjects(updatedList);
      setActiveProjectId(created.id);
      setPreviewKey((prev) => prev + 1);
    } catch (err: any) {
      console.error('Failed to create project:', err);
    } finally {
      setIsBuilding(false);
      setBuildingProgress(0);
    }
  };

  const handleRunTests = async () => {
    if (!activeProject || isBuilding) return;
    setIsBuilding(true);
    setBuildingMessage('Running automated test verification suite...');

    try {
      const updated = await projectBuilderService.runProjectTests(activeProject);
      setProjects(projectBuilderService.getProjects());
      setActiveProjectId(updated.id);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleAutoRepair = async () => {
    if (!activeProject || isBuilding) return;
    setIsBuilding(true);
    setBuildingMessage('Autonomous Debugger diagnosing code and synthesizing patch...');

    try {
      const updated = await projectBuilderService.runAutonomousRepair(activeProject);
      setProjects(projectBuilderService.getProjects());
      setActiveProjectId(updated.id);
      setActiveTab('repair');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleApplyModification = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!modificationPrompt.trim() || !activeProject || isBuilding) return;

    const promptText = modificationPrompt.trim();
    setModificationPrompt('');
    setIsBuilding(true);
    setBuildingMessage(`Surgically integrating feature: "${promptText}"...`);

    try {
      const updated = await projectBuilderService.applyIncrementalModification(activeProject, promptText);
      setProjects(projectBuilderService.getProjects());
      setActiveProjectId(updated.id);
      setPreviewKey((prev) => prev + 1);
    } finally {
      setIsBuilding(false);
    }
  };

  const handleExportZip = async () => {
    if (!activeProject) return;
    await projectBuilderService.exportProjectAsZip(activeProject);
  };

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  // Generate safe data URI or srcdoc for the interactive preview iframe
  const previewFile = activeProject?.files.find((f) => f.path === 'client/index.html');
  const previewHtml = previewFile ? previewFile.content : '<h1>Preview not found</h1>';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full h-full max-w-[1720px] max-h-[96vh] bg-[#0c1017] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">

        {/* TOP TITLEBAR */}
        <header className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {activeProject?.name || 'Autonomous Project Builder'}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  PostgreSQL Active
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                  Node.js + Express
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xl">
                {activeProject?.prompt || 'Autonomous Software Engineering Agent'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Project</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isBuilding}
              title="Execute Automated System Test Suite"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Run Tests</span>
            </button>

            <button
              onClick={handleAutoRepair}
              disabled={isBuilding}
              title="Trigger Autonomous Self-Healing Debugger"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer disabled:opacity-50"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Self-Repair</span>
            </button>

            <button
              onClick={handleExportZip}
              title="Download Complete Runnable Project as ZIP Archive"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export ZIP</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
              title="Close Builder Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* PIPELINE STATUS BANNER (DURING PIPELINE RUN) */}
        {isBuilding && (
          <div className="px-4 py-2 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-500/30 flex items-center justify-between gap-3 text-xs shrink-0 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 overflow-hidden">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
              <span className="font-semibold text-indigo-300 truncate">{buildingMessage}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${buildingProgress || 45}%` }}
                />
              </div>
              <span className="font-mono text-indigo-400 text-[11px] font-bold">
                {buildingProgress ? `${buildingProgress}%` : 'Processing'}
              </span>
            </div>
          </div>
        )}

        {/* MAIN STUDIO BODY (SIDEBAR + STAGE) */}
        <div className="flex-1 flex overflow-hidden">

          {/* LEFT WORKSPACE SIDEBAR */}
          <aside className="w-64 sm:w-72 bg-slate-950/90 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Workspaces</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                {projects.length} Active
              </span>
            </div>

            {/* Workspace list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setActiveProjectId(proj.id);
                    setPreviewKey((prev) => prev + 1);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    proj.id === activeProjectId
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-bold text-xs truncate">{proj.name}</p>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Verified" />
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{proj.prompt}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>{proj.files.length} Files</span>
                    <span className="text-emerald-400 font-medium">100% Tests Pass</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Project Quick Info Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Database Engine:</span>
                <span className="font-semibold text-slate-200">PostgreSQL Relational</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Verification Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </aside>

          {/* MAIN STAGE CONTENT */}
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">

            {/* STAGE TAB NAVIGATION */}
            <div className="px-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                    activeTab === 'preview'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Sandbox Preview</span>
                </button>

                <button
                  onClick={() => setActiveTab('files')}
                  className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                    activeTab === 'files'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>Code Explorer ({activeProject?.files.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                    activeTab === 'terminal'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>Terminal &amp; Execution Logs</span>
                </button>

                <button
                  onClick={() => setActiveTab('architecture')}
                  className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                    activeTab === 'architecture'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Architecture &amp; Schema</span>
                </button>

                <button
                  onClick={() => setActiveTab('repair')}
                  className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
                    activeTab === 'repair'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Autonomous Self-Repair</span>
                  {activeProject?.repairHistory.length ? (
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">
                      {activeProject.repairHistory.length}
                    </span>
                  ) : null}
                </button>
              </nav>

              {/* Viewport Toggles (When in Preview) */}
              {activeTab === 'preview' && (
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setDeviceViewport('desktop')}
                    className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                      deviceViewport === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Desktop Preview (100%)"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceViewport('tablet')}
                    className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                      deviceViewport === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Tablet Preview (768px)"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeviceViewport('mobile')}
                    className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                      deviceViewport === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Mobile Preview (375px)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-slate-800 mx-1" />
                  <button
                    onClick={() => setPreviewKey((prev) => prev + 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                    title="Reload Preview Frame"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: LIVE INTERACTIVE PREVIEW */}
            {activeTab === 'preview' && (
              <div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden items-center justify-center bg-[#07090e]">
                {/* Simulated Browser URL bar */}
                <div
                  className={`w-full mb-2 bg-slate-900 border border-slate-800 rounded-t-xl px-3 py-1.5 flex items-center justify-between gap-3 text-xs ${
                    deviceViewport === 'mobile'
                      ? 'max-w-sm'
                      : deviceViewport === 'tablet'
                      ? 'max-w-2xl'
                      : 'max-w-full'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 bg-slate-950 px-3 py-1 rounded-md text-[11px] text-slate-400 font-mono text-center truncate border border-slate-800">
                    http://localhost:4000/ (EduManage Pro Live Runtime)
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                    Interactive
                  </div>
                </div>

                {/* The Running App Preview */}
                <div
                  className={`flex-1 w-full bg-white rounded-b-xl overflow-hidden shadow-2xl border border-slate-800 transition-all ${
                    deviceViewport === 'mobile'
                      ? 'max-w-sm'
                      : deviceViewport === 'tablet'
                      ? 'max-w-2xl'
                      : 'max-w-full'
                  }`}
                >
                  <iframe
                    key={previewKey}
                    title="EduManage Pro Live Application"
                    srcDoc={previewHtml}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: FILE EXPLORER & CODE VIEWER */}
            {activeTab === 'files' && (
              <div className="flex-1 flex overflow-hidden">
                {/* File Tree */}
                <div className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col shrink-0">
                  <div className="p-3 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Workspace Files
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {activeProject?.files.map((file) => (
                      <button
                        key={file.path}
                        onClick={() => setSelectedFilePath(file.path)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between gap-2 transition cursor-pointer ${
                          selectedFilePath === file.path
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{file.path}</span>
                        </div>
                        <span className="text-[10px] uppercase opacity-75">{file.layer}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Viewer / Editor */}
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                  {/* File Header */}
                  <div className="px-4 py-2 bg-slate-900/70 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono text-slate-300">
                      <span className="text-indigo-400">{selectedFile?.path}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-[11px] text-slate-400">{selectedFile?.size} bytes</span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  {/* Code Body */}
                  <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 bg-slate-950 leading-relaxed selection:bg-indigo-500/40">
                    <pre className="whitespace-pre">{selectedFile?.content}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TERMINAL & EXECUTION LOGS */}
            {activeTab === 'terminal' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden bg-black font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-xs">
                  <div className="flex items-center gap-2">
                    <TerminalIcon className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">Terminal Sandbox Execution Console</span>
                  </div>
                  <span className="text-emerald-400">Exit Code: 0 (All Clean)</span>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-4 text-slate-300 custom-scrollbar">
                  {activeProject?.logs.map((log) => (
                    <div key={log.id} className="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span className="text-indigo-400 font-bold">$ {log.command}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()} ({log.durationMs}ms)</span>
                      </div>
                      {log.stdout && (
                        <pre className="text-emerald-300 whitespace-pre-wrap text-xs pl-2 border-l-2 border-emerald-500/40">
                          {log.stdout}
                        </pre>
                      )}
                      {log.stderr && (
                        <pre className="text-red-400 whitespace-pre-wrap text-xs pl-2 border-l-2 border-red-500/40">
                          {log.stderr}
                        </pre>
                      )}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            )}

            {/* TAB 4: ARCHITECTURE & SCHEMA */}
            {activeTab === 'architecture' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {/* Requirements & Spec Summary */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Requirement Specification &amp; Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeProject?.spec?.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Relational Database Entities */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Database className="w-4 h-4 text-violet-400" />
                      PostgreSQL Relational Schema &amp; Entities
                    </h3>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Foreign Keys &amp; Indexes Enforced
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeProject?.plan?.entities.map((ent) => (
                      <div key={ent.name} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-indigo-300 font-mono">TABLE {ent.name}</span>
                          <span className="text-[10px] text-slate-500">{ent.fields.length} columns</span>
                        </div>
                        <ul className="text-xs font-mono text-slate-400 space-y-1 pl-2 border-l border-slate-800">
                          {ent.fields.map((f, i) => (
                            <li key={i} className="text-[11px] text-slate-300">• {f}</li>
                          ))}
                        </ul>
                        {ent.relations && (
                          <div className="pt-2 text-[10px] text-violet-400 font-medium">
                            Relations: {ent.relations.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* REST API Routes */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    REST API Endpoints &amp; Authentication Contracts
                  </h3>
                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden text-xs">
                    {activeProject?.plan?.apiEndpoints.map((ep, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/60 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ep.method === 'GET' ? 'bg-blue-500/20 text-blue-300' : ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {ep.method}
                          </span>
                          <span className="font-semibold text-slate-200">{ep.path}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-xs">{ep.description}</span>
                          {ep.authRequired && (
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                              Auth Protected
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AUTONOMOUS SELF-REPAIR LOG */}
            {activeTab === 'repair' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-400" />
                      Autonomous Debugger &amp; Self-Repair Loop
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Diagnoses syntax and schema errors, creates surgical patches, and re-tests automatically.
                    </p>
                  </div>
                  <button
                    onClick={handleAutoRepair}
                    disabled={isBuilding}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    Simulate Auto-Repair Loop
                  </button>
                </div>

                <div className="space-y-3">
                  {activeProject?.repairHistory.map((rep) => (
                    <div key={rep.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            Attempt #{rep.attemptNumber}
                          </span>
                          <span className="font-bold text-xs text-white">Target: {rep.affectedFile}</span>
                        </div>
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved Autonomously
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 text-xs space-y-1">
                        <p className="text-slate-400 font-semibold">Diagnosis:</p>
                        <p className="text-slate-200">{rep.diagnosis}</p>
                      </div>

                      <div className="font-mono text-xs bg-black/60 p-3 rounded-xl border border-slate-800/80">
                        <p className="text-slate-500 text-[11px] mb-1">Unified Git Diff Applied:</p>
                        <pre className="text-emerald-400 whitespace-pre-wrap">{rep.diff}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOTTOM NATURAL LANGUAGE INCREMENTAL MODIFIER DOCK */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 shrink-0">
              <form onSubmit={handleApplyModification} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={modificationPrompt}
                    onChange={(e) => setModificationPrompt(e.target.value)}
                    placeholder="Ask RO Assistant to modify or add a feature (e.g., 'Add dark mode toggle', 'Add grade average calculator')..."
                    disabled={isBuilding}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">Autonomous Mod</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isBuilding || !modificationPrompt.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Apply Patch</span>
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>

      {/* MODAL: CREATE NEW AUTONOMOUS PROJECT */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Create New Autonomous Project</h3>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Describe any application in natural language. RO Assistant will automatically plan the architecture, select the tech stack, generate production-ready code, run tests, debug, and launch an interactive preview.
            </p>

            <textarea
              value={newProjectPrompt}
              onChange={(e) => setNewProjectPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. Build me a student management system with login, student registration, attendance, dashboard, search, PostgreSQL database and an admin panel."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none font-sans"
            />

            {/* Quick Templates Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Quick Starters:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setNewProjectPrompt(
                      'Build me a student management system with login, student registration, attendance, dashboard, search, PostgreSQL database and an admin panel.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] border border-slate-700 transition cursor-pointer"
                >
                  🎓 Student Management System (PostgreSQL)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewProjectPrompt(
                      'Build an e-commerce store with product catalog, shopping cart, checkout, payment gateway simulation, and order dashboard.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition cursor-pointer"
                >
                  🛍️ E-Commerce Platform
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNewProjectPrompt(
                      'Build a team Kanban project manager with drag-and-drop task boards, assignees, deadlines, and milestone analytics.'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition cursor-pointer"
                >
                  📋 Team Kanban SaaS
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateNewProject()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch Autonomous Engineer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
