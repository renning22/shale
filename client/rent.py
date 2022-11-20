
import time
import random
import uuid

from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.progress import Progress, TextColumn, TimeElapsedColumn
from rich.columns import Columns
from rich.layout import Layout

_HARDCODE_PROVIDER = 'ssh root@61.155.163.13 -p 8000'

def give_me_container_demo(**argkws):
    console = Console()

    session_id = str(uuid.uuid4())
    session_status = Progress(
        TimeElapsedColumn(),
        TextColumn('Spent: [b bright_blue]{task.completed:.3f} FILs'),
        TextColumn(f' Session: [b]{_HARDCODE_PROVIDER}'),
    )

    console.log('Starting request...')
    console.log(argkws)
    time.sleep(2)

    console.log(f'Starting session: {session_id}')
    time.sleep(2)

    console.log('Container created...')
    console.log('SSH pub key injected...')
    console.log('Please run:')
    console.log(_HARDCODE_PROVIDER)
    time.sleep(2)
    
    fil_spent_task_id = session_status.add_task("")
    fil_per_min = float(argkws['price'].removesuffix('FIL/min'))
    fil_per_sec = fil_per_min / 60.0

    with Live(Panel(session_status), console=console):
        for i in range(10000):
            console.log("CPU: ...")

            # session_spent.update(fil_spent_task_id, total=100, completed=random.randrange(100))
            session_status.update(fil_spent_task_id, advance=fil_per_sec)
            time.sleep(1)
