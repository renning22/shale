# Shale - Decentralized Cloud

Shale is aiming to bring cloud computing to Filcoin and make Storage Providers (SPs) directly compete with AWS, Google Cloud, etc..

With Shale, SPs are able to lease and monetize their computing devices
(CPU/RAM/GPU severs) with access to the data they sealed.

Shale is targeting native high-performance computing such as AI/ML training/inference usually against open and large datasets, but any other traditional tasks are possible, such as C/C++ compiling, short-time web serving, data-processing etc..

## Design

The idea is sending programs around to where the data locate, i.e. in the data center of SP, and make the sealed data (Filecoin+ deals) accessible by disk mouting.
### SSH-payment-tunnel

Just like normal SSHs but with local cryptographic payment tunnel that posts final ZKP to Shale layer-2 on FVM to claim rewards.

Both parties could choose to terminate the session at anytime and not extend the lease.

This framework with future plugins could prevent most cheating and bad behaviors.

### Layer-2 Marketplace

There will be Shale smart contracts on FVM for coordinating orders between clients and SPs that includes exchanging pub-keys, claiming final rewards and leaving ratings/reviews.

### High-performance native computing

Programs are running natively in container with access to local accelerators (GPU).

All web1/web2 software ecosystems (unix, apt-get, gcc, python, nodejs, etc.) are available thanks to container.

Examples: Fortran C/C++ compiling, ML training, inferecing, data processing, short-time serving etc.. 

## Implementation

The first implementation is a terminal command-line tool (CLI) that focused on demostrating the using experiecnes, which includes:

* Client lists SPs with available datasets 
* Client sends request to particular SP
* SP spawns docker containers on GPU server
* SP auto-provisions SSH server and client's pub-key inside container
* Mock SSH-payment-tunnel UI


## Client-side

For those who have Shales(FILs) and want to rent computing units.

### Request a container
```bash
shale give-me-container \
  --miner=f01946720 \
  --price=0.01fil/min \
  --num_cpus=10 \
  --num_rams=12Gi \
  --num_gpus=1 \
  --image=cuda-ubuntu18.04 \
  --mnt=<data_cid_1>:/mnt/mnist.zip \
  --mnt=<data_cid_2>:/mnt/cifar-100.zip \
  -- bash
```


## Server-side

For storage providers who want to lease their severs.

### Start a specfic container per request (low-level command)


```bash
shale start-specific-container
```

### Start Daemon

Daemon that accepts requests and start containers automatically.

TBD.
