
from rich.console import Console
from rich.table import Table
from rich.tree import Tree


def client_list_all_sps_demo():

    resources_tree = Tree(
        f':computer: NVIDIA GeForce RTX 3090',
    )
    resources_tree.add('CPU: 128')
    resources_tree.add('RAM: 256Gi')
    resources_tree.add('GPU: 2')
    resources_tree.add('BANDWIDTH: 2Mbps')

    datasets_tree = Tree(
        '💽', hide_root=True,
    )
    cid_1 = datasets_tree.add(':file_folder: [i bright_blue]bafykbzacedn7inlv3caodlac4fq5ngbczptxblksj3yq7ifs6nqcjv2h3vvne')
    cid_1.add('📄 mnist.zip')
    cid_2 = datasets_tree.add(':file_folder: [i bright_blue]bafykbzaceca7fik2pyped74zhj3tzzu6avatm6n5gafgpcn4ifddosng7xtbo')
    cid_2.add('📄 t10k-images-idx3-ubyte')
    cid_3 = datasets_tree.add(':file_folder: [i bright_blue]bafykbzacediwsg3k4uhzfut4ivzlbwi7sjjomayvny3u4fh3ytm6fyvbw2vka')
    cid_3.add('📄 train-images-idx3-ubyte')
    cid_4 = datasets_tree.add(':file_folder: [i bright_blue]bafykbzacea4iydnltpxtxq2fandb6wyhodrxh32cpsarzgod6chnf6w3xnqae')
    cid_4.add('📄 cifar-100-python.tar.gz')

    table = Table(show_lines=True, title='Storage Providers with Shale Compute')
    table.add_column("Storage Provider", style="cyan", no_wrap=True)
    table.add_column("Available Resources", style="magenta")
    table.add_column("Available Datasets (Data CID -> File)", style="magenta")
    table.add_column("Price", justify="right", style="green")

    table.add_row("f01946720", resources_tree, datasets_tree, "0.01 FIL/MINUTE")

    console = Console()
    console.print(table)

    print('https://shaleprotocol.com')
