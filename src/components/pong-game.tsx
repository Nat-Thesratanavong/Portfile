"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import {
  BALL_RADIUS,
  COURT_HEIGHT,
  COURT_WIDTH,
  createInitialGame,
  movePlayerPaddle,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
  pauseGame,
  restartGame,
  resumeGame,
  startGame,
  stepGame,
  type PongState,
} from "@/lib/pong";

const PAPER = "#f4efe6";
const INK = "#1b1712";
const MUTED = "#8b7c6b";
const ORANGE = "#c2410c";

export function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<PongState | null>(null);
  const playerYRef = useRef<number | null>(null);
  const [game, setGame] = useState<PongState>(createInitialGame);
  const isTouchPrimary = useSyncExternalStore(
    subscribeToTouchPointer,
    getTouchPointerSnapshot,
    getTouchPointerServerSnapshot,
  );

  function updateGame(next: PongState) {
    gameRef.current = next;
    setGame(next);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    drawCourt(context, game);
  }, [game]);

  useEffect(() => {
    if (game.status !== "playing") return;

    let animationFrame = 0;
    let previousTime = performance.now();

    const tick = (time: number) => {
      const elapsed = time - previousTime;
      previousTime = time;
      const currentGame = gameRef.current;
      if (!currentGame) return;
      const next = stepGame(currentGame, elapsed, {
        playerY: playerYRef.current ?? currentGame.playerY,
      });
      updateGame(next);

      if (next.status === "playing") {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [game.status]);

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (isTouchPrimary || event.pointerType === "touch") return;

    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    if (bounds.height === 0) return;

    const y = ((event.clientY - bounds.top) / bounds.height) * COURT_HEIGHT;
    playerYRef.current = y;
    updateGame(movePlayerPaddle(gameRef.current ?? game, y));
  }

  function handleStart() {
    updateGame(startGame(gameRef.current ?? game));
  }

  function handlePause() {
    updateGame(pauseGame(gameRef.current ?? game));
  }

  function handleResume() {
    updateGame(resumeGame(gameRef.current ?? game));
  }

  function handleRestart() {
    const next = restartGame();
    playerYRef.current = next.playerY;
    updateGame(next);
  }

  const statusMessage = getStatusMessage(game);

  return (
    <section aria-labelledby="pong-title" className="mt-10">
      <div className="flex flex-col gap-5 border-y border-rule py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">A small diversion</p>
          <h1 id="pong-title" className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Atari Pong
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted">
            A friendly first-to-seven match. Move your mouse or trackpad over the court to steer the orange paddle.
          </p>
        </div>
        <div aria-label="Match score" className="flex items-end gap-3 font-mono">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-widest text-muted">You</p>
            <p className="text-4xl leading-none" data-testid="player-score">{game.playerScore}</p>
          </div>
          <span className="pb-1 text-muted" aria-hidden="true">—</span>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted">CPU</p>
            <p className="text-4xl leading-none" data-testid="ai-score">{game.aiScore}</p>
          </div>
        </div>
      </div>

      {isTouchPrimary ? (
        <div role="alert" data-testid="touch-fallback" className="mt-8 border border-rule bg-wash p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Desktop-only game</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold">Bring a mouse or trackpad</h2>
          <p className="mt-3 max-w-lg leading-7 text-muted">
            This Pong match needs a mouse or trackpad to control the paddle. Visit again on a desktop to play.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 overflow-hidden border border-rule bg-wash p-2 sm:p-3">
            <canvas
              ref={canvasRef}
              width={COURT_WIDTH}
              height={COURT_HEIGHT}
              data-player-y={game.playerY}
              aria-label="Pong court. Move your mouse or trackpad over this court to move your paddle."
              onPointerMove={handlePointerMove}
              className="block h-auto w-full cursor-crosshair border border-ink/20"
            />
          </div>

          <p role="status" aria-live="polite" className="mt-4 min-h-7 text-[15px] text-muted" data-testid="game-status">
            {statusMessage}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {game.status === "ready" && (
              <button type="button" onClick={handleStart} className="button-primary">
                Start match
              </button>
            )}
            {game.status === "playing" && (
              <button type="button" onClick={handlePause} className="button-secondary">
                Pause
              </button>
            )}
            {game.status === "paused" && (
              <button type="button" onClick={handleResume} className="button-primary">
                Resume
              </button>
            )}
            {(game.status === "playing" || game.status === "paused") && (
              <button type="button" onClick={handleRestart} className="button-secondary">
                Restart
              </button>
            )}
            {game.status === "won" && (
              <button type="button" onClick={handleRestart} className="button-primary">
                Play again
              </button>
            )}
          </div>

          {game.status === "ready" && (
            <p className="mt-6 border-l-2 border-accent pl-4 text-sm leading-6 text-muted">
              First to 7 wins. Your paddle remembers its last position when the pointer leaves the court.
            </p>
          )}
        </>
      )}
    </section>
  );
}

function getStatusMessage(game: PongState): string {
  if (game.status === "ready") return "Ready when you are. Move your mouse or trackpad over the court, then start the match.";
  if (game.status === "playing") return `Match in progress. You ${game.playerScore}, CPU ${game.aiScore}.`;
  if (game.status === "paused") return `Match paused at ${game.playerScore}–${game.aiScore}. Resume when ready.`;
  return game.winner === "player"
    ? `You win ${game.playerScore}–${game.aiScore}! Nice reflexes.`
    : `The CPU wins ${game.aiScore}–${game.playerScore}. Give it another shot.`;
}

function drawCourt(context: CanvasRenderingContext2D, game: PongState) {
  context.clearRect(0, 0, COURT_WIDTH, COURT_HEIGHT);
  context.fillStyle = PAPER;
  context.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

  context.strokeStyle = MUTED;
  context.lineWidth = 2;
  context.setLineDash([10, 13]);
  context.beginPath();
  context.moveTo(COURT_WIDTH / 2, 24);
  context.lineTo(COURT_WIDTH / 2, COURT_HEIGHT - 24);
  context.stroke();
  context.setLineDash([]);

  context.fillStyle = ORANGE;
  context.fillRect(PADDLE_MARGIN, game.playerY - PADDLE_HEIGHT / 2, PADDLE_WIDTH, PADDLE_HEIGHT);
  context.fillStyle = INK;
  context.fillRect(
    COURT_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
    game.aiY - PADDLE_HEIGHT / 2,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
  );

  context.fillStyle = ORANGE;
  context.beginPath();
  context.arc(game.ball.x, game.ball.y, BALL_RADIUS, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = INK;
  context.font = "600 18px monospace";
  context.fillText("YOU", 42, 33);
  context.fillText("CPU", COURT_WIDTH - 84, 33);
  context.font = "600 34px monospace";
  context.fillText(String(game.playerScore), 42, 70);
  context.fillText(String(game.aiScore), COURT_WIDTH - 84, 70);
}

function subscribeToTouchPointer(callback: () => void): () => void {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getTouchPointerSnapshot(): boolean {
  return window.matchMedia("(pointer: coarse)").matches && navigator.maxTouchPoints > 0;
}

function getTouchPointerServerSnapshot(): boolean {
  return false;
}
