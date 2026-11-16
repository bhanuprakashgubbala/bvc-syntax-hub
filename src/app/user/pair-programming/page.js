"use client";

import { useState } from "react";
import { 
  Users, 
  ArrowLeft, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Play, 
  Copy, 
  Check, 
  Sparkles,
  Terminal,
  Send,
  PhoneOff
} from "lucide-react";
import Link from "next/link";

export default function PairProgrammingPage() {
  const [roomId, setRoomId] = useState("ROOM-7821");
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [copied, setCopied] = useState(false);

  const [code, setCode] = useState(
`// Collaborative Workspace
// Connected Peer: Alex Rivera (BVC CSE)

function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
`
  );

  const [chatMessages, setChatMessages] = useState([
    { sender: "Alex Rivera", text: "Hey! Let's solve the two-pointer problem together.", time: "10:14 AM" },
    { sender: "You", text: "Sounds good, I've outlined the hash map approach in the editor.", time: "10:15 AM" }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [output, setOutput] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = { sender: "You", text: inputMsg, time: "Just now" };
    setChatMessages(prev => [...prev, newMsg]);
    setInputMsg("");

    // Simulated peer auto-reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { sender: "Alex Rivera", text: "Great idea! Let's test the edge cases with negative values.", time: "Just now" }
      ]);
    }, 1200);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`https://codex.nextgenlabs.co/user/pair-programming?room=${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    setOutput("[Running in collaborative sandbox...]\n> [0, 1]\nExecution finished with exit code 0.");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/user" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
              <Users className="w-6 h-6 text-violet-400" />
              Live Pair Programming Room
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Real-time collaborative code editor, WebRTC media calls, and technical chat.</p>
          </div>
        </div>

        {/* Room Info & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono">
            <span className="text-zinc-500">Room:</span>
            <span className="text-violet-400 font-bold">{roomId}</span>
          </div>

          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied" : "Invite Peer"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Collaborative Code Editor (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Editor Top Bar */}
            <div className="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">2 Peers Connected</span>
              </div>

              <button
                onClick={handleRunCode}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-violet-600/30 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Solution</span>
              </button>
            </div>

            {/* Code Box */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full flex-1 bg-[#121217] p-5 font-mono text-xs text-zinc-200 focus:outline-none leading-relaxed resize-none"
              spellCheck={false}
            />

            {/* Output console */}
            {output && (
              <div className="h-28 bg-zinc-950 border-t border-zinc-800 p-3 font-mono text-xs text-emerald-400 overflow-y-auto">
                <span className="text-zinc-500 block mb-1">=== Console Output ===</span>
                <pre>{output}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Right: Video Feeds & Live Chat */}
        <div className="space-y-4 flex flex-col h-[520px]">
          {/* Video Strip */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {/* Peer Video */}
            <div className="h-28 bg-zinc-950 border border-zinc-800 rounded-2xl relative flex flex-col items-center justify-center overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-violet-600/30 text-violet-400 font-bold flex items-center justify-center text-sm">
                AR
              </div>
              <span className="text-[10px] text-zinc-400 font-mono mt-1">Alex Rivera</span>
              <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>

            {/* Self Video */}
            <div className="h-28 bg-zinc-950 border border-zinc-800 rounded-2xl relative flex flex-col items-center justify-center overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center text-sm">
                YOU
              </div>
              <span className="text-[10px] text-zinc-400 font-mono mt-1">You (Host)</span>

              {/* Call Controls Overlay */}
              <div className="absolute bottom-1.5 flex gap-1.5 bg-zinc-900/80 px-2 py-1 rounded-lg border border-zinc-800">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-1 rounded cursor-pointer ${isMuted ? 'text-rose-400' : 'text-zinc-400 hover:text-white'}`}
                >
                  {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-1 rounded cursor-pointer ${isVideoOff ? 'text-rose-400' : 'text-zinc-400 hover:text-white'}`}
                >
                  {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex-1 flex flex-col justify-between overflow-hidden">
            <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-bold text-zinc-200">
                <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> Session Chat
              </span>
              <span className="text-[10px] text-zinc-500">Encrypted</span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`space-y-0.5 ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono justify-end">
                    <span>{msg.sender}</span>
                    <span>•</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className={`inline-block px-3 py-1.5 rounded-xl text-xs max-w-[85%] ${
                    msg.sender === 'You'
                      ? 'bg-violet-600 text-white rounded-tr-none'
                      : 'bg-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-2 bg-zinc-950 border-t border-zinc-800 flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type message to peer..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
