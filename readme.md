# Docker Shell

This shell run commands on docker container using host env var ( exluding configure key words) and bind current folder

Additional blacklisted env var words, command binnary to docker image mapping and additionnal volumes can be configured

## Usage

```dsh <img or command> [command]```

## Examples

With docker image specified

```dsh alpine ls .```


With only command specified

```dsh ls .```

## Configure

```dsh configure```

## Update configuration

```dsh update```

## Search for images

```dsh search <image_word>```