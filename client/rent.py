
import time

from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.progress import TransferSpeedColumn, Progress, TextColumn, TimeElapsedColumn

def give_me_container_demo(**argkws):
    # overall progress bar
    overall_progress = Progress(
        TimeElapsedColumn(), TransferSpeedColumn(), TextColumn("{task.description}")
    )
    # group of progress bars;
    # some are always visible, others will disappear when progress is complete
    progress_group = Group(
        Panel(overall_progress),
    )

    # tuple specifies how long each step takes for that app
    step_actions = ("downloading", "configuring", "building", "installing")
    apps = [
        ("one", (2, 1, 4, 2)),
        ("two", (1, 3, 8, 4)),
        ("three", (2, 1, 3, 2)),
    ]

    # create overall progress bar
    overall_task_id = overall_progress.add_task("", total=len(apps))

    def run_steps(console, step_times):
        """Run steps for a single app, and update corresponding progress bars."""

        for idx, step_time in enumerate(step_times):
            # add progress bar for this step (time elapsed + spinner)
            action = step_actions[idx]

            # run steps, update progress
            for _ in range(step_time):
                console.log("Server starting...")
                console.log("Serving on http://127.0.0.1:8000")
                time.sleep(0.5)

    console = Console()
    with Live(progress_group, console=console):

        for idx, (name, step_times) in enumerate(apps):
            # update message on overall progress bar
            top_descr = "[bold #AAAAAA](%d out of %d apps installed)" % (idx, len(apps))
            overall_progress.update(overall_task_id, description=top_descr)
            run_steps(console, step_times)
            # increase overall progress now this task is done
            overall_progress.update(overall_task_id, advance=1)

        # final update for message on overall progress bar
        overall_progress.update(
            overall_task_id, description="[bold green]%s apps installed, done!" % len(apps)
        )
