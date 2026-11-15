import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Moved verbatim from v1 Home.jsx
const MiniTerminal = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState([
    { type: "w1", text: "H⠀⠀⠀⠀⠀⠆⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀" },
    { type: "w1", text: "E⠀⠀⠀⠀⠐⢀⡙⠴⢖⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀" },
    { type: "w1", text: "L⠀⠀⠀⠠⠀⠀⠀⣤⠘⢛⢻⣿⣧⣿⣿⣿⣿⣿⣿⣤⣤⣀⣀⠀⠀⠀⠀⠀⠀" },
    { type: "w1", text: "L⠀⠀⠠⠆⣀⠁⠤⠄⣘⠊⠦⢴⣿⣿⠉⠉⠉⣹⣿⠟⠻⢿⣿⣦⡀⠀⠀⠀⠀" },
    { type: "w1", text: "O⠀⠀⠀⢀⠉⠤⠄⣈⡘⠐⢡⣿⣿⠇⠀⠀⢠⣿⡏⠀⠀⠀⢸⣿⠁⠀⠀⠀⠀" },
    { type: "w1", text: "⠀⠀⠀⡈⠠⠄⡈⠉⠽⠿⣿⣿⠿⠿⠿⣾⣿⣿⣤⣀⠀⣼⣿⡇⠀⠀⠀⠀⠀" },

    { type: "w2", text: "T⠰⠀⠀⠀⠶⠀⠀⠀⠁⢀⣿⣿⠁⠀⠀⢸⣿⠏⠹⢿⣿⣿⡿⠀⠀⠀⠀⠀⠀" },
    { type: "w2", text: "H⠀⠀⠋⣤⣄⣈⡈⠔⢰⣿⣿⠀⠀⠀⢠⣿⠃⠀⠀⠀⣼⣿⠃⠀⠀⠀⠀⠀⠀" },
    { type: "w2", text: "E⠀⠀⠀⠀⠘⠛⠿⠿⣿⣿⣿⣿⣷⣶⣿⣇⡀⠀⠀⣼⣿⠃⠀⠀⠀⠀⠀⠀⠀" },
    { type: "w2", text: "R⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠉⠙⠛⠿⣿⣿⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀" },
    { type: "w2", text: "E⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀" },
    { type: "w2", text: "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀   ⠀⠀⠀⠀⠀⠀⠀⠀" },
    { type: "system", text: 'Type "help" for commands' },
    { type: "prompt", text: "" },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPath] = useState("~/portfolio");
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const commands = {
    help: () => [
      {
        type: "error",
        text: "System Alert: Unauthorized access to an isolated node...",
      },
      {
        type: "success",
        text: "Absolutely nothing here. But hey, nice job finding the terminal.",
      },
      { type: "system", text: "Available commands:" },
      { type: "output", text: "  about    - About me" },
      { type: "output", text: "  ls       - List files" },
      { type: "output", text: "  cv - Download resume.pdf" },
    ],
    cv: () => {
      const link = document.createElement("a");
      link.href = "/Buwaneka_Senarathne_cv.pdf";
      link.download = "Buwaneka_Vishwajith_CV.pdf";
      link.click();

      return [
        { type: "output", text: "Downloading CV.pdf..." },
        { type: "success", text: "✓ Done!" },
      ];
    },
    clear: () => {
      setOutput([{ type: "prompt", text: "" }]);
      return [];
    },
    about: () => [
      { type: "output", text: "Buwaneka Vishwajith" },
      { type: "output", text: "Fullstack Engineer" },
      { type: "output", text: "Code with purpose. Design with precision." },
    ],
    ls: () => [
      { type: "output", text: "buwaneka/" },
      { type: "output", text: "├── About.jsx" },
      { type: "output", text: "├── Experience.jsx" },
      { type: "output", text: "├── Projects.jsx" },
    ],
  };

  const executeCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    if (trimmedCmd === "") return [];

    if (commands[trimmedCmd]) {
      return commands[trimmedCmd]();
    } else {
      return [
        { type: "error", text: `Command not found: ${trimmedCmd}` },
        { type: "output", text: 'Type "help" for available commands' },
      ];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newOutput = [
      ...output.slice(0, -1),
      { type: "command", text: `${currentPath}$ ${input}` },
      ...executeCommand(input),
      { type: "prompt", text: "" },
    ];

    setOutput(newOutput);
    setInput("");
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case "system":
        return "text-blue-400";
      case "command":
        return "text-white";
      case "output":
        return "text-purple-300";
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "prompt":
        return "text-white";
      case "w1":
        return "text-teal-200";
      case "w3":
        return "text-yellow-400/50";
      case "w2":
        return "text-cyan-500";
      case "w4":
        return "text-lime-500/50";
      default:
        return "text-gray-300";
    }
  };

  return (
    <motion.div
      className={`bg-gray-900 rounded-lg shadow-2xl overflow-hidden font-mono text-xs transition-all duration-300 w-full max-w-md ${
        isExpanded ? "h-80" : "h-64"
      }`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 1.5 }}
    >
      {/* Terminal Header */}
      <div className="bg-gray-800 px-3 py-2 flex items-center justify-center relative">
        <div className="flex space-x-1.5 absolute left-3">
          <button className="w-2.5 h-2.5 bg-purple-400 rounded-full hover:bg-red-400 transition-colors"></button>
          <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
          <div className="w-2.5 h-2.5 bg-teal-400 rounded-full"></div>
        </div>
        <div className="text-gray-400 text-xs">terminal</div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-white transition-colors absolute right-3"
        ></button>
      </div>

      {/* Terminal Body */}
      <div
        className={`bg-neutral-900 p-3 overflow-y-auto cursor-text transition-all duration-300 terminal-scrollbar ${
          isExpanded ? "h-64" : "h-48"
        }`}
        onClick={focusInput}
        ref={outputRef}
      >
        {output.map((line, index) => (
          <div
            key={index}
            className={`${getTextColor(line.type)} leading-relaxed`}
          >
            {line.type === "prompt" && index === output.length - 1 ? (
              <div className="flex items-center">
                <span className="text-teal-300 text-xs">~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(e);
                    }
                  }}
                  className="bg-transparent text-white outline-none flex-1 ml-1 text-xs"
                  spellCheck="false"
                />
                <span className="animate-pulse text-white">_</span>
              </div>
            ) : (
              <div className="text-xs">{line.text}</div>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Footer */}
      <div className="bg-gray-800 px-3 py-1 text-xs text-gray-400/60 flex justify-center">
        <span className="text-center">Surely this terminal does more than just sit here... right?</span>
      </div>
    </motion.div>
  );
};

export default MiniTerminal;
