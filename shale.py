import click
import rich


@click.group()
def cli():
    pass

@click.command()
def give_me_container():
    click.echo('give_me_container')

@click.command()
def lease_container():
    click.echo('lease_container')

cli.add_command(give_me_container)
cli.add_command(lease_container)

if __name__ == '__main__':
    cli()