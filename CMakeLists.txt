
cmake_minimum_required(VERSION 3.9)
project(BoostTestAsan CXX)

find_package(Boost REQUIRED)

add_executable(boost_asan boost_asan.cpp)

target_compile_options(boost_asan PRIVATE -fsanitize=address)

target_link_libraries(boost_asan Boost::boost)

target_link_options(boost_asan PRIVATE -fsanitize=address)
