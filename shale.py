import click

from client.list import client_list_all_sps_demo
from client.rent import give_me_container_demo

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
@click.option('--bandwidth', default='1Mi')
@click.option('--image', default='cuda-ubuntu18.04')
def give_me_container(miner, price, num_cpus, num_rams, num_gpus, bandwidth, image):
    give_me_container_demo(miner, price, num_cpus, num_rams, num_gpus, bandwidth, image)

@click.command()
def lease_container():
    click.echo('lease_container')

cli.add_command(list)
cli.add_command(give_me_container)
cli.add_command(lease_container)

if __name__ == '__main__':
    cli()