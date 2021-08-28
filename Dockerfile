FROM conanio/gcc7

RUN conan profile new --detect default \
    && conan profile update settings.compiler.libcxx=libstdc++11 default

ENV CONAN_SYSREQUIRES_MODE=enabled
