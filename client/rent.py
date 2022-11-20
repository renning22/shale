
import time
import uuid
from subprocess import check_output

from rich.console import Console, Group
from rich.live import Live
from rich.panel import Panel
from rich.progress import Progress, TextColumn, TimeElapsedColumn
from rich.columns import Columns
from rich.layout import Layout

_HARDCODE_PROVIDER_PORT = 8000
_HARDCODE_PROVIDER_IP = '61.155.163.13'
_HARDCODE_PROVIDER_SSH_CMD = f'ssh root@{_HARDCODE_PROVIDER_IP} -p {_HARDCODE_PROVIDER_PORT}'
_HARDCODE_PROVIDER_DATA_COPY_CMD = f'scp -P {_HARDCODE_PROVIDER_PORT} ./example/mnist_train.py root@{_HARDCODE_PROVIDER_IP}:~/'

def _get_remote_usage():
    cmd = ['ssh', '-q', f'root@{_HARDCODE_PROVIDER_IP}', '-p 21022', '-n', "docker stats --no-stream --format '{{.CPUPerc}}, {{.MemUsage}}'"]
    out = check_output(cmd).decode('utf-8')
    cpu, mem = out.split(',')
    return {'cpu': cpu.strip(), 'mem': mem.strip()}

def give_me_container_demo(**argkws):
    console = Console()

    session_id = str(uuid.uuid4())
    session_status = Progress(
        TimeElapsedColumn(),
        TextColumn('Spent: [b bright_blue]{task.completed:.3f} FILs'),
        TextColumn(f' Session: [b]{_HARDCODE_PROVIDER_SSH_CMD}'),
    )

    console.log('Starting request...')
    console.log(argkws)
    time.sleep(2)

    console.log(f'Starting session: {session_id}')
    time.sleep(2)

    console.log('Container created...')
    console.log('SSH pub key injected...')
    console.log()
    console.log('For data copy, please run:')
    console.log(' ' + _HARDCODE_PROVIDER_DATA_COPY_CMD)
    console.log()
    console.log('For login, please run:')
    console.log(' ' + _HARDCODE_PROVIDER_SSH_CMD)
    console.log()
    time.sleep(2)
    
    fil_spent_task_id = session_status.add_task("")
    fil_per_min = float(argkws['price'].removesuffix('FIL/min'))
    fil_per_sec = fil_per_min / 60.0

    with Live(Panel(session_status), console=console, auto_refresh=True):
        for i in range(10000):
            console.log(_get_remote_usage())
            session_status.update(fil_spent_task_id, advance=fil_per_sec)
            time.sleep(1)
