#!/bin/bash
set -x

#cd "$( dirname "${BASH_SOURCE[0]}" )"
QADIR=/vagrant/qa
cd $QADIR

# First we write our env vars to a file, then run phase1.sh which will use them (and may add to them)
cat <<-PHASE1 >> envvars.sh
QADIR=/vagrant/qa
VMOS=ubuntu
VM=ubuntu16_tar_ccs
BEATS="metricbeat packetbeat filebeat"
PRODUCTS="metricbeat packetbeat filebeat elasticsearch kibana logstash apm-server"
OSS=
TLS=YES
XPACK=YES
SECURITY=YES
LICENSE=TRIAL
# LICENSE=BASIC
# LICENSE=GOLD
# LICENSE=PLATINUM

LINUX_INSTALL_DIR=/home/vagrant
ESURL=https://elastic:changeit@localhost:9200
ESURLDATA=https://elastic:changeit@localhost:9210
KIBANAURL=https://elastic:changeit@localhost:5601
ESHOST=localhost
ESPROTO=https
ESPORT=9200
KIBANAPWD=changeit

KIBANASERVERUSER=kibana
KIBANASERVERPWD=changeit

KIBANAFILEUSER=user
KIBANAFILEPWD=changeme

NATIVEKIBANAUSER=ironman
NATIVEKIBANAPWD=changeme

LOGSTASHUSER=logstash_internal
LOGSTASHPWD=changeme

BEATSUSER=beats_internal
BEATSPWD=changeme

PACKAGE=tar.gz
PLATFORM=-linux-x86_64
KIBANA_PLATFORM=-linux-x86_64
KIBANAIP=localhost

DOTBAT=
INSTALL_DIR=\$LINUX_INSTALL_DIR
CONFIG_DIR=\$INSTALL_DIR

ES_CONFIG=\$INSTALL_DIR/elasticsearch/config/elasticsearch.yml

LOGSTASH_CONFIG=\${INSTALL_DIR}/logstash/config/logstash.conf
LOGSTASH_YML_DIR=\${INSTALL_DIR}/logstash/config

KIBANA_CONFIG=\$INSTALL_DIR/kibana/config/kibana.yml
KIBANA_LOG=\$INSTALL_DIR/kibana/logs/kibana.stdout

PHASE1

# ./phase1.sh
