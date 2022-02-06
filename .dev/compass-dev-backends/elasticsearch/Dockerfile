FROM docker.elastic.co/elasticsearch/elasticsearch:7.16.3
RUN elasticsearch-plugin install analysis-icu
RUN elasticsearch-plugin install analysis-kuromoji

RUN cd / && \
    curl -L https://github.com/WorksApplications/elasticsearch-sudachi/archive/refs/heads/develop.zip -o /elasticsearch-sudachi-develop.zip && \
    unzip /elasticsearch-sudachi-develop.zip && \
    cd /elasticsearch-sudachi-develop && \
    env JAVA_HOME=/usr/share/elasticsearch/jdk/ JAVA_TOOL_OPTIONS=-Dfile.encoding=UTF8 ./gradlew -PelasticsearchVersion=7.16.3 build && \
    elasticsearch-plugin install file:///elasticsearch-sudachi-develop/build/distributions/analysis-sudachi-7.16.3-2.1.1-SNAPSHOT.zip && \
    mkdir /usr/share/elasticsearch/config/sudachi

RUN cd / && \
    curl -L http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/sudachi-dictionary-latest-core.zip -o /sudachi-dictionary-latest-core.zip && \
    curl -L http://sudachi.s3-website-ap-northeast-1.amazonaws.com/sudachidict/sudachi-dictionary-latest-full.zip -o /sudachi-dictionary-latest-full.zip && \
    unzip -j sudachi-dictionary-latest-core.zip -d sudachi-dictionary-latest-core && \
    unzip -j sudachi-dictionary-latest-full.zip -d sudachi-dictionary-latest-full && \
    mv /sudachi-dictionary-latest-core/system_core.dic /usr/share/elasticsearch/config/sudachi/ && \
    mv /sudachi-dictionary-latest-full/system_full.dic /usr/share/elasticsearch/config/sudachi/ && \
    rm -rf /sudachi-dictionary-latest-core/ && \
    rm -rf /sudachi-dictionary-latest-full/ 
    