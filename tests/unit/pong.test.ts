import { describe, expect, it } from "vitest";
import {
  AI_MAX_SPEED,
  BALL_RADIUS,
  COURT_HEIGHT,
  COURT_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
  WINNING_SCORE,
  createInitialGame,
  movePlayerPaddle,
  pauseGame,
  restartGame,
  resumeGame,
  startGame,
  stepGame,
} from "@/lib/pong";

describe("pong engine", () => {
  it("bounces the ball off the top and bottom walls", () => {
    const game = startGame(createInitialGame());
    const topBounce = stepGame(
      { ...game, ball: { x: 400, y: 10, vx: 0, vy: -100 } },
      100,
    );
    const bottomBounce = stepGame(
      { ...game, ball: { x: 400, y: COURT_HEIGHT - 10, vx: 0, vy: 100 } },
      100,
    );

    expect(topBounce.ball.vy).toBeGreaterThan(0);
    expect(bottomBounce.ball.vy).toBeLessThan(0);
    expect(topBounce.ball.y).toBeGreaterThanOrEqual(7);
    expect(bottomBounce.ball.y).toBeLessThanOrEqual(COURT_HEIGHT - 7);
  });

  it("reflects the ball from a paddle and adds spin from the hit position", () => {
    const game = startGame(createInitialGame());
    const next = stepGame(
      { ...game, playerY: 100, ball: { x: PADDLE_MARGIN + 20, y: 80, vx: -200, vy: 0 } },
      50,
    );

    expect(next.ball.vx).toBeGreaterThan(0);
    expect(next.ball.vy).toBeLessThan(0);
  });

  it("does not let a fast ball tunnel through a paddle during a long frame", () => {
    const game = startGame({ ...createInitialGame(), playerY: 225 });
    const next = stepGame(
      {
        ...game,
        ball: { x: PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS + 1, y: 225, vx: -440, vy: 0 },
      },
      100,
    );

    expect(next.ball.vx).toBeGreaterThan(0);
    expect(next.ball.x).toBeGreaterThanOrEqual(PADDLE_MARGIN + PADDLE_WIDTH + BALL_RADIUS);
  });

  it("awards a point and serves the next ball toward the scorer's side", () => {
    const game = startGame(createInitialGame());
    const next = stepGame(
      { ...game, ball: { x: 0, y: 225, vx: -200, vy: 0 } },
      50,
    );

    expect(next.playerScore).toBe(0);
    expect(next.aiScore).toBe(1);
    expect(next.status).toBe("playing");
    expect(next.ball.x).toBe(COURT_WIDTH / 2);
    expect(next.ball.vx).toBeLessThan(0);
  });

  it("finishes when one side reaches seven points", () => {
    const game = startGame({ ...createInitialGame(), playerScore: WINNING_SCORE - 1 });
    const next = stepGame(
      { ...game, ball: { x: COURT_WIDTH, y: 225, vx: 200, vy: 0 } },
      50,
    );

    expect(next.playerScore).toBe(WINNING_SCORE);
    expect(next.winner).toBe("player");
    expect(next.status).toBe("won");
    expect(next.ball.vx).toBe(0);
  });

  it("limits AI movement to its configured speed", () => {
    const game = startGame({ ...createInitialGame(), aiY: PADDLE_HEIGHT / 2 });
    const next = stepGame(
      { ...game, ball: { x: COURT_WIDTH / 2, y: COURT_HEIGHT - 20, vx: 200, vy: 0 }, aiReactionMs: 0 },
      100,
    );

    expect(next.aiY - game.aiY).toBeLessThanOrEqual((AI_MAX_SPEED * 100) / 1000);
  });

  it("supports pause, resume, and restart transitions", () => {
    const playing = startGame(createInitialGame());
    const paused = pauseGame(playing);
    const resumed = resumeGame(paused);
    const restarted = restartGame();

    expect(paused.status).toBe("paused");
    expect(stepGame(paused, 100).ball).toEqual(paused.ball);
    expect(resumed.status).toBe("playing");
    expect(restarted.status).toBe("ready");
    expect(restarted.playerScore).toBe(0);
    expect(movePlayerPaddle(restarted, -100).playerY).toBe(PADDLE_HEIGHT / 2);
  });
});
