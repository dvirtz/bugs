FROM conanio/gcc13-ubuntu16.04

ADD --chown=conan https://github.com/conan-io/cmake-conan/raw/develop2/conan_provider.cmake /home/conan/cmake-conan/

# install newer cmake
ARG CMAKE_VERSION=3.25
ARG CMAKE_VERSION_FULL=3.25.3

RUN wget -q --no-check-certificate https://cmake.org/files/v${CMAKE_VERSION}/cmake-${CMAKE_VERSION_FULL}-linux-x86_64.tar.gz \
  && tar -xf cmake-${CMAKE_VERSION_FULL}-linux-x86_64.tar.gz \
       --exclude=bin/cmake-gui \
       --exclude=doc/cmake \
       --exclude=share/cmake-${CMAKE_VERSION}/Help \
       --exclude=share/vim \
       --exclude=share/vim \
  && sudo cp -fR cmake-${CMAKE_VERSION_FULL}-linux-x86_64/* /usr \
  && rm -rf cmake-${CMAKE_VERSION_FULL}-linux-x86_64 \
  && rm cmake-${CMAKE_VERSION_FULL}-linux-x86_64.tar.gz

# install newer GDB
ARG GDB_VERSION=8.3

RUN wget -q http://ftp.gnu.org/gnu/gdb/gdb-${GDB_VERSION}.tar.gz \
  && tar xf gdb-${GDB_VERSION}.tar.gz \
  && cd gdb-${GDB_VERSION} \
  && ./configure \
  && make -j \
  && sudo make install \
  && cd .. \
  && rm -rf gdb-${GDB_VERSION} \
  && rm gdb-${GDB_VERSION}.tar.gz

# install other deps
RUN export DEBIAN_FRONTEND=noninteractive \ 
  && sudo apt-get update \
  && sudo apt-get install -y \
    ninja-build
