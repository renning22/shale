# Shale - Decentralized Cloud

Shale is a toolkit that makes Filecoin Storage Providers (SP) be able to lease/monetize their
CPU/GPU severs to provide cloud computing businesses that directly compete with AWS, google cloud, etc..

The idea is sending programs to where the data located, i.e. in the data center of SP, and make the 
data (Filecoin sectors/deals) accessible by the programs by disk mouting.

The first implementation is to remote-spawn a docker container on SP's GPU-server (usually the sealing server),
and make client login-able by pub-key injecting with a SSH-payment-tunnel.

## SSH-payment-tunnel

Just like a normal SSH but with transfering payment tunnel, extend leasing at minutes-level, and posting final ZKP to
Shale layer-2 on FVM.

The design of this mechanism is to prevent cheating behaviors for most cases.

## High-performance and native runtimes

Programs are running natively on CPUs with accelerators like GPUs (thanks container technology).

All web1/web2 software ecosystems (unix, apt-get, gcc, python, nodejs, etc.) are available.

E.g. be able to run compiling, ML training, inferecing, data processing, short-time serving etc.. 

## Client-side

For those who have Shales(FILs) and want to rent computing units.

### Request a container
```bash
> shale give-me-container \
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


# Server-side

For storage providers who want to lease their severs.

## Start a specfic container per request (low-level command)


```bash

shale start-specific-container

```

## Start Daemon

TODO.