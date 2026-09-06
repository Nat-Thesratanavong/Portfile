export const COURT_WIDTH = 800;
export const COURT_HEIGHT = 450;
export const PADDLE_WIDTH = 14;
export const PADDLE_HEIGHT = 86;
export const PADDLE_MARGIN = 42;
export const BALL_RADIUS = 7;
export const WINNING_SCORE = 7;
export const AI_MAX_SPEED = 230;
export const AI_REACTION_DELAY = 120;

const INITIAL_BALL_SPEED = 280;
const MAX_BALL_SPEED = 440;
const MAX_FRAME_MS = 100;
const MAX_PHYSICS_STEP_MS = 1000 / 60;

export type GameStatus = "ready" | "playing" | "paused" | "won";
export type Winner = "player" | "ai" | null;

export type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type PongState = {
  status: GameStatus;
  winner: Winner;
  playerScore: number;
  aiScore: number;
  playerY: number;
  aiY: number;
  ball: Ball;
  aiTargetY: number;
  aiReactionMs: number;
  rallyNumber: number;
};

export type GameInput = {
  playerY?: number;
};

export function createInitialGame(): PongState {
  return {
    status: "ready",
    winner: null,
    playerScore: 0,
    aiScore: 0,
    playerY: COURT_HEIGHT / 2,
    aiY: COURT_HEIGHT / 2,
    ball: centeredBall(),
    aiTargetY: COURT_HEIGHT / 2,
    aiReactionMs: AI_REACTION_DELAY,
    rallyNumber: 0,
  };
}

export function startGame(game: PongState): PongState {
  if (game.status !== "ready") return game;

  return {
    ...game,
    status: "playing",
    ball: serveBall(1, game.rallyNumber),
    aiReactionMs: AI_REACTION_DELAY,
    aiTargetY: game.aiY,
  };
}

export function pauseGame(game: PongState): PongState {
  return game.status === "playing" ? { ...game, status: "paused" } : game;
}

export function resumeGame(game: PongState): PongState {
  return game.status === "paused" ? { ...game, status: "playing" } : game;
}

export function restartGame(): PongState {
  return createInitialGame();
}

export function movePlayerPaddle(game: PongState, y: number): PongState {
  return { ...game, playerY: clampPaddleY(y) };
}

export function stepGame(game: PongState, deltaMs: number, input: GameInput = {}): PongState {
  const withInput = input.playerY === undefined ? game : movePlayerPaddle(game, input.playerY);
  if (withInput.status !== "playing" || deltaMs <= 0) return withInput;

  // Bound catch-up work after a paused tab, then use small deterministic steps so a fast
  // ball cannot cross a paddle between collision checks.
  let remainingMs = Math.min(deltaMs, MAX_FRAME_MS);
  let current = withInput;

  while (remainingMs > 0.0001) {
    const stepMs = Math.min(remainingMs, MAX_PHYSICS_STEP_MS);
    const next = stepGameSlice(current, stepMs);

    // Stop at the point boundary instead of advancing a newly served ball in the same frame.
    if (
      next.status !== "playing" ||
      next.playerScore !== current.playerScore ||
      next.aiScore !== current.aiScore
    ) {
      return next;
    }

    current = next;
    remainingMs -= stepMs;
  }

  return current;
}

function stepGameSlice(game: PongState, elapsedMs: number): PongState {
  const seconds = elapsedMs / 1000;
  let aiReactionMs = game.aiReactionMs - elapsedMs;
  let aiTargetY = game.aiTargetY;

  if (aiReactionMs <= 0) {
    aiTargetY = predictBallY(game.ball);
    aiReactionMs = AI_REACTION_DELAY;
  }

  const aiY = moveTowards(game.aiY, aiTargetY, AI_MAX_SPEED * seconds);
  const nextBall = {
    ...game.ball,
    x: game.ball.x + game.ball.vx * seconds,
    y: game.ball.y + game.ball.vy * seconds,
  };

  const bouncedBall = bounceOffWalls(nextBall);
  const playerBall = collideWithPaddle(bouncedBall, game.playerY, "player");
  const paddleBall = collideWithPaddle(playerBall, aiY, "ai");

  if (paddleBall.x < -BALL_RADIUS) {
    return scorePoint({ ...game, aiY, aiTargetY, aiReactionMs }, "ai");
  }
  if (paddleBall.x > COURT_WIDTH + BALL_RADIUS) {
    return scorePoint({ ...game, aiY, aiTargetY, aiReactionMs }, "player");
  }

  return {
    ...game,
    aiY,
    aiTargetY,
    aiReactionMs,
    ball: paddleBall,
  };
}

function centeredBall(): Ball {
  return { x: COURT_WIDTH / 2, y: COURT_HEIGHT / 2, vx: 0, vy: 0 };
}

function serveBall(direction: 1 | -1, rallyNumber: number): Ball {
  return {
    x: COURT_WIDTH / 2,
    y: COURT_HEIGHT / 2,
    vx: INITIAL_BALL_SPEED * direction,
    vy: rallyNumber % 2 === 0 ? 72 : -72,
  };
}

function clampPaddleY(y: number): number {
  return clamp(y, PADDLE_HEIGHT / 2, COURT_HEIGHT - PADDLE_HEIGHT / 2);
}

function predictBallY(ball: Ball): number {
  return clampPaddleY(ball.y + ball.vy * 0.12);
}

function moveTowards(current: number, target: number, distance: number): number {
  if (Math.abs(target - current) <= distance) return target;
  return current + Math.sign(target - current) * distance;
}

function bounceOffWalls(ball: Ball): Ball {
  if (ball.y - BALL_RADIUS < 0) {
    return { ...ball, y: BALL_RADIUS, vy: Math.abs(ball.vy) };
  }
  if (ball.y + BALL_RADIUS > COURT_HEIGHT) {
    return { ...ball, y: COURT_HEIGHT - BALL_RADIUS, vy: -Math.abs(ball.vy) };
  }
  return ball;
}

function collideWithPaddle(ball: Ball, paddleY: number, side: "player" | "ai"): Ball {
  const paddleX = side === "player" ? PADDLE_MARGIN : COURT_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH;
  const movingTowardPaddle = side === "player" ? ball.vx < 0 : ball.vx > 0;
  const overlapsX =
    ball.x + BALL_RADIUS >= paddleX && ball.x - BALL_RADIUS <= paddleX + PADDLE_WIDTH;
  const overlapsY = Math.abs(ball.y - paddleY) <= PADDLE_HEIGHT / 2 + BALL_RADIUS;

  if (!movingTowardPaddle || !overlapsX || !overlapsY) return ball;

  const direction = side === "player" ? 1 : -1;
  const offset = clamp((ball.y - paddleY) / (PADDLE_HEIGHT / 2), -1, 1);
  const speed = Math.min(MAX_BALL_SPEED, Math.max(INITIAL_BALL_SPEED, Math.hypot(ball.vx, ball.vy) * 1.03));
  const vy = clamp(offset * 260 + ball.vy * 0.18, -330, 330);
  const vxMagnitude = Math.sqrt(Math.max(120 * 120, speed * speed - vy * vy));

  return {
    ...ball,
    x: side === "player" ? paddleX + PADDLE_WIDTH + BALL_RADIUS : paddleX - BALL_RADIUS,
    vx: vxMagnitude * direction,
    vy,
  };
}

function scorePoint(game: PongState, scorer: "player" | "ai"): PongState {
  const playerScore = game.playerScore + (scorer === "player" ? 1 : 0);
  const aiScore = game.aiScore + (scorer === "ai" ? 1 : 0);
  const winner = playerScore >= WINNING_SCORE ? "player" : aiScore >= WINNING_SCORE ? "ai" : null;

  if (winner) {
    return {
      ...game,
      status: "won",
      winner,
      playerScore,
      aiScore,
      ball: centeredBall(),
    };
  }

  const direction = scorer === "player" ? 1 : -1;
  const rallyNumber = game.rallyNumber + 1;
  return {
    ...game,
    playerScore,
    aiScore,
    ball: serveBall(direction, rallyNumber),
    rallyNumber,
    aiReactionMs: AI_REACTION_DELAY,
    aiTargetY: game.aiY,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
