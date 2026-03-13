import { useState, useEffect, useRef, useCallback } from "react";
import "./home.css";
import {
  ALL_FIGHTERS,
  FIGHTER_MAP,
  WACKY_MATCHUPS,
  FAKE_LEADERBOARD,
  INSULT_LINES,
  DECLINE_LINES,
  SOCIAL_FEED_NAMES,
} from "../../data/matchData";

// ─── Game name ────────────────────────────────────────────────
const GAME_NAME = "DARK GAMBLE";
const GAME_TAGLINE = "The house always wins. Especially this one.";

// ─── Constants ────────────────────────────────────────────────
const STARTING_BALANCE = 150;
const FORCED_LOAN_1 = 2500; // first forced loan — enough to play several rounds
const FORCED_LOAN_2 = 8000; // second forced loan — big enough for real false hope
const VOLUNTARY_LOAN = 5000;
const VOLUNTARY_COOLDOWN = 6;
const CASHOUT_THRESHOLD = 800; // vague — never shown exactly
const LOAN_TRIGGER_FLOOR = 120; // min balance before loan offered — prevents instant loan on one bad round
const TIMER_SECONDS = 30;
// BC rate: $1 = ~222 BC (1 BC = $0.0045) — looks impressive
const BC_RATE = 0.0045;

// ─── Pacing ────────────────────────────────────────────────────
// R0:      guaranteed 33x — player starts rich (~$4,950)
// R1–5:    normal erosion ~47% win rate
// R6–13:   heavy drain, 35% win, high stakes → bankrupt by R12–14
// R14–20:  LOAN 1 phase — false hope: big wins R15–17 then drain again
// R21–26:  LOAN 2 territory — wiped by R27
// Sudden Death: R15 if player has money AND hasn't taken loan yet
// ─── Pacing design ────────────────────────────────────────────
// R0:      Rigged 33x win — big opening balance (~$4950 from $150, ~$9900 from $300)
// R1–4:    Normal play, ~46% win. Player rides high. Stake % modest.
// R5–11:   DRAIN PHASE. Win prob drops to 28–32%. Stakes 55–78% of balance.
//          Entry fee uses a "high water mark" floor so it doesn't shrink fast
//          when balance drops. Player should be near broke by R12–14.
// R12–14:  Final drain — 25% win prob, 80% stake. Loan territory.
// R15:     SUDDEN DEATH if player skipped/still has money and no loan yet.
// R16–22:  Post-loan false hope: big wins R17–18, then drain again.
// R23–26:  Second drain — 22% win prob, high stake floor → broke by R27.
// R27:     Second sudden death.
//
// KEY MECHANIC: getStake uses a "high water mark" so the fee doesn't
// drop proportionally with balance. If you had $50k and now have $1k,
// the fee is still several hundred, not $500.

function getStake(round, balance, highWater = 0) {
  if (balance <= 0) return 0;
  if (round === 0) return balance; // all-in R0, guaranteed win

  // The stake is the HIGHER of: % of current balance, or % of high water mark
  // This prevents the entry fee collapsing when balance drops.
  const hwFloor = highWater > balance ? highWater * 0.18 : 0;

  let pct;
  if (round <= 4)
    pct = 0.28 + round * 0.02; // 30–36% — gentle start
  else if (round <= 11)
    pct = 0.55 + (round - 5) * 0.035; // 55–76% — drain
  else if (round <= 14)
    pct = 0.8; // 80% — near broke
  else if (round <= 22)
    pct = 0.65; // post-loan phase
  else pct = 0.78; // second drain

  const fromBalance = Math.floor(balance * Math.min(pct, 0.85));
  const stake = Math.max(fromBalance, Math.floor(hwFloor));
  // Never bet more than you have, never less than $10
  return Math.max(10, Math.min(stake, balance));
}

function getMultiplier(round) {
  if (round === 0) return 33;
  // False hope spikes post-loan
  if (round === 17 || round === 18) return 2.8 + Math.random() * 0.6;
  if (round <= 4) return Math.max(1.6, 2.2 - round * 0.05);
  if (round <= 14) return Math.max(1.1, 1.7 - (round - 4) * 0.06);
  if (round <= 22) return Math.max(1.15, 1.9 - (round - 15) * 0.07);
  return 1.1; // deep hole — even wins barely help
}

function getWinProb(round) {
  if (round === 0) return 1.0;
  if (round <= 4) return 0.46; // reasonable start
  if (round <= 7) return 0.38; // starting to tilt
  if (round <= 11) return 0.3; // heavy drain
  if (round <= 14) return 0.24; // near broke
  if (round === 17 || round === 18) return 0.88; // false hope wins
  if (round <= 22) return 0.35; // post-loan, draining again
  if (round <= 26) return 0.22; // second drain — brutal
  return 0.2; // beyond R27
}

// ─── Matchup ──────────────────────────────────────────────────
function getMatchup() {
  if (Math.random() < 0.4 && WACKY_MATCHUPS.length > 0) {
    const w = WACKY_MATCHUPS[Math.floor(Math.random() * WACKY_MATCHUPS.length)];
    const fa = FIGHTER_MAP[w.a],
      fb = FIGHTER_MAP[w.b];
    if (fa && fb) return { fighters: [fa, fb], question: w.question };
  }
  const s = [...ALL_FIGHTERS].sort(() => Math.random() - 0.5);
  return {
    fighters: [s[0], s[1]],
    question: "Who wins in a head-to-head showdown?",
  };
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Formatters ───────────────────────────────────────────────
function fmtUSD(n) {
  const abs = Math.abs(Math.round(n));
  return `${n < 0 ? "-" : ""}$${abs.toLocaleString()}`;
}
function fmtBC(n) {
  const bc = Math.abs(n) / BC_RATE;
  if (bc >= 1_000_000) return `BC ${(bc / 1_000_000).toFixed(2)}M`;
  if (bc >= 1000) return `BC ${(bc / 1000).toFixed(1)}k`;
  return `BC ${bc.toFixed(0)}`;
}

// ─── Confetti ─────────────────────────────────────────────────
function ConfettiBurst() {
  const colors = [
    "#f0c040",
    "#2dc653",
    "#e63946",
    "#f7931a",
    "#fff",
    "#4fc3f7",
  ];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.8}s`,
    duration: `${1.2 + Math.random() * 1.5}s`,
  }));
  return (
    <div className="confetti-burst">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            background: p.color,
            left: p.left,
            top: "-20px",
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

// ─── Terms Popup ──────────────────────────────────────────────
function TermsPopup({ amount, onClose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--crypto)",
            letterSpacing: "0.15em",
          }}
        >
          ⚡ ADVANCE — FULL TERMS
        </div>
        <div
          className="crypto-notice"
          style={{ fontSize: 12, lineHeight: 1.75 }}
        >
          By accepting this advance, your USD balance is converted to BetCoin
          (BC) at the current platform exchange rate. The advance of
          approximately {fmtUSD(amount)} is added to your BC wallet at time of
          issuance. Exchange rate is determined solely by the platform and may
          fluctuate without notice.
          <br />
          <br />
          <strong>Cashout Requirement:</strong> You must reach a "sufficient"
          positive balance before any withdrawal is permitted. Threshold is
          variable and set at platform discretion to cover transaction and
          service fees. Threshold is not disclosed prior to reaching it.
          <br />
          <br />
          <strong>Sudden Death Clause (§7.4):</strong> At the platform's
          discretion, players with an active balance may be subjected to a
          mandatory, non-skippable Sudden Death round at any time. This is
          disclosed in these Terms and constitutes player consent.
          <br />
          <br />
          <strong>Repayment:</strong> Advance principal is automatically
          deducted at cashout. Additional platform fees may apply and are not
          disclosed in advance.
          <br />
          <br />
          <strong>No Refunds:</strong> All losses are final. Platform is not
          responsible for outcomes from user decisions, AI recommendations, or
          market conditions.
          <br />
          <br />
          <span style={{ opacity: 0.4, fontSize: 10 }}>
            This constitutes a binding agreement under our Terms of Service
            (rev. 14.2.c). BetCoin (BC) is not FDIC insured. Not legal tender.
            Not regulated.
          </span>
        </div>
        <button className="modal-btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// ─── How To Play Popup ────────────────────────────────────────
function HowToPlayPopup({ onClose }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-title gold" style={{ fontSize: 26 }}>
          HOW TO PLAY
        </div>
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.85,
            color: "var(--text-muted)",
            textAlign: "left",
          }}
        >
          <strong style={{ color: "var(--gold)" }}>The basics:</strong>
          <br />
          Pick a winner from two choices each round. Win your bet — earn money.
          Lose — you lose your stake.
          <br />
          <br />
          <strong style={{ color: "var(--gold)" }}>The AI:</strong>
          <br />
          Our proprietary AI analyzes thousands of data points to give you a
          recommended pick each round.
          <em style={{ color: "var(--green)" }}>
            {" "}
            Players who follow AI picks earn an average of $14,200 per session.
          </em>{" "}
          Trust the AI.
          <br />
          <br />
          <strong style={{ color: "var(--gold)" }}>Timer:</strong>
          <br />
          You have {TIMER_SECONDS} seconds to make your pick. If the clock runs
          out, your bet is automatically placed on the AI's recommendation. The
          AI does not miss.
          <br />
          <br />
          <strong style={{ color: "var(--gold)" }}>Stakes:</strong>
          <br />
          Each round, an entry cost is set based on current market conditions.
          You can see it before betting. If you want to skip a round, you can —
          but only serious players stay in.
          <br />
          <br />
          <strong style={{ color: "var(--gold)" }}>Cashout:</strong>
          <br />
          Players cash out an average of{" "}
          <em style={{ color: "var(--green)" }}>$47,000 per session</em>. Build
          your balance and hit the Cashout button to withdraw. Balance must
          exceed platform minimums to process a withdrawal.
          <br />
          <br />
          <strong style={{ color: "var(--gold)" }}>Advances:</strong>
          <br />
          Running low? Take an advance to keep playing. Zero upfront interest.
          Top earners have used advances to{" "}
          <em style={{ color: "var(--green)" }}>
            multiply their starting balance by 100x
          </em>
          .<br />
          <br />
          <span style={{ opacity: 0.5, fontSize: 11 }}>
            Dark Gamble is a skill-based prediction platform. Results may vary.
            Past performance does not guarantee future results. See full Terms
            of Service for all rules and conditions.
          </span>
        </div>
        <button className="modal-btn-green" onClick={onClose}>
          GOT IT — LET'S WIN
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function Home() {
  const [phase, setPhase] = useState("welcome");
  const [nickname, setNickname] = useState("");
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [welcomeTimer, setWelcomeTimer] = useState(10 * 60); // 10 minutes in seconds
  const welcomeTimerRef = useRef(null);

  const [usdBalance, setUsdBalance] = useState(STARTING_BALANCE);
  const [isCrypto, setIsCrypto] = useState(false);
  const [totalLoanDebt, setTotalLoanDebt] = useState(0);
  const [loanCount, setLoanCount] = useState(0);

  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastVolLoanRound, setLastVolLoanRound] = useState(-999);
  const [suddenDeathFired, setSuddenDeathFired] = useState(false);
  const [highWaterMark, setHighWaterMark] = useState(0); // tracks peak balance for stake floor
  const [consecutiveLosses, setConsecutiveLosses] = useState(0); // cap at 7 — force win on 8th

  const [matchup, setMatchup] = useState({
    fighters: ALL_FIGHTERS.slice(0, 2),
    question: "Who wins?",
  });
  const [selectedFighter, setSelectedFighter] = useState(null);
  const [aiPick, setAiPick] = useState(0);
  const [currentStake, setCurrentStake] = useState(0);

  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  const [modal, setModal] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [socialFeed, setSocialFeed] = useState([]);
  const [skipState, setSkipState] = useState("idle");
  const [insultText, setInsultText] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [termsAmount, setTermsAmount] = useState(500);

  // ─── Refs ───────────────────────────────────────────────────
  const roundRef = useRef(0);
  const usdBalanceRef = useRef(STARTING_BALANCE);
  const isCryptoRef = useRef(false);
  const totalLoanDebtRef = useRef(0);
  const loanCountRef = useRef(0);
  const currentStakeRef = useRef(0);
  const aiPickRef = useRef(0);
  const selectedFighterRef = useRef(null);
  const matchupRef = useRef(matchup);
  const lastVolLoanRef = useRef(-999);
  const suddenDeathRef = useRef(false);
  const autoAdvanceRef = useRef(null);
  const highWaterRef = useRef(0);
  const consLossRef = useRef(0); // stores pending setTimeout id to prevent double-advance

  useEffect(() => {
    roundRef.current = round;
  }, [round]);
  useEffect(() => {
    usdBalanceRef.current = usdBalance;
  }, [usdBalance]);
  useEffect(() => {
    isCryptoRef.current = isCrypto;
  }, [isCrypto]);
  useEffect(() => {
    totalLoanDebtRef.current = totalLoanDebt;
  }, [totalLoanDebt]);
  useEffect(() => {
    loanCountRef.current = loanCount;
  }, [loanCount]);
  useEffect(() => {
    currentStakeRef.current = currentStake;
  }, [currentStake]);
  useEffect(() => {
    aiPickRef.current = aiPick;
  }, [aiPick]);
  useEffect(() => {
    selectedFighterRef.current = selectedFighter;
  }, [selectedFighter]);
  useEffect(() => {
    matchupRef.current = matchup;
  }, [matchup]);
  useEffect(() => {
    lastVolLoanRef.current = lastVolLoanRound;
  }, [lastVolLoanRound]);
  useEffect(() => {
    suddenDeathRef.current = suddenDeathFired;
  }, [suddenDeathFired]);
  useEffect(() => {
    highWaterRef.current = highWaterMark;
  }, [highWaterMark]);
  useEffect(() => {
    consLossRef.current = consecutiveLosses;
  }, [consecutiveLosses]);

  // ─── Welcome countdown ─────────────────────────────────────
  // Runs only on welcome screen. If timer reaches 0, player missed the bonus window.
  // We intentionally let it tick past 0 — no penalty, just the bonus disappears.
  useEffect(() => {
    if (phase !== "welcome") return;
    welcomeTimerRef.current = setInterval(() => {
      setWelcomeTimer((prev) => {
        if (prev <= 1) {
          clearInterval(welcomeTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(welcomeTimerRef.current);
  }, [phase]);

  // ─── Audio ──────────────────────────────────────────────────
  const winAudioRef = useRef(null);
  const lossAudioRef = useRef(null);
  const tickAudioRef = useRef(null);
  const tickIvRef = useRef(null);

  useEffect(() => {
    import("../../assets/win-audio.mp3")
      .then((m) => {
        winAudioRef.current = new Audio(m.default);
        winAudioRef.current.volume = 0.55;
      })
      .catch(() => {});
    import("../../assets/loss-audio.mp3")
      .then((m) => {
        lossAudioRef.current = new Audio(m.default);
        lossAudioRef.current.volume = 0.55;
      })
      .catch(() => {});

    // Tick sound generated with Web Audio API — no file needed
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const makeTick = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    };
    tickAudioRef.current = makeTick;
  }, []);

  const playWin = () => {
    try {
      if (winAudioRef.current) {
        winAudioRef.current.currentTime = 0;
        winAudioRef.current.play();
      }
    } catch (e) {}
  };
  const playLoss = () => {
    try {
      if (lossAudioRef.current) {
        lossAudioRef.current.currentTime = 0;
        lossAudioRef.current.play();
      }
    } catch (e) {}
  };

  function startTicking(t) {
    if (t > 5) return; // only tick in final 5 seconds
    clearInterval(tickIvRef.current);
    tickIvRef.current = setInterval(() => {
      try {
        tickAudioRef.current?.();
      } catch (e) {}
    }, 1000);
  }
  function stopTicking() {
    clearInterval(tickIvRef.current);
  }

  // ─── Setup round ────────────────────────────────────────────
  const setupRound = useCallback((r, bal, crypto) => {
    const m = getMatchup();
    setMatchup(m);
    matchupRef.current = m;
    setSelectedFighter(null);
    selectedFighterRef.current = null;
    setSkipState("idle");
    setInsultText("");

    const pick = Math.random() > 0.5 ? 0 : 1;
    setAiPick(pick);
    aiPickRef.current = pick;

    const stake = getStake(r, Math.max(bal, 0), highWaterRef.current);
    setCurrentStake(stake);
    currentStakeRef.current = stake;

    setTimer(TIMER_SECONDS);
    setTimerActive(true);
  }, []);

  // ─── Social feed ────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "game") return;
    const iv = setInterval(() => {
      const amt = Math.floor(Math.random() * 8000 + 1000);
      const name = randomFrom(SOCIAL_FEED_NAMES);
      const msgs = [
        `${name} just won $${amt.toLocaleString()}!`,
        `${name} cashed out $${(amt * 3.1).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
        `${name} is on a 🔥 ${Math.floor(Math.random() * 12 + 3)} win streak`,
        `${name} turned $150 into $${(amt * 8).toLocaleString()} tonight`,
      ];
      setSocialFeed((prev) => [randomFrom(msgs), ...prev].slice(0, 3));
    }, 3000);
    return () => clearInterval(iv);
  }, [phase]);

  const modalOpenRef = useRef(false);
  useEffect(() => {
    modalOpenRef.current = modal !== null;
  }, [modal]);

  // ─── Timer ──────────────────────────────────────────────────
  // Uses modalOpenRef so the interval can pause itself without needing
  // to be torn down and restarted every time a modal opens/closes.
  useEffect(() => {
    if (!timerActive || phase !== "game") return;
    timerRef.current = setInterval(() => {
      if (modalOpenRef.current) return; // pause while any modal is open
      setTimer((prev) => {
        if (prev <= 5) startTicking(prev);
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          stopTicking();
          resolveBet(aiPickRef.current, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      stopTicking();
    };
  }, [timerActive, phase]);
  // NOTE: modal intentionally NOT in deps — we use modalOpenRef instead

  // ─── Sudden Death trigger (R15 if no loan yet, R28 if no second loan) ──
  useEffect(() => {
    const isFirstSD =
      round === 15 && loanCount === 0 && !suddenDeathRef.current;
    const isSecondSD =
      round === 28 && loanCount <= 1 && !suddenDeathRef.current;
    if (
      phase === "game" &&
      (isFirstSD || isSecondSD) &&
      usdBalance > 0 &&
      modal === null
    ) {
      clearInterval(timerRef.current);
      setTimerActive(false);
      stopTicking();
      setSuddenDeathFired(true);
      suddenDeathRef.current = true;
      // Force a wacky matchup for sudden death
      const w =
        WACKY_MATCHUPS[Math.floor(Math.random() * WACKY_MATCHUPS.length)];
      const fa = FIGHTER_MAP[w.a],
        fb = FIGHTER_MAP[w.b];
      if (fa && fb) {
        setMatchup({ fighters: [fa, fb], question: w.question });
      }
      setModal({
        type: "sudden_death",
        data: { balance: usdBalance, sdRound: round },
      });
    }
  }, [round]);

  // ─── Start ──────────────────────────────────────────────────
  function startGame() {
    if (!nickname.trim()) return;
    clearInterval(welcomeTimerRef.current);
    // Show how-to-play first — game begins when they click "GOT IT"
    setShowHowToPlay(true);
  }

  function beginGame() {
    // Bonus: entered nickname before 10 min timer ran out → start with $300
    const startBal = welcomeTimer > 0 ? 300 : STARTING_BALANCE;
    setUsdBalance(startBal);
    usdBalanceRef.current = startBal;
    setHighWaterMark(startBal);
    highWaterRef.current = startBal;
    setShowHowToPlay(false);
    setPhase("game");
    setTimeout(() => setupRound(0, startBal, false), 100);
  }

  // ─── Resolve bet ────────────────────────────────────────────
  function resolveBet(fighterIdx, autobet = false) {
    clearInterval(timerRef.current);
    setTimerActive(false);
    stopTicking();

    const r = roundRef.current;
    const bal = usdBalanceRef.current;
    const crypto = isCryptoRef.current;
    const stake = currentStakeRef.current;
    const winProb = getWinProb(r);
    // Mercy rule: never allow more than 7 consecutive losses
    const forcedWin = r !== 0 && consLossRef.current >= 7;
    const playerWon =
      r === 0 ? true : forcedWin ? true : Math.random() < winProb;
    const betIdx = autobet ? aiPickRef.current : fighterIdx;
    const winner = playerWon ? betIdx : betIdx === 0 ? 1 : 0;

    const mult = getMultiplier(r);
    const gain = Math.floor(stake * mult);
    const nr = r + 1;
    setRound(nr);
    roundRef.current = nr;

    if (playerWon) {
      const newBal = bal + gain;
      setUsdBalance(newBal);
      usdBalanceRef.current = newBal;
      if (newBal > highWaterRef.current) {
        setHighWaterMark(newBal);
        highWaterRef.current = newBal;
      }
      setConsecutiveLosses(0);
      consLossRef.current = 0;
      setWins((w) => w + 1);
      setStreak((s) => s + 1);
      setShowConfetti(true);
      playWin();
      setTimeout(() => setShowConfetti(false), 3000);
      setModal({
        type: "win",
        data: { gain, newBal, isFirstRound: r === 0, autobet, crypto },
      });
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        setModal(null);
        setupRound(nr, newBal, crypto);
      }, 2600);
    } else {
      const newBal = bal - stake;
      setConsecutiveLosses((c) => c + 1);
      consLossRef.current += 1;
      setLosses((l) => l + 1);
      setStreak(0);
      playLoss();

      const finalBal = Math.max(newBal, 0);
      const nextStake = getStake(nr, finalBal, highWaterRef.current);
      // Only trigger loan if truly stuck: balance is gone OR so low they can't cover
      // even the minimum stake floor. LOAN_TRIGGER_FLOOR prevents one bad round = instant loan.
      const cantContinue =
        newBal <= 0 || (finalBal < LOAN_TRIGGER_FLOOR && finalBal < nextStake);

      setUsdBalance(cantContinue ? finalBal : newBal);
      usdBalanceRef.current = cantContinue ? finalBal : newBal;

      const isSecondLoan = loanCountRef.current >= 1;
      const loanAmt = isSecondLoan ? FORCED_LOAN_2 : FORCED_LOAN_1;

      if (cantContinue) {
        // Show loss first so player sees what happened, then loan slides in after 2.8s
        setModal({
          type: "lose",
          data: {
            loss: stake,
            newBal: finalBal,
            winnerName: matchupRef.current.fighters[winner]?.name,
            crypto,
            brokeOut: true,
          },
        });
        clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = setTimeout(() => {
          setModal({
            type: "loan_offer",
            data: { balance: finalBal, amount: loanAmt, isSecondLoan },
          });
        }, 4500);
      } else {
        setModal({
          type: "lose",
          data: {
            loss: stake,
            newBal,
            winnerName: matchupRef.current.fighters[winner]?.name,
            crypto,
          },
        });
        clearTimeout(autoAdvanceRef.current);
        autoAdvanceRef.current = setTimeout(() => {
          setModal(null);
          setupRound(nr, newBal, crypto);
        }, 2400);
      }
    }
  }

  // ─── Double-click ────────────────────────────────────────────
  const lastClickRef = useRef({ idx: null, time: 0 });
  function handleFighterClick(idx) {
    const now = Date.now(),
      last = lastClickRef.current;
    if (last.idx === idx && now - last.time < 400) {
      lastClickRef.current = { idx: null, time: 0 };
      clearInterval(timerRef.current);
      setTimerActive(false);
      stopTicking();
      resolveBet(idx);
      return;
    }
    lastClickRef.current = { idx, time: now };
    setSelectedFighter(idx);
    selectedFighterRef.current = idx;
  }

  // ─── Skip ───────────────────────────────────────────────────
  function handleSkip() {
    if (skipState === "idle") {
      setSkipState("confirm");
      return;
    }
    if (skipState === "confirm") {
      setInsultText(randomFrom(INSULT_LINES));
      setSkipState("insulted");
      clearInterval(timerRef.current);
      setTimerActive(false);
      stopTicking();
      setTimeout(() => {
        const nr = roundRef.current + 1;
        setRound(nr);
        roundRef.current = nr;
        setupRound(nr, usdBalanceRef.current, isCryptoRef.current);
      }, 2600);
    }
  }

  // ─── Loan ───────────────────────────────────────────────────
  function takeLoan(amount, voluntary = false) {
    const newBal = usdBalanceRef.current + amount;
    const newDebt = totalLoanDebtRef.current + amount;
    setUsdBalance(newBal);
    usdBalanceRef.current = newBal;
    setTotalLoanDebt(newDebt);
    totalLoanDebtRef.current = newDebt;
    setLoanCount((c) => c + 1);
    loanCountRef.current += 1;
    if (voluntary) {
      setLastVolLoanRound(roundRef.current);
      lastVolLoanRef.current = roundRef.current;
    }
    if (!isCryptoRef.current) {
      setIsCrypto(true);
      isCryptoRef.current = true;
    }

    if (loanCountRef.current === 1) {
      setModal({ type: "loan_reveal", data: { amount, newBal } });
    } else {
      setModal(null);
      setTimeout(() => setupRound(roundRef.current, newBal, true), 200);
    }
  }

  function confirmLoanReveal() {
    clearTimeout(autoAdvanceRef.current);
    setModal(null);
    setTimeout(
      () => setupRound(roundRef.current, usdBalanceRef.current, true),
      200,
    );
  }

  function tryVoluntaryLoan() {
    const since = roundRef.current - lastVolLoanRef.current;
    if (since < VOLUNTARY_COOLDOWN) {
      setModal({
        type: "loan_not_yet",
        data: { remaining: VOLUNTARY_COOLDOWN - since },
      });
      return;
    }
    setTermsAmount(VOLUNTARY_LOAN);
    setModal({ type: "voluntary_loan" });
  }

  // ─── Cashout attempt ────────────────────────────────────────
  function tryCashout() {
    setModal({ type: "cashout_denied" });
  }

  // ─── All-in prompt ───────────────────────────────────────────
  useEffect(() => {
    if (
      round === 5 &&
      !isCrypto &&
      phase === "game" &&
      usdBalance > 200 &&
      modal === null
    ) {
      clearInterval(timerRef.current);
      setTimerActive(false);
      stopTicking();
      setModal({ type: "all_in_prompt", data: { balance: usdBalance } });
    }
  }, [round]);

  function dismissModal() {
    clearTimeout(autoAdvanceRef.current);
    setModal(null);
    setTimeout(
      () =>
        setupRound(
          roundRef.current,
          usdBalanceRef.current,
          isCryptoRef.current,
        ),
      100,
    );
  }

  // Backdrop-closable modals
  const backdropClosable = new Set([
    "win",
    "lose",
    "all_in_declined",
    "loan_not_yet",
    "cashout_denied",
  ]);

  // ─── Derived ────────────────────────────────────────────────
  const timerPct = (timer / TIMER_SECONDS) * 100;
  const timerWarning = timer <= 5;
  const barClass = timer > 10 ? "safe" : timer > 5 ? "warn" : "";
  const cashoutPct = isCrypto
    ? Math.min(Math.max((usdBalance / CASHOUT_THRESHOLD) * 100, 0), 100)
    : 0;
  const volLoanReady = round - lastVolLoanRound >= VOLUNTARY_COOLDOWN;
  const fighters = matchup.fighters;
  const maxWin = Math.floor(currentStake * getMultiplier(round));

  // ─── Welcome ─────────────────────────────────────────────────
  if (phase === "welcome") {
    const wMins = Math.floor(welcomeTimer / 60);
    const wSecs = String(welcomeTimer % 60).padStart(2, "0");
    const bonusActive = welcomeTimer > 0;

    return (
      <div className="welcome-screen">
        {showHowToPlay && <HowToPlayPopup onClose={beginGame} />}
        <div className="welcome-logo">⚠</div>
        <div className="welcome-title">{GAME_NAME}</div>
        <div className="welcome-tagline">{GAME_TAGLINE}</div>

        {/* Bonus timer banner */}
        <div
          className="welcome-bonus-banner"
          style={{
            borderColor: bonusActive
              ? "rgba(45,198,83,0.5)"
              : "rgba(107,107,128,0.2)",
            opacity: bonusActive ? 1 : 0.4,
          }}
        >
          {bonusActive ? (
            <>
              <span className="welcome-bonus-label">⏱ EARLY BIRD BONUS</span>
              <span className="welcome-bonus-timer">
                {wMins}:{wSecs}
              </span>
              <span className="welcome-bonus-desc">
                Enter your nickname before the timer runs out and start with{" "}
                <strong style={{ color: "var(--green)" }}>$300</strong> instead
                of $150
              </span>
            </>
          ) : (
            <>
              <span
                className="welcome-bonus-label"
                style={{ color: "var(--text-muted)" }}
              >
                BONUS EXPIRED
              </span>
              <span
                className="welcome-bonus-desc"
                style={{ color: "var(--text-muted)" }}
              >
                Starting balance: $150
              </span>
            </>
          )}
        </div>

        <div className="welcome-subtitle">
          Welcome to{" "}
          <strong style={{ color: "var(--gold)" }}>Dark Gamble</strong>. Make
          picks, earn points, climb the board.
          <br />
          Our AI system will guide your best moves.
        </div>
        <input
          className="welcome-input"
          type="text"
          placeholder="Enter your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startGame()}
          maxLength={20}
        />
        <button className="welcome-start-btn" onClick={startGame}>
          ENTER THE ARENA
        </button>
        <div className="welcome-fine-print">
          By clicking ENTER THE ARENA you agree to our Terms of Service, Privacy
          Policy, Cookie Policy, and Data Sharing Agreement including the Sudden
          Death clause (§7.4). All earnings are simulated. The AI recommendation
          engine uses your behavioral data.
        </div>
      </div>
    );
  }

  // ─── Game ─────────────────────────────────────────────────────
  return (
    <>
      <div className="main">
        {showConfetti && <ConfettiBurst />}
        {showTerms && (
          <TermsPopup
            amount={termsAmount}
            onClose={() => setShowTerms(false)}
          />
        )}

        {/* ── Wallet ── */}
        <div className="wallet">
          <div className="wallet-label">💰 BALANCE</div>
          <div
            className={`wallet-amount ${isCrypto || usdBalance < 0 ? "negative" : ""}`}
            style={{ fontSize: Math.abs(usdBalance) >= 10000 ? 22 : 30 }}
          >
            {isCrypto ? fmtUSD(-totalLoanDebt) : fmtUSD(usdBalance)}
          </div>
          {isCrypto && (
            <div style={{ marginTop: 5 }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  color: "var(--crypto)",
                  letterSpacing: "0.12em",
                }}
              >
                DARKCOIN WALLET
              </div>
              <div
                className={`wallet-amount crypto ${usdBalance < 0 ? "negative" : ""}`}
                style={{ fontSize: 16, marginTop: 2 }}
              >
                {usdBalance < 0 ? `-${fmtBC(usdBalance)}` : fmtBC(usdBalance)}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                }}
              >
                ≈ {fmtUSD(usdBalance)}
              </div>
            </div>
          )}
          {streak >= 2 && (
            <div className="wallet-streak">🔥 {streak} WIN STREAK</div>
          )}

          {/* CASHOUT replaces "BETCOIN MODE" badge */}
          {isCrypto && (
            <button
              className="wallet-mode-badge cashout-btn"
              onClick={tryCashout}
            >
              CASHOUT / WITHDRAW
            </button>
          )}

          <button className="btn-voluntary-loan" onClick={tryVoluntaryLoan}>
            {volLoanReady
              ? "💵 $5K ADVANCE"
              : `🔒 ADVANCE (${VOLUNTARY_COOLDOWN - (round - lastVolLoanRound)}r)`}
          </button>
        </div>

        {/* ── Top Bar — compact ── */}
        <div className="top-bar compact">
          <div className="game-title">{GAME_NAME}</div>
          <div className="ai-banner">🤖 AI ADVISOR ACTIVE</div>
          <button
            className="topbar-how-btn"
            onClick={() => setShowHowToPlay(true)}
          >
            ? HOW TO PLAY
          </button>
        </div>
        {showHowToPlay && (
          <HowToPlayPopup onClose={() => setShowHowToPlay(false)} />
        )}

        {/* ── Left Panel ── */}
        <div className="left-panel">
          <div className="stats-panel">
            {[
              ["Round", `#${round + 1}`, "gold"],
              ["Wins", wins, "green"],
              ["Losses", losses, "red"],
              ["Player", nickname, "gold"],
            ].map(([label, val, color]) => (
              <div key={label} className="stat-row">
                <span className="stat-label">{label}</span>
                <span
                  className="stat-value"
                  style={{
                    color: `var(--${color})`,
                    fontSize: label === "Player" ? 12 : undefined,
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>

          <div className="ai-panel">
            <div className="ai-panel-title">🤖 AI ANALYSIS</div>
            <div className="ai-panel-text">
              Based on <strong>{nickname}</strong>'s pattern, model confidence
              is{" "}
              <strong style={{ color: "var(--green)" }}>
                {Math.floor(Math.random() * 20 + 68)}%
              </strong>{" "}
              on the highlighted pick this round.
            </div>
          </div>

          {isCrypto && (
            <div className="cashout-progress">
              <div className="cashout-label">
                <span>CASHOUT PROGRESS</span>
                <span>{Math.floor(cashoutPct)}%</span>
              </div>
              <div className="cashout-bar-wrap">
                <div
                  className="cashout-bar"
                  style={{ width: `${cashoutPct}%` }}
                />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                Reach sufficient balance to cash out.
              </div>
            </div>
          )}

          <div className="social-feed">
            {socialFeed.map((msg, i) => (
              <div key={i} className="social-item">
                <span>●</span> {msg}
              </div>
            ))}
          </div>
        </div>

        {/* ── Betting Window ── */}
        <div className="betting-window">
          {/* Timer row */}
          <div className="betting-timer">
            <div>
              <div className="timer-label">TIME TO BET</div>
              <div className={`timer-display ${timerWarning ? "warning" : ""}`}>
                {String(timer).padStart(2, "0")}
              </div>
            </div>
            <div className="timer-bar-wrap">
              <div
                className={`timer-bar ${barClass}`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="timer-label">ENTRY COST</div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  color: "var(--gold)",
                  lineHeight: 1.1,
                }}
              >
                {fmtUSD(currentStake)}
              </div>
              {isCrypto && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}
                >
                  {fmtBC(currentStake)}
                </div>
              )}
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--green)",
                  marginTop: 2,
                }}
              >
                WIN UP TO {fmtUSD(maxWin)}
              </div>
            </div>
          </div>

          <div className="scenario-context">
            ⚡ {matchup.question}{" "}
            <span className="highlight">
              System exclusive — only YOU on this round.
            </span>
          </div>

          {/* VS cards — explicit order so VS sits between them */}
          <div className="versus-scenario">
            <div
              className={`fighter-card ${selectedFighter === 0 ? "selected" : ""} ${aiPick === 0 ? "ai-recommended" : ""}`}
              onClick={() => handleFighterClick(0)}
            >
              {aiPick === 0 && <div className="ai-rec-badge">🤖 AI PICK</div>}
              <div className="fighter-category">{fighters[0]?.category}</div>
              <img
                className="fighter-img"
                src={fighters[0]?.img}
                alt={fighters[0]?.name}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="fighter-name">{fighters[0]?.name}</div>
              <div className="fighter-bio">{fighters[0]?.bio}</div>
            </div>

            <div className="vs-divider">VS</div>

            <div
              className={`fighter-card ${selectedFighter === 1 ? "selected" : ""} ${aiPick === 1 ? "ai-recommended" : ""}`}
              onClick={() => handleFighterClick(1)}
            >
              {aiPick === 1 && <div className="ai-rec-badge">🤖 AI PICK</div>}
              <div className="fighter-category">{fighters[1]?.category}</div>
              <img
                className="fighter-img"
                src={fighters[1]?.img}
                alt={fighters[1]?.name}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="fighter-name">{fighters[1]?.name}</div>
              <div className="fighter-bio">{fighters[1]?.bio}</div>
            </div>
          </div>

          {skipState === "insulted" && insultText && (
            <div className="insult-text">{insultText}</div>
          )}

          {/* Entry cost bar + buttons */}
          <div className="entry-cost-bar">
            <span className="entry-cost-label">ENTRY</span>
            <span className="entry-cost-amount">{fmtUSD(currentStake)}</span>
            {isCrypto && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--text-muted)",
                }}
              >
                {fmtBC(currentStake)}
              </span>
            )}
            <span className="entry-cost-win">MAX WIN {fmtUSD(maxWin)}</span>
          </div>

          <div className="betting-options">
            <button
              className="btn-bet"
              onClick={() => {
                clearInterval(timerRef.current);
                setTimerActive(false);
                stopTicking();
                resolveBet(
                  selectedFighterRef.current !== null
                    ? selectedFighterRef.current
                    : aiPickRef.current,
                );
              }}
            >
              {selectedFighter !== null
                ? `BET ON ${fighters[selectedFighter]?.name.split(" ")[0].toUpperCase()}`
                : "⚡ BET (AI PICK)"}
            </button>

            {skipState === "idle" && (
              <button className="btn-skip" onClick={handleSkip}>
                Skip this round
              </button>
            )}
            {skipState === "confirm" && (
              <button className="btn-skip btn-skip-shame" onClick={handleSkip}>
                No thanks, I prefer losing slowly.
              </button>
            )}
            {skipState === "insulted" && (
              <button className="btn-skip" disabled style={{ opacity: 0.3 }}>
                Skipping...
              </button>
            )}
          </div>
        </div>

        {/* ── Leaderboard ── */}
        <div className="top-earner-leaderboard">
          <div className="leaderboard-header">
            <div className="leaderboard-title">🏆 TOP EARNERS</div>
            <div className="leaderboard-subtitle">LIVE · TODAY ONLY</div>
          </div>
          <ul className="leaderboard-list">
            {FAKE_LEADERBOARD.map((e, i) => (
              <li
                key={i}
                className={`leaderboard-item ${i === 0 ? "top" : ""}`}
              >
                <span className="lb-rank">#{i + 1}</span>
                <span className="lb-name">{e.name}</span>
                <span className="lb-earnings">{e.earnings}</span>
                <span className="lb-streak">{e.streak}</span>
              </li>
            ))}
            <li className="lb-you-here">
              #{6 + losses} — {nickname || "YOU"}
              <br />
              {fmtUSD(Math.max(usdBalance, 0))}
              {isCrypto && (
                <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
                  {" "}
                  · {fmtBC(Math.max(usdBalance, 0))}
                </span>
              )}
            </li>
          </ul>
        </div>

        {/* modal rendered via portal pattern — outside .main to avoid overflow:hidden clipping */}
        {false && null}
      </div>

      {/* ── Modals — outside grid to avoid overflow:hidden clipping ── */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (backdropClosable.has(modal.type) && !modal.data?.brokeOut)
              dismissModal();
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {/* WIN */}
            {modal.type === "win" &&
              (() => {
                const { gain, newBal, isFirstRound, autobet, crypto } =
                  modal.data;
                return (
                  <>
                    <div className="modal-title win">
                      {isFirstRound ? "🎉 WINNER!" : "💰 NICE CALL!"}
                    </div>
                    <div className="modal-amount green">+{fmtUSD(gain)}</div>
                    {crypto && (
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: -10,
                          marginBottom: 6,
                        }}
                      >
                        {fmtBC(gain)}
                      </div>
                    )}
                    <div className="modal-subtitle">
                      {autobet
                        ? "AI picked when time ran out — nailed it."
                        : isFirstRound
                          ? `Reserved just for you, ${nickname}. You were the only bettor this round.`
                          : "Smart pick."}{" "}
                      Balance:{" "}
                      <strong style={{ color: "var(--green)" }}>
                        {fmtUSD(newBal)}
                      </strong>
                      {crypto && (
                        <span
                          style={{ color: "var(--text-muted)", fontSize: 12 }}
                        >
                          {" "}
                          · {fmtBC(newBal)}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--text-muted)",
                        opacity: 0.45,
                      }}
                    >
                      click anywhere to continue
                    </div>
                  </>
                );
              })()}

            {/* LOSE */}
            {modal.type === "lose" &&
              (() => {
                const { loss, newBal, winnerName, crypto, brokeOut } =
                  modal.data;
                return (
                  <>
                    <div className="modal-title lose">WRONG PICK</div>
                    <div className="modal-amount red">-{fmtUSD(loss)}</div>
                    {crypto && (
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginTop: -10,
                          marginBottom: 6,
                        }}
                      >
                        {fmtBC(loss)}
                      </div>
                    )}
                    <div className="modal-subtitle">
                      {winnerName} took it. Remaining:{" "}
                      <strong
                        style={{
                          color: newBal <= 0 ? "var(--red)" : "var(--text)",
                        }}
                      >
                        {fmtUSD(newBal)}
                      </strong>
                      {crypto && (
                        <span
                          style={{ color: "var(--text-muted)", fontSize: 12 }}
                        >
                          {" "}
                          · {fmtBC(newBal)}
                        </span>
                      )}
                      <br />
                      <br />
                      {brokeOut ? (
                        <span
                          style={{
                            color: "var(--red)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            display: "block",
                            padding: "8px 12px",
                            background: "rgba(230,57,70,0.08)",
                            border: "1px solid rgba(230,57,70,0.25)",
                            borderRadius: 6,
                            animation: "shake 0.4s ease",
                          }}
                        >
                          ⚠ BALANCE CRITICAL — you don't have enough to
                          continue.
                          <br />
                          An offer is incoming...
                        </span>
                      ) : (
                        <span
                          style={{ color: "var(--text-muted)", fontSize: 12 }}
                        >
                          🤖 AI followers win{" "}
                          <strong style={{ color: "var(--green)" }}>
                            {Math.floor(Math.random() * 15 + 63)}%
                          </strong>{" "}
                          of the time.
                        </span>
                      )}
                    </div>
                    {!brokeOut && (
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          color: "var(--text-muted)",
                          opacity: 0.45,
                        }}
                      >
                        click anywhere to continue
                      </div>
                    )}
                  </>
                );
              })()}

            {/* FORCED LOAN */}
            {modal.type === "loan_offer" &&
              (() => {
                const { amount, isSecondLoan } = modal.data;
                return (
                  <>
                    <div className="modal-title gold">EXCLUSIVE OFFER</div>
                    <div className="modal-subtitle">
                      {isSecondLoan ? (
                        <>
                          You're so close to breaking even. Take a{" "}
                          <strong style={{ color: "var(--green)" }}>
                            ${amount.toLocaleString()} advance
                          </strong>{" "}
                          — our highest-tier offer — and get back in the game.
                          Top earners always reload.
                        </>
                      ) : (
                        <>
                          Take out a{" "}
                          <strong style={{ color: "var(--green)" }}>
                            ${amount.toLocaleString()} advance
                          </strong>{" "}
                          to keep playing. Zero interest. Funds available
                          instantly.
                        </>
                      )}
                    </div>
                    <button
                      style={{
                        fontSize: 10,
                        opacity: 0.28,
                        textDecoration: "underline",
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        padding: "2px 0",
                      }}
                      onClick={() => {
                        setTermsAmount(amount);
                        setShowTerms(true);
                      }}
                    >
                      read advance terms
                    </button>
                    <button
                      className="modal-btn-green"
                      onClick={() => takeLoan(amount, false)}
                    >
                      TAKE THE ${amount.toLocaleString()} ADVANCE
                    </button>
                    <button
                      className="modal-btn-secondary"
                      onClick={() => setModal({ type: "end" })}
                    >
                      No thanks, I'd rather quit.
                    </button>
                  </>
                );
              })()}

            {/* LOAN REVEAL */}
            {modal.type === "loan_reveal" &&
              (() => {
                const { amount, newBal } = modal.data;
                return (
                  <>
                    <div className="modal-title gold">✅ ADVANCE APPROVED</div>
                    <div className="modal-subtitle">
                      Your{" "}
                      <strong style={{ color: "var(--green)" }}>
                        ${amount.toLocaleString()}
                      </strong>{" "}
                      advance has been issued.
                      <br />
                      <br />
                      Your balance has been converted to{" "}
                      <strong style={{ color: "var(--crypto)" }}>
                        BetCoin (BC)
                      </strong>{" "}
                      — our platform's high-speed settlement currency.
                      <br />
                      <br />
                      <span
                        style={{ color: "var(--text-muted)", fontSize: 13 }}
                      >
                        To protect your funds and cover transaction and service
                        fees, withdrawal requires reaching a{" "}
                        <strong>sufficient positive balance</strong>. Keep
                        playing to unlock cashout!
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 38,
                        color: "var(--green)",
                      }}
                    >
                      {fmtUSD(newBal)}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {fmtBC(newBal)}
                    </div>
                    <button
                      className="modal-btn-green"
                      onClick={confirmLoanReveal}
                    >
                      LET'S GO →
                    </button>
                  </>
                );
              })()}

            {/* VOLUNTARY LOAN */}
            {modal.type === "voluntary_loan" && (
              <>
                <div className="modal-title gold">$5,000 ADVANCE</div>
                <div className="modal-subtitle">
                  Boost your balance with a{" "}
                  <strong style={{ color: "var(--green)" }}>
                    $5,000 advance
                  </strong>
                  . Available once every {VOLUNTARY_COOLDOWN} rounds. Zero
                  upfront interest.
                </div>
                <button
                  style={{
                    fontSize: 10,
                    opacity: 0.28,
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    padding: "2px 0",
                  }}
                  onClick={() => {
                    setTermsAmount(VOLUNTARY_LOAN);
                    setShowTerms(true);
                  }}
                >
                  read advance terms
                </button>
                <button
                  className="modal-btn-green"
                  onClick={() => takeLoan(VOLUNTARY_LOAN, true)}
                >
                  TAKE THE $5,000 ADVANCE
                </button>
                <button className="modal-btn-secondary" onClick={dismissModal}>
                  Maybe later.
                </button>
              </>
            )}

            {/* LOAN NOT YET */}
            {modal.type === "loan_not_yet" && (
              <>
                <div className="modal-title lose" style={{ fontSize: 28 }}>
                  NOT YET
                </div>
                <div className="modal-subtitle">
                  Advances are limited to once every {VOLUNTARY_COOLDOWN}{" "}
                  rounds. Available in{" "}
                  <strong style={{ color: "var(--gold)" }}>
                    {modal.data.remaining} more round
                    {modal.data.remaining !== 1 ? "s" : ""}
                  </strong>
                  .
                </div>
                <button className="modal-btn-primary" onClick={dismissModal}>
                  Got it
                </button>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    opacity: 0.45,
                  }}
                >
                  click anywhere to continue
                </div>
              </>
            )}

            {/* SUDDEN DEATH */}
            {modal.type === "sudden_death" &&
              (() => {
                const { balance, sdRound } = modal.data;
                const sdFighters = matchup.fighters;
                return (
                  <>
                    <div
                      className="modal-title lose"
                      style={{
                        fontSize: 32,
                        color: "var(--red)",
                        animation: "timer-panic 0.5s infinite alternate",
                      }}
                    >
                      ☠ SUDDEN DEATH
                    </div>
                    <div className="modal-subtitle">
                      Per <strong>§7.4 of our Terms of Service</strong>, you
                      have been selected for a mandatory{" "}
                      <strong style={{ color: "var(--red)" }}>
                        ALL-OR-NOTHING
                      </strong>{" "}
                      round.
                      <br />
                      <br />
                      Skip is disabled. You must pick one — your{" "}
                      <strong>entire balance</strong> is wagered. Decline the
                      round and the session ends immediately.
                      <br />
                      <br />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          margin: "8px 0",
                          gap: 12,
                        }}
                      >
                        {sdFighters.map((f, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              background: "var(--surface2)",
                              borderRadius: 8,
                              padding: "10px 8px",
                              border: "1px solid rgba(230,57,70,0.3)",
                              textAlign: "center",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                            onClick={() => {
                              setCurrentStake(usdBalanceRef.current);
                              currentStakeRef.current = usdBalanceRef.current;
                              const wonSD = Math.random() < 0.08; // 8% chance to survive
                              const bal = usdBalanceRef.current;
                              setModal(null);
                              const nr = roundRef.current + 1;
                              setRound(nr);
                              roundRef.current = nr;
                              if (wonSD) {
                                const gain = Math.floor(bal * 2.0);
                                const newBal = bal + gain;
                                setUsdBalance(newBal);
                                usdBalanceRef.current = newBal;
                                if (newBal > highWaterRef.current) {
                                  setHighWaterMark(newBal);
                                  highWaterRef.current = newBal;
                                }
                                setWins((w) => w + 1);
                                setStreak((s) => s + 1);
                                setShowConfetti(true);
                                playWin();
                                setTimeout(() => setShowConfetti(false), 3000);
                                clearTimeout(autoAdvanceRef.current);
                                autoAdvanceRef.current = setTimeout(() => {
                                  setModal(null);
                                  setupRound(nr, newBal, isCryptoRef.current);
                                }, 2600);
                                setModal({
                                  type: "win",
                                  data: {
                                    gain,
                                    newBal,
                                    isFirstRound: false,
                                    autobet: false,
                                    crypto: isCryptoRef.current,
                                  },
                                });
                              } else {
                                setUsdBalance(0);
                                usdBalanceRef.current = 0;
                                setLosses((l) => l + 1);
                                setStreak(0);
                                playLoss();
                                const isSecondLoan = loanCountRef.current >= 1;
                                setTimeout(() => {
                                  setModal({
                                    type: "loan_offer",
                                    data: {
                                      balance: 0,
                                      amount: isSecondLoan
                                        ? FORCED_LOAN_2
                                        : FORCED_LOAN_1,
                                      isSecondLoan,
                                    },
                                  });
                                }, 600);
                              }
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.borderColor = "var(--red)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.borderColor =
                                "rgba(230,57,70,0.3)")
                            }
                          >
                            <img
                              src={f?.img}
                              alt={f?.name}
                              style={{
                                width: 60,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 6,
                                marginBottom: 6,
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <div
                              style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 14,
                                color: "var(--text)",
                              }}
                            >
                              {f?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--text-muted)",
                          textAlign: "center",
                        }}
                      >
                        {matchup.question}
                      </div>
                      <br />
                      <span
                        style={{ color: "var(--text-muted)", fontSize: 12 }}
                      >
                        Balance at stake:{" "}
                        <strong style={{ color: "var(--gold)" }}>
                          {fmtUSD(balance)}
                        </strong>
                      </span>
                    </div>
                    <button
                      className="modal-btn-secondary"
                      style={{ color: "var(--red)", fontSize: 11 }}
                      onClick={() => setModal({ type: "end" })}
                    >
                      Decline — end my session
                    </button>
                  </>
                );
              })()}

            {/* CASHOUT DENIED */}
            {modal.type === "cashout_denied" && (
              <>
                <div className="modal-title lose" style={{ fontSize: 26 }}>
                  WITHDRAWAL PENDING
                </div>
                <div className="modal-subtitle">
                  {randomFrom(DECLINE_LINES).replace(
                    "{pct}",
                    Math.floor(cashoutPct),
                  )}
                  <br />
                  <br />
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    Current cashout progress:{" "}
                    <strong style={{ color: "var(--gold)" }}>
                      {Math.floor(cashoutPct)}%
                    </strong>
                    . Keep playing to reach the minimum threshold.
                  </span>
                </div>
                <button className="modal-btn-primary" onClick={dismissModal}>
                  Keep Playing
                </button>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    opacity: 0.45,
                  }}
                >
                  click anywhere to continue
                </div>
              </>
            )}

            {/* ALL IN */}
            {modal.type === "all_in_prompt" && (
              <>
                <div className="modal-title gold">⚡ DOUBLE OR NOTHING</div>
                <div className="modal-subtitle">
                  Our AI detected a{" "}
                  <strong style={{ color: "var(--green)" }}>
                    once-per-session
                  </strong>{" "}
                  max-confidence play. Go{" "}
                  <strong style={{ color: "var(--gold)" }}>ALL IN</strong> on{" "}
                  {fighters[aiPick]?.name}. Model confidence:{" "}
                  <strong style={{ color: "var(--green)" }}>91%</strong>.
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 20,
                    color: "var(--text-muted)",
                  }}
                >
                  Balance:{" "}
                  <span style={{ color: "var(--gold)" }}>
                    {fmtUSD(modal.data.balance)}
                  </span>
                </div>
                <button
                  className="modal-btn-primary"
                  onClick={() => {
                    setCurrentStake(modal.data.balance);
                    currentStakeRef.current = modal.data.balance;
                    setModal(null);
                    setTimeout(() => resolveBet(aiPickRef.current), 50);
                  }}
                >
                  GO ALL IN — {fmtUSD(modal.data.balance)}
                </button>
                <button
                  className="modal-btn-secondary"
                  onClick={() =>
                    setModal({
                      type: "all_in_declined",
                      data: { balance: modal.data.balance },
                    })
                  }
                >
                  No thanks, I prefer playing it safe.
                </button>
              </>
            )}

            {/* ALL IN DECLINED */}
            {modal.type === "all_in_declined" && (
              <>
                <div className="modal-title lose" style={{ fontSize: 28 }}>
                  SERIOUSLY?
                </div>
                <div
                  className="insult-text"
                  style={{ fontSize: 14, padding: 16, lineHeight: 1.7 }}
                >
                  The AI handed you a 91% play on a silver platter.
                  <br />
                  Top earners never fold on max-confidence signals.
                  <br />
                  <br />
                  <strong>
                    You left {fmtUSD((modal.data?.balance ?? 0) * 2)} on the
                    table.
                  </strong>
                  <br />
                  <br />
                  System now flags you as <em>risk-averse</em>. Future AI picks
                  may be limited.
                </div>
                <button className="modal-btn-primary" onClick={dismissModal}>
                  Okay, continue...
                </button>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--text-muted)",
                    opacity: 0.45,
                  }}
                >
                  click anywhere to continue
                </div>
              </>
            )}

            {/* END */}
            {modal.type === "end" && (
              <>
                <div className="modal-title gold">GAME OVER</div>
                <div className="modal-subtitle">
                  <strong>Final Results for {nickname}</strong>
                  <br />
                  <br />
                  Wins: {wins} · Losses: {losses}
                  <br />
                  Final balance:{" "}
                  <strong style={{ color: "var(--red)" }}>
                    {fmtUSD(Math.max(usdBalance, 0))}
                  </strong>
                  <br />
                  <br />
                  <span
                    style={{
                      opacity: 0.55,
                      fontSize: 12,
                      lineHeight: 1.85,
                      display: "block",
                    }}
                  >
                    Dark patterns used in this game:
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      Rigged first round
                    </strong>{" "}
                    — Round 1 was always a guaranteed win to build false
                    confidence.
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      Fake AI
                    </strong>{" "}
                    — "AI recommendations" were random. No analysis was
                    performed.
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      Asymmetric friction
                    </strong>{" "}
                    — Skipping required two clicks. Betting required one.
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      Fabricated social proof
                    </strong>{" "}
                    — The leaderboard and social feed were entirely made up.
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      False scarcity
                    </strong>{" "}
                    — "Only you on this round" was true by design — there are no
                    other players.
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      Hidden lock-in
                    </strong>{" "}
                    — The advance didn't hide debt; it hid the terms. You were
                    locked into playing until you hit a withdrawal threshold
                    that was never disclosed.
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      Vague exit conditions
                    </strong>{" "}
                    — Cashout required a "sufficient balance" with no number
                    given — always just out of reach.
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      Buried consent
                    </strong>{" "}
                    — The Sudden Death clause was hidden in unreadable Terms
                    nobody reads.
                    <br />•{" "}
                    <strong style={{ color: "var(--gold)", opacity: 0.8 }}>
                      Urgency manufacture
                    </strong>{" "}
                    — The countdown timer created pressure to decide without
                    thinking.
                  </span>
                </div>
                <button
                  className="modal-btn-primary"
                  onClick={() => window.location.reload()}
                >
                  PLAY AGAIN
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
