import click

from client.list import client_list_all_sps_demo

@click.group()
def cli():
    pass

@click.command()
def list():
    client_list_all_sps_demo()


@click.command()
def give_me_container():
    click.echo('give_me_container')

@click.command()
def lease_container():
    click.echo('lease_container')

cli.add_command(list)
cli.add_command(give_me_container)
cli.add_command(lease_container)

if __name__ == '__main__':
    cli()