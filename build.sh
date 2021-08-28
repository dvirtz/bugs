set -e

mkdir -p build
cd build
conan install .. --build missing
cmake ..
cmake --build .
cd ..
