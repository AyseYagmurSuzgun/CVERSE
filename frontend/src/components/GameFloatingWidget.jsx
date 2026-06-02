import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSignalR } from "../context/SignalRContext";

// ── Teknoloji Kelime Veritabanı ──────────────────────────────────────────────
const TECH_WORDS = [
  { word: "REACT", hint: "Bileşen tabanlı, popüler ön yüz kütüphanesi." },
  { word: "DOTNET", hint: "Microsoft tarafından geliştirilen nesne yönelimli kurumsal yazılım çatısı." },
  { word: "DOCKER", hint: "Uygulamaları izole konteynerlar içinde çalıştırma teknolojisi." },
  { word: "POSTGRES", hint: "Açık kaynaklı, gelişmiş ilişkisel SQL veritabanı yönetim sistemi." },
  { word: "ANGULAR", hint: "Google'ın TypeScript tabanlı popüler web uygulama framework'ü." },
  { word: "JAVASCRIPT", hint: "Web tarayıcılarında çalışan en yaygın programlama dili." },
  { word: "TYPESCRIPT", hint: "JavaScript'e statik tip tanımlamaları ekleyen üst küme dili." },
  { word: "PYTHON", hint: "Yapay zeka, makine öğrenimi ve veri biliminde lider programlama dili." },
  { word: "SIGNALR", hint: "ASP.NET uygulamalarına gerçek zamanlı web işlevselliği kazandıran kütüphane." },
  { word: "BACKEND", hint: "Uygulamaların sunucu ve veritabanı işlemlerini yürüten arka plan katmanı." },
  { word: "KUBERNETES", hint: "Konteynerize edilmiş uygulamaları otomatik dağıtma ve yönetme sistemi." },
  { word: "REDIS", hint: "Yüksek hızlı, bellek içi anahtar-değer veri deposu ve önbellek sistemi." },
  { word: "GRAPHQL", hint: "API'ler için Facebook tarafından geliştirilen esnek sorgulama dili." },
  { word: "MONGODB", hint: "Belge tabanlı, NoSQL yapıdaki popüler veritabanı sistemi." },
  { word: "DEVOPS", hint: "Geliştirme ve operasyon süreçlerini birleştiren çevik yönetim kültürü." },
  { word: "LINUX", hint: "Açık kaynaklı, sunucularda en yaygın kullanılan işletim sistemi çekirdeği." },
];

// ── Eğlence / Genel Kültür Kelime Veritabanı ─────────────────────────────────
const FUN_WORDS = [
  { word: "SİNEMA", hint: "Hareketli görüntüler sanatı; film izleme deneyimi." },
  { word: "MÜZİK", hint: "Ses ve ritmin birleşimiyle oluşan sanat dalı." },
  { word: "FUTBOL", hint: "Dünyanın en popüler takım sporu, 11 kişiyle oynanır." },
  { word: "GEZEGEN", hint: "Güneş veya başka bir yıldız etrafında dönen büyük gök cismi." },
  { word: "OLİMPİYAT", hint: "4 yılda bir düzenlenen uluslararası spor organizasyonu." },
  { word: "ROBOT", hint: "Programlanmış görevleri otomatik yapan makine ya da otomasyon aygıtı." },
  { word: "SANAT", hint: "İnsanın yaratıcı ifadesinin ürünü olan estetik yapıtlar bütünü." },
  { word: "UZAY", hint: "Dünya atmosferinin ötesindeki sonsuz boşluk." },
  { word: "ROMAN", hint: "Uzun anlatı yapısındaki edebi nesir türü." },
  { word: "TARİH", hint: "Geçmiş olayları ve medeniyetleri inceleyen bilim dalı." },
  { word: "DANS", hint: "Ritme uygun vücut hareketlerinden oluşan performans sanatı." },
  { word: "OKYANUS", hint: "Dünyanın yüzde yetmişini kaplayan dev tuz suyu kütlesi." },
  { word: "MİZAH", hint: "Güldürme amacı taşıyan söz, davranış veya durum." },
  { word: "HAFIZA", hint: "Geçmiş deneyimlerin ve bilgilerin zihinde saklanması yetisi." },
  { word: "MOZAİK", hint: "Küçük renkli parçacıklardan oluşturulan dekoratif yüzey sanatı." },
  { word: "PİYANO", hint: "Tuşlara basılarak çalınan, 88 tuşlu klasik çalgı aleti." },
];

const GameFloatingWidget = () => {
  const signalR = useSignalR();
  const addToast = signalR?.addToast;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("xox"); // "xox" | "word"
  const [wordCategory, setWordCategory] = useState("tech"); // "tech" | "fun"

  // ── TIC-TAC-TOE ─────────────────────────────────────────────────────────────
  const [xoxBoard, setXoxBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [xoxWinner, setXoxWinner] = useState(null);
  const [xoxWinningPattern, setXoxWinningPattern] = useState([]);
  const [xoxScores, setXoxScores] = useState({ user: 0, ai: 0, ties: 0 });

  const winningPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkXoxWinner = (board) => {
    for (let pattern of winningPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a] === 'X' ? 'User' : 'AI', pattern };
      }
    }
    if (board.every(cell => cell !== null)) return { winner: 'Tie', pattern: [] };
    return { winner: null, pattern: [] };
  };

  const makeAIMove = (currentBoard) => {
    const empty = currentBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (!empty.length) return;

    for (let idx of empty) {
      const copy = [...currentBoard]; copy[idx] = 'O';
      if (checkXoxWinner(copy).winner === 'AI') { executeAIMove(idx); return; }
    }
    for (let idx of empty) {
      const copy = [...currentBoard]; copy[idx] = 'X';
      if (checkXoxWinner(copy).winner === 'User') { executeAIMove(idx); return; }
    }
    if (empty.includes(4)) { executeAIMove(4); return; }
    executeAIMove(empty[Math.floor(Math.random() * empty.length)]);
  };

  const executeAIMove = (index) => {
    setTimeout(() => {
      setXoxBoard(prev => {
        const next = [...prev]; next[index] = 'O';
        const result = checkXoxWinner(next);
        if (result.winner) handleXoxEnd(result.winner, result.pattern);
        else setIsXNext(true);
        return next;
      });
    }, 420);
  };

  const handleXoxCellClick = (index) => {
    if (xoxBoard[index] || xoxWinner || !isXNext) return;
    const nextBoard = [...xoxBoard]; nextBoard[index] = 'X';
    setXoxBoard(nextBoard); setIsXNext(false);
    const result = checkXoxWinner(nextBoard);
    if (result.winner) handleXoxEnd(result.winner, result.pattern);
    else makeAIMove(nextBoard);
  };

  const handleXoxEnd = (winner, pattern) => {
    setXoxWinner(winner); setXoxWinningPattern(pattern);
    if (winner === 'User') { setXoxScores(p => ({ ...p, user: p.user + 1 })); if (addToast) addToast("Harika! XOX oyununu kazandınız! 🏆", "success"); }
    else if (winner === 'AI') { setXoxScores(p => ({ ...p, ai: p.ai + 1 })); if (addToast) addToast("AI kazandı. Bir dahaki sefere! 🤖", "warning"); }
    else { setXoxScores(p => ({ ...p, ties: p.ties + 1 })); if (addToast) addToast("Berabere bitti! 🤝", "info"); }
  };

  const resetXox = () => {
    setXoxBoard(Array(9).fill(null));
    setXoxWinner(null); setXoxWinningPattern([]); setIsXNext(true);
  };

  // ── WORD PUZZLE ──────────────────────────────────────────────────────────────
  const [wordState, setWordState] = useState({
    word: "", hint: "", guessedLetters: [],
    wrongGuesses: 0, score: 0, isCompleted: false, hasLost: false
  });

  const lettersTurkish = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

  const getDatabase = (cat) => cat === "tech" ? TECH_WORDS : FUN_WORDS;

  const startNewWordGame = (keepScore = false, cat = wordCategory) => {
    const db = getDatabase(cat);
    const item = db[Math.floor(Math.random() * db.length)];
    setWordState(prev => ({
      word: item.word.toUpperCase(), hint: item.hint,
      guessedLetters: [], wrongGuesses: 0,
      score: keepScore ? prev.score : 0,
      isCompleted: false, hasLost: false
    }));
  };

  const handleCategoryChange = (cat) => {
    setWordCategory(cat);
    startNewWordGame(false, cat);
  };

  useEffect(() => {
    if (isOpen && !wordState.word) startNewWordGame();
  }, [isOpen]);

  const handleWordLetterGuess = (letter) => {
    if (wordState.isCompleted || wordState.hasLost || wordState.guessedLetters.includes(letter)) return;
    const nextGuessed = [...wordState.guessedLetters, letter];
    const isCorrect = wordState.word.includes(letter);
    const nextWrong = isCorrect ? wordState.wrongGuesses : wordState.wrongGuesses + 1;
    const uniqueLetters = Array.from(new Set(wordState.word.split("")));
    const isWon = uniqueLetters.every(l => nextGuessed.includes(l));
    const isLost = nextWrong >= 6;
    setWordState(prev => ({
      ...prev, guessedLetters: nextGuessed, wrongGuesses: nextWrong,
      isCompleted: isWon, hasLost: isLost,
      score: isWon ? prev.score + 100 : prev.score
    }));
    if (isWon && addToast) addToast(`Doğru Kelime! +100 Puan 🎉 Kelime: ${wordState.word}`, "success");
    if (isLost && addToast) addToast(`Üzgünüm, kaybettiniz! Kelime: ${wordState.word} 😢`, "error");
  };

  const getWordDisplay = () => {
    return wordState.word.split("").map((l, i) => (
      <span key={i} className="w-8 h-10 border-b-4 border-sky-300 dark:border-slate-600 flex items-center justify-center text-lg font-black text-slate-800 dark:text-slate-100 uppercase mx-0.5">
        {wordState.guessedLetters.includes(l) ? l : ""}
      </span>
    ));
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none font-sans">
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 hover:from-primary-dark hover:to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary/25 cursor-pointer relative"
        title="Oyun Konsolu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </span>
      </motion.button>

      {/* Main Glassmorphic Game Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-slate-900/10 dark:bg-black/20 backdrop-blur-xs" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50, x: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50, x: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-16 right-0 w-[350px] sm:w-[390px] bg-sky-50/90 dark:bg-slate-900/90 backdrop-blur-xl border border-sky-200/60 dark:border-slate-800 rounded-3xl shadow-2xl p-5 z-50 text-left overflow-hidden"
            >
              {/* Top Banner Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-sky-200/50 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 bg-primary/10 text-primary rounded-xl shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </span>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">CVerse Mini Oyunlar</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Game Tabs */}
              <div className="flex bg-sky-100/70 dark:bg-slate-950/40 p-1 rounded-xl border border-sky-200/40 dark:border-slate-800 mt-3 flex-row gap-1">
                <button
                  onClick={() => setActiveTab("xox")}
                  className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    activeTab === "xox"
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-sky-200/30"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  🤖 XOX Arena
                </button>
                <button
                  onClick={() => setActiveTab("word")}
                  className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    activeTab === "word"
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-sky-200/30"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  🧠 Kelime Bulmaca
                </button>
              </div>

              {/* Game Arenas */}
              <div className="mt-4 min-h-[250px]">
                {activeTab === "xox" ? (
                  // ── TIC TAC TOE ARENA ──────────────────────────────────────
                  <div className="space-y-4 text-center">
                    {/* Scoreboard */}
                    <div className="flex justify-between items-center bg-sky-100/60 dark:bg-slate-950/20 px-3.5 py-2 rounded-2xl border border-sky-200/40 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex flex-col items-center">
                        <span className="font-extrabold text-blue-500">Oyuncu (X)</span>
                        <span className="text-xs font-black">{xoxScores.user}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 flex flex-col items-center">
                        <span>Berabere</span>
                        <span className="text-xs font-black">{xoxScores.ties}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex flex-col items-center">
                        <span className="font-extrabold text-indigo-500">AI (O)</span>
                        <span className="text-xs font-black">{xoxScores.ai}</span>
                      </div>
                    </div>

                    {/* XOX Board */}
                    <div className="flex justify-center">
                      <div className="grid grid-cols-3 gap-2 w-[186px] h-[186px]">
                        {xoxBoard.map((cell, idx) => {
                          const isWinning = xoxWinningPattern.includes(idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => handleXoxCellClick(idx)}
                              disabled={cell !== null || xoxWinner !== null || !isXNext}
                              className={`w-[58px] h-[58px] rounded-xl text-xl font-black transition-all flex items-center justify-center border-2 shadow-sm ${
                                cell === 'X'
                                  ? "bg-blue-200 border-blue-400 text-blue-800 dark:bg-blue-950/50 dark:border-blue-600 dark:text-blue-350"
                                  : cell === 'O'
                                  ? "bg-purple-200 border-purple-400 text-purple-850 dark:bg-indigo-950/50 dark:border-indigo-650 dark:text-indigo-350"
                                  : "bg-blue-100/80 border-blue-200/90 hover:bg-blue-200/50 hover:border-blue-300 dark:bg-slate-800/60 dark:border-slate-700 dark:hover:bg-slate-700 text-text-primary cursor-pointer active:scale-95"
                              } ${isWinning ? "ring-2 ring-emerald-400 bg-emerald-100 border-emerald-300 dark:bg-emerald-950/30" : ""}`}
                            >
                              {cell && (
                                <motion.span
                                  initial={{ scale: 0.3, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", damping: 12 }}
                                >
                                  {cell}
                                </motion.span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Status & Reset */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                        {xoxWinner
                          ? xoxWinner === 'User' ? '🎉 Kazandınız!' : xoxWinner === 'AI' ? '🤖 AI Kazandı!' : '🤝 Beraberlik!'
                          : isXNext ? 'Sıra: Sende' : 'Sıra: AI Düşünüyor...'}
                      </span>
                      <button
                        onClick={resetXox}
                        className="px-3.5 py-1.5 bg-primary text-white text-[10px] font-black rounded-xl hover:bg-primary-dark transition-all cursor-pointer shadow shadow-primary/20"
                      >
                        Yeniden Oyna
                      </button>
                    </div>
                  </div>
                ) : (
                  // ── WORD PUZZLE ARENA ──────────────────────────────────────
                  <div className="space-y-3">
                    {/* Category Selector */}
                    <div className="flex gap-1.5 bg-sky-100/70 dark:bg-slate-950/30 p-1 rounded-xl border border-sky-200/40 dark:border-slate-800">
                      <button
                        onClick={() => handleCategoryChange("tech")}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-black transition-all ${
                          wordCategory === "tech"
                            ? "bg-primary text-white shadow shadow-primary/20"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        💻 Teknoloji
                      </button>
                      <button
                        onClick={() => handleCategoryChange("fun")}
                        className={`flex-1 py-1 rounded-lg text-[9px] font-black transition-all ${
                          wordCategory === "fun"
                            ? "bg-violet-500 text-white shadow shadow-violet-500/20"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        }`}
                      >
                        🎭 Eğlence
                      </button>
                    </div>

                    {/* Clue Panel */}
                    <div className="bg-sky-100/60 dark:bg-slate-950/30 border border-sky-200/40 dark:border-slate-800 p-2.5 rounded-2xl">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">İPUCU:</span>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 font-bold leading-normal mt-0.5">
                        {wordState.hint}
                      </p>
                    </div>

                    {/* Word Blank Slots */}
                    <div className="flex justify-center py-1.5 shrink-0 flex-wrap gap-y-1">
                      {getWordDisplay()}
                    </div>

                    {/* Score & Lives */}
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 border-y border-sky-200/40 dark:border-slate-800 py-1.5">
                      <div className="flex items-center gap-1">
                        <span>Puan:</span>
                        <span className="text-primary font-black">{wordState.score}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span>Hak:</span>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <span key={i} className="text-xs">
                            {i < (6 - wordState.wrongGuesses) ? "❤️" : "🖤"}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Keyboard */}
                    <div className="grid grid-cols-8 gap-1 max-w-[330px] mx-auto">
                      {lettersTurkish.map((letter) => {
                        const isGuessed = wordState.guessedLetters.includes(letter);
                        const isCorrect = isGuessed && wordState.word.includes(letter);
                        const isWrong = isGuessed && !wordState.word.includes(letter);
                        return (
                          <button
                            key={letter}
                            onClick={() => handleWordLetterGuess(letter)}
                            disabled={isGuessed || wordState.isCompleted || wordState.hasLost}
                            className={`h-7 rounded text-[9px] font-black transition-all flex items-center justify-center ${
                              isCorrect
                                ? "bg-emerald-500 text-white shadow shadow-emerald-500/20"
                                : isWrong
                                ? "bg-rose-400 text-white shadow shadow-rose-400/20"
                                : isGuessed
                                ? "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                : "bg-sky-100 border border-sky-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-sky-200 dark:hover:bg-slate-700 cursor-pointer"
                            }`}
                          >
                            {letter}
                          </button>
                        );
                      })}
                    </div>

                    {/* Result + Actions */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] font-black">
                        {wordState.isCompleted && <span className="text-emerald-500">🎉 Tebrikler! Bilindi.</span>}
                        {wordState.hasLost && <span className="text-rose-500">😢 Cevap: {wordState.word}</span>}
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startNewWordGame(false)}
                          className="px-2 py-1.5 bg-sky-100 dark:bg-slate-800 hover:bg-sky-200 border border-sky-200/60 text-slate-600 dark:text-slate-400 text-[9px] font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Sıfırla
                        </button>
                        <button
                          onClick={() => startNewWordGame(true)}
                          className="px-3 py-1.5 bg-indigo-500 text-white text-[9px] font-black rounded-xl hover:bg-indigo-600 transition-all cursor-pointer shadow shadow-indigo-500/20"
                        >
                          Yeni Kelime
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameFloatingWidget;
