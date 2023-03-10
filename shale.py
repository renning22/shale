import click

from client.list import client_list_all_sps_demo
from client.rent import give_me_container_demo
from server.lease import spawn_container


@click.group()
def cli():
    pass

@click.command()
def list():
    client_list_all_sps_demo()


@click.command()
@click.option('--miner', default='f01946720')
@click.option('--price', default='0.01FIL/min')
@click.option('--num_cpus', default=10)
@click.option('--num_rams', default='12Gi')
@click.option('--num_gpus', default=1)
@click.option('--bandwidth', default='1Mbps')
@click.option('--image', default='tensorflow:gpu')
@click.option('--mnt', multiple=True)
@click.option('--ssh_pubkey', default='~/.ssh/id_rsa.pub')
def give_me_container(miner, price, num_cpus, num_rams, num_gpus, bandwidth, image, mnt, ssh_pubkey):
    give_me_container_demo(
        miner=miner,
        price=price,
        num_cpus=num_cpus,
        num_rams=num_rams,
        num_gpus=num_gpus,
        bandwidth=bandwidth,
        image=image,
        mnt=mnt,
        ssh_pubkey=ssh_pubkey)


@click.command()
@click.option('--external_ip', default='0.0.0.0:8000', show_default=True)
@click.option('--num_cpus', default=4, show_default=True)
@click.option('--num_rams', default='16g', show_default=True)
@click.option('--num_gpus', default='all', show_default=True)
@click.option('--image', default='tensorflow:gpu', show_default=True)
@click.option('--cache_dir', default='/tmp', show_default=True)
@click.option('--fullnode_ip', default='Node21')
@click.option('--mount', '-m', multiple=True)
@click.option('--jupyter', is_flag=True, help='expose jupyter notebook port 8888')
def lease_container(external_ip, num_cpus, num_rams, num_gpus, image, cache_dir, fullnode_ip, mount, jupyter):
    spawn_container(external_ip, num_cpus, num_rams, num_gpus,
                    image, cache_dir, fullnode_ip, mount, jupyter)

cli.add_command(list)
cli.add_command(give_me_container)
cli.add_command(lease_container)

if __name__ == '__main__':
    cli()
