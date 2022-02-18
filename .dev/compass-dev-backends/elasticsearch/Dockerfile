FROM docker.elastic.co/elasticsearch/elasticsearch:7.17.0

# install analysis-icu
RUN elasticsearch-plugin install analysis-icu

# install analysis-kuromoji
RUN elasticsearch-plugin install analysis-kuromoji

# build and install analysis-sudachi 
ENV BRANCH acf55354a8e39c89f54066baffeb544a060e8b89
ENV VERSION 2.1.1
ENV ES_VERSION 7.17.0
RUN mkdir -p /sudachi && \
    cd /sudachi && \
    curl -LO https://github.com/WorksApplications/elasticsearch-sudachi/archive/$BRANCH.zip && \
    unzip $BRANCH.zip && \
    cd elasticsearch-sudachi-$BRANCH && \
    env JAVA_HOME=/usr/share/elasticsearch/jdk/ JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF8 ./gradlew -PelasticsearchVersion=$ES_VERSION build && \
    elasticsearch-plugin install file:///sudachi/elasticsearch-sudachi-$BRANCH/build/distributions/analysis-sudachi-$ES_VERSION-$VERSION-SNAPSHOT.zip

# install sudachi-dict
ENV DICT_VERSION 20211220
RUN mkdir -p /sudachi && \
    cd /sudachi && \
    curl -LO http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/sudachi-dictionary-$DICT_VERSION-core.zip && \
    curl -LO http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/sudachi-dictionary-$DICT_VERSION-full.zip && \
    unzip -n sudachi-dictionary-$DICT_VERSION-core.zip && \
    unzip -n sudachi-dictionary-$DICT_VERSION-full.zip && \
    mkdir -p /usr/share/elasticsearch/config/sudachi && \
    mv sudachi-dictionary-$DICT_VERSION/system_core.dic /usr/share/elasticsearch/config/sudachi/ && \
    mv sudachi-dictionary-$DICT_VERSION/system_full.dic /usr/share/elasticsearch/config/sudachi/ && \
    rm -rf sudachi-dictionary-$DICT_VERSION/
