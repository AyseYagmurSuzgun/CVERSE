import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { staggerContainer, slideUp } from "../animations";
import { useSignalR } from "../context/SignalRContext";

const Games = () => {
  const { addToast } = useSignalR();
  const [activeTab, setActiveTab] = useState("xox"); // "xox" or "word"
  const xoxGameEndedRef = useRef(false);

  // ----------------------------------------------------
  // TIC-TAC-TOE (XOX) STATE & LOGIC
  // ----------------------------------------------------
  const [xoxBoard, setXoxBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [xoxScores, setXoxScores] = useState({ user: 0, ai: 0, ties: 0 });
  const [xoxWinner, setXoxWinner] = useState(null); // 'User', 'AI', 'Tie', or null
  const [xoxWinningPattern, setXoxWinningPattern] = useState([]);

  const winningPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (board) => {
    for (let pattern of winningPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a] === 'X' ? 'User' : 'AI', pattern };
      }
    }
    if (board.every(cell => cell !== null)) {
      return { winner: 'Tie', pattern: [] };
    }
    return { winner: null, pattern: [] };
  };

  // AI Move (Minimax or intelligent random)
  const makeAIMove = (currentBoard) => {
    const emptyIndices = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (emptyIndices.length === 0) return;

    // 1. Try to win
    for (let idx of emptyIndices) {
      const copy = [...currentBoard];
      copy[idx] = 'O';
      if (checkWinner(copy).winner === 'AI') {
        executeAIMove(idx);
        return;
      }
    }

    // 2. Block user
    for (let idx of emptyIndices) {
      const copy = [...currentBoard];
      copy[idx] = 'X';
      if (checkWinner(copy).winner === 'User') {
        executeAIMove(idx);
        return;
      }
    }

    // 3. Take Center if open
    if (emptyIndices.includes(4)) {
      executeAIMove(4);
      return;
    }

    // 4. Default: Random
    const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    executeAIMove(randomIdx);
  };

  const executeAIMove = (index) => {
    setTimeout(() => {
      setXoxBoard(prev => {
        const next = [...prev];
        next[index] = 'O';
        return next;
      });
      setIsXNext(true);
    }, 450);
  };

  const handleXoxCellClick = (index) => {
    if (xoxBoard[index] || xoxWinner || !isXNext) return;

    const nextBoard = [...xoxBoard];
    nextBoard[index] = 'X';
    setXoxBoard(nextBoard);
    setIsXNext(false);
  };

  // Single Source of Truth for XOX Game Engine & Score Controller
  useEffect(() => {
    if (xoxWinner) return; // Stop checking if game has already ended

    const result = checkWinner(xoxBoard);
    if (result.winner) {
      handleXoxEnd(result.winner, result.pattern);
    } else {
      if (!isXNext) {
        makeAIMove(xoxBoard);
      }
    }
  }, [xoxBoard, isXNext, xoxWinner]);

  const handleXoxEnd = (winner, pattern) => {
    setXoxWinner(winner);
    setXoxWinningPattern(pattern);
    
    if (winner === 'User') {
      setXoxScores(prev => ({ ...prev, user: prev.user + 5 }));
      if (addToast) addToast("Harika! XOX oyununu kazandınız! 🏆", "success");
    } else if (winner === 'AI') {
      setXoxScores(prev => ({ ...prev, ai: prev.ai + 5 }));
      if (addToast) addToast("AI kazandı. Bir dahaki sefere! 🤖", "warning");
    } else {
      setXoxScores(prev => ({ ...prev, ties: prev.ties + 1 }));
      if (addToast) addToast("Berabere bitti! 🤝", "info");
    }
  };

  const resetXox = () => {
    setXoxBoard(Array(9).fill(null));
    setXoxWinner(null);
    setXoxWinningPattern([]);
    setIsXNext(true);
  };

  // ----------------------------------------------------
  // WORD PUZZLE (KELİME BULMACA) STATE & LOGIC
  // ----------------------------------------------------
  const technologyWords = [
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
    { word: "CSS", hint: "Web sayfalarının görsel düzenini ve stilini oluşturan dil." }
  ];

  const generalCultureWords = [
    { word: "SİNEMA", hint: "Görüntülerin perdeye yansıtılmasına dayanan sanat dalı, yedinci sanat." },
    { word: "TİYATRO", hint: "Sahnede, seyirciler önünde oyuncuların sergilediği drama sanatı." },
    { word: "FUTBOL", hint: "On birer oyuncudan oluşan iki takım arasında küresel bir topla oynanan takım sporu." },
    { word: "MÜZİK", hint: "Seslerin belirli bir ritim, melodi ve harmoni düzenine göre birleştirilmesi sanatı." },
    { word: "KİTAP", hint: "Bir kenarından birleştirilerek kapak içine alınmış basılı kağıt yaprakların bütünü." },
    { word: "COĞRAFYA", hint: "Yeryüzünü, insan-mekan ilişkisini ve doğal çevreyi inceleyen bilim dalı." },
    { word: "TARİH", hint: "Geçmişte yaşamış insan topluluklarının faaliyetlerini yer ve zaman göstererek inceleyen bilim." },
    { word: "ASTRONOMİ", hint: "Gök cisimlerini ve uzayı inceleyen en eski doğa bilimlerinden biri." },
    { word: "EDEBİYAT", hint: "Duygu, düşünce ve hayallerin dil aracılığıyla estetik bir biçimde ifade edilmesi sanatı." },
    { word: "OLİMPİYAT", hint: "Dört yılda bir düzenlenen, dünyanın en kapsamlı spor organizasyonu." }
  ];

  const lettersTurkish = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [wordScore, setWordScore] = useState(0);
  const [wordCategory, setWordCategory] = useState("tech"); // "tech" or "culture"
  const [wordHighScore, setWordHighScore] = useState(
    parseInt(localStorage.getItem("cverse_word_high_score") || "0", 10)
  );
  const [wordCompleted, setWordCompleted] = useState(false);
  const [wordFailed, setWordFailed] = useState(false);

  const initWordGame = (keepScore = false, category = wordCategory) => {
    const db = category === "tech" ? technologyWords : generalCultureWords;
    const randomItem = db[Math.floor(Math.random() * db.length)];
    setWord(randomItem.word.toUpperCase());
    setHint(randomItem.hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setWordCompleted(false);
    setWordFailed(false);
    if (!keepScore) {
      setWordScore(0);
    }
  };

  useEffect(() => {
    initWordGame(false, "tech");
  }, []);

  // Kategori değiştiğinde oyunu otomatik sıfırla
  const handleCategoryChange = (newCat) => {
    setWordCategory(newCat);
    initWordGame(false, newCat);
  };

  const handleWordLetterClick = (letter) => {
    if (wordCompleted || wordFailed || guessedLetters.includes(letter)) return;

    const nextGuessed = [...guessedLetters, letter];
    setGuessedLetters(nextGuessed);

    if (word.includes(letter)) {
      // Check win
      const uniqueLetters = Array.from(new Set(word.split("")));
      const isWon = uniqueLetters.every((l) => nextGuessed.includes(l));
      if (isWon) {
        setWordCompleted(true);
        const nextScore = wordScore + 100;
        setWordScore(nextScore);
        if (nextScore > wordHighScore) {
          setWordHighScore(nextScore);
          localStorage.setItem("cverse_word_high_score", nextScore.toString());
        }
        if (addToast) addToast("Harika! Kelimeyi doğru tahmin ettiniz: " + word + " 🎉", "success");
      }
    } else {
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      if (nextWrong >= 6) {
        setWordFailed(true);
        if (addToast) addToast("Maalesef hakkınız bitti! Doğru kelime: " + word + " 😢", "error");
      }
    }
  };

  const getWordSlots = () => {
    return word.split("").map((letter, idx) => {
      const isRevealed = guessedLetters.includes(letter);
      return (
        <span
          key={idx}
          className="w-10 h-12 border-b-4 border-border-soft flex items-center justify-center text-xl font-black text-text-primary uppercase mx-1 select-none"
        >
          {isRevealed ? letter : ""}
        </span>
      );
    });
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8 select-none font-sans"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Üst Başlık */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card-primary border border-border-soft p-6 rounded-3xl shadow-premium text-text-primary"
        variants={slideUp}
      >
        <div>
          <h1 className="text-xl md:text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
            CVerse Oyun Alanı
            <span className="text-[10px] tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full font-black border border-primary/20">
              Eğlence Modülü
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-semibold">Yoğun iş arayışı ve CV analizleri arasında zihninizi dinlendirmek için mini oyunlarımıza göz atın.</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-bg-app p-1 rounded-2xl border border-border-soft shrink-0">
          <button
            onClick={() => setActiveTab("xox")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "xox"
                ? "bg-card-secondary text-text-primary shadow-sm border border-border-soft/50"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            🤖 XOX (Tic-Tac-Toe)
          </button>
          <button
            onClick={() => setActiveTab("word")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === "word"
                ? "bg-card-secondary text-text-primary shadow-sm border border-border-soft/50"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            🧠 Kelime Bulmaca
          </button>
        </div>
      </motion.div>

      {/* Oyun Alanı Gövdesi */}
      <AnimatePresence mode="wait">
        {activeTab === "xox" ? (
          <motion.div
            key="xox"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
          >
            {/* Sol: Skor tablosu ve kurallar */}
            <div className="md:col-span-4 space-y-6">
              <Card variant="primary" animate={false} className="p-6 space-y-4">
                <h3 className="text-sm font-black text-text-primary tracking-tight uppercase border-b border-border-soft pb-2">XOX Arenası</h3>
                
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs text-text-secondary font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Oyuncu (X)</span>
                    <span className="font-extrabold text-text-primary">{xoxScores.user} Galibiyet</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-secondary font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" /> Yapay Zeka (O)</span>
                    <span className="font-extrabold text-text-primary">{xoxScores.ai} Galibiyet</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-secondary font-bold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-text-secondary/35 rounded-full" /> Beraberlik</span>
                    <span className="font-extrabold text-text-primary">{xoxScores.ties}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    onClick={resetXox}
                    className="w-full text-xs font-black py-2.5 rounded-2xl shadow-md shadow-primary/20"
                  >
                    Oyunu Sıfırla
                  </Button>
                </div>
              </Card>

              <Card variant="secondary" animate={false} className="p-5 text-[10px] font-semibold space-y-2 leading-relaxed text-text-secondary">
                <span className="text-text-primary font-extrabold uppercase block">Yapay Zeka Kuralları</span>
                <p>CVerse AI, her adımda sizin hamlelerinizi durdurmaya veya kendi galibiyetini kurmaya çalışır. 3'lü yatay, dikey ya da çapraz seriyi ilk kuran maçı kazanır.</p>
              </Card>
            </div>

            {/* Sağ: XOX Oyun Tahtası */}
            <div className="md:col-span-8">
              <Card variant="primary" animate={false} className="p-8 flex flex-col items-center justify-center min-h-[350px]">
                {/* 3x3 Grid of Buttons - Highlighted Soft blue in light mode for max visibility! */}
                <div className="grid grid-cols-3 gap-3 w-72 h-72">
                  {xoxBoard.map((cell, idx) => {
                    const isWinningCell = xoxWinningPattern.includes(idx);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleXoxCellClick(idx)}
                        disabled={cell !== null || xoxWinner !== null || !isXNext}
                        className={`w-22 h-22 rounded-2xl text-2xl font-black transition-all flex items-center justify-center border shadow-sm ${
                          cell === 'X'
                            ? "bg-blue-100/90 dark:bg-blue-950/40 border-blue-300 dark:border-blue-900/80 text-blue-600 dark:text-blue-300"
                            : cell === 'O'
                            ? "bg-indigo-100/90 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-900/80 text-indigo-600 dark:text-indigo-300"
                            : "bg-blue-50/90 dark:bg-slate-900/40 hover:bg-blue-100/95 dark:hover:bg-slate-800/80 border-blue-200/70 dark:border-slate-800/80 text-text-primary cursor-pointer active:scale-95"
                        } ${isWinningCell ? "ring-2 ring-emerald-500 bg-emerald-100/40 dark:bg-emerald-950/20" : ""}`}
                      >
                        {cell && (
                          <motion.span
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            {cell}
                          </motion.span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Kazanan mesajı */}
                {xoxWinner && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 text-sm font-extrabold text-text-primary flex items-center gap-2"
                  >
                    <span>
                      {xoxWinner === 'User' ? '🎉 Tebrikler, Kazandınız!' :
                       xoxWinner === 'AI' ? '🤖 Yapay Zeka Kazandı!' :
                       '🤝 Berabere Bitti!'}
                    </span>
                  </motion.div>
                )}
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="word"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
          >
            {/* Sol: Skor tablosu, kurallar & Kategori Seçimi */}
            <div className="md:col-span-4 space-y-6">
              {/* Kategori Seçim Paneli */}
              <Card variant="primary" animate={false} className="p-6 space-y-4">
                <h3 className="text-sm font-black text-text-primary tracking-tight uppercase border-b border-border-soft pb-2">Kelime Kategorisi</h3>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={() => handleCategoryChange("tech")}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-black transition-all text-left flex items-center justify-between border ${
                      wordCategory === "tech"
                        ? "bg-primary text-white border-primary/20 shadow-md"
                        : "bg-bg-app text-text-primary border-border-soft hover:bg-primary/10"
                    }`}
                  >
                    <span>💻 Teknoloji Kelimeleri</span>
                    {wordCategory === "tech" && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => handleCategoryChange("culture")}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs font-black transition-all text-left flex items-center justify-between border ${
                      wordCategory === "culture"
                        ? "bg-secondary text-white border-secondary/20 shadow-md"
                        : "bg-bg-app text-text-primary border-border-soft hover:bg-primary/10"
                    }`}
                  >
                    <span>🎭 Eğlence & Genel Kültür</span>
                    {wordCategory === "culture" && <span>✓</span>}
                  </button>
                </div>
              </Card>

              <Card variant="primary" animate={false} className="p-6 space-y-4">
                <h3 className="text-sm font-black text-text-primary tracking-tight uppercase border-b border-border-soft pb-2">Skor Tablosu</h3>
                
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs text-text-secondary font-bold">
                    <span>Toplam Puan</span>
                    <span className="font-extrabold text-primary">{wordScore} Puan</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-secondary font-bold">
                    <span>En Yüksek Skor</span>
                    <span className="font-extrabold text-text-primary">{wordHighScore === 0 ? "-" : `${wordHighScore} Puan`}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-secondary font-bold">
                    <span>Kalan Hak</span>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i} className="text-sm">
                          {i < (6 - wrongGuesses) ? "❤️" : "🖤"}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => initWordGame(false)}
                    className="flex-1 text-xs font-black py-2.5 rounded-2xl"
                  >
                    Sıfırla
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => initWordGame(true)}
                    className="flex-1 text-xs font-black py-2.5 rounded-2xl shadow-md shadow-primary/20"
                  >
                    Yeni Kelime
                  </Button>
                </div>
              </Card>

              <Card variant="secondary" animate={false} className="p-5 text-[10px] font-semibold space-y-2 leading-relaxed text-text-secondary">
                <span className="text-text-primary font-extrabold uppercase block">Bulmaca Kuralları</span>
                <p>CVerse kelime haznesindeki popüler kelimeleri tahmin edin. Her yanlış harf seçimi bir canınızı (❤️) götürür. 6 yanlış tahminde bulunmadan önce gizli kelimeyi tamamlamalısınız!</p>
              </Card>
            </div>

            {/* Sağ: Kelime Bulmaca Oyun Alanı */}
            <div className="md:col-span-8">
              <Card variant="primary" animate={false} className="p-8 flex flex-col items-center justify-center min-h-[350px] space-y-6">
                
                {/* Clue Panel */}
                <div className="w-full bg-card-secondary/40 border border-border-soft p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block">KELİME İPUCU:</span>
                  <p className="text-sm text-text-primary font-bold leading-normal mt-1">
                    {hint}
                  </p>
                </div>

                {/* Word Blank Slots */}
                <div className="flex justify-center py-4">
                  {getWordSlots()}
                </div>

                {/* Keyboard UI */}
                <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 w-full max-w-xl mx-auto pt-2">
                  {lettersTurkish.map((letter) => {
                    const isGuessed = guessedLetters.includes(letter);
                    const isCorrect = isGuessed && word.includes(letter);
                    const isWrong = isGuessed && !word.includes(letter);

                    return (
                      <button
                        key={letter}
                        onClick={() => handleWordLetterClick(letter)}
                        disabled={isGuessed || wordCompleted || wordFailed}
                        className={`h-10 sm:h-12 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                          isCorrect
                            ? "bg-emerald-500 text-white shadow shadow-emerald-500/20"
                            : isWrong
                            ? "bg-rose-500 text-white shadow shadow-rose-500/20"
                            : isGuessed
                            ? "bg-primary/5 text-text-secondary/40 cursor-not-allowed border border-border-soft/20"
                            : "bg-bg-app text-text-primary border border-border-soft hover:bg-primary/10 cursor-pointer active:scale-95"
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>

                {/* Tamamlandı/Başarısız mesajı */}
                {(wordCompleted || wordFailed) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    {wordCompleted && (
                      <>
                        <span className="text-emerald-500 font-extrabold text-sm flex items-center gap-1.5">
                          🎉 Tebrikler! Kelimeyi bildiniz: <strong className="underline">{word}</strong>
                        </span>
                        <span className="text-[10px] text-text-secondary font-bold">+100 Puan hanenize eklendi!</span>
                      </>
                    )}
                    {wordFailed && (
                      <>
                        <span className="text-rose-500 font-extrabold text-sm flex items-center gap-1.5">
                          😢 Kaybettiniz! Doğru kelime: <strong className="underline">{word}</strong>
                        </span>
                        <span className="text-[10px] text-text-secondary font-bold">Yeni bir kelime ile şansınızı tekrar deneyin.</span>
                      </>
                    )}
                  </motion.div>
                )}
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Games;
