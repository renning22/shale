import os
import subprocess

def spawn_container(external_ip, num_cpus, num_rams, num_gpus, image, cache_dir, fullnode_ip, mount, jupyter_notebook=False):
    # cache files for mounting
    os.makedirs(cache_dir, exist_ok=True)
    params = ['-p', f'{external_ip}:22', '--gpus', num_gpus, '-m', num_rams, '--mount', 'type=bind,source=/root/.ssh,target=/root/.ssh']
    if jupyter_notebook:
        params = ['-p', '8888:8888'] + params

    for mnt in mount:
        source, target = mnt.split(':')
        cache_path = f'{cache_dir}/{target.split("/")[-1]}'
        params += ['--mount', f'type=bind,source={cache_path},target={target}']
        if os.path.exists(cache_path):
            continue
        subprocess.run(['lotus', 'client', 'retrieve', source, cache_path])
        subprocess.run(['scp', f'{fullnode_ip}:{cache_path}', cache_path])
    params += [image, '/usr/sbin/sshd', '-D']
    subprocess.run(['docker', 'run', '-dit'] + params)
