import { Timer, TimerManager } from "../src/index";
import { expect } from "chai";
import "mocha";

describe("Timer", () => {
    context("#Timer add & delete", () => {
        const manager: TimerManager = Timer.timerManager;
        const timers: Timer[] = [];
        let num = 10;
        let prevNum: number;

        it("Global TimerManager is created", () => {
            prevNum = manager.timers.length;
            timers.push(new Timer(1000));
            expect(manager).to.not.equal(null);
        });

        it("Timer count is correct", () => {
            expect(manager.timers.length).to.equal(prevNum + 1);
        });

        it("Add " + num + " timers", () => {
            for (let i = 0; i < num; i++) {
                timers.push(new Timer(Math.random() * 1000 + 1000));
            }
            expect(manager.timers.length).to.equal(num + prevNum + 1);
        });

        it("Delete one timer using TimeManager.removeTimer()", () => {
            manager.removeTimer(timers[0]);
            manager.update(5);
            expect(manager.timers.length).to.equal(num + prevNum);
        });

        it("Delete all timers using Timer.prototype.remove()", () => {
            for (const timer of timers) {
                timer.remove();
            }
            manager.update(5);
            expect(manager.timers.length).to.equal(prevNum);
        });
    });

    context("#Timer functionalities", () => {
        const timer = new Timer(1000);
        const manager = timer.timerManager;
        let started: boolean = false;
        let ended: boolean = false;
        let stoped: boolean = false;
        let repeated: number = 0;
        let _delta: number = 0;
        let _elapsed: number = 0;
        timer.on("start", () => {
            started = true;
            ended = false;
            stoped = false;
            repeated = 0;
        });
        timer.on("update", (elapsed, delta) => {
            _delta = delta;
            _elapsed = elapsed;
        });
        timer.on("repeat", (elapsed, repeat) => repeated = repeat);
        timer.on("stop", elapsed => stoped = true);
        timer.on("end", elapsed => {
            ended = true;
            _elapsed = elapsed;
        });

        it("Timer is started", () => {
            timer.start();
            timer.update(500);
            expect(manager).to.not.equal(null);
            expect(started).to.equal(true);
            expect(timer.isStarted).to.equal(true);
            expect(ended).to.equal(false);
            expect(timer.isEnded).to.equal(false);
        });

        it("Timer is updated", () => {
            expect(_elapsed).to.equal(500);
            expect(_delta).to.equal(500);
        });

        it("Timer is ended", () => {
            timer.update(600);
            expect(_elapsed).to.equal(1000);
            expect(ended).to.equal(true);
            expect(timer.isEnded).to.equal(true);
        });

        it("Timer is looping", () => {
            expect(timer.active).to.equal(false);
            timer.loop = true;
            timer.time = 500;
            timer.reset();
            timer.start();
            for (let i = 0; i < 10; i++) {
                timer.update(500);
                expect(repeated).to.equal(i + 1);
            }
        });

        it("Timer is repeated", () => {
            expect(timer.active).to.equal(true);
            timer.loop = false;
            timer.repeat = 5;
            timer.reset().start();
            for (let i = 0; i < 10; i++) {
                timer.update(500);
            }
            expect(repeated).to.equal(5);
            expect(timer.active).to.equal(false);
        });

        it("Timer is delayed", () => {
            timer.repeat = 0;
            timer.delay = 500;
            timer.reset().start();
            timer.update(500);
            expect(timer.active).to.equal(true);
            expect(timer.isEnded).to.equal(false);
            timer.update(500);
            expect(timer.isEnded).to.equal(true);
        });

        it("Timer is stoped", () => {
            timer.delay = 0;
            timer.reset().start();
            timer.update(200);
            timer.stop();
            expect(timer.active).to.equal(false);
            expect(timer.isEnded).to.equal(false);
            timer.update(300);
            expect(timer.isEnded).to.equal(false);
            expect(stoped).to.equal(true);
        });

        it("Timer can be expired", () => {
            timer.expire = true;
            timer.delay = 0;
            timer.reset();
            timer.start();
            if (timer.timerManager) timer.timerManager.update(500);
            expect(timer.timerManager).to.equal(null);
        });
    });
});
