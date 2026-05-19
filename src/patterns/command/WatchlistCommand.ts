import type { Show } from "../../types";
import type { IWatchlistRepository } from "../repository/WatchlistRepository";
import { NotificationFactory } from "../factory/NotificationFactory";
import { notificationCenter } from "../observer/NotificationCenter";

export interface Command {
  readonly label: string;
  execute(): void;
  undo(): void;
}

export class AddShowCommand implements Command {
  readonly label: string;
  private wasPresent = false;

  constructor(
    private readonly repo: IWatchlistRepository,
    private readonly show: Show,
  ) {
    this.label = `Add “${show.name}”`;
  }

  execute(): void {
    const current = this.repo.getAll();
    this.wasPresent = current.some((s) => s.id === this.show.id);
    if (this.wasPresent) {
      notificationCenter.publish(NotificationFactory.duplicate(this.show.name));
      return;
    }
    this.repo.save([...current, this.show]);
    notificationCenter.publish(NotificationFactory.added(this.show.name));
  }

  undo(): void {
    if (this.wasPresent) return;
    const current = this.repo.getAll();
    this.repo.save(current.filter((s) => s.id !== this.show.id));
  }
}

export class RemoveShowCommand implements Command {
  readonly label: string;
  private removed: Show | null = null;

  constructor(
    private readonly repo: IWatchlistRepository,
    private readonly showId: number,
  ) {
    this.label = `Remove show #${showId}`;
  }

  execute(): void {
    const current = this.repo.getAll();
    this.removed = current.find((s) => s.id === this.showId) ?? null;
    if (!this.removed) return;
    this.repo.save(current.filter((s) => s.id !== this.showId));
    notificationCenter.publish(NotificationFactory.removed(this.removed.name));
  }

  undo(): void {
    if (!this.removed) return;
    const current = this.repo.getAll();
    if (current.some((s) => s.id === this.removed!.id)) return;
    this.repo.save([...current, this.removed]);
  }
}

export class CommandHistory {
  private done: Command[] = [];

  run(command: Command): void {
    command.execute();
    this.done.push(command);
  }

  undoLast(): Command | null {
    const command = this.done.pop();
    if (!command) return null;
    command.undo();
    return command;
  }

  size(): number {
    return this.done.length;
  }

  list(): readonly Command[] {
    return this.done;
  }
}
